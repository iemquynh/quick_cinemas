import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let io;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.NEXT_PUBLIC_CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });

  // Middleware để xác thực token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      socket.theaterChain = decoded.theater_chain;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    // console.log(`User connected: ${socket.userId} with role: ${socket.userRole}`);

    // Join room dựa trên role
    if (socket.userRole === 'theater_admin') {
      socket.join(`theater_${socket.theaterChain}`);
      // console.log(`Theater admin joined room: theater_${socket.theaterChain}`);
    } else if (socket.userRole === 'user') {
      socket.join(`user_${socket.userId}`);
      // console.log(`User joined room: user_${socket.userId}`);
    }

    socket.on('disconnect', () => {
      // console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}

// Hàm gửi thông báo cho theater admin
export function notifyTheaterAdmin(theaterChain, notification) {
  if (io) {
    io.to(`theater_${theaterChain}`).emit('booking_pending', notification);
    // console.log(`Notification sent to theater_${theaterChain}:`, notification);
  }
}

// Hàm gửi thông báo cho user
export function notifyUser(userId, notification) {
  if (io) {
    io.to(`user_${userId}`).emit('booking_update', notification);
    // console.log(`Notification sent to user_${userId}:`, notification);
  }
} 