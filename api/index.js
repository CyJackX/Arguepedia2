import { handler } from '../dist/ssr/index.js';

export default async (req, res) => {
  const startTime = Date.now();
  console.log('[Vercel] Request received:', req.url);

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
