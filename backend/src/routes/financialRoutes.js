const router = require('express').Router();
const ctrl = require('../controllers/financialController');

router.get('/', ctrl.index);
router.get('/:id', ctrl.show);
router.post('/', ctrl.store);
router.put('/:id', ctrl.update);
router.post('/:id/installments/:installment_id/pay', ctrl.payInstallment);

module.exports = router;
