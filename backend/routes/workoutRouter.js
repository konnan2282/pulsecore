const Router = require('express');
const router = new Router();
const workoutController = require('../controllers/workoutController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, workoutController.create);
router.get('/', authMiddleware, workoutController.getAll);

module.exports = router;