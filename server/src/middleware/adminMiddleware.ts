import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_COGNITO_IDS = [
  "b4d80438-b081-7025-1adc-d6f95479680f", 
  "74488448-c071-70b0-28db-644fc67f3f11",
];

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cognitoId = req.headers.authorization?.split(' ')[1];

    if (!cognitoId) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    if (!ADMIN_COGNITO_IDS.includes(cognitoId)) {
      return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }

    next();
  } catch (error) {
    console.error('Error in admin middleware:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 