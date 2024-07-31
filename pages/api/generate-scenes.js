import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { response, style } = req.body;

    const scriptPath = path.join(process.cwd(), 'ML_backend', 'generate-scenes.py');
    const command = `python3 ${scriptPath} ${JSON.stringify(response)} ${JSON.stringify(style)}`;

    console.log("Executing command:", command);

    try {
      const { stdout, stderr } = await execPromise(command);

      console.log("Raw stdout:", stdout);
      console.log("stderr:", stderr);

      // Ensure the JSON output is correctly formatted
      let jsonStart = stdout.indexOf('{');
      let jsonEnd = stdout.lastIndexOf('}') + 1;
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('Failed to extract JSON from stdout');
      }
      const jsonString = stdout.slice(jsonStart, jsonEnd).trim();

      console.log("Extracted JSON string:", jsonString);

      const parsedOutput = JSON.parse(jsonString);

      // Modify paths to be accessible from the server
      const videoPaths = parsedOutput.result.video_paths.map(video => `/api/video?file=${path.basename(video)}`);
      const fullNarrationFile = `/ML_backend/generated/audio/${path.basename(parsedOutput.result.full_narration_file)}`;
      const musicFilePath = `/ML_backend/generated/audio/${path.basename(parsedOutput.result.music_file_path)}`;

      res.status(200).json({
        videoPaths,
        fullNarrationFile,
        musicFilePath,
        sceneDurations: parsedOutput.result.scene_durations,
        narrationScript: parsedOutput.narrationScript,
        styleUsed: parsedOutput.styleUsed
      });
    } catch (error) {
      console.error('Error executing Python script:', error);
      console.error('Error details:', error.message);
      res.status(500).json({ error: 'Failed to execute Python script' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
