import { Bot } from "lucide-react";
import "./NoChatSelected.css"; 

const NoChatSelected = () => {
  return (
    <div className="no-chat-container">
      <div className="no-chat-card">
        <div className="icon-container">
          <div className="icon-wrapper">
             <Bot className="iconn" size={68} strokeWidth={1.5} />
          </div>
        </div>

        <div className="text-container">
          <h2 className="welcome-text">Start chatting now !</h2>
          <p className="instruction-text">
            Choose a chat from the list to send Messages instantly.
          </p>
          <p className="instruction-text">
            You can share text, images with your contacts.
          </p>
          <p className="instruction-text">
            Stay connected and never miss a Message.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;

