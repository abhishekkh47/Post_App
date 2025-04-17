import multer from "multer";
import path from "path";
// import fs from "fs";
// import Config from "config";
// import { v4 as uuidV4 } from "uuid";

// const UPLOADS_DIR = (Config.UPLOADS_DIR as string) || "src/uploads";
// if (!fs.existsSync(UPLOADS_DIR as string)) {
//   fs.mkdirSync(UPLOADS_DIR as string, { recursive: true });
// }

// Set up file storage in memory (no need for disk storage)
const storage = multer.memoryStorage();
// multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, UPLOADS_DIR as string);
//   },
//   filename: (req, file, cb) => {
//     cb(null, uuidV4() + path.extname(file.originalname));
//   },
// });

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  } /** Optional: set file size limit (e.g., 10MB) */,
  fileFilter: (req, file, cb) => {
    // Optional: filter for specific file types
    const filetypes = /jpg|jpeg|png|gif|webp|mp4/;
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Error: Only image files are allowed!"));
    }
  },
});
