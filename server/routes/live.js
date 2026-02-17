const router = require('express').Router();
const ctrl = require('../controllers/liveController');

router.get('/', ctrl.getLive);

module.exports = router;
