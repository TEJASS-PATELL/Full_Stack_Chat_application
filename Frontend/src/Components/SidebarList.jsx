const formatLastSeen = (lastSeen) => {
  const last = new Date(lastSeen);
  const now = new Date();
  const diffMs = now - last;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  if (diffHr < 24) return `${diffHr} hour${diffHr > 1 ? "s" : ""} ago`;
  return `${diffDay} day${diffDay > 1 ? "s" : ""} ago`;
};

const SidebarList = ({
  users,
  onlineUsers,
  selectedUser,
  handleUserClick,
  handleUserDoubleClick,
  unreadMessages,
}) => {
  return (
    <div className="sidebar-list">
      {users.length === 0 && <div className="sidebar-no-users">No users found</div>}

      {users.map((user) => {
        const isOnline = onlineUsers.includes(String(user.id));
        const isSelected = selectedUser?.id === user.id;
        const hasUnread = unreadMessages[user.id];

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
                  <img src={user.profilepic || "/person.png"} alt="User" className="avatar-imgg" />
                  <span className={`status-indicatorr ${isOnline ? "online" : "offline"}`} />
                </div>

                <div style={{ flex: 1 }}>
                  <span className="sidebar-username">{user.fullname || "User"}</span>

                  {hasUnread ? (
                    <div className="new-message-text">Incoming message</div>
                  ) : (
                    <div className="sidebar-lastseen-only">
                      {isOnline ? (
                        <span className="status-online">Online</span>
                      ) : user.lastSeen ? (
                        <span className="status-lastseen">
                          Last seen {formatLastSeen(user.lastSeen)}
                        </span>
                      ) : (
                        <span className="status-offline">Offline</span>
                      )}
                    </div>
                  )}
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
