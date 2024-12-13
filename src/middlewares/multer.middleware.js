// src/middlewares/multer.middleware.js
import multer from 'multer';
import path from 'path';

// Set up storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/temp'); // Specify the uploads directory
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use a unique filename
    },
});

// Initialize multer with the storage configuration
const upload = multer({ storage });

// Export the upload middleware
export { upload };
