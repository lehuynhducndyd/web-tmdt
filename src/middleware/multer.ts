import multer from "multer";
import { Request } from "express";

const fileFilter = (req: Request, file: Express.Multer.File, cb: Function) => {
    const allowedTypes = [
        "image/png",
        "image/jpg",
        "image/jpeg",
        "image/heif",
        "image/heic"
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PNG, JPG, JPEG, HEIF, HEIC images are allowed."), false);
    }
};

export const fileUploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1024 * 1024 * 3 },
    fileFilter
});
