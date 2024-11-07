import multer from 'multer';
import AWS from 'aws-sdk';
import multerS3 from 'multer-s3';
import { v4 as uuidv4 } from 'uuid';

const s3 = new AWS.S3();

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.MP_S3_BUCKET_NAME!,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const uniqueFileName = `${uuidv4()}-${file.originalname}`;
      cb(null, uniqueFileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
