const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Create uploads directories if they don't exist
const createUploadDirs = async () => {
    const dirs = [
        path.join(__dirname, '../../uploads'),
        path.join(__dirname, '../../uploads/projects'),
        path.join(__dirname, '../../uploads/vehicles'),
    ];

    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error('Error creating upload directory:', error);
            }
        }
    }
};

// Initialize directories
createUploadDirs();

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const type = req.baseUrl.includes('projects') ? 'projects' : 'vehicles';
        const uploadPath = path.join(__dirname, `../../uploads/${type}`);
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-randomhash-originalname
        const uniqueSuffix = crypto.randomBytes(8).toString('hex');
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        const safeFilename = `${timestamp}-${uniqueSuffix}-${nameWithoutExt}${ext}`;
        cb(null, safeFilename);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
    ];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and documents are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    }
});

// Helper function to delete a file
const deleteFile = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../../uploads', filePath);
        await fs.unlink(fullPath);
        return true;
    } catch (error) {
        console.error('Error deleting file:', error);
        return false;
    }
};

// Helper function to check if file exists
const fileExists = async (filePath) => {
    try {
        const fullPath = path.join(__dirname, '../../uploads', filePath);
        await fs.access(fullPath);
        return true;
    } catch {
        return false;
    }
};

module.exports = {
    upload,
    deleteFile,
    fileExists,
    createUploadDirs
};
