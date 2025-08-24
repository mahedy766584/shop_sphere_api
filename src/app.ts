import cors from 'cors';
import type { Application, Request, Response } from 'express';
import express from 'express';

const app: Application = express();

app.use(cors());
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello Shop Sphere!');
});

export default app;
