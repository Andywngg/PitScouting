import express from 'express';
import multer from 'multer';
import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createTeam, getTeam, getAllTeams, updateTeam, deleteTeam } from '../controllers/team.controller';

const router = express.Router();

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const storage = hasCloudinaryConfig
  ? (new CloudinaryStorage({
      cloudinary,
      params: {
        folder: 'pit-scouting',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      } as any,
    }) as unknown as multer.StorageEngine)
  : multer.diskStorage({
      destination: './uploads/',
      filename: (_req, file, cb) => {
        cb(null, `${Date.now()}${path.extname(file.originalname)}`);
      },
    });

const upload = multer({ storage });

router.post('/', upload.single('robotImage'), createTeam);
router.get('/:teamNumber', getTeam);
router.get('/', getAllTeams);
router.put('/:teamNumber', upload.single('robotImage'), updateTeam);
router.delete('/:teamNumber', deleteTeam);

export default router; 
