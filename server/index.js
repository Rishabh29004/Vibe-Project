import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './configs/db.js';
import cors from 'cors';
import { Server } from 'socket.io';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded images as static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/search', searchRoutes);

// Basic Route
app.get('/', (req, res) => {
  res.send('Vibe API is running...');
});

// Socket.io Connection
const userSocketMap = {}; // { userId: socketId }

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('Socket handshake userId:', userId);
  
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  // Send online users list to everyone
  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('sendMessage', (data) => {
    console.log('Server received sendMessage:', data);
    const { recipientId, text, sender, conversationId } = data;
    const recipientSocketId = userSocketMap[recipientId];
    
    console.log(`Looking for recipient ${recipientId}. Found socket: ${recipientSocketId}`);

    if (recipientSocketId) {
      io.to(recipientSocketId).emit('newMessage', data);
      console.log('Emitted newMessage to recipient');
    } else {
      console.log('Recipient not online or not in map');
    }
  });

  socket.on('disconnect', () => {
    if (userId) {
      delete userSocketMap[userId];
      console.log(`User ${userId} disconnected`);
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    }
  });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB Connected');
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
  });
