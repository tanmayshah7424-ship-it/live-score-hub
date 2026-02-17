const router = require('express').Router();
const { body } = require('express-validator');
const ctrl = require('../controllers/authController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.post('/register', [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
], ctrl.register);

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
], ctrl.login);

router.post('/google', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('name').notEmpty().withMessage('Name is required'),
    body('googleId').notEmpty().withMessage('Google ID is required'),
], ctrl.googleLogin);

router.get('/me', auth, ctrl.getMe);
router.get('/users', auth, admin, ctrl.getUsers);
router.patch('/users/:id/role', auth, require('../middleware/superadmin'), ctrl.updateUserRole);

// Profile management
router.patch('/profile', auth, ctrl.updateProfile);
router.post('/change-password', auth, ctrl.changePassword);

// Password reset
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password/:token', ctrl.resetPassword);

// Favorites management
router.post('/favorites/teams/:teamId', auth, ctrl.addFavoriteTeam);
router.delete('/favorites/teams/:teamId', auth, ctrl.removeFavoriteTeam);
router.post('/favorites/players/:playerId', auth, ctrl.addFavoritePlayer);
router.delete('/favorites/players/:playerId', auth, ctrl.removeFavoritePlayer);
router.get('/favorites', auth, ctrl.getFavorites);

// User management (superadmin only)
router.delete('/users/:id', auth, require('../middleware/superadmin'), ctrl.deleteUser);

module.exports = router;
