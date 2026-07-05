const multer = require('multer');
const path = require('path');
const fs = require('fs');

const makeStorage = (subfolder) => {
  const dir = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const unique = `${req.user ? req.user._id : 'anon'}-${Date.now()}${ext}`;
      cb(null, unique);
    },
  });
};

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif|pdf/;
  const extValid = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeValid = allowed.test(file.mimetype);
  if (extValid && mimeValid) return cb(null, true);
  cb(new Error('Only image or PDF files are allowed'));
};

const uploadReceipt = multer({
  storage: makeStorage('receipts'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const uploadAvatar = multer({
  storage: makeStorage('avatars'),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

module.exports = { uploadReceipt, uploadAvatar };
