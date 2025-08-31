/* eslint-disable no-undef */
/* eslint-disable no-console */
import { v2 as cloudinary } from 'cloudinary';
import type { UploadApiResponse } from 'cloudinary';
import fs from 'fs';
import multer from 'multer';

import config from '@config/index.js';

cloudinary.config({
  cloud_name: config.cloudinary_cloud_name,
  api_key: config.cloudinary_api_key,
  api_secret: config.cloudinary_api_secret,
});

export const uploadImageToCloudinary = async (
  imageName: string,
  path: string,
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(path, { public_id: imageName }, function (error, result) {
      if (error) {
        return reject(error);
      }

      if (!result) {
        return reject(new Error('Upload failed with unknown error'));
      }

      resolve(result);

      fs.unlink(path, (err) => {
        if (err) {
          reject(err);
        } else {
          console.log('File is deleted.');
        }
      });
    });
  });
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, process.cwd() + '/src/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

export const upload = multer({
  storage: storage,
  limits: {
    fieldSize: 20 * 1024 * 1024, // ✅ 20MB
  },
});
