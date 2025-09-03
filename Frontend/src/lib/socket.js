import { io } from "socket.io-client";
let socket = null;

export const connectSocket = (userId) => {
  if (!userId || socket) return; 

  socket = io(import.meta.env.VITE_API_URL, {
    query: { userId },
    transports: ["websocket"],
  });

  console.log("Socket connected with userId:", userId);
};

export { socket };
