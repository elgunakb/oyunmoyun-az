// client/src/lib/socket.js
import { io } from 'socket.io-client';

// Render prod URL-i default qoy (lokalda VITE_WS_URL override edərsən)
const URL = import.meta.env.VITE_WS_URL ?? 'https://quisor-dev.onrender.com';
const PATH = import.meta.env.VITE_WS_PATH ?? '/socket.io/'; // sondakı / olsun

const socket = io(URL, {
  path: PATH,
  transports: ['websocket', 'polling'], // fallback aç
  withCredentials: false, // cookie yoxdursa OFF
});

export default socket;
