import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { narrationScript, sceneDurations } = req.body;

    const scriptPath = path.join(process.cwd(), 'ML_backend', 'combine_to_movie.py');
    const videoOutputPath = path.join(process.cwd(), 'ML_backend', 'generated', 'output_video.mp4');

    const command = `python3 ${scriptPath} '${JSON.stringify(narrationScript)}' '${JSON.stringify(sceneDurations)}'`;

    console.log("Executing command:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: 'Failed to generate movie', details: error.message });
      }

      try {
        console.log('STDOUT:', stdout);

        // Check if video file exists
        if (fs.existsSync(videoOutputPath)) {
          // Send the video file
          res.writeHead(200, {
            'Content-Type': 'video/mp4',
            'Content-Length': fs.statSync(videoOutputPath).size,
          });

          const readStream = fs.createReadStream(videoOutputPath);
          readStream.pipe(res);
        } else {
          return res.status(500).json({ error: 'Movie generated but video file not found' });
        }
      } catch (parseError) {
        console.error(`parse error: ${parseError}`);
        console.error(`stdout: ${stdout}`);
        return res.status(500).json({ error: 'Failed to parse movie generation output', details: parseError.message });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
