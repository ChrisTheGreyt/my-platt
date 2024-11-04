// src/controllers/uploadController.ts

import { Request, Response } from 'express';

export const uploadImage = (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Use a type assertion to tell TypeScript that req.file has the `location` property
    const filePath = (req.file as Express.Multer.File & { location: string }).location;

    res.status(200).json({ success: true, filePath });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'An error occurred during the upload' });
  }
};
