import { v2 as cloudinary } from 'cloudinary';

const CLOUDINARY_CLOUD_NAME = "dr687rmux";
const CLOUDINARY_API_KEY= "713936758212262";
const CLOUDINARY_API_SECRET = "GQrQ2FMZRYz04THm2qK8KOj6nJ0";
export const configCloudinary = () => {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  });

  return cloudinary;
};
