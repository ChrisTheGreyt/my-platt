import express from 'express';
import cors from 'cors';
import userTaskRoutes from './routes/userTaskRoutes';

const app = express();

// Configure CORS
const corsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'https://main.d249lhj5v2utjs.amplifyapp.com',
      'http://1localhost:3000'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'],
  credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Mount the routes at the root path
app.use('/api', userTaskRoutes);

export default app; 