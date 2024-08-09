import { exec } from 'child_process';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { url, duration } = req.body;
    const scriptPath = path.join(process.cwd(), 'ML_backend', 'generate_script.py');

    const command = `python3 ${scriptPath} "${url}" "${duration}"`;

    // Log the command being executed
    console.log("Executing command:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: 'Failed to generate script', details: error.message });
      }
      try {
        console.log('STDOUT:', stdout);
        // Extract the last valid JSON line from the stdout
        const outputLines = stdout.split('\n');
        let jsonOutput = null;
        for (const line of outputLines) {
          try {
            jsonOutput = JSON.parse(line);
            break;  // Found the JSON, exit the loop
          } catch (e) {
            continue;  // Not a JSON line, skip
          }
        }
        
        if (!jsonOutput) {
          throw new Error('No valid JSON output found');
        }
        res.status(200).json({ scenes: jsonOutput });
      } catch (parseError) {
        console.error(`parse error: ${parseError}`);
        console.error(`stdout: ${stdout}`);
        return res.status(500).json({ error: 'Failed to parse script output', details: parseError.message });
      }
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
