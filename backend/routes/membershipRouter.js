const Router = require('express');
const router = new Router();
const membershipController = require('../controllers/membershipController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, membershipController.create);
router.get('/my', authMiddleware, membershipController.getMy);
router.put('/:id/renew', authMiddleware, membershipController.renew);
module.exports = router;