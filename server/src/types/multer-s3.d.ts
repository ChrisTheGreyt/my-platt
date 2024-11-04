// src/types/multer-s3.d.ts
declare module 'multer-s3' {
  import { S3 } from 'aws-sdk';
  import { StorageEngine } from 'multer';
  import { Request as ExpressRequest } from 'express';

  interface Options {
    s3: S3;
    bucket: string;
    acl?: string;
    metadata?: (req: ExpressRequest, file: Express.Multer.File, cb: (error: any, metadata?: any) => void) => void;
    key?: (req: ExpressRequest, file: Express.Multer.File, cb: (error: any, key?: string) => void) => void;
  }

  function multerS3(options: Options): StorageEngine;

  export = multerS3;
}
