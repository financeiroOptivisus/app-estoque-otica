const router = require('express').Router();
const auth = require('../middleware/authMiddleware');

router.use('/auth', require('./authRoutes'));
router.use('/clients', auth, require('./clientRoutes'));
router.use('/frames', auth, require('./frameRoutes'));
router.use('/lenses', auth, require('./lensRoutes'));
router.use('/service-orders', auth, require('./serviceOrderRoutes'));
router.use('/financial', auth, require('./financialRoutes'));
router.use('/reports', auth, require('./reportRoutes'));

module.exports = router;
