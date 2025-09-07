import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
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
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to fetch users");
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);

          if (!res.data || !Array.isArray(res.data)) {
            toast.error("Invalid response from server");
            return;
          }

          const messages = res.data.map((m) => ({
            ...m,
            senderId: m.senderid,
            receiverId: m.receiverid,
            createdAt: m.createdat,
          }));

          set({ messages });

        } catch (error) {
          console.error("Error fetching messages:", error);
          if (error.response) {
            toast.error(error.response.data?.message || "Failed to fetch messages");
          } else {
            toast.error("Network error while fetching messages");
          }
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, addMessage } = get();
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser.id}`, messageData);
          const newMsg = {
            ...res.data,
            senderId: res.data.senderid,
            receiverId: res.data.receiverid,
            createdAt: res.data.createdat,
          };

          addMessage(newMsg);
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
        }
      },

      addMessage: (message) => {
        set((state) => ({
          messages: [...state.messages, message],
        }));

        const { selectedUser } = get();
        if (message.senderId !== selectedUser?.id) {
          get().addUnreadMessage(message.senderId);
        }
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (!socket) return;

        messageListenerRef = (newMessage) => {
          const msg = {
            ...newMessage,
            senderId: newMessage.senderid,
            receiverId: newMessage.receiverid,
            createdAt: newMessage.createdat,
          };
          const currentUser = get().selectedUser;

          const isForSelectedUser =
            msg.senderId === currentUser?.id || msg.receiverId === currentUser?.id;

          if (isForSelectedUser) {
            set((state) => ({
              messages: [...state.messages, msg],
            }));
          } else {
            get().addUnreadMessage(msg.senderId);
          }
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
          return {
            selectedUser,
            unreadMessages: updatedUnread,
          };
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
      partialize: (state) => ({
        unreadMessages: state.unreadMessages,
      }),
    }
  )
);
