require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');
const sportsDbService = require('./services/sportsDbService');
const cricApiService = require('./services/rapidCricketService'); // Using RapidAPI service
const path = require('path');

const app = express();
const server = http.createServer(app);

// Init Socket.IO
initSocket(server);

// Middleware
app.use(cors());
app.use(express.json());

// Note: In Docker, frontend is served separately by nginx
// This code only runs in non-Docker development mode
if (process.env.NODE_ENV === 'production' && process.env.SERVE_FRONTEND === 'true') {
    const frontendPath = path.join(__dirname, '../frontend/dist');
    try {
        app.use(express.static(frontendPath));
    } catch (err) {
        console.warn('Frontend dist folder not found, skipping static file serving');
    }
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/players', require('./routes/players'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/commentary', require('./routes/commentary'));
app.use('/api/favorites', require('./routes/favorites'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/live', require('./routes/live'));
app.use('/api/player', require('./routes/player'));
app.use('/api/cricapi', require('./routes/cricApi'));
app.use('/api/system', require('./routes/system'));
app.use('/api/search', require('./routes/search'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Note: In Docker, frontend is served by nginx (separate container)
// This catch-all only runs if SERVE_FRONTEND is explicitly enabled
if (process.env.NODE_ENV === 'production' && process.env.SERVE_FRONTEND === 'true') {
    app.get('*', (req, res) => {
        const frontendPath = path.resolve(__dirname, '../frontend', 'dist', 'index.html');
        try {
            res.sendFile(frontendPath);
        } catch (err) {
            res.status(404).json({ error: 'Frontend not found' });
        }
    });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const ensureSuperadmin = async () => {
    const User = require('./models/User');
    const superadminEmail = 'tanmayshah7424@gmail.com';

    try {
        let superadmin = await User.findOne({ email: superadminEmail });

        if (!superadmin) {
            superadmin = await User.create({
                name: 'Superadmin',
                email: superadminEmail,
                password: 'Tanmay7424@',
                role: 'superadmin'
            });
            console.log('✅ Superadmin account created:', superadminEmail);
        } else if (superadmin.role !== 'superadmin') {
            superadmin.role = 'superadmin';
            await superadmin.save();
            console.log('✅ Superadmin role restored for:', superadminEmail);
        } else {
            console.log('✅ Superadmin account exists:', superadminEmail);
        }
    } catch (error) {
        console.error('❌ Error ensuring superadmin:', error.message);
    }
};

const start = async () => {
    await connectDB();
    await ensureSuperadmin();
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📡 Socket.IO ready`);
        sportsDbService.start();
        cricApiService.start();
    });
};

start();

