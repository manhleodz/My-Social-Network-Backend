const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create multer upload instance
const upload = multer({
    storage: multer.memoryStorage(),
});

// Custom file upload middleware
const uploadMiddleware = (req, res, next) => {
    // Use multer upload instance
    upload.array('files', 5)(req, res, (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }

        // Retrieve uploaded files
        const files = req.files;
        const errors = [];

        if (!files)
            return res.status(400).json({
                message: "No files were uploaded"
            });

        // Validate file types and sizes
        files.forEach((file) => {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'video/mp4'];
            const maxSize = 10 * 1024 * 1024; // 5MB 

            if (!allowedTypes.includes(file.mimetype)) {
                errors.push(`Invalid file type: ${file.originalname}`);
            }

            if (file.size > maxSize) {
                errors.push(`File too large: ${file.originalname}`);
            }
        });

        // Handle validation errors
        if (errors.length > 0) {
            return res.status(400).json({
                message: errors
            });
        }

        // Attach files to the request object
        req.files = files;

        // Proceed to the next middleware or route handler
        return next();
    });
};

module.exports = uploadMiddleware;