import { metricsMiddleware, metricsRegistry } from '@shared/metrics.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import type { Application, Request, Response } from 'express';

import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import notFound from './app/middlewares/notFound.js';
import router from './app/routes/index.js';

const app: Application = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());

// ✅ Metrics middleware সব request এর আগে বসাও
app.use(metricsMiddleware);

//Application route
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Shop Sphere!');
});

// ✅ Metrics endpoint → Prometheus এখান থেকে scrape করবে
app.get('/metrics', async (req: Request, res: Response) => {
  res.set('Content-Type', metricsRegistry.contentType);
  res.end(await metricsRegistry.metrics());
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
