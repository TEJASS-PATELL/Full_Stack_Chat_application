import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { useAuthStore } from "../Store/useAuthStore";
import { formatLastSeen } from "../utils/formatLastSeen";
import './SidebarList.css';

const SidebarList = ({ users, selectedUser, handleUserClick, handleLockIconClick, isUserLocked }) => {
  const { onlineUsers } = useAuthStore();

  return (
    <div className="sidebar-list">
      {users.length === 0 && <div className="sidebar-no-users">
        <p>Looks like you're alone.</p>
        <p>Invite someone to chat!</p>
      </div>}

      {users.map((user) => {
        const isOnline = onlineUsers.includes(String(user.id));
        const isSelected = selectedUser?.id === user.id;
        return (
          <div key={user.id} onClick={() => handleUserClick(user)} className={`sidebar-user ${isSelected ? "selected" : ""}`}>
            <div className="sidebar-user-container">
              <div className="sidebar-space">
                <div className="sidebar-avatar">
                  <img src={user.profilepic || "user.png"} alt="User" className="avatar-imgg" />
                  <span className={`status-indicatorr ${isOnline ? "online" : "offline"}`} />
                </div>

                <div className="main-list">
                  <span className="sidebar-username">{user.fullname || "User"}</span>
                  <div className="sidebar-lastseen-only">
                    {isOnline ? (
                      <span className="status-online">Online</span>
                    ) : (
                      <span className="status-lastseen">
                        Last seen {formatLastSeen(user.lastSeen)}
                      </span>
                    )}

                  {isUserLocked(user.id) ? (
                    <LockKeyhole
                      className="lock-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLockIconClick(e, user.id);
                      }}
                    />
                  ) : (
                    <LockKeyholeOpen
                      className="lock-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleLockIconClick(e, user.id);
                      }}
                    />
                  )}
                </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SidebarList;
