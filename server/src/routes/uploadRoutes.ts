// src/routes/uploadRoutes.ts

import { Router } from "express";
import { uploadImage } from "../controllers/uploadController";
import upload from "../middleware/uploadMiddleware";
const router = Router();

// Route: POST /upload
router.post('/', upload.single('file'), uploadImage);

export default router;
