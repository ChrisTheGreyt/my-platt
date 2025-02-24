import express from 'express';
import cors from 'cors';
import userTaskRoutes from './routes/userTaskRoutes';

const app = express();

// Configure CORS
const corsOptions = {
  origin: [
    'https://main.d249lhj5v2utjs.amplifyapp.com',
    'http://localhost:3000' // Keep local development working
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
  credentials: true // Enable credentials
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount the routes at the root path
app.use('/api', userTaskRoutes);

export default app; 