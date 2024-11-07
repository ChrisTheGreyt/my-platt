// src/middleware/uploadMiddleware.ts

import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Define a custom file interface extending Multer.File with s3Location
interface CustomFile extends Express.Multer.File {
  s3Location?: string;
}

// Initialize S3 client with v3 SDK configuration
const s3Client = new S3Client({
  region: process.env.MP_REGION,
  credentials: {
    accessKeyId: process.env.MP_ACCESS_KEY_ID!,
    secretAccessKey: process.env.MP_SECRET_ACCESS_KEY!,
  },
});

// Configure multer to store files in memory for further processing
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      cb(new Error('Invalid file type. Only images are allowed.'));
    } else {
      cb(null, true);
    }
  },
});

// Middleware to upload file to S3 after multer processes it
const uploadToS3 = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new Error('No file uploaded'));
  }

  try {
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const bucketName = process.env.MP_S3_BUCKET_NAME!;

    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read" as const,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Cast req.file to CustomFile to add s3Location
    (req.file as CustomFile).s3Location = `https://${bucketName}.s3.${process.env.MP_REGION}.amazonaws.com/${uniqueFileName}`;
    next();
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    next(error);
  }
};

export { upload, uploadToS3 };
