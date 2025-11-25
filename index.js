import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';

import { connectDB } from './database/db.js';

// ❗ DO NOT import Razorpay here
// ❗ DO NOT create another Razorpay instance here
import { instance } from "./config/razorpay.js";

const app = express();

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(express.json());

app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

const port = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Server is working');
});

// Routes
import userRoutes from './routes/user.js';
import CourseRoutes from './routes/course.js';
import AdminRoutes from './routes/admin.js';

app.use('/api', userRoutes);
app.use('/api', CourseRoutes);
app.use('/api', AdminRoutes);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    connectDB();
});
