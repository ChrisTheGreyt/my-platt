import 'multer';

declare module 'multer' {
  export interface File {
    location?: string; // Property added by multer-s3 for S3 file URL
    // Add other multer-s3 specific properties if needed, e.g., key: string;
  }
}