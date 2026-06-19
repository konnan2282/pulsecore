// === backend/routes/progressRouter.js ===
const Router = require('express');
const router = new Router();
const progressController = require('../controllers/progressController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');

// Настройка хранилища для загружаемых картинок (multer)
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, 'progress-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5МБ
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp|jfif|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname || mimetype) {
            return cb(null, true);
        }
        cb(new Error('Разрешены только файлы изображений (JPEG, JPG, PNG, WEBP, JFIF, GIF)!'));
    }
});

// Безопасный перехватчик ошибок Multer
const uploadSinglePhoto = (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.post('/', authMiddleware, uploadSinglePhoto, progressController.create);
router.get('/my', authMiddleware, progressController.getMy);
router.delete('/:id', authMiddleware, progressController.delete); // Метод удаления замера

module.exports = router;