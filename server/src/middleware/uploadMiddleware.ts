// import multer from 'multer';
// import AWS from 'aws-sdk';
// import multerS3 from 'multer-s3';
// import { Request, Response, NextFunction } from 'express';
// import { v4 as uuidv4 } from 'uuid';

// // Initialize AWS S3 instance using AWS SDK v2 for compatibility with multer-s3
// const s3 = new AWS.S3({
//   region: process.env.NEXT_PUBLIC_AWS_REGION,
//   accessKeyId: process.env.MP_AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.MP_AWS_SECRET_ACCESS_KEY,
// });

// // Configure multer with multer-s3 storage
// const upload = multer({
//   storage: multerS3({
//     s3,
//     bucket: process.env.MP_S3_BUCKET_NAME!,
//     acl: 'public-read', // Adjust as needed
//     metadata: (req, file, cb) => {
//       cb(null, { fieldName: file.fieldname });
//     },
//     key: (req, file, cb) => {
//       const fileExtension = file.originalname.split('.').pop();
//       const uniqueFileName = `${uuidv4()}.${fileExtension}`;
//       cb(null, uniqueFileName);
//     },
//   }),
//   limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
//   fileFilter: (req, file, cb) => {
//     if (!file.mimetype.startsWith('image/')) {
//       cb(new Error('Invalid file type. Only images are allowed.'));
//     } else {
//       cb(null, true);
//     }
//   },
// });

// // Middleware to attach S3 URL to req.file object
// const uploadToS3 = (req: Request, res: Response, next: NextFunction) => {
//   const file = req.file as Express.MulterS3File; // Use the extended type
//   if (file && file.location) {
//     console.log(`File uploaded successfully. Accessible at: ${file.location}`);
//   }
//   next();
// };

// export { upload, uploadToS3 };
