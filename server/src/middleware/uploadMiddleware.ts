// src/middleware/uploadMiddleware.ts

import multer, { FileFilterCallback } from 'multer';
import AWS from 'aws-sdk';
import { Request as ExpressRequest } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Use require syntax with type annotation to bypass type errors temporarily
const multerS3: any = require('multer-s3');

// Initialize AWS S3 instance
const s3 = new AWS.S3();

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
    s3: s3,
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
