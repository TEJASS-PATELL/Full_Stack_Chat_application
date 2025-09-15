import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useChatLockStore = create((set, get) => ({
  lockedUserIds: new Set(),
  isLocking: false,
  isFetchingLocks: false,

  fetchLockedChats: async (users) => {
    set({ isFetchingLocks: true });
    try {
      const lockedIds = new Set(
        (
          await Promise.all(
            users.map(async (user) => {
              const res = await axiosInstance.get(`/chat-lock/status/${user.id}`, {
                withCredentials: true,
              });
              return res.data.isLocked ? user.id : null;
            })
          )
        ).filter(Boolean)
      );
      set({ lockedUserIds: lockedIds });
    } catch (err) {
      console.error("Failed to fetch locked chats:", err);
    } finally {
      set({ isFetchingLocks: false });
    }
  },

  lockChat: async (userId, pin) => {
    set({ isLocking: true });
    try {
      await axiosInstance.post(
        "/chat-lock/lock",
        { lockedUserId: userId, pin },
        { withCredentials: true }
      );
      set((state) => {
        const updated = new Set(state.lockedUserIds);
        updated.add(userId);
        return { lockedUserIds: updated };
      });
      toast.success("Chat locked successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to lock chat");
    } finally {
      set({ isLocking: false });
    }
  },

  unlockChat: async (userId, pin) => {
    set({ isLocking: true });
    try {
      const res = await axiosInstance.post(
        "/chat-lock/unlock",
        { lockedUserId: userId, pin },
        { withCredentials: true }
      );

      if (res.data.success) {
        set((state) => {
          const updated = new Set(state.lockedUserIds);
          updated.delete(userId);
          return { lockedUserIds: updated };
        });
        toast.success("Chat unlocked successfully!");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Incorrect PIN or error occurred");
    } finally {
      set({ isLocking: false });
    }
  },

  isUserLocked: (userId) => {
    return get().lockedUserIds.has(userId);
  },
}));
