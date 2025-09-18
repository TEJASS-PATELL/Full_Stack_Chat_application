import { formatMessageTime } from "../lib/utils";
import React from "react";
import "./ChatContainer.css";

const MessageContainer = React.memo(({ index, data }) => {
  const { messages, authUser, selectedUser } = data;
  const message = messages[index];

  const isSender = message.senderId === authUser.id;

  return (
    <div className={`message ${isSender ? "message-incoming" : "message-outgoing" }`}>
      <div className="avatar-wrapperr">
        <img
          src={
            isSender
              ? authUser.profilepic || authUser.profilePic || "./user.png"
              : selectedUser?.profilepic || selectedUser?.profilePic || "./user.png"
          }
          alt="profile pic"
          className="avatarr"
        />
      </div>
      <div className="message-contentt">
        <div className={message.image ? "message-bubble-image" : "message-bubble"}>
          {message.image && (
            <img
              src={message.image}
              alt="Attachment"
              className="message-image"
            />
          )}
          {message.text && <p className="message-text">{message.text}</p>}
          <time className={message.image ? "timestapimg" : "timestamp"}>
            {formatMessageTime(message.createdAt || message.createdat)}
          </time>
        </div>
      </div>
    </div>
  );
});

export default MessageContainer;
