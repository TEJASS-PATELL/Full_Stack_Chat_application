import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatLockStore = create((set, get) => ({
  lockedUserIds: [],

  fetchLockedChats: async (users) => {
    try {
      const lockedIds = (
        await Promise.all(
          users.map(async (user) => {
            const res = await axiosInstance.get(`/chat-lock/status/${user.id}`, {
              withCredentials: true,
            });
            return res.data.isLocked ? user.id : null;
          })
        )
      ).filter(Boolean);

      set({ lockedUserIds: lockedIds });
    } catch (err) {
      console.error("Failed to fetch locked chats:", err);
    }
  },

  lockChat: async (userId, pin) => {
    try {
      await axiosInstance.post(
        "/chat-lock/lock",
        { lockedUserId: userId, pin },
        { withCredentials: true }
      );
      set((state) => ({ lockedUserIds: [...state.lockedUserIds, userId] }));
      toast.success("Chat locked successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to lock chat");
    }
  },

  unlockChat: async (userId, pin) => {
    try {
      await axiosInstance.post(
        "/chat-lock/unlock",
        { lockedUserId: userId, pin },
        { withCredentials: true }
      );
      set((state) => ({
        lockedUserIds: state.lockedUserIds.filter((id) => id !== userId),
      }));
      toast.success("Chat unlocked");
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect PIN or error occurred");
    }
  },

  isUserLocked: (userId) => {
    return get().lockedUserIds.includes(userId);
  },
}));
