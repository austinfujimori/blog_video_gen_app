import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const file = 'music.mp3';

  const filePath = path.join(process.cwd(), 'ML_backend', 'generated', 'audio', file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.setHeader('Content-Type', 'audio/mp3');
  fs.createReadStream(filePath).pipe(res);
}
