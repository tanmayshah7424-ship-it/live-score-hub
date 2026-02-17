const router = require('express').Router();
const ctrl = require('../controllers/playerController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', auth, admin, ctrl.create);
router.put('/:id', auth, admin, ctrl.update);
router.delete('/:id', auth, admin, ctrl.remove);

module.exports = router;
