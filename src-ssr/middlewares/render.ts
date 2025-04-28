import { type RenderError } from '#q-app';
import { defineSsrMiddleware } from '#q-app/wrappers';
import type { Request, Response } from 'express';

// This middleware should execute as last one
// since it captures everything and tries to
// render the page with Vue

export default defineSsrMiddleware(({ app, resolve, render }) => {
  // we capture any other Express route and hand it
  // over to Vue and Vue Router to render our page
  app.get(resolve.urlPath('*'), async (req: Request, res: Response) => {
    const startTime = Date.now();
    console.log(`[SSR] Starting render for ${req.url}`);
    console.log('[Render] Request headers:', req.headers);
    res.setHeader('Content-Type', 'text/html');

    try {
      console.log('[Render] Calling render function');
      const html = await render({
        req,
        res,
      });

      const renderTime = Date.now() - startTime;
      console.log(`[SSR] Render successful for ${req.url} in ${renderTime}ms`);
      console.log(`[SSR] HTML size: ${html.length} bytes`);

      // Add hydration debugging attributes
      const enhancedHtml = html.replace(
        '<div id="app">',
        `<div id="app" data-server-rendered="true" data-render-time="${renderTime}">`,
      );

      res.send(enhancedHtml);
      console.log('[Render] Response sent');
    } catch (err: unknown) {
      const error = err as RenderError;
      const errorTime = Date.now() - startTime;
      console.error(`[SSR] Render failed for ${req.url} after ${errorTime}ms:`, error);
      console.error('[Render] Error stack:', error.stack);

      if (error.url) {
        if (error.code === 404) {
          console.log('[SSR] 404 redirect to:', error.url);
          res.redirect(error.url);
          return;
        } else if (process.env.DEV) {
          // Preserve error during development
          throw error;
        }
      }

      // Production error handling
      if (error.code === 404) {
        res.status(404).send('404 | Page Not Found');
        return;
      }

      // Default to 500 error
      res.status(500).send('500 | Internal Server Error');
    }
  });
});
