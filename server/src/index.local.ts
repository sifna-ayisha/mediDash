import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Load routes
import routes from './routes';
app.use('/api', routes);

// Connect to MongoDB (only once)
let isConnected = false;

async function connectDB() {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log("MongoDB connected");
        isConnected = true;
    } catch (error) {
        console.error("MongoDB error:", error);
    }
}

connectDB();

app.get('/', (req, res) => {
    res.send('MediDash API is running');
});

export default app;  