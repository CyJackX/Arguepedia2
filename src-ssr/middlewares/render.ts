import { type Request, type Response } from 'express';
import { type RenderError } from '#q-app';
import { defineSsrMiddleware } from '#q-app/wrappers';

// This middleware should execute as last one
// since it captures everything and tries to
// render the page with Vue

export default defineSsrMiddleware(({ app, resolve, render, serve }) => {
  // we capture any other Express route and hand it
  // over to Vue and Vue Router to render our page
  app.get(resolve.urlPath('*'), (req: Request, res: Response) => {
    console.log('[Render] Starting render for:', req.url);
    res.setHeader('Content-Type', 'text/html');

    render(/* the ssrContext: */ { req, res })
      .then((html) => {
        console.log('[Render] Successfully rendered:', req.url);
        // now let's send the rendered html to the client
        res.send(html);
      })
      .catch((err: RenderError) => {
        console.error('[Render] Error rendering:', req.url, err);

        // oops, we had an error while rendering the page

        // we were told to redirect to another URL
        if (err.url) {
          console.log('[Render] Redirecting to:', err.url);
          if (err.code) {
            res.redirect(err.code, err.url);
          } else {
            res.redirect(err.url);
          }
        } else if (err.code === 404) {
          console.log('[Render] 404 Not Found:', req.url);
          // hmm, Vue Router could not find the requested route

          // Should reach here only if no "catch-all" route
          // is defined in /src/routes
          res.status(404).send('404 | Page Not Found');
        } else if (process.env.DEV) {
          console.error('[Render] Dev mode error:', err);
          // well, we treat any other code as error;
          // if we're in dev mode, then we can use Quasar CLI
          // to display a nice error page that contains the stack
          // and other useful information

          // serve.error is available on dev only
          serve.error({ err, req, res });
        } else {
          console.error('[Render] Production error:', err);
          // we're in production, so we should have another method
          // to display something to the client when we encounter an error
          // (for security reasons, it's not ok to display the same wealth
          // of information as we do in development)

          // Render Error Page on production or
          // create a route (/src/routes) for an error page and redirect to it
          res.status(500).send('500 | Internal Server Error');

          if (process.env.DEBUGGING) {
            console.error(err.stack);
          }
        }
      });
  });
});
