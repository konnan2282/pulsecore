// === backend/routes/bookingRouter.js ===
const Router = require('express');
const router = new Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, bookingController.create);
router.get('/my', authMiddleware, bookingController.getMy);
router.get('/workout/:workoutId', authMiddleware, bookingController.getByWorkout); // Для тренера
router.put('/:id', authMiddleware, bookingController.updateStatus); // Для тренера (отметка посещений)

module.exports = router;