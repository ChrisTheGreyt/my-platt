// src/middleware/uploadMiddleware.ts

import multer, { FileFilterCallback } from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Request as ExpressRequest } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Use require syntax with type annotation to bypass type errors temporarily
const multerS3: any = require('multer-s3');

// Initialize the S3 client with @aws-sdk/client-s3
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// File filter function to accept only image files
const fileFilter = (
  req: ExpressRequest,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Invalid file type. Only images are allowed.'));
  } else {
    cb(null, true);
  }
};

// Configure multer with multer-s3 storage
const upload = multer({
  storage: multerS3({
    s3: s3,  // Uses our S3Client instance
    bucket: process.env.AWS_S3_BUCKET_NAME!,
    acl: 'public-read', // Adjust as needed
    metadata: (req: ExpressRequest, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req: ExpressRequest, file: Express.Multer.File, cb: (error: any, key?: string) => void) => {
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      cb(null, uniqueFileName);
    },
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

export default upload;
