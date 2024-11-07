// src/middleware/uploadMiddleware.ts

import multer, { FileFilterCallback } from 'multer';
import multerS3 from 'multer-s3';
import { Request } from 'express';
import s3 from '@/config/awsConfig';
import { v4 as uuidv4 } from 'uuid';

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  if (!file.mimetype.startsWith('image/')) {
    cb(new Error('Invalid file type. Only images are allowed.'));
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.MP_S3_BUCKET_NAME!,
    acl: 'public-read', // Adjust as needed
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileExtension = file.originalname.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      cb(null, uniqueFileName);
    },
  }),
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
});

export default upload;
