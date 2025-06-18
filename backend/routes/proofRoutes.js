const express = require('express');
const uploadProof = require('../middleware/uploadProof');
const { verifyToken } = require('../middleware/authMiddleware');

const router = express.Router();

router.post(
  '/upload-proof',
  verifyToken,
  uploadProof.single('proof'),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const fileUrl = `/proofs/${req.file.filename}`;
    res.status(200).json({ message: 'Uploaded successfully', fileUrl });
  }
);

module.exports = router;
