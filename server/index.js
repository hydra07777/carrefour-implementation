const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins for simplicity in this demo
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 3000;

const trafficLogic = require('./trafficLogic');

// Subscribe to light changes from the logic module
trafficLogic.setCallback((lights) => {
    console.log('Broadcasting light update:', lights);
    io.emit('lightUpdate', lights);
});

io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Send current state immediately upon connection
    // We can access current lights from trafficLogic if we expose them, 
    // or just wait for next update. 
    // For better UX, let's expose currentState in trafficLogic or just wait.
    // For now, we'll just acknowledge connection.

    // Receive sensor data
    socket.on('sensorData', (data) => {
        // data format: { lane: 'A', count: 5, distance: 10 }
        // console.log('Received sensor data:', data);

        if (data && data.lane && typeof data.count === 'number') {
            trafficLogic.updateQueues({ [data.lane]: data.count });
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
