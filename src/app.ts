import cors from 'cors';
import type { Application, Request, Response } from 'express';
import express from 'express';

import globalErrorHandler from './app/middlewares/globalErrorHandler.js';
import notFound from './app/middlewares/notFound.js';
import router from './app/routes/index.js';

const app: Application = express();

app.use(cors());
app.use(express.json());

//Application route
app.use('/api/v1', router);

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Shop Sphere!');
});

app.use(globalErrorHandler);
app.use(notFound);

export default app;
