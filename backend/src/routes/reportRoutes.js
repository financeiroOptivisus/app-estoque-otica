const router = require('express').Router();
const ctrl = require('../controllers/reportController');

router.get('/dashboard', ctrl.dashboard);
router.get('/revenue', ctrl.revenue);
router.get('/debtors', ctrl.debtors);
router.get('/low-stock', ctrl.lowStock);
router.get('/top-lenses', ctrl.topLenses);

module.exports = router;
