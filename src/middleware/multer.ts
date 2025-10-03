import multer from 'multer';

const fileUploadMiddleware = (fieldName: string) => {
    return multer({
        storage: multer.memoryStorage(),
        limits: {
            fileSize: 1024 * 1024 * 3
        },
        fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
            const allowedTypes = [
                'image/png',
                'image/jpg',
                'image/jpeg',
                'image/heif',
                'image/heic'
            ];

            if (allowedTypes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Only PNG, JPG, JPEG, HEIF, HEIC images are allowed.'), false);
            }
        }
    }).single(fieldName);
}

export default fileUploadMiddleware;
