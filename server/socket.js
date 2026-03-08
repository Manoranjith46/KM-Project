import { Server } from 'socket.io';

let io;

export function initSocket(server, corsOptions) {
  io = new Server(server, { cors: corsOptions });

  io.on('connection', (socket) => {
    const { phoneNumber, role } = socket.handshake.query;
    if (phoneNumber) {
      socket.join(phoneNumber);
    }
    if (role === 'resident') {
      socket.join('residents');
    }

    socket.on('disconnect', () => {});
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.IO not initialized');
  return io;
}
