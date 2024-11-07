// src/routes/uploadRoutes.ts

import { Router } from "express";
import { uploadImage } from "../controllers/uploadController";
import { upload, uploadToS3 } from "../middleware/uploadMiddleware"; // Import both as named exports

const router = Router();

// Route: POST /upload
router.post('/', upload.single('file'), uploadToS3, uploadImage);

export default router;
