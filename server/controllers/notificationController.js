const Notification = require('../models/Notification');
const User = require('../models/User');
const { getIO } = require('../socket');

// Get all notifications for current user
exports.getUserNotifications = async (req, res, next) => {
    try {
        const userId = req.user._id;

        // Get user-specific and broadcast notifications
        const notifications = await Notification.find({
            $or: [
                { userId: userId },
                { broadcast: true }
            ]
        })
            .populate('sender', 'name email')
            .populate('matchId', 'teamA teamB date')
            .sort({ createdAt: -1 })
            .limit(50);

        // Add isRead flag for frontend
        const result = notifications.map(notif => {
            const notifObj = notif.toObject();
            notifObj.read = notif.readBy.some(id => id.toString() === userId.toString());
            return notifObj;
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
};

// Get unread count
exports.getUnreadCount = async (req, res, next) => {
    try {
        const userId = req.user._id;

        const count = await Notification.countDocuments({
            $and: [
                {
                    $or: [
                        { userId: userId },
                        { broadcast: true }
                    ]
                },
                { readBy: { $ne: userId } }
            ]
        });

        res.json({ count });
    } catch (error) {
        next(error);
    }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findById(id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        // Check if user has access to this notification
        if (!notification.broadcast && notification.userId && notification.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Access denied' });
        }

        // Add user to readBy array if not already present
        if (!notification.readBy.includes(userId)) {
            notification.readBy.push(userId);
            await notification.save();
        }

        res.json({ message: 'Notification marked as read' });
    } catch (error) {
        next(error);
    }
};

// Send system notification (superadmin only)
exports.sendSystemNotification = async (req, res, next) => {
    try {
        const { title, message } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        const notification = await Notification.create({
            type: 'system',
            title,
            message,
            sender: req.user._id,
            broadcast: true,
        });

        // Emit to all connected clients
        const io = getIO();
        if (io) {
            io.emit('notification:new', {
                id: notification._id,
                type: notification.type,
                title: notification.title,
                message: notification.message,
                createdAt: notification.createdAt,
            });
        }

        res.json({ message: 'System notification sent successfully', notification });
    } catch (error) {
        next(error);
    }
};

// Send match notification (admin/superadmin)
exports.sendMatchNotification = async (req, res, next) => {
    try {
        const { title, message, matchId, userIds } = req.body;

        if (!title || !message) {
            return res.status(400).json({ message: 'Title and message are required' });
        }

        // If userIds provided, send to specific users; otherwise broadcast
        if (userIds && userIds.length > 0) {
            // Create notification for each user
            const notifications = await Promise.all(
                userIds.map(userId =>
                    Notification.create({
                        type: 'match',
                        title,
                        message,
                        sender: req.user._id,
                        userId,
                        matchId,
                    })
                )
            );

            // Emit to specific users
            const io = getIO();
            if (io) {
                userIds.forEach(userId => {
                    io.to(userId).emit('notification:new', {
                        type: 'match',
                        title,
                        message,
                        matchId,
                        createdAt: new Date(),
                    });
                });
            }

            res.json({ message: `Match notification sent to ${userIds.length} users`, count: notifications.length });
        } else {
            // Broadcast match notification
            const notification = await Notification.create({
                type: 'match',
                title,
                message,
                sender: req.user._id,
                matchId,
                broadcast: true,
            });

            const io = getIO();
            if (io) {
                io.emit('notification:new', {
                    id: notification._id,
                    type: notification.type,
                    title: notification.title,
                    message: notification.message,
                    matchId: notification.matchId,
                    createdAt: notification.createdAt,
                });
            }

            res.json({ message: 'Match notification broadcasted successfully', notification });
        }
    } catch (error) {
        next(error);
    }
};

// Broadcast notification (legacy - use sendSystemNotification)
exports.broadcast = async (req, res, next) => {
    try {
        const { title, message, type = 'broadcast' } = req.body;

        const notification = await Notification.create({
            title,
            message,
            type,
            broadcast: true,
            sender: req.user._id,
        });

        const io = getIO();
        if (io) {
            io.emit('notification:new', notification);
        }

        res.json({ message: 'Notification broadcasted', notification });
    } catch (error) {
        next(error);
    }
};
