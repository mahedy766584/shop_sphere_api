/* eslint-disable no-console */
/* eslint-disable no-undef */
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
  files: Express.Multer.File | Express.Multer.File[] | undefined,
  prefix: string,
): Promise<string | string[] | null> => {
  if (!files) return null;

  const filesArray = Array.isArray(files) ? files : [files];

  const uploads = await Promise.all(
    filesArray.map((file, index) => {
      const imageName = `${prefix}-${Date.now()}-${index}`;

      return new Promise<UploadApiResponse>((resolve, reject) => {
        cloudinary.uploader.upload(file.path, { public_id: imageName }, function (error, result) {
          if (error) return reject(error);
          if (!result) return reject(new Error('Upload failed'));

          resolve(result);

          fs.unlink(file.path, (err) => {
            if (err) {
              console.error('File delete error:', err);
            } else {
              console.log(`File ${file.path} deleted successfully.`);
            }
          });
        });
      });
    }),
  );

  const urls = uploads.map((res) => res.secure_url);
  return Array.isArray(files) ? urls : urls[0];
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
