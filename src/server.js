import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route.js';
import userRoutes from './routes/user.route.js';
import { connectDB } from './lib/db.js';
import cookieParser from 'cookie-parser';
import chatRoutes from './routes/chat.route.js';
import cors from 'cors';

dotenv.config();

const app=express();

const PORT = process.env.PORT;


const allowedOrigins = [
  "https://client-side-video-chat-meet.vercel.app",
  "http://localhost:5173", 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS not allowed for this origin: " + origin));
    }
  },
  credentials: true,
}));

app.options("*", cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

const startServer = async () => {
  await connectDB();

  app.use("/api/auth", authRoutes());
  app.use("/api/users", userRoutes());
  app.use("/api/chat", chatRoutes());

  app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
  });
};

startServer();