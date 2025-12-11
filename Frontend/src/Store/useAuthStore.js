import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const SOCKET_URL = import.meta.env.VITE_API_URL;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isDeletingAccount: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  
  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check", {
        withCredentials: true,
      });
      set({ authUser: res.data });
      get().connectSocket(res.data.id);
    } catch (error) {
      console.error("checkAuth error:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data, {
        withCredentials: true,
      });
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket(res.data.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data, {
        withCredentials: true,
      });
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket(res.data.id);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout", {}, { withCredentials: true });
      get().disconnectSocket();
      set({ authUser: null, onlineUsers: [] });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error(error.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data, {
        withCredentials: true,
      });
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Profile update failed");
      throw error;
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  deleteAccount: async () => {
    set({ isDeletingAccount: true });
    try {
      await axiosInstance.delete("/auth/delete-account", {
        withCredentials: true,
      });
      set({ authUser: null });
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response?.data?.message || "Account deletion failed");
    } finally {
      set({ isDeletingAccount: false });
    }
  },

  connectSocket: (userId) => {
    const { socket } = get();
    if (!userId || socket) return;

    console.log("Connecting to socket with userId:", userId);

    const newSocket = io(SOCKET_URL, {
      query: { userId },
      transports: ["websocket"],
      withCredentials: true,
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });

    newSocket.on("disconnect", (reason) => {
      set({ socket: null });
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ onlineUsers: [], socket: null });
      console.log("Socket manually disconnected");
    }
  },
}));
