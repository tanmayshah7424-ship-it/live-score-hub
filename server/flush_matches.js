const mongoose = require('mongoose');
require('dotenv').config(); // Should pick up .env in current dir or find it
const Match = require('./models/Match');

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/scorehub-live');
        console.log('MongoDB Connected');
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

const flush = async () => {
    await connectDB();
    try {
        const result = await Match.deleteMany({});
        console.log(`✅ Flushed ${result.deletedCount} matches.`);
    } catch (err) {
        console.error(err);
    } finally {
        mongoose.disconnect();
    }
};

flush();
