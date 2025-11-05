// client/src/lib/socket.js
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_WS_URL ?? 'http://localhost:8000';
const PATH = import.meta.env.VITE_WS_PATH ?? '/socket.io';

const socket = io(URL, {
  transports: ['websocket'],
  withCredentials: true, // CORS server credentials:true ilə uyğundur
  path: PATH,
});

export default socket;
