import { useEffect, useState, useRef } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useChatLockStore } from "../Store/useChatLockStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SidebarHeader from "./SidebarHeader";
import SidebarList from "./SidebarList";
import LockModal from "./LockModel";
import "./Sidebar.css";
import { useUIStore } from "../Store/useUIStore";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } = useChatStore();
  const { fetchLockedChats, isUserLocked } = useChatLockStore();
  const [showLockModal, setShowLockModal] = useState(false);
  const [currentLockUserId, setCurrentLockUserId] = useState(null);
  const { isSidebarOpen, closeSidebar } = useUIStore();
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
  };

  const handleUserClick = (user) => {
    if (clickTimerRef.current) clearTimeout(clickTimerRef.current);

    clickTimerRef.current = setTimeout(() => {
      if (!isUserLocked(user.id)) {
        setSelectedUser(user);
        closeSidebar();
      } else {
        setCurrentLockUserId(user.id);
        setShowLockModal(true);
      }
      clickTimerRef.current = null;
    }, 200);
  };

  const handleLockIconClick = (e, userId) => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    handleLockClick(e, userId);
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <>
      <div className={`sidebarr ${isSidebarOpen ? "open" : ""}`}>
        <SidebarHeader />
        <SidebarList 
          users={users}
          selectedUser={selectedUser}
          handleUserClick={handleUserClick}
          handleLockIconClick={handleLockIconClick}
          isUserLocked={isUserLocked}/>
      </div>
      {showLockModal && ( <LockModal setShowLockModal={setShowLockModal} currentLockUserId={currentLockUserId} />)}
    </>
  );
};

export default Sidebar;
