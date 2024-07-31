import path from 'path';
import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { index, duration, sceneDescription, style } = req.body;

    // Escape double quotes in sceneDescription to prevent shell errors
    const escapedSceneDescription = sceneDescription.replace(/"/g, '\\"');

    const scriptPath = path.join(process.cwd(), 'ML_backend', 'regenerate-scene.py');
    const command = `python3 ${scriptPath} --index ${index} --duration ${duration} --scene-description "${escapedSceneDescription}" --style "${style}"`;

    console.log("Executing command:", command);

    try {
      const { stdout, stderr } = await execPromise(command);

      console.log("Raw stdout:", stdout);
      console.log("stderr:", stderr);

      if (stderr) {
        throw new Error(stderr);
      }

      res.status(200).json({ message: 'Scene regenerated successfully', newVideoPath: stdout.trim() });
    } catch (error) {
      console.error('Error executing Python script:', error);
      res.status(500).json({ error: 'Failed to regenerate scene' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
