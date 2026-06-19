// === backend/routes/membershipRouter.js ===
const Router = require('express');
const router = new Router();
const membershipController = require('../controllers/membershipController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, membershipController.create);
router.get('/my', authMiddleware, membershipController.getMy);
router.put('/:id/renew', authMiddleware, membershipController.renew);
router.put('/:id/reset', authMiddleware, membershipController.reset); // Новый: Обнуление абонемента

module.exports = router;