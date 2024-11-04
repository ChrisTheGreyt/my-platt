// src/@types/express-multer-s3.d.ts

import 'express'; // Ensure you import express to extend it properly

declare global {
  namespace Express {
    interface MulterS3File extends Multer.File {
      location: string; // The S3 file URL
      key: string;      // The S3 object key
      bucket: string;   // The S3 bucket name
      etag: string;     // The ETag of the uploaded object
    }
  }
}
