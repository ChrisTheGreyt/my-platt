import express from 'express';
import cors from 'cors';
import userTaskRoutes from './routes/userTaskRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Mount the routes with the correct base path
app.use('/api/user-tasks', userTaskRoutes);

export default app; 