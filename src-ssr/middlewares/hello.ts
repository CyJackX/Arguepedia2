import { type Request, type Response } from 'express';
import { defineSsrMiddleware } from '#q-app/wrappers';

export default defineSsrMiddleware(({ app, resolve }) => {
  app.get(resolve.urlPath('/api/hello'), (req: Request, res: Response) => {
    res.json({
      message: `Hello from SSR! ${String(req.headers.timestamp || '')}`,
      timestamp: new Date().toISOString(),
    });
  });
});
