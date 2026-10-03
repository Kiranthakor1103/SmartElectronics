import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { protect, authorize } from "../middleware/auth";
import { uploadRateLimiter } from "../middleware/rateLimiter";

const router = Router();

// Apply rate limiting and restrict uploads to authenticated admins and sellers
router.use(uploadRateLimiter);
router.use(protect as any, authorize("admin", "seller") as any);

// Ensure uploads directory exists
const uploadDir = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    // Generate safe, unique filename
    const cleanOriginalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(cleanOriginalName) || ".jpg";
    const base = path.basename(cleanOriginalName, ext).substring(0, 30);
    cb(null, `product-${base}-${uniqueSuffix}${ext}`);
  },
});

// File filter for images
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
  ];

  if (allowedMimes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPG, PNG, WebP, GIF, and SVG images are allowed."
      )
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
});

/**
 * @route POST /api/upload
 * @desc Upload a single product image file
 */
router.post(
  "/",
  (req: Request, res: Response, next) => {
    // Support both field names 'image' and 'file'
    const uploadSingle = upload.fields([
      { name: "image", maxCount: 1 },
      { name: "file", maxCount: 1 },
    ]);

    uploadSingle(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File is too large. Maximum allowed size is 10MB.",
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message || "Failed to upload file.",
        });
      }
      next();
    });
  },
  (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const uploadedFile = files?.image?.[0] || files?.file?.[0];

    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        message: "No image file provided in request.",
      });
    }

    const relativeUrl = `/uploads/${uploadedFile.filename}`;

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: relativeUrl,
      filename: uploadedFile.filename,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      originalName: uploadedFile.originalname,
    });
  }
);

/**
 * @route POST /api/upload/multiple
 * @desc Upload up to 5 product gallery images
 */
router.post(
  "/multiple",
  upload.array("images", 5),
  (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[] | undefined;
    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No image files provided.",
      });
    }

    const urls = files.map((f) => `/uploads/${f.filename}`);

    return res.status(200).json({
      success: true,
      message: `${files.length} images uploaded successfully`,
      urls,
      files: files.map((f) => ({
        url: `/uploads/${f.filename}`,
        filename: f.filename,
        size: f.size,
      })),
    });
  }
);

/**
 * @route POST /api/upload/base64
 * @desc Upload image via base64 data URI (useful for pasted/cropped images)
 */
router.post("/base64", async (req: Request, res: Response) => {
  try {
    const { imageBase64, filename } = req.body;
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return res.status(400).json({
        success: false,
        message: "Missing or invalid base64 image data.",
      });
    }

    // Match data URI prefix: data:image/png;base64,...
    const matches = imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({
        success: false,
        message: "Invalid base64 data URI format.",
      });
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length > 10 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Image exceeds 10MB limit.",
      });
    }

    let ext = ".jpg";
    if (mimeType === "image/png") ext = ".png";
    else if (mimeType === "image/webp") ext = ".webp";
    else if (mimeType === "image/gif") ext = ".gif";

    const cleanName = (filename || "pasted")
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 20);
    const uniqueName = `product-${cleanName}-${Date.now()}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    await fs.promises.writeFile(filePath, buffer);

    return res.status(200).json({
      success: true,
      message: "Base64 image saved successfully",
      url: `/uploads/${uniqueName}`,
      filename: uniqueName,
      size: buffer.length,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message || "Failed to process base64 image.",
    });
  }
});

export default router;
