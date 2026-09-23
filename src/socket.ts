import { io } from "socket.io-client";

// Get the current host dynamically. 
// If running in development or AI Studio preview, it connects to the same host using wss:// or ws://
const URL = window.location.origin;

export const socket = io(URL, {
  autoConnect: false,
});
