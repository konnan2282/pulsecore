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
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        cb(new Error('Разрешены только файлы изображений!'));
    }
});

router.post('/', authMiddleware, upload.single('photo'), progressController.create);
router.get('/my', authMiddleware, progressController.getMy);

module.exports = router;