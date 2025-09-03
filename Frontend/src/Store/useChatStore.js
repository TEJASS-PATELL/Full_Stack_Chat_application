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
          set({ messages: res.data });
          await get().markMessagesAsSeen(userId);
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to fetch messages");
        } finally {
          set({ isMessagesLoading: false });
        }
      },
      
      sendMessage: async (messageData) => {
        const { selectedUser, addMessage } = get();
        try {
          const res = await axiosInstance.post(`/messages/send/${selectedUser.id}`, messageData);

          const socket = useAuthStore.getState().socket;
          socket.emit("sendMessage", res.data);

          addMessage(res.data);
        } catch (error) {
          toast.error(error.response?.data?.message || "Failed to send message");
        }
      },
      
      markMessagesAsSeen: async (userId) => {
        try {
          await axiosInstance.post(`/messages/mark-seen/${userId}`);
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.senderId === userId ? { ...msg, seen: true } : msg
            ),
          }));
        } catch (error) {
          console.error("Failed to mark messages as seen", error);
        }
      },

      addMessage: (message) => {
        const { selectedUser } = get();
        const isFromSelectedUser = message.senderId === selectedUser?.id;

        set((state) => ({
          messages: [...state.messages, isFromSelectedUser ? { ...message, seen: true } : message],
        }));

        // If it's from another user, add to unread
        if (!isFromSelectedUser) {
          get().addUnreadMessage(message.senderId);
        }
      },

      subscribeToMessages: () => {
        const socket = useAuthStore.getState().socket;

        messageListenerRef = (newMessage) => {
          const currentUser = get().selectedUser;

          const isForSelectedUser =
            newMessage.senderId === currentUser?.id ||
            newMessage.receiverId === currentUser?.id;

          if (isForSelectedUser) {
            const isFromCurrentUser = newMessage.senderId === currentUser?.id;
            set((state) => ({
              messages: [...state.messages, { ...newMessage, seen: isFromCurrentUser }],
            }));
          } else {
            get().addUnreadMessage(newMessage.senderId);
          }
        };

        socket.on("newMessage", messageListenerRef);
        console.log("Subscribed to newMessage");
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (messageListenerRef) {
          socket.off("newMessage", messageListenerRef);
          console.log("🔌 Unsubscribed from newMessage");
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
