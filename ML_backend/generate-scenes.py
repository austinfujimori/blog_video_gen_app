


# take in (response, style)



# this will download the generated videos for each scene as: 
#    gen_video_i_0000.mp4

# the full narration audio as:
#    full_continuous_narration.mp3

# and the full music audio as: 
#    music.mp3

# also the durations for each scene as a list of floats

from scrape_info import get_blog_info
import os
import subprocess
import json
from create_scenes import create_scenes
import re
import sys

# For clearing modal volume
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

    # Find the JSON-like array in the concatenated output
    json_match = re.search(r'\[".*?"]', output, re.DOTALL)
    if json_match:
        json_string = json_match.group(0)
        return json_string
    else:
        raise ValueError("No valid JSON output found. Output:\n" + output)


def extract_scenes(paragraph, max_words=9):
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s', paragraph)

    def split_long_sentence(sentence, max_words=11):
        words = sentence.split()
        if len(words) <= max_words:
            return [sentence]

        num_chunks = (len(words) + max_words - 1) // max_words  # calculate number of chunks needed
        chunk_size = len(words) // num_chunks  # base size of each chunk
        remainder = len(words) % num_chunks  # remaining words to distribute

        chunks = []
        start = 0
        for i in range(num_chunks):
            extra_word = 1 if i < remainder else 0  # distribute the remainder words
            end = start + chunk_size + extra_word
            chunks.append(' '.join(words[start:end]))
            start = end
        return chunks

    scenes = []
    for sentence in sentences:
        split_sentences = split_long_sentence(sentence, max_words)
        scenes.extend(split_sentences)
    
    return scenes


def extract_image_scenes(full_text):
    # Remove the list brackets if they exist
    full_text = full_text.strip().strip('[]"')
    
    # Adjust the regular expression to handle newline characters within descriptions
    image_pattern = re.compile(r'IMAGE_\d+: (.*?)(?=IMAGE_\d+:|\Z)', re.DOTALL)
    matches = image_pattern.findall(full_text)
    
    
    # Strip whitespace and return the matches
    stripped_matches = [match.strip().replace('\n', ' ') for match in matches]
    
    return stripped_matches


def generate_images(scenes):
    image_urls = []
    script_path = os.path.abspath(os.path.join(os.path.dirname(__file__), 'generate_image.py'))

    for i, scene in enumerate(scenes):
        prompt = scene
        result = subprocess.run(
            ["python3", script_path, prompt],
            capture_output=True,
            text=True
        )
        image_url = result.stdout.strip()
        if image_url:
            image_urls.append(image_url)
    return image_urls


def get_music_prompt(full_text):
    script_start = full_text.find("BEGIN_PROMPT") + len("BEGIN_PROMPT")
    script_end = full_text.find("END_PROMPT")
    if script_end == -1:
        script_end = len(full_text)
    script_text = full_text[script_start:script_end].strip()
    return script_text


def main(response, style):
    narration_speed = 1.0
    
    # Make a list for each scene (sentence)
    response_scenes = extract_scenes(response)
    for i, scene in enumerate(response_scenes):
        print("\nScene " + str(i) + ": " + scene + "\n\n")

    # # Get image descriptions
    # image_prompt = "For each scene in this script: "
    # for i, scene in enumerate(response_scenes):
    #     image_prompt += "Scene " + str(i) + ": " + scene + "\n\n"
    # image_prompt += "come up with a very short description of a " + style + " styled image for each scene that aligns with what the script is talking about and also the overall theme. Begin each description with IMAGE_X:, for example: IMAGE_1: description IMAGE_2: description IMAGE_3: description. Do it for all scenes given."
    # image_prompt_response = get_text(image_prompt, 1500)
    # print("\nImage Prompt Response:\n", image_prompt_response)

    # image_descriptions = extract_image_scenes(image_prompt_response)
    # for description in image_descriptions:
    #     description += " generate in a " + style + " style"
    # for i, description in enumerate(image_descriptions):
    #     print("\nScene " + str(i) + ": " + description + "\n\n")


    # # Generate images for each image description
    # image_urls = generate_images(image_descriptions)
    # # print("Image URLs:\n", image_urls)
    # with open("image_urls.json", "w") as file:
    #     json.dump(image_urls, file)
    # print("\n\n\n\n Image URLS: " + str(len(image_urls)))

    # for i in range(len(image_urls)):
    #     print("\" " + image_urls[i] + "\", ")

    # # Get music prompt
    # music_prompt = "Generate a prompt for a music generator for music that would go along with a story like this: "
    # for scene in response_scenes:
    #     music_prompt += scene
    # music_response = get_text(music_prompt, 50)[0]
    # print(music_response)

    # # Clear Modal Volume
    # clear_modal_cache("model-cache-volume")

    # # Create movie
    # narration_script = response_scenes
    
    # result = create_scenes(image_urls, image_descriptions, narration_script, music_response, narration_speed)
    # return (result, narration_script, style)




    ###############################################################
    
    # ONLY FOR TESTING, UNCOMMENT ABOVE FOR REAL
    
    ###############################################################

    narration_script = response_scenes
    
    video_paths = ["/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_0_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_1_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_2_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_3_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_4_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_5_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_6_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_7_0000.mp4", "/Users/austinfujimori/Desktop/blog_video_app/ML_backend/generated/videos/gen_video_8_0000.mp4"]
    
    
    full_narration_file = "ML_backend/generated/audio/full_continuous_narration.mp3"
    music_file_path = "ML_backend/generated/audio/music.mp3"
    scaled_durations = [3.4181591895803183, 5.815458755426918, 4.014616497829233, 4.198141823444284, 3.8655021707670043, 5.333704775687409, 5.127238784370477, 4.049027496382054, 3.808150506512301]

    result = {
        "video_paths": video_paths,
        "full_narration_file": full_narration_file,
        "music_file_path": music_file_path,
        "scene_durations": scaled_durations
    }

    return (result, narration_script, style)


    ###############################################################
    
    ###############################################################






    
    
if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python main.py <response> <style>")
        sys.exit(1)
    response = sys.argv[1]
    style = sys.argv[2]
    try:
        (result, narration_script, style_used) = main(response, style)
        result_data = {
            "result": result,
            "narrationScript": narration_script,
            "styleUsed": style_used
        }
        print(json.dumps(result_data))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)
