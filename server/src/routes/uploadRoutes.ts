// src/routes/uploadRoutes.ts

import { Router } from "express";

const router = Router();

if (!process.env.DISABLE_UPLOAD) {
  // Only require and use upload middleware if DISABLE_UPLOAD is not set
  const { upload, uploadToS3 } = require("../middleware/uploadMiddleware");
  const { uploadImage } = require("../controllers/uploadController");

  // Route: POST /upload
  router.post('/', upload.single('file'), uploadToS3, uploadImage);
}

export default router;
