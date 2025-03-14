// src/index.ts

import express, { Request, Response, NextFunction } from "express";
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
import { createUser } from "./controllers/userController";
import schoolRoutes from "./routes/schoolRoutes";
import userTaskRoutes from './routes/userTaskRoutes';
import path from "path";

/* CONFIGURATIONS */
dotenv.config();
const app = express();

// Middleware
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({
  origin: ['http://localhost:3000', 'https://main.d249lhj5v2utjs.amplifyapp.com'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'X-Amz-Date', 'Authorization', 'X-Api-Key', 'X-Amz-Security-Token', 'X-Requested-With']
}));

// Logging middleware to log all incoming requests
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  console.log('Request headers:', req.headers);
  if (Object.keys(req.body).length) {
    console.log('Request body:', req.body);
  }

  // Add response logging
  const oldSend = res.send;
  res.send = function (data) {
    console.log(`Response for ${req.method} ${req.url}:`, data);
    return oldSend.call(this, data);
  };

  next();
});

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send('Hello, World!');
});

// app.use("/", userRoutes); //FOR TESTING PURPOSES ONLY!!
app.use("/projects", projectRoutes);
app.use("/tasks", taskRoutes);
app.use("/search", searchRoutes);
app.use("/users", userRoutes);
app.use("/teams", teamRoutes);
app.use('/subscriptions', subscriptionRoutes);
app.post('/create-user', createUser);
app.use('/api', userTaskRoutes);
app.use('/api', schoolRoutes);
 


app.post('/users/update-after-payment', (req, res) => {
  console.log('POST /users/update-after-payment hit');
  console.log('Request Body:', req.body);
  res.json({ success: true, message: 'Request received successfully', data: req.body });
});

// Serve static files
app.use('/public', express.static(path.join(__dirname, '../public')));

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Error:', err);
  res.status(500).json({ success: false, error: 'An unexpected error occurred.' });
});


// Start the Server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
