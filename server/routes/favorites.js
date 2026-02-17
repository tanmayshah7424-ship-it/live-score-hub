const router = require('express').Router();
const ctrl = require('../controllers/favoriteController');
const auth = require('../middleware/auth');

router.get('/', auth, ctrl.getAll);
router.post('/team/:teamId', auth, ctrl.toggleTeam);
router.post('/player/:playerId', auth, ctrl.togglePlayer);

module.exports = router;
