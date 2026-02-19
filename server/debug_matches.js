const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');
const Match = require('./models/Match');
const Team = require('./models/Team');

const run = async () => {
    try {
        // Check both potential env vars
        const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
        console.log('Using Mongo URI:', uri || 'UNDEFINED');

        if (!uri) throw new Error('Database URI not found in env');

        await mongoose.connect(uri);
        console.log('Connected to DB');

        console.log('Fetching completed matches...');
        const matches = await Match.find({ status: 'completed' })
            .populate('teamA', 'name shortName logo sport')
            .populate('teamB', 'name shortName logo sport');

        console.log('Matches found:', matches.length);
        if (matches.length > 0) {
            console.log('Sample:', JSON.stringify(matches[0], null, 2));
        } else {
            console.log('No matches found.');
        }

    } catch (error) {
        console.error('FULL ERROR:', error);
    } finally {
        if (mongoose.connection.readyState === 1) {
            await mongoose.disconnect();
        }
    }
};

run();
