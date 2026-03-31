const router = require('express').Router();
const ctrl = require('../controllers/lensController');

router.get('/', ctrl.index);
router.get('/:id', ctrl.show);
router.post('/', ctrl.store);
router.put('/:id', ctrl.update);
router.patch('/:id/stock', ctrl.adjustStock);
router.delete('/:id', ctrl.destroy);

module.exports = router;
