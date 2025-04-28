import { handler } from '../dist/ssr/index.js';

export default async (req, res) => {
  const startTime = Date.now();
  console.log('[Vercel] Request received:', req.url);

  try {
    const result = await handler(req, res);
    const endTime = Date.now();
    console.log('[Vercel] Response sent in', endTime - startTime, 'ms');
    console.log('[Vercel] Response size:', result?.length || 'unknown');
    return result;
  } catch (error) {
    console.error('[Vercel] Error:', error);
    throw error;
  }
};
