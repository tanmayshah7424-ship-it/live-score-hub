const router = require('express').Router();
const ctrl = require('../controllers/liveController');

router.get('/', ctrl.getLive);
router.get('/cricket', ctrl.getCricketLive);
router.get('/cricket/:id', ctrl.getCricketMatchById);

module.exports = router;
