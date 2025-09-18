import { MessagesSquare } from "lucide-react";
import "./NoChatSelected.css";
import { useUIStore } from "../Store/useUIStore";

const NoChatSelected = () => {
  const { toggleSidebar } = useUIStore();
  return (
    <div className="no-chat-container">
      <div className="no-chat-card">
        <div className="icon-container">
          <div className="icon-wrapper">
            <MessagesSquare
              className="iconn"
              strokeWidth={1.2}
              onClick={toggleSidebar}
            />
          </div>
        </div>

        <div className="text-container">
          <h2 className="welcome-text"> " Welcome to <strong>ChatLock</strong> Let’s Chat, Bro! "</h2>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;

