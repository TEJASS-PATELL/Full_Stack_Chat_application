import "./ChatHeader.css";
import { X, LogOut, User } from "lucide-react";
import { useAuthStore } from "../Store/useAuthStore";
import { useChatStore } from "../Store/useChatStore";
import { Link, useNavigate } from "react-router-dom";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, typingUserId } = useChatStore();
  const { authUser, onlineUsers, logout } = useAuthStore();
  const navigate = useNavigate();
  const isOnline = selectedUser && onlineUsers.includes(selectedUser.id);
  const isTyping = typingUserId === selectedUser?.id;

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (!selectedUser) return null;

  return (
    <div className="chat-header">
      <div className="chat-user">
        <div className="avatar-container">
          <img
            src={selectedUser.profilepic || "/avatar.png"}
            alt={selectedUser.fullname}
            className="avatar"
          />
          <span className={`status-indicator ${isOnline ? "online" : "offline"}`}></span>
        </div>

        <div className="user-details">
          <h3 className="user-name">{selectedUser.fullname}</h3>
          <p className={`user-status ${isTyping ? "typing" : isOnline ? "online" : "offline"}`}>
            {isTyping ? "Typing..." : isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      <div className="chat-controls">
        {authUser && (
          <>
            <Link to="/profile" className="nav-btn">
              <User className="btn-icon" />
            </Link>

            <button className="nav-btn logout-btn" onClick={handleLogout}>
              <LogOut className="btn-icon" />
            </button>
          </>
        )}
        <button onClick={() => setSelectedUser(null)} className="nav-btn close-btn">
          <X size={30} />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
