import { handler } from '../dist/ssr/index.js';
import fs from 'fs';
import path from 'path';

export default async (req, res) => {
  const startTime = Date.now();
  console.log('[Vercel] Request received:', req.url);

  // Handle static file requests
  if (req.url.startsWith('/assets/') || req.url.startsWith('/icons/')) {
    try {
      const filePath = path.join(process.cwd(), 'dist/ssr/client', req.url);
      console.log('[Vercel] Serving static file:', filePath);

      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath);
        const contentType = getContentType(filePath);

        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=31536000');

        const endTime = Date.now();
        console.log('[Vercel] Static file sent in', endTime - startTime, 'ms');
        console.log('[Vercel] Static file size:', fileContent.length, 'bytes');

        return res.send(fileContent);
      } else {
        console.error('[Vercel] Static file not found:', filePath);
        res.status(404).send('File not found');
        return;
      }
    } catch (error) {
      console.error('[Vercel] Error serving static file:', error);
      res.status(500).send('Error serving static file');
      return;
    }
  }

  // Handle SSR requests
  try {
    const result = await handler(req, res);
    const endTime = Date.now();
    console.log('[Vercel] Response sent in', endTime - startTime, 'ms');

    if (result && typeof result === 'string') {
      console.log('[Vercel] Response size:', result.length, 'bytes');
    } else if (result) {
      console.log('[Vercel] Response type:', typeof result);
    } else {
      console.log('[Vercel] Response was empty or null');
    }

    return result;
  } catch (error) {
    console.error('[Vercel] Error:', error);
    throw error;
  }
};

// Helper function to determine content type
function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  const contentTypes = {
    '.js': 'application/javascript',
    '.css': 'text/css',
    '.html': 'text/html',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'font/otf',
  };

  return contentTypes[ext] || 'application/octet-stream';
}
