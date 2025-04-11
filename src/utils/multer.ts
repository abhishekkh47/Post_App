import multer from "multer";
import path from "path";
import fs from "fs";
import Config from "config";
import { v4 as uuidV4 } from "uuid";

const UPLOADS_DIR = (Config.UPLOADS_DIR as string) || "src/uploads";
// const UPLOADS_DIR = path.resolve(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = uuidV4();
    const extname = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${extname}`);
  },
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  } /** Optional: set file size limit (e.g., 10MB) */,
  fileFilter: (req, file, cb) => {
    // Optional: filter for specific file types
    const filetypes = /jpg|jpeg|png|gif|webp/;
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
