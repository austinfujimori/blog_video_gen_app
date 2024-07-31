from moviepy.editor import VideoFileClip, concatenate_videoclips, AudioFileClip, CompositeVideoClip, TextClip, CompositeAudioClip, ColorClip
import os
import json
import sys

BASE_DIR = os.path.join('ML_backend', 'generated')
VIDEOS_DIR = os.path.join(BASE_DIR, 'videos')
AUDIO_DIR = os.path.join(BASE_DIR, 'audio')

FONT_PATH = "Arial-Bold.ttf"
MAX_WORDS_PER_LINE = 5

def split_text_into_lines(text, max_words_per_line):
    words = text.split()
    lines = []
    current_line = []

    for word in words:
        if len(current_line) + len(word.split()) <= max_words_per_line:
            current_line.append(word)
        else:
            lines.append(" ".join(current_line))
            current_line = [word]

    if current_line:
        lines.append(" ".join(current_line))

    return lines

def create_movie(narration_script, durations, output_file=os.path.join(BASE_DIR, "output_video.mp4"), fps=24, resolution="480p", aspect_ratio="9:16"):
    video_clips = []
    total_duration = sum(durations)

    # Load pre-generated videos
    for i in range(len(narration_script)):
        video_path = os.path.join(VIDEOS_DIR, f"gen_video_{i}_0000.mp4")
        print(f"Trying to load video: {video_path}")  # Debug print
        
        if os.path.exists(video_path):
            video_clip = VideoFileClip(video_path).subclip(0, durations[i])
            video_clips.append(video_clip)
        else:
            print(f"Missing video for scene {i}: {video_path}")
            continue

    if not video_clips:
        print("No valid clips to concatenate. Exiting.")
        return

    # Concatenate video clips
    final_video = concatenate_videoclips(video_clips, method="compose")

    # Generate subtitles
    for i, scene in enumerate(narration_script):
        lines = split_text_into_lines(scene, MAX_WORDS_PER_LINE)
        subtitle_clips = []
        start_time = sum(durations[:i])
        for j, line in enumerate(lines):
            subtitle = TextClip(line, fontsize=30, color='white', font=FONT_PATH, method='caption', size=(final_video.size[0], None))
            subtitle = subtitle.set_duration(durations[i] / len(lines)).set_start(start_time + j * (durations[i] / len(lines))).set_position(('center', 'bottom'))

            bg_size = subtitle.size
            bg_clip = ColorClip(size=(bg_size[0] + 20, bg_size[1] + 10), color=(0, 0, 0, 128)).set_duration(durations[i] / len(lines)).set_start(start_time + j * (durations[i] / len(lines)))
            
            subtitle_with_bg = CompositeVideoClip([bg_clip.set_position(('center', 'bottom')), subtitle.set_position(('center', 'bottom'))])
            subtitle_clips.append(subtitle_with_bg)

        final_video = CompositeVideoClip([final_video] + subtitle_clips)

    # Load full continuous narration audio
    full_narration_path = os.path.join(AUDIO_DIR, "full_continuous_narration.mp3")
    if not os.path.exists(full_narration_path):
        print(f"Full continuous narration audio not found.")
        return
    full_narration_audio = AudioFileClip(full_narration_path)

    # Load pre-generated background music
    music_file_path = os.path.join(AUDIO_DIR, "music.mp3")
    if not os.path.exists(music_file_path):
        print(f"Background music audio not found.")
        return
    music_clip = AudioFileClip(music_file_path).subclip(0, min(total_duration, AudioFileClip(music_file_path).duration))

    # Combine video audio, narration, and music
    combined_audio = CompositeAudioClip([full_narration_audio, music_clip])
    final_video = final_video.set_audio(combined_audio)

    # Write the final video file
    final_video.write_videofile(output_file, codec="libx264", audio_codec="aac", fps=fps)
    print(f"Video written to {output_file}")

def main(narration_script, durations):
    narration_script = json.loads(narration_script)
    create_movie(narration_script, durations)

if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python combine_to_movie.py <narration_script> <durations>")
        sys.exit(1)
    narration_script = sys.argv[1]
    durations = json.loads(sys.argv[2])
    main(narration_script, durations)
