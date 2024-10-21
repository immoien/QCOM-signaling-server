const fs = require('fs');
const http = require('http');
const socketIo = require('socket.io');

const options = {
	key: fs.readFileSync('/etc/letsencrypt/live/qcom.info/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/qcom.info/fullchain.pem'),
};

const server = http.createServer(options);

const io = socketIo(server, {
	cors: {
		origin: '*',
	},
});

const users = {};

io.on('connection', (socket) => {
	console.log('New client connected:', socket.id);

	socket.on('join-room', (room) => {
		socket.join(room);

		users[socket.id] = room;
		socket.to(room).emit('user-joined', socket.id);
	});

	socket.on('signal', (data) => {
		io.to(data.to).emit('signal', {
			from: socket.id,
			signal: data.signal,
		});
	});

	socket.on('disconnect', () => {
		const room = users[socket.id];
		delete users[socket.id];
		socket.to(room).emit('user-left', socket.id);
		console.log('Client disconnected:', socket.id);
	});
});

server.listen(3000, '127.0.0.1', () => {
	console.log('Secure signaling server is running on port 3000');
});
