import dotenv from "dotenv";
dotenv.config();
import Config from "config";
import cloudinary from "cloudinary";

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: Config.CLOUDINARY_CLOUD_NAME,
  api_key: Config.CLOUDINARY_API_KEY,
  api_secret: Config.CLOUDINARY_API_SECRET,
});

export default cloudinary;
