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
      typingUserId: null,
      unreadMessages: {},
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

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        const authUser = useAuthStore.getState().authUser;
        if (!selectedUser || !authUser) return;

        const tempId = Date.now();
        const tempMsg = {
          id: tempId,
          text: messageData.text,
          senderId: authUser.id,
          receiverId: selectedUser.id,
          createdAt: new Date().toISOString(),
          pending: true,
        };

        set({ messages: [...messages, tempMsg] });

        try {
          await axiosInstance.post(`/messages/send/${selectedUser.id}`, {
            ...messageData,
            tempId,
          });
        } catch (err) {
          console.error("Send message error:", err);
          set((state) => ({
            messages: state.messages.map((m) =>
              m.id === tempId ? { ...m, failed: true } : m
            ),
          }));
        }
      },

      replaceTempMessage: (confirmedMsg, tempId) =>
        set((state) => {
          const updated = state.messages.map((m) =>
            m.id === tempId ? { ...confirmedMsg } : m
          );

          if (!updated.some((m) => m.id === confirmedMsg.id)) {
            updated.push(confirmedMsg);
          }

          return { messages: updated };
        }),

      addMessage: (message) =>
        set((state) => {
          if (
            state.messages.some(
              (m) => m.id === message.id || m.tempId === message.tempId
            )
          )
            return state;

          const newMessages = [...state.messages, message];

          const { selectedUser } = get();
          if (message.senderId !== selectedUser?.id) {
            get().addUnreadMessage(message.senderId);
          }

          return { messages: newMessages };
        }),

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

          if (msg.senderId === authUser?.id && newMessage.tempId) {
            get().replaceTempMessage(msg, newMessage.tempId);
          } else {
            get().addMessage(msg);
          }
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

      setSelectedUser: (selectedUser) =>
        set((state) => {
          if (!selectedUser) return { selectedUser: null };
          const updatedUnread = { ...state.unreadMessages };
          delete updatedUnread[selectedUser.id];
          return { selectedUser, unreadMessages: updatedUnread };
        }),

      addUnreadMessage: (userId) =>
        set((state) => ({
          unreadMessages: { ...state.unreadMessages, [userId]: true },
        })),
    }),
    {
      name: "chat-store",
      partialize: (state) => ({ unreadMessages: state.unreadMessages }),
    }
  )
);
