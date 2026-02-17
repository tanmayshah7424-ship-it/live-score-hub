const router = require('express').Router();
const ctrl = require('../controllers/commentaryController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/:matchId', ctrl.getByMatch);
router.post('/', auth, admin, ctrl.create);

module.exports = router;
