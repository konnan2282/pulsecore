// === backend/routes/workoutRouter.js ===
const Router = require('express');
const router = new Router();
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middleware/authMiddleware');

// Создавать тренировки может только авторизованный тренер или админ
router.post('/', authMiddleware, workoutController.create);

// Просматривать список тренировок может любой посетитель сайта
router.get('/', workoutController.getAll);

module.exports = router;