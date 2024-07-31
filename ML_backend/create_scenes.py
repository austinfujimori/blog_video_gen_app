from moviepy.editor import AudioFileClip, VideoFileClip
import requests
from PIL import Image
from io import BytesIO
import os
import uuid
from dotenv import load_dotenv
from elevenlabs import VoiceSettings
from elevenlabs.client import ElevenLabs
from moviepy.video.fx.all import speedx
import replicate
import json
import subprocess

os.environ['IMAGEMAGICK_BINARY'] = '/opt/homebrew/bin/magick'

load_dotenv()
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
client = ElevenLabs(api_key=ELEVENLABS_API_KEY)

BASE_DIR = os.path.join('ML_backend', 'generated')
VIDEOS_DIR = os.path.join(BASE_DIR, 'videos')
AUDIO_DIR = os.path.join(BASE_DIR, 'audio')
AUDIO_TEMP_DIR = os.path.join(BASE_DIR, 'audio_temp')
IMAGES_DIR = os.path.join(BASE_DIR, 'images')


def upload_image_to_volume(local_image_path, remote_image_name, volume_name):
    command = f"modal volume put {volume_name} {local_image_path} {remote_image_name}"
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print("Image uploaded to volume successfully.")
        print(f"Standard Output:\n{result.stdout}")
        print(f"Standard Error:\n{result.stderr}")
    except subprocess.CalledProcessError as e:
        if "already exists" in e.stderr:
            print("Image already exists in volume. Skipping upload.")
        else:
            print(f"Image upload failed with exit code {e.returncode}")
            print(f"Standard Output:\n{e.stdout}")
            print(f"Standard Error:\n{e.stderr}")


def run_modal_main(image_paths, prompts, file_mount_names, sample_names, durations, resolutions, aspect_ratios):
    # Upload images to volume
    for idx in range(len(image_paths)):
        upload_image_to_volume(image_paths[idx], file_mount_names[idx], "model-cache-volume")

    # Prepare command to run generate_video.py
    script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'generate_video.py'))
    command = [
        "modal", "run", f"{script_path}::main",
        "--image-paths", json.dumps(image_paths),
        "--prompts", json.dumps(prompts),
        "--file-mount-names", json.dumps(file_mount_names),
        "--sample-names", json.dumps(sample_names),
        "--durations", json.dumps(durations),
        "--resolutions", json.dumps(resolutions),
        "--aspect-ratios", json.dumps(aspect_ratios)
    ]

    try:
        result = subprocess.run(command, check=True, capture_output=True, text=True)
        print("Modal run command executed successfully.")
        print(f"Standard Output:\n{result.stdout}")
        print(f"Standard Error:\n{result.stderr}")
    except subprocess.CalledProcessError as e:
        print(f"Modal run command failed with exit code {e.returncode}")
        print(f"Standard Output:\n{e.stdout}")
        print(f"Standard Error:\n{e.stderr}")
        
        
        
def download_video(remote_video_name, index):
    volume_name = "model-cache-volume"
    local_video_path = VIDEOS_DIR
    local_video_path_name = os.path.join(VIDEOS_DIR, f"gen_video_{index}_0000.mp4")

    if not os.path.exists(VIDEOS_DIR):
        os.makedirs(VIDEOS_DIR)

    files_in_volume = list_files_in_volume(volume_name)
    if remote_video_name not in files_in_volume:
        # print(f"File {remote_video_name} not found in volume {volume_name}")
        return None

    command = f"modal volume get {volume_name} {remote_video_name} {local_video_path}"
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        # print("Video downloaded from volume successfully.")
        # print(f"Standard Output:\n{result.stdout}")
        # print(f"Standard Error:\n{result.stderr}")
        return local_video_path_name
    except subprocess.CalledProcessError as e:
        # print(f"Video download failed with exit code {e.returncode}")
        # print(f"Standard Output:\n{e.stdout}")
        # print(f"Standard Error:\n{e.stderr}")
        return None

def generate_full_narration(narrations, narration_speed):
    if not os.path.exists(AUDIO_TEMP_DIR):
        os.makedirs(AUDIO_TEMP_DIR)
    if not os.path.exists(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)

    full_narration_text = " ".join(narrations)
    # print(f"Generating full narration for text: {full_narration_text}")
    response = client.text_to_speech.convert(
        voice_id="pNInz6obpgDQGcFmaJgB",  # Adam pre-made voice
        optimize_streaming_latency="0",
        output_format="mp3_22050_32",
        text=full_narration_text,
        model_id="eleven_turbo_v2",
        voice_settings=VoiceSettings(
            stability=0.0,
            similarity_boost=1.0,
            style=0.0,
            use_speaker_boost=True,
        ),
    )

    save_file_path = os.path.join(AUDIO_TEMP_DIR, f"{uuid.uuid4()}.mp3")

    with open(save_file_path, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)

    # print(f"{save_file_path}: Full narration audio file was saved successfully!")

    # Adjust narration speed
    audio_clip = AudioFileClip(save_file_path)
    adjusted_audio_clip = speedx(audio_clip, narration_speed)
    adjusted_audio_path = os.path.join(AUDIO_DIR, "full_continuous_narration.mp3")
    adjusted_audio_clip.write_audiofile(adjusted_audio_path)

    return adjusted_audio_path

def generate_music(music_prompt, duration):
    output = replicate.run(
        "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
        input={
            "top_k": 250,
            "top_p": 0,
            "prompt": music_prompt,
            "duration": int(duration),
            "temperature": 1,
            "continuation": False,
            "model_version": "stereo-melody-large",
            "output_format": "mp3",
            "continuation_start": 0,
            "multi_band_diffusion": False,
            "normalization_strategy": "peak",
            "classifier_free_guidance": 3
        }
    )

    music_url = output
    if music_url:
        music_response = requests.get(music_url)
        music_file_path = os.path.join(AUDIO_DIR, "music.mp3")
        with open(music_file_path, "wb") as music_file:
            music_file.write(music_response.content)
        return music_file_path
    else:
        raise Exception("Failed to get music URL from response.")

def calculate_scene_durations(narrations, narration_speed):
    audio_clips = []
    audio_files = []
    sum_of_clips_duration = 0

    for i, narration in enumerate(narrations):
        if not narration.strip():
            # print(f"Skipping empty narration for slide {i + 1}")
            continue

        audio_file = generate_narration(narration, narration_speed)
        audio_clip = AudioFileClip(audio_file)
        audio_duration = audio_clip.duration
        sum_of_clips_duration += audio_duration
        audio_clips.append(audio_clip.set_duration(audio_duration))
        audio_files.append(audio_file)
        # print(f"Generated narration {i + 1}: {audio_file} with duration {audio_duration}")

    if not audio_clips:
        print("No valid clips to concatenate. Exiting.")
        return []

    # Generate full narration audio for the entire script
    full_narration_file = generate_full_narration(narrations, narration_speed)
    final_audio_clip = AudioFileClip(full_narration_file)

    # Calculate the actual duration of the full narration audio
    actual_duration = final_audio_clip.duration

    # Calculate the duration scale factor
    duration_scale = actual_duration / sum_of_clips_duration

    # Calculate scaled durations for each scene
    scaled_durations = [audio_clip.duration * duration_scale for audio_clip in audio_clips]

    # Clean up temporary audio files
    for audio_file in audio_files:
        os.remove(audio_file)

    return scaled_durations

def generate_narration(text, narration_speed):
    if not os.path.exists(AUDIO_TEMP_DIR):
        os.makedirs(AUDIO_TEMP_DIR)
    if not os.path.exists(AUDIO_DIR):
        os.makedirs(AUDIO_DIR)

    # print(f"Generating narration for text: {text}")
    response = client.text_to_speech.convert(
        voice_id="pNInz6obpgDQGcFmaJgB",  # Adam pre-made voice
        optimize_streaming_latency="0",
        output_format="mp3_22050_32",
        text=text,
        model_id="eleven_turbo_v2",
        voice_settings=VoiceSettings(
            stability=0.0,
            similarity_boost=1.0,
            style=0.0,
            use_speaker_boost=True,
        ),
    )

    save_file_path = os.path.join(AUDIO_TEMP_DIR, f"{uuid.uuid4()}.mp3")

    with open(save_file_path, "wb") as f:
        for chunk in response:
            if chunk:
                f.write(chunk)

    # print(f"{save_file_path}: A new audio file was saved successfully!")

    # Adjust narration speed
    audio_clip = AudioFileClip(save_file_path)
    adjusted_audio_clip = speedx(audio_clip, narration_speed)
    adjusted_audio_path = os.path.join(AUDIO_DIR, f"{uuid.uuid4()}_adjusted.mp3")
    adjusted_audio_clip.write_audiofile(adjusted_audio_path)

    return adjusted_audio_path

def download_image(image_url, index):
    response = requests.get(image_url)
    if response.status_code == 200:
        image = Image.open(BytesIO(response.content))
        if not os.path.exists(IMAGES_DIR):
            os.makedirs(IMAGES_DIR)
        image_path = os.path.join(IMAGES_DIR, f"image{index}.png")
        image.save(image_path)
        return image_path
    else:
        raise Exception(f"Failed to download image from {image_url}")

def create_scenes(image_urls, image_descriptions, narrations, music_prompt, narration_speed=1.0, resolution="480p", aspect_ratio="9:16"):
    

    ####################################################
    
    # Download images
    
    ####################################################
    
    images_paths = [download_image(url, i) for i, url in enumerate(image_urls)]



    ####################################################
    
    # Generate full narration audio
    
    ####################################################
    
    full_narration_file = generate_full_narration(narrations, narration_speed)



    ####################################################
    
    # Generate full music audio
    
    ####################################################
    
    scaled_durations = calculate_scene_durations(narrations, narration_speed)
    music_file_path = generate_music(music_prompt, int(sum(scaled_durations)))
    
    
    
    
    ####################################################
    
    # Generate videos
    
    ####################################################
    
    
    # Scaled durations for the audio clips (due to audio for full script taking longer/shorter than audio for combined clips)
    # These durations also represent the length for each "scene"
    # scaled_durations = []
    prompts = []
    file_mount_names = []
    sample_names = []
    resolutions = []
    aspect_ratios = []
    for i, image_path in enumerate(images_paths):
        # args for create videos
        file_mount_names.append(f"image{i}.png")
        sample_names.append(f"gen_video_{i}")
        resolutions.append(resolution)
        aspect_ratios.append(aspect_ratio)
        prompts.append(image_descriptions[i])
        
    # since open-sora only accepts durations of 2, 4, 8, 16s, we have to make it longer then cut it short
    durations = []
    for duration in scaled_durations:
        if duration < 2:
            durations.append("2s")
        elif duration < 4:
            durations.append("4s")
        elif duration < 8:
            durations.append("8s")
        else:
            durations.append("16s")
        
    
    # run in inference for vids in parallel
    run_modal_main(images_paths, prompts, file_mount_names, sample_names, durations, resolutions, aspect_ratios)
    
    # Download videos and store paths
    video_paths = [download_video(f"gen_video_{i}_0000.mp4", i) for i in range(len(image_urls))]


    # Return paths and durations
    return {
        "video_paths": video_paths,
        "full_narration_file": full_narration_file,
        "music_file_path": music_file_path,
        "scene_durations": scaled_durations
    }

if __name__ == "__main__":
    image_urls = ["https://example.com/image1.png", "https://example.com/image2.png"]
    image_descriptions = ["image prompt 1", "image prompt 2"]
    narrations = ["Narration for image 1. This is the first narration.", "Narration for image 2. This is the second narration."]
    narration_speed = 1
    music_prompt = "Example music prompt for testing"
    resolution="480p"
    aspect_ratio="9:16"

    result = create_scenes(image_urls, image_descriptions, narrations, music_prompt, narration_speed, resolution, aspect_ratio)
    print("Results:", result)
