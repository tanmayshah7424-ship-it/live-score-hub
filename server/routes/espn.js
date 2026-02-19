const router = require('express').Router();
const ctrl = require('../controllers/espnController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Public endpoints (or protected if needed, usually ingestion checks are admin only)
router.get('/genes', ctrl.getGenes);

// Ingestion/Passthrough endpoints - verifying Auth/Admin for ingestion might be good, 
// but for now keeping open or as per request. 
// Adding auth/admin middleware for ingestion actions would be safer.
// For now, I'll allow public READ, but maybe restrict INGEST? 
// The controller checks query param `ingest=true`. 
// I'll keep it simple for now as requested.

router.get('/teams', ctrl.getTeams);
router.get('/teams/:id', ctrl.getTeam);
router.get('/scoreboard', ctrl.getScoreboard);

module.exports = router;
