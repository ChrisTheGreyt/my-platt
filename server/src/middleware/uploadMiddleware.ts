import multer from 'multer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Multer File type to include s3Location
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        s3Location?: string;
      }
    }
  }
}

// Initialize S3 client with v3 SDK configuration
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Configure multer to store files in memory
const storage = multer.memoryStorage();
export const upload = multer({
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
export const uploadToS3 = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(new Error('No file uploaded'));
  }

  try {
    const fileExtension = req.file.originalname.split('.').pop();
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;
    
    // Upload file to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ACL: "public-read" as const,
    };

    const command = new PutObjectCommand(uploadParams);
    await s3.send(command);

    // Attach the S3 file location to the request object
    req.file.s3Location = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    next();
  } catch (error) {
    console.error('Error uploading file to S3:', error);
    next(error);
  }
};
