const router = require('express').Router();
const ctrl = require('../controllers/notificationController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const superadmin = require('../middleware/superadmin');

// Get notifications for current user
router.get('/', auth, ctrl.getUserNotifications);
router.get('/unread-count', auth, ctrl.getUnreadCount);

// Mark as read
// Mark as read
router.patch('/:id/read', auth, ctrl.markAsRead);

// Delete notification
router.delete('/:id', auth, ctrl.deleteNotification);

// Send notifications (role-based)
router.post('/system', auth, superadmin, ctrl.sendSystemNotification);
router.post('/match', auth, admin, ctrl.sendMatchNotification);
router.post('/broadcast', auth, admin, ctrl.broadcast); // Legacy

module.exports = router;
