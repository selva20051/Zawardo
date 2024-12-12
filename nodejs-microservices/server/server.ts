import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { googleStrategy } from './controller/userController.js';
import passport from 'passport';
import session from 'express-session';

import userRouter from './routes/userRouter.js';
import classroomRouter from './routes/classroomRoutes.js';
import taskRouter from './routes/taskRoutes.js'
import todoRouter from './routes/todoRoutes.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

// Updated CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5555'],  // Allow both origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'token'], // Add 'token' to allowed headers
  exposedHeaders: ['set-cookie']
}));

app.use(session({
  secret: process.env.JWT_SECRET,  // Replace with a secure key
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);  // Store the user ID in the session
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: id },
    });
    done(null, user);  // Attach user object to req.user
  } catch (error) {
    done(error, null);
  }
});

// Initialize Google Strategy
googleStrategy();

dotenv.config();
const PORT = process.env.PORT || 4000;

const prisma = new PrismaClient();

app.use('/users', userRouter);
app.use('/classroom', classroomRouter);
app.use('/task', taskRouter);
app.use('/todo', todoRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});