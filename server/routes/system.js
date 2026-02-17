const router = require('express').Router();
const ctrl = require('../controllers/systemController');
const auth = require('../middleware/auth');
const superadmin = require('../middleware/superadmin');

// All system routes require superadmin access
router.get('/settings', auth, superadmin, ctrl.getSettings);
router.patch('/settings', auth, superadmin, ctrl.updateSettings);
router.post('/broadcast', auth, superadmin, ctrl.broadcastNotification);

module.exports = router;
