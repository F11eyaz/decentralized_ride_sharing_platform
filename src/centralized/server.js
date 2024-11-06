import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5174', 'http://localhost:5173'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['my-custom-header'],
    credentials: true,
  },
});

let locations = {};
const userSockets = {}; // Mapping of userId -> socketId

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Event to register a user's socket with their userId
  socket.on('registerUser', ({ userId }) => {
    userSockets[userId] = socket.id;
    console.log(`Registered user ${userId} with socket ${socket.id}`);
  });

  // Update location
  socket.on('updateLocation', ({ userId, latitude, longitude }) => {
    locations[userId] = { latitude, longitude };
    io.emit('locationUpdate', { userId, latitude, longitude });
  });

  // Complete ride and notify the passenger only
  socket.on('completeRide', ({ rideIndex, passengerId, driverId }) => {
    const passengerSocketId = userSockets[passengerId];
    if (passengerSocketId) {
      io.to(passengerSocketId).emit('rideCompleted', { rideIndex, passengerId, driverId });
      console.log(`Notified passenger ${passengerId} of ride completion`);
    }
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove the disconnected user's socket from userSockets
    for (const userId in userSockets) {
      if (userSockets[userId] === socket.id) {
        delete userSockets[userId];
        break;
      }
    }
    delete locations[socket.id];
  });
});

server.listen(3000, () => {
  console.log('Server is running on port 3000');
});
