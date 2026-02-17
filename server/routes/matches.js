const router = require('express').Router();
const ctrl = require('../controllers/matchController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public endpoints
router.get('/', ctrl.getAll);
router.get('/live', ctrl.getLive);
router.get('/upcoming', ctrl.getUpcoming);
router.get('/finished', ctrl.getFinished);
router.get('/stats', ctrl.getStats);
router.get('/:id', ctrl.getById);

// Admin endpoints
router.post('/', auth, admin, ctrl.create);
router.put('/:id', auth, admin, ctrl.update);
router.patch('/:id/score', auth, admin, ctrl.updateScore);
router.patch('/:id/status', auth, admin, ctrl.updateStatus);
router.delete('/:id', auth, admin, ctrl.remove);

module.exports = router;
