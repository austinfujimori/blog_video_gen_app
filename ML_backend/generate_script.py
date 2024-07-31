from scrape_info import get_blog_info
import os
import subprocess
import json
import re

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

def extract_scenes(full_text):
    # Extract script text
    script_start = full_text.find("BEGIN_SCRIPT") + len("BEGIN_SCRIPT")
    script_end = full_text.find("END_SCRIPT")
    if script_end == -1:
        script_end = len(full_text)
    script_text = full_text[script_start:script_end].strip()

    # Remove unwanted newline characters and extra spaces
    script_text = re.sub(r'\s+', ' ', script_text)

    # Split script text into sentences using punctuation as delimiters
    sentences = re.split(r'(?<!\w\.\w.)(?<![A-Z][a-z]\.)(?<=\.|\?|!)\s+', script_text)

    # Clean up sentences
    scenes = [sentence.strip() for sentence in sentences if sentence.strip()]

    return scenes



def main(url, duration):
    blog_info = get_blog_info(url)
    max_tokens = 42

    full_text = f"Title: {blog_info['title']}\nDate: {blog_info['date']}\nAuthor: {blog_info['author']}\nContent: {blog_info['content']}"
    prompt = "Can you generate a very short and immersive narration for a video that summarizes the blog provided below:" + full_text + "Do not include anything other than the narrator's dialogue. Keep the script as short as possible and try to summarize everything in the blog. Start it with: BEGIN_SCRIPT and end it with END_SCRIPT, for example: BEGIN_SCRIPT The sun dipped below the horizon, casting a golden hue over the sprawling meadow. The air was crisp and carried the faint scent of blooming wildflowers. In the midst of this serene landscape, a lone figure ambled along a narrow, winding path, his silhouette elongated by the setting sun. END_SCRIPT."

    if duration == "Tiktok (~ 30 sec)":
        max_tokens = 120
    elif duration == "Long (~ 1:00 min)":
        max_tokens = 384
    
    
    response = get_text(prompt, max_tokens)
    
    
    response_scenes = extract_scenes(response)

    return response_scenes

if __name__ == "__main__":
    import sys
    url = sys.argv[1]
    duration = sys.argv[2]
    scenes = main(url, duration)
    print(json.dumps(scenes))
