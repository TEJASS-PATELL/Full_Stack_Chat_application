import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

let messageListenerRef = null;

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      typingUserId: null,
      unreadMessages: {},

      setTypingUserId: (id) => set({ typingUserId: id }),

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
        } catch {
          set({ users: [] });
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          if (!res.data || !Array.isArray(res.data)) return;
          const messages = res.data.map((m) => ({
            ...m,
            senderId: m.senderid || m.senderId,
            receiverId: m.receiverid || m.receiverId,
            createdAt: m.createdat || m.createdAt,
          }));
          set({ messages });
        } catch {
          set({ messages: [] });
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, replaceTempMessage } = get();
        if (!selectedUser) return;
        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser.id}`,
            messageData
          );
          const newMsg = {
            ...res.data,
            senderId: res.data.senderid || res.data.senderId,
            receiverId: res.data.receiverid || res.data.receiverId,
            createdAt: res.data.createdat || res.data.createdAt,
          };
          replaceTempMessage(newMsg);
        } catch {}
      },

      addMessage: (message) => {
        set((state) => {
          if (state.messages.some((m) => m.id === message.id)) return state;
          return { messages: [...state.messages, message] };
        });
        const { selectedUser } = get();
        if (message.senderId !== selectedUser?.id) {
          get().addUnreadMessage(message.senderId);
        }
      },

      replaceTempMessage: (confirmedMsg) => {
        set((state) => {
          const updated = state.messages.map((m) =>
            typeof m.id === "number" && m.id > 1e12
              ? { ...confirmedMsg }
              : m
          );
          if (!updated.some((m) => m.id === confirmedMsg.id)) {
            updated.push(confirmedMsg);
          }
          return { messages: updated };
        });
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
          get().addMessage(msg);
        };
        socket.on("newMessage", messageListenerRef);
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (messageListenerRef && socket) {
          socket.off("newMessage", messageListenerRef);
          messageListenerRef = null;
        }
      },

      setSelectedUser: (selectedUser) => {
        if (!selectedUser) {
          set({ selectedUser: null });
          return;
        }
        set((state) => {
          const updatedUnread = { ...state.unreadMessages };
          delete updatedUnread[selectedUser.id];
          return { selectedUser, unreadMessages: updatedUnread };
        });
      },

      addUnreadMessage: (userId) =>
        set((state) => ({
          unreadMessages: {
            ...state.unreadMessages,
            [userId]: true,
          },
        })),
    }),
    {
      name: "chat-store",
      partialize: (state) => ({ unreadMessages: state.unreadMessages }),
    }
  )
);
