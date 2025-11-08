import multer from "multer";

export const upload = multer({
  storage: multer.diskStorage({
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  limits: { fileSize: 5000000 },
});
