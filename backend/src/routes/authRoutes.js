const router = require('express').Router();
const ctrl = require('../controllers/authController');
const auth = require('../middleware/authMiddleware');

router.post('/login', ctrl.login);
router.get('/me', auth, ctrl.me);

module.exports = router;
