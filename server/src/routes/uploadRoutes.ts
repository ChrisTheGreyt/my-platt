// src/routes/uploadRoutes.ts

import { Router } from 'express';
const router = Router();

// Conditionally load the upload middleware only if it exists
let upload, uploadToS3;
try {
    ({ upload, uploadToS3 } = require('../middleware/uploadMiddleware'));
} catch (error) {
    console.warn("Upload middleware is not available. Skipping upload routes.");
}

if (upload && uploadToS3) {
    router.post('/', upload.single('file'), uploadToS3, (req, res) => {
        res.status(200).send({ message: 'Upload route is temporarily disabled.' });
    });
} else {
    // Temporary fallback for builds, to prevent errors if middleware is missing
    router.post('/', (req, res) => {
        res.status(503).send({ message: 'Uploads are currently disabled.' });
    });
}

export default router;
