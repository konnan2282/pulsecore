const Router = require('express');
const router = new Router();
const reportController = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/stats', authMiddleware, reportController.getStats);
router.get('/export-csv', authMiddleware, reportController.exportCSV);

module.exports = router;