const router = require('express').Router();
const ctrl = require('../controllers/serviceOrderController');

router.get('/', ctrl.index);
router.get('/:id/print', ctrl.print);
router.get('/:id', ctrl.show);
router.post('/', ctrl.store);
router.put('/:id', ctrl.update);
router.patch('/:id/status', ctrl.updateStatus);

module.exports = router;
