import { Router } from 'express';
import admin from '../middleware/admin.mid.js';
import multer from 'multer';
import handler from 'express-async-handler';
import { BAD_REQUEST } from '../constants/httpStatus.js';
import { storage } from '../config/firebaseConfig.js';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { configCloudinary } from '../config/cloudinary.config.js';

const router = Router();
const upload = multer();

router.post(
  '/',
  admin,
  upload.single('image'),
  handler(async (req, res) => {
    const file = req.file;
    if (!file) {
      res.status(BAD_REQUEST).send();
      return;
    }

    try {
      const imageUrl = await handleUpload(file);
      res.send({ imageUrl });
    } catch (error) {
      res.status(BAD_REQUEST).send({ error: error.message });
    }
  })
);

const uploadImageToCloudinary = imageBuffer => {
  const cloudinary = configCloudinary();

  return new Promise((resolve, reject) => {
    if (!imageBuffer) reject(null);

    cloudinary.uploader
      .upload_stream((error, result) => {
        if (error || !result) reject(error);
        else resolve(result.url);
      })
      .end(imageBuffer);
  });
};

const handleUpload = (imageFile) => {
  if (!imageFile) return;

  const storageRef = ref(storage, `images/${imageFile.originalname}`);
  const uploadTask = uploadBytesResumable(storageRef, imageFile.buffer);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      },
      (error) => {
        // Handle upload errors
        reject(error);
      },
      async () => {
        // Handle successful uploads
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (error) {
          reject(error);
        }
      }
    );
  });
};

export default router;

