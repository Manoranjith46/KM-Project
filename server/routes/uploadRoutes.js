import express from 'express';
import mongoose from 'mongoose';
import { getGridFSBucket } from '../config/gridfs.js';

const router = express.Router();

// @desc    Stream file from GridFS
// @route   GET /api/uploads/:id
router.get('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid file ID' });
    }

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const bucket = getGridFSBucket();

    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      return res.status(404).json({ message: 'File not found' });
    }

    const file = files[0];
    res.set('Content-Type', file.contentType || 'application/octet-stream');
    res.set('Cache-Control', 'public, max-age=86400');

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.pipe(res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
