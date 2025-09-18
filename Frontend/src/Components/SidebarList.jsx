import { useAuthStore } from "../Store/useAuthStore";
import { formatLastSeen } from "../utils/formatLastSeen";

const SidebarList = ({ users, selectedUser, handleUserClick, handleUserDoubleClick }) => {
  const { onlineUsers } = useAuthStore();

  return (
    <div className="sidebar-list">
      {users.length === 0 && <div className="sidebar-no-users">No users found</div>}

      {users.map((user) => {
        const isOnline = onlineUsers.includes(String(user.id));
        const isSelected = selectedUser?.id === user.id;

        return (
          <div
            key={user.id}
            onClick={() => handleUserClick(user)}
            onDoubleClick={(e) => handleUserDoubleClick(e, user.id)}
            className={`sidebar-user ${isSelected ? "selected" : ""}`}
          >
            <div className="sidebar-user-container">
              <div className="sidebar-space">
                <div className="sidebar-avatar" style={{ marginRight: 10, position: "relative" }}>
                  <img src={user.profilepic || "user.png"} alt="User" className="avatar-imgg" />
                  <span className={`status-indicatorr ${isOnline ? "online" : "offline"}`} />
                </div>

                <div style={{ flex: 1 }}>
                  <span className="sidebar-username">{user.fullname || "User"}</span>
                  <div className="sidebar-lastseen-only">
                    {isOnline ? (
                      <span className="status-online">Online</span>
                    ) : (
                      <span className="status-lastseen">
                        Last seen {formatLastSeen(user.lastSeen)}
                      </span>
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
