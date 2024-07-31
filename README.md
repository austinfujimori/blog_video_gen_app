roomGPT boilerplate: https://github.com/Nutlope/roomGPT?tab=readme-ov-file

blog_video_gen: https://github.com/austinfujimori/blog_video_gen


Need in .env:

REPLICATE_API_TOKEN=______
OPENAI_API_KEY=______
ELEVENLABS_API_KEY=______



Python scripts and “database” are all stored in ML_backend folder in the root dir. Called in the frontend via the pages/api/ files...

For testing, the actual paths of generated videos, narration, and music, are hardcoded in and the generation is commented out (for real deal, in generate-scenes.py, uncomment lines 165 to 204, comment out the labeled lines).


