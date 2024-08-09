roomGPT boilerplate: https://github.com/Nutlope/roomGPT?tab=readme-ov-file

blog_video_gen: https://github.com/austinfujimori/blog_video_gen



# View Demo + Samples

Check out this drive for a demo and some of the samples: https://drive.google.com/drive/folders/1yapIKb0VK8V7KTmVZuXy_3lP5EXc9JQh?usp=sharing. The demo video is cut in some parts during the script generation and when regenerating a scene. The other part for generating all scenes and videos uses the already downloaded scenes like in testing. 


# Use + Testing


Python scripts and “database” are all stored in ML_backend folder in the root dir. Called in the frontend via the pages/api/ files...

For testing, the actual paths of generated videos, narration, and music, are hardcoded in and the generation is commented out.

**For real use**, in generate-scenes.py, uncomment lines 165 to 204, comment out the lines in the testing section.


#### Step 1. Clone Repo


```bash
git clone https://github.com/austinfujimori/blog_video_gen_app.git
```

#### Step 2. Install Dependencies

```bash
npm install
```

#### Step 3. Create and activate Virtual Env

```bash
python -m venv modal-venv
```

```bash
source modal-venv/bin/activate
```

Install the requirements (make sure you have a modal account).

pip install -r requirements.txt



#### Step 4. Create .env file in the root directory

And put:

REPLICATE_API_TOKEN=______

OPENAI_API_KEY=______

ELEVENLABS_API_KEY=______

#### Step 5. Run app

```bash
npm run dev
```