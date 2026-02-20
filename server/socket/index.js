const { Server } = require('socket.io');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    });

    io.on('connection', (socket) => {
        console.log(`Client connected: ${socket.id}`);

        socket.on('match:join', (matchId) => {
            socket.join(`match:${matchId}`);
            console.log(`${socket.id} joined match:${matchId}`);
        });

        socket.on('match:leave', (matchId) => {
            socket.leave(`match:${matchId}`);
            console.log(`${socket.id} left match:${matchId}`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) return null;
    return io;
};

module.exports = { initSocket, getIO };
