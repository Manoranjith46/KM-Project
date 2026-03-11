import mongoose from 'mongoose';

let bucket;

export const getGridFSBucket = () => {
  if (!bucket) {
    const db = mongoose.connection.getClient().db();
    bucket = new mongoose.mongo.GridFSBucket(db, {
      bucketName: 'uploads',
    });
  }
  return bucket;
};

export const uploadToGridFS = (buffer, filename, contentType) => {
  return new Promise((resolve, reject) => {
    const bucket = getGridFSBucket();
    const uploadStream = bucket.openUploadStream(filename, { contentType });

    uploadStream.on('finish', () => resolve(uploadStream.id));
    uploadStream.on('error', reject);

    uploadStream.end(buffer);
  });
};

export const deleteFromGridFS = async (fileId) => {
  const bucket = getGridFSBucket();
  await bucket.delete(new mongoose.Types.ObjectId(fileId));
};
