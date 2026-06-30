const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
['avatars', 'resumes', 'recordings'].forEach(dir => {
  const fullPath = path.join(uploadDir, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'others';
    if (file.fieldname === 'avatar') folder = 'avatars';
    else if (file.fieldname === 'resume') folder = 'resumes';
    else if (file.fieldname === 'recording') folder = 'recordings';
    cb(null, path.join(uploadDir, folder));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${uuidv4().slice(0, 8)}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (allowedTypes) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error(`不支持的文件类型: ${ext}`), false);
  }
};

const uploadAvatar = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: fileFilter(['.jpg', '.jpeg', '.png', '.gif', '.webp'])
}).single('avatar');

const uploadResume = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: fileFilter(['.pdf', '.docx', '.doc'])
}).single('resume');

const uploadRecording = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: fileFilter(['.mp3', '.wav', '.webm', '.m4a'])
}).single('recording');

module.exports = { uploadAvatar, uploadResume, uploadRecording };
