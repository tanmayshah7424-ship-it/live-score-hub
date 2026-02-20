require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const { initSocket } = require('./socket');
const errorHandler = require('./middleware/errorHandler');
const sportsDbService = require('./services/sportsDbService');
const cricApiService = require('./services/rapidCricketService'); // Using RapidAPI service
const espnPollingService = require('./services/espnPollingService');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Init Socket.IO
initSocket(server);

// Middleware – allow all origins so other devices on the LAN can connect
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'] }));
app.use(express.json());

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../frontend/dist')));

    // API Routes are defined below, so they take precedence
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
app.use('/api/espn', require('./routes/espn'));
app.use('/api/cricbuzz', require('./routes/cricbuzz'));

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Catch-all for client-side routing in production
if (process.env.NODE_ENV === 'production') {
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'dist', 'index.html'));
    });
}

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

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
    try {
        await connectDB();
        await ensureSuperadmin();
        // Only listen if not in test mode, or if explicitly called
        if (process.env.NODE_ENV !== 'test') {
            server.listen(PORT, '0.0.0.0', () => {
                console.log(`🚀 Server running on port ${PORT}`);
                console.log(`📡 Socket.IO ready`);
                sportsDbService.start();
                cricApiService.start();
                // espnPollingService.start(); // Disabled temporarily for stability
            });
        }
    } catch (err) {
        console.error("Server startup error:", err);
    }
};

// Only auto-start if not imported (main module)
if (require.main === module) {
    start();
}

module.exports = { app, server, start, connectDB };

