import multer from "multer";

// Allowed MIME types for test result file uploads
const ALLOWED_MIMES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
];

// Use memory storage — files go directly to Cloudinary, never touch disk
const resultUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only JPEG, PNG, WebP, GIF images and PDF files are allowed"),
        false,
      );
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20 MB
  },
});

export default resultUpload;
