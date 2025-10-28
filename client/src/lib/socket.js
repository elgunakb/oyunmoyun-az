import { io } from 'socket.io-client';
const socket = io(import.meta.env.VITE_WS_URL ?? 'http://localhost:5000', {
  transports: ['websocket'],
  withCredentials: false,
});
export default socket;
