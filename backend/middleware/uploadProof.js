const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ensure folder exists
const proofsDir = path.join('uploads', 'proofs');
if (!fs.existsSync(proofsDir)) {
  fs.mkdirSync(proofsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, proofsDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const ext = path.extname(sanitizedName).toLowerCase();

    const uniqueName = `proof_${Date.now()}_${Math.round(Math.random() * 1E9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/png', 
    'image/jpg',
    'application/pdf'
  ];
  
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
  const fileExt = path.extname(file.originalname).toLowerCase();
  
  if (allowedMimeTypes.includes(file.mimetype) && allowedExtensions.includes(fileExt)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Only JPEG, PNG, and PDF files are allowed. Received: ${file.mimetype}`), false);
  }
};

const uploadProof = multer({
  storage,
  fileFilter,
  limits: { 
    fileSize: 5 * 1024 * 1024,
    files: 4, 
    fieldSize: 10 * 1024 * 1024, 
    fields: 20, 
    fieldNameSize: 100, 
    headerPairs: 2000 
  },
  
  onError: (err, next) => {
    console.error('File upload error:', err);
    next(err);
  }
});

module.exports = uploadProof;