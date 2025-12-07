import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

let messageListenerRef = null;

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  typingUserId: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  setTypingUserId: (id) => set({ typingUserId: id }),

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const { data } = await axiosInstance.get("/messages/users");
      set({ users: data || [] });
    } catch {
      set({ users: [] });
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const { data } = await axiosInstance.get(`/messages/${userId}`);
      if (!Array.isArray(data)) return;
      set({
        messages: data.map((m) => ({
          ...m,
          senderId: m.senderid || m.senderId,
          receiverId: m.receiverid || m.receiverId,
          createdAt: m.createdat || m.createdAt,
        })),
      });
    } catch {
      set({ messages: [] });
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async ({ text, image }) => {
    const { selectedUser, messages } = get();
    const authUser = useAuthStore.getState().authUser;
    if (!selectedUser || !authUser) return;

    const tempId = Date.now();
    const tempMsg = {
      id: tempId,
      text,
      image,
      senderId: authUser.id,
      receiverId: selectedUser.id,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    set({ messages: [...messages, tempMsg] });

    try {
      const { data: savedMsg } = await axiosInstance.post(
        `/messages/send/${selectedUser.id}`,
        { text, image, tempId }
      );

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...savedMsg, senderId: authUser.id } : m
        ),
      }));
    } catch (err) {
      toast.error("Message failed to send");
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === tempId ? { ...m, failed: true } : m
        ),
      }));
    }
  },

  deleteImage: async (imageUrl, messageId) => {
    const authUser = useAuthStore.getState().authUser;
    const selectedUser = get().selectedUser;

    if (!authUser || !selectedUser) return;

    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, image: null, deleting: true } : m
      ),
    }));

    try {
      await axiosInstance.delete(`/messages/delete-image/${messageId}`, {
        data: { imageUrl },
      });

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, deleting: false } : m
        ),
      }));

      toast.success("Image deleted");
    } catch (err) {
      toast.error("Failed to delete image");

      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, deleting: false, image: imageUrl } : m
        ),
      }));
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    messageListenerRef = (newMessage) => {
      const msg = {
        ...newMessage,
        senderId: newMessage.senderid || newMessage.senderId,
        receiverId: newMessage.receiverid || newMessage.receiverId,
        createdAt: newMessage.createdat || newMessage.createdAt,
      };

      const authUser = useAuthStore.getState().authUser;
      if (!authUser) return;

      if (msg.senderId === authUser.id) {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === msg.tempId ? { ...msg, pending: false } : m
          ),
        }));
        return;
      }

      const exists = get().messages.some((m) => m.id === msg.id);
      if (exists) return;

      set((state) => ({ messages: [...state.messages, msg] }));
    };

    socket.on("receiveMessage", messageListenerRef);
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (messageListenerRef && socket) {
      socket.off("receiveMessage", messageListenerRef);
      messageListenerRef = null;
    }
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}),
);
