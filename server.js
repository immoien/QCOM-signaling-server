const io = require('socket.io')(3000, {
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
