const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const EventEmitter = require('events');

EventEmitter.defaultMaxListeners = 20; 

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('start-speed-test', () => {
    console.log(`Starting speed test for: ${socket.id}`);

    let interval = setInterval(() => {
      const data = new Array(500000).fill('X').join('');
      const startTime = Date.now();

      socket.emit('test-data', data); 

      
      socket.once('test-completed', () => {
        const endTime = Date.now();
        const duration = endTime - startTime; 
        const speed = ((data.length / duration) * 1000) / (1024 * 1024); // หน่วย MBps

        // แสดงผลใน Terminal
        console.log(`Speed for ${socket.id}: ${speed.toFixed(2)} KB/s`);

        // ส่งผลลัพธ์กลับไปยังไคลเอนต์
        socket.emit('speed-result', speed.toFixed(2));
      });
    }, 1000); 


    socket.on('disconnect', () => {
      clearInterval(interval);
      console.log('User disconnected:', socket.id);
    });
  });
});

server.listen(3001, () => {
  console.log('Server is running on http://localhost:3001');
});
