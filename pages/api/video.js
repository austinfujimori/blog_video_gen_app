import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { file } = req.query;

  if (!file) {
    return res.status(400).json({ error: 'File parameter is required' });
  }

  const filePath = path.join(process.cwd(), 'ML_backend', 'generated', 'videos', file);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File not found' });
  }

  res.setHeader('Content-Type', 'video/mp4');
  fs.createReadStream(filePath).pipe(res);
}
