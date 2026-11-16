import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from './api';

// Socket server URL is the origin of the API (e.g. http://localhost:5040)
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      withCredentials: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      // Automatically join the super admin room
      socket?.emit('join_admin');
    });
  }

  return socket;
};
