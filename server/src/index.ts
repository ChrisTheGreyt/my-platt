// src/index.ts

import express, { Request, Response } from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
/* ROUTE IMPORTS */
import projectRoutes from "./routes/projectRoutes"; 
import taskRoutes from "./routes/taskRoutes";
import searchRoutes from "./routes/searchRoutes";
import userRoutes from "./routes/userRoutes";
import teamRoutes from "./routes/teamRoutes";
import subscriptionRoutes from "./routes/subscriptionRoutes";
import uploadRoutes from "./routes/uploadRoutes"; // Import the upload routes
import path from 'path';





/* CONFIGURATIONS */
dotenv.config();
const app = express();


// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin"}));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
    origin: process.env.CLIENT_URL, 
    methods: ['GET', 'POST'],
    credentials: true,
  }));

app.use(morgan('dev'));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.use("/upload", uploadRoutes); // Mount the upload routes

app.use('/public', express.static(path.join(__dirname, '../public')));

// Error Handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
});

// Start the Server
const port = Number(process.env.PORT) || 3000;
app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
});
