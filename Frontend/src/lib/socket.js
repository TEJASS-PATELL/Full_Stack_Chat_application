import { io } from "socket.io-client";
let socket = null;

export const connectSocket = (userId) => {
  if (!userId || socket) return; 

  socket = io("http://localhost:5001", {
    query: { userId },
    transports: ["websocket"],
  });

  console.log("Socket connected with userId:", userId);
};

export { socket };
