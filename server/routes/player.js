const router = require('express').Router();
const ctrl = require('../controllers/playerSearchController');

router.get('/search', ctrl.searchPlayer);

module.exports = router;
