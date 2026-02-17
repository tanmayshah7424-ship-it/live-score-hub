const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User = require('../models/User');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);

        res.status(201).json({ token, user });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = generateToken(user._id);
        res.json({ token, user });
    } catch (error) {
        next(error);
    }
};

exports.getMe = async (req, res) => {
    res.json(req.user);
};

exports.getUsers = async (req, res, next) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        next(error);
    }
};

exports.googleLogin = async (req, res, next) => {
    try {
        const { email, name, googleId } = req.body;

        let user = await User.findOne({ email });

        if (!user) {
            // Create a new user with a random password
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            user = await User.create({
                name,
                email,
                password: randomPassword,
                role: 'user'
            });
        }

        const token = generateToken(user._id);
        res.json({ token, user });
    } catch (error) {
        next(error);
    }
};

exports.updateUserRole = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { role } = req.body;

        if (!['user', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent modification of superadmin accounts
        if (targetUser.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot modify superadmin role' });
        }

        // Only allow promoting to admin, not to superadmin (superadmin is permanent)
        if (role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot promote users to superadmin' });
        }

        targetUser.role = role;
        await targetUser.save();

        res.json({ message: 'User role updated', user: targetUser });
    } catch (error) {
        next(error);
    }
};

exports.updateProfile = async (req, res, next) => {
    try {
        const { name } = req.body;

        if (!name || name.trim().length === 0) {
            return res.status(400).json({ message: 'Name is required' });
        }

        const user = await User.findById(req.user._id);
        user.name = name.trim();
        await user.save();

        res.json({ message: 'Profile updated successfully', user });
    } catch (error) {
        next(error);
    }
};

exports.changePassword = async (req, res, next) => {
    try {
        const { oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            return res.status(400).json({ message: 'Old and new passwords are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters' });
        }

        const user = await User.findById(req.user._id);
        const isMatch = await user.comparePassword(oldPassword);

        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;
        await user.save();

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        next(error);
    }
};

exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Don't reveal whether email exists
            return res.json({ message: 'If that email exists, a reset link has been sent' });
        }

        // Generate reset token
        const crypto = require('crypto');
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send email
        const emailService = require('../services/email');
        await emailService.sendPasswordResetEmail(user.email, resetToken);

        res.json({ message: 'If that email exists, a reset link has been sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        next(error);
    }
};

exports.resetPassword = async (req, res, next) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Hash the token from URL
        const crypto = require('crypto');
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() },
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successful. You can now login with your new password.' });
    } catch (error) {
        next(error);
    }
};



exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (id === req.user._id.toString()) {
            return res.status(403).json({ message: 'Cannot delete yourself' });
        }
        const targetUser = await User.findById(id);
        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (targetUser.role === 'superadmin') {
            return res.status(403).json({ message: 'Cannot delete superadmin accounts' });
        }
        await User.findByIdAndDelete(id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

exports.addFavoriteTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const user = await User.findById(req.user._id);
        if (user.favoriteTeams.includes(teamId)) {
            return res.status(400).json({ message: 'Team already in favorites' });
        }
        user.favoriteTeams.push(teamId);
        await user.save();
        res.json({ message: 'Team added to favorites', favorites: user.favoriteTeams });
    } catch (error) {
        next(error);
    }
};

exports.removeFavoriteTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const user = await User.findById(req.user._id);
        user.favoriteTeams = user.favoriteTeams.filter(id => id.toString() !== teamId);
        await user.save();
        res.json({ message: 'Team removed from favorites', favorites: user.favoriteTeams });
    } catch (error) {
        next(error);
    }
};

exports.addFavoritePlayer = async (req, res, next) => {
    try {
        const { playerId } = req.params;
        const user = await User.findById(req.user._id);
        if (user.favoritePlayers.includes(playerId)) {
            return res.status(400).json({ message: 'Player already in favorites' });
        }
        user.favoritePlayers.push(playerId);
        await user.save();
        res.json({ message: 'Player added to favorites', favorites: user.favoritePlayers });
    } catch (error) {
        next(error);
    }
};

exports.removeFavoritePlayer = async (req, res, next) => {
    try {
        const { playerId } = req.params;
        const user = await User.findById(req.user._id);
        user.favoritePlayers = user.favoritePlayers.filter(id => id.toString() !== playerId);
        await user.save();
        res.json({ message: 'Player removed from favorites', favorites: user.favoritePlayers });
    } catch (error) {
        next(error);
    }
};

exports.getFavorites = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('favoriteTeams')
            .populate('favoritePlayers');
        res.json({
            teams: user.favoriteTeams,
            players: user.favoritePlayers
        });
    } catch (error) {
        next(error);
    }
};
