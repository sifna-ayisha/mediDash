import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import routes from '../server/src/routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', routes);

// Connect MongoDB only once
let isConnected = false;
async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGODB_URI as string);
  isConnected = true;
}

export default async function handler(req: Request, res: Response) {
  await connectDB();
  return app(req, res);
}
