const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const { errorHandler } = require('./middleware/errorMiddleware');
const path = require('path');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // In production, replace with your frontend URL
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    },
});

app.use(cors());
app.use(express.json());

// Routes will be added here
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/tasks', require('./routes/taskRoutes'));
app.use('/api/comments', require('./routes/commentRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Serve static assets in production
if (process.env.NODE_ENV === 'production' || true) { // Forced true for this task
    const distPath = path.join(__dirname, '../frontend/dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(distPath, 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
}

// Socket.io connection
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('joinUser', (userId) => {
        socket.join(userId);
        console.log(`User joined personal room: ${userId}`);
    });

    socket.on('joinProject', (projectId) => {
        socket.join(projectId);
        console.log(`User joined project: ${projectId}`);
    });

    socket.on('leaveProject', (projectId) => {
        socket.leave(projectId);
        console.log(`User left project: ${projectId}`);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

// Export io to use in controllers
app.set('socketio', io);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
