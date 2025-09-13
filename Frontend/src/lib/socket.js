import { io } from "socket.io-client";
let socket = null;

export const connectSocket = (userId, onReceiveMessage, onOnlineUsers, onTyping) => {
  if (!userId || socket) return;

  socket = io(import.meta.env.VITE_API_URL, {
    query: { userId },
    transports: ["websocket"],
  });

  console.log("Socket connected with userId:", userId);

  if (onReceiveMessage) socket.on("receiveMessage", onReceiveMessage);
  if (onOnlineUsers) socket.on("getOnlineUsers", onOnlineUsers);
  if (onTyping) socket.on("showTyping", onTyping);
};

export { socket };
