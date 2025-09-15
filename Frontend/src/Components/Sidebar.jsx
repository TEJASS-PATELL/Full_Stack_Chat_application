import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";
import { useChatLockStore } from "../Store/useChatLockStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SidebarHeader from "./SidebarHeader";
import SidebarList from "./SidebarList";
import LockModal from "./LockModel";
import { FaBars } from "react-icons/fa";
import toast from "react-hot-toast";
import "./Sidebar.css";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading, unreadMessages } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { fetchLockedChats, lockChat, unlockChat, isUserLocked } = useChatLockStore();

  const [viewType, setViewType] = useState("chat");
  const [showLockModal, setShowLockModal] = useState(false);
  const [currentLockUserId, setCurrentLockUserId] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [pinInput, setPinInput] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const clickTimerRef = useRef(null);

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (users.length) fetchLockedChats(users);
  }, [users]);

  const handleLockClick = (e, userId) => {
    e.stopPropagation();
    setCurrentLockUserId(userId);
    setShowLockModal(true);
    setPinInput(Array(6).fill(""));
  };

  const handleUserClick = (user) => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      if (!isUserLocked(user.id)) {
        setSelectedUser(user);
      } else {
        setCurrentLockUserId(user.id);
        setShowLockModal(true);
      }
      setIsSidebarOpen(false);
      clickTimerRef.current = null;
    }, 200);
  };

  const handleUserDoubleClick = (e, userId) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    handleLockClick(e, userId);
  };

  const handlePinSubmit = async () => {
    const pin = pinInput.join("");

    if (pin.length !== 6 || !currentLockUserId) {
      toast.error("Please enter a valid 6-digit PIN");
      return;
    }

    try {
      if (isUserLocked(currentLockUserId)) {
        await unlockChat(currentLockUserId, pin);
        if (!isUserLocked(currentLockUserId)) {
          const unlockedUser = users.find((u) => u.id === currentLockUserId);
          if (unlockedUser) setSelectedUser(unlockedUser);
        }
      } else {
        await lockChat(currentLockUserId, pin);
      }
    } finally {
      setShowLockModal(false);
      setPinInput(Array(6).fill(""));
      setCurrentLockUserId(null);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <button className="hamburger-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
        <FaBars />
      </button>

      <div className={`sidebarr ${isSidebarOpen ? "open" : ""}`}>
        <SidebarHeader viewType={viewType} setViewType={setViewType} />
        <SidebarList
          viewType={viewType}
          users={users}
          onlineUsers={onlineUsers}
          selectedUser={selectedUser}
          handleUserClick={handleUserClick}
          handleUserDoubleClick={handleUserDoubleClick}
          isUserLocked={isUserLocked}
          unreadMessages={unreadMessages}
          setIsSidebarOpen={setIsSidebarOpen}
        />
      </div>

      {showLockModal && (
        <LockModal
          setShowLockModal={setShowLockModal}
          pinInput={pinInput}
          setPinInput={setPinInput}
          inputRefs={inputRefs}
          handlePinSubmit={handlePinSubmit}
        />
      )}
    </>
  );
};

export default Sidebar;
