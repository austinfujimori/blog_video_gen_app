import os
import subprocess
import json
import re
import requests
from pathlib import Path
from PIL import Image
from io import BytesIO

VIDEOS_DIR = Path("ML_backend/generated/videos")
IMAGES_DIR = Path("ML_backend/generated/images")

def list_files_in_volume(volume_name):
    command = f"modal volume ls {volume_name}"
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.returncode == 0:
            files = result.stdout.strip().split("\n")
            return files
        else:
            print(f"Failed to list files in volume with exit code {result.returncode}")
            print(f"Standard Output:\n{result.stdout}")
            print(f"Standard Error:\n{result.stderr}")
            return []
    except subprocess.CalledProcessError as e:
        print(f"Error listing files in volume: {e}")
        return []

def delete_files_in_volume(volume_name, files):
    for file in files:
        command = f"modal volume rm {volume_name} {file}"
        try:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"File {file} deleted successfully.")
            else:
                print(f"Failed to delete file {file} with exit code {result.returncode}")
                print(f"Standard Output:\n{result.stdout}")
                print(f"Standard Error:\n{result.stderr}")
        except subprocess.CalledProcessError as e:
            print(f"Error deleting file {file}: {e}")

def clear_modal_cache(volume_name):
    files = list_files_in_volume(volume_name)
    if files:
        delete_files_in_volume(volume_name, files)
    else:
        print("No files to delete in volume.")

def get_text(user_input, max_tokens=512):
    env = os.environ.copy()
    env["USER_INPUT"] = user_input
    env["MAX_TOKENS"] = str(max_tokens)
    script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'get_text.py'))

    result = subprocess.run(["modal", "run", script_path], capture_output=True, text=True, env=env)

    output = result.stdout + result.stderr

    json_match = re.search(r'\[".*?"]', output, re.DOTALL)
    if json_match:
        json_string = json_match.group(0)
        return json_string
    else:
        raise ValueError("No valid JSON output found. Output:\n" + output)

def extract_image_scenes(full_text):
    full_text = full_text.strip().strip('[]"')
    image_pattern = re.compile(r'IMAGE_\d+: (.*?)(?=IMAGE_\d+:|\Z)', re.DOTALL)
    matches = image_pattern.findall(full_text)
    stripped_matches = [match.strip().replace('\n', ' ') for match in matches]
    return stripped_matches

def generate_images(scenes):
    image_urls = []
    script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'generate_image.py'))

    for i, scene in enumerate(scenes):
        prompt = scene
        result = subprocess.run(
            ["python3", script_path, prompt],
            stdout=subprocess.PIPE,  # Suppress extensive stdout
            stderr=subprocess.PIPE,
            text=True
        )
        image_url = result.stdout.strip()
        if image_url:
            image_urls.append(image_url)
    return image_urls

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

def upload_image_to_volume(local_image_path, remote_image_name, volume_name):
    command = f"modal volume put {volume_name} {local_image_path} {remote_image_name}"
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
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
    # Debugging info
    print(f"Image Paths: {image_paths}")
    print(f"Prompts: {prompts}")
    print(f"File Mount Names: {file_mount_names}")
    print(f"Sample Names: {sample_names}")
    print(f"Durations: {durations}")
    print(f"Resolutions: {resolutions}")
    print(f"Aspect Ratios: {aspect_ratios}")

    for idx in range(len(image_paths)):
        upload_image_to_volume(image_paths[idx], file_mount_names[idx], "model-cache-volume")

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

    # Redirecting stdout and stderr to a log file
    with open("modal_run.log", "w") as log_file:
        try:
            result = subprocess.run(command, check=True, stdout=log_file, stderr=log_file, text=True)
            print("Modal run command executed successfully. Check modal_run.log for details.")
        except subprocess.CalledProcessError as e:
            print(f"Modal run command failed with exit code {e.returncode}. Check modal_run.log for details.")

def download_video(remote_video_name, index):
    volume_name = "model-cache-volume"
    local_video_path = VIDEOS_DIR
    local_video_path_name = os.path.join(VIDEOS_DIR, f"gen_video_{index}_0000.mp4")

    if not os.path.exists(VIDEOS_DIR):
        os.makedirs(VIDEOS_DIR)

    files_in_volume = list_files_in_volume(volume_name)
    if remote_video_name not in files_in_volume:
        return None

    command = f"modal volume get {volume_name} {remote_video_name} {local_video_path}"
    try:
        result = subprocess.run(command, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return local_video_path_name
    except subprocess.CalledProcessError as e:
        return None

def regenerate_scene(index, duration, scene_description, style):
    video_name = f"gen_video_{index}_0000.mp4"
    video_path = os.path.join(VIDEOS_DIR, video_name)

    if os.path.exists(video_path):
        os.remove(video_path)
        print(f"Deleted existing video: {video_name}")

    image_name = f"image{index}.png"
    image_path = os.path.join(IMAGES_DIR, image_name)

    if os.path.exists(image_path):
        os.remove(image_path)
        print(f"Deleted existing image: {image_name}")

    response_scenes = [scene_description]

    image_prompt = "For each scene in this script: "
    for i, scene in enumerate(response_scenes):
        image_prompt += "Scene " + str(i) + ": " + scene + "\n\n"
    image_prompt += "come up with a very short description of a " + style + " styled image for each scene that aligns with what the script is talking about and also the overall theme. Begin each description with IMAGE_X:, for example: IMAGE_1: description IMAGE_2: description IMAGE_3: description. Do it for all scenes given."
    
    image_prompt_response = get_text(image_prompt, 1500)
    print("\nImage Prompt Response:\n", image_prompt_response)

    image_descriptions = extract_image_scenes(image_prompt_response)
    for description in image_descriptions:
        description += " generate in a " + style + " style"
    for i, description in enumerate(image_descriptions):
        print("\nScene " + str(i) + ": " + description + "\n\n")

    image_urls = generate_images(image_descriptions)
    with open("image_urls.json", "w") as file:
        json.dump(image_urls, file)
    print("\n\n\n\n Image URLS: " + str(len(image_urls)))

    for i in range(len(image_urls)):
        print("\" " + image_urls[i] + "\", ")

    clear_modal_cache("model-cache-volume")

    local_image_path = download_image(image_urls[0], index)
    image_paths = [local_image_path]
    file_mount_names = [f"image_{index}.png"]
    sample_names = [f"gen_video_{index}"]
    durations = []

    if duration < 2:
        durations.append("2s")
    elif duration < 4:
        durations.append("4s")
    elif duration < 8:
        durations.append("8s")
    else:
        durations.append("16s")

    resolutions = ["480p"]
    aspect_ratios = ["9:16"]
    prompts = [image_descriptions[0]]

    run_modal_main(image_paths, prompts, file_mount_names, sample_names, durations, resolutions, aspect_ratios)
    download_video(video_name, index)

def main():
    import argparse

    parser = argparse.ArgumentParser(description='Regenerate a specific scene video.')
    parser.add_argument('--index', type=int, required=True, help='Index of the scene.')
    parser.add_argument('--duration', type=float, required=True, help='Duration of the scene.')
    parser.add_argument('--scene-description', type=str, required=True, help='Description of the scene.')
    parser.add_argument('--style', type=str, required=True, help='Style of the scene.')

    args = parser.parse_args()

    regenerate_scene(args.index, args.duration, args.scene_description, args.style)

if __name__ == '__main__':
    main()
