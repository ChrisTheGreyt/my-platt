declare module 'express-fileupload' {
    import { RequestHandler } from 'express';
  
    interface UploadedFile {
      name: string;
      data: Buffer;
      size: number;
      encoding: string;
      tempFilePath: string;
      truncated: boolean;
      mimetype: string;
      md5: string;
      mv: (path: string, callback: (err: any) => void) => void;
      mv: (path: string) => Promise<void>;
    }
  
    interface FileArray {
      [fieldname: string]: UploadedFile | UploadedFile[];
    }
  
    interface Options {
      createParentPath?: boolean;
      uriDecodeFileNames?: boolean;
      safeFileNames?: boolean | RegExp;
      preserveExtension?: boolean | number;
      abortOnLimit?: boolean;
      responseOnLimit?: string;
      limitHandler?: RequestHandler;
      uploadTimeout?: number;
      useTempFiles?: boolean;
      tempFileDir?: string;
      debug?: boolean;
      [propName: string]: any;
    }
  
    function fileUpload(options?: Options): RequestHandler;
    export = fileUpload;
  }
  