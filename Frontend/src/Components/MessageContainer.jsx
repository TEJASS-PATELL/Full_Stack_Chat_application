import { formatMessageTime } from "../lib/utils";
import React, { useEffect, useState } from "react";
import "./ChatContainer.css";
import { Loader2, Trash2 } from "lucide-react";

const MessageContainer = React.memo(({ index, data }) => {
  const { messages, authUser, selectedUser } = data;
  const [Loading, setLoading] = useState(true);
  const message = messages[index];

  const handleImageDelete = (imageUrl, messageId) => {
    data.deleteImage(imageUrl, messageId);
  };

  const isSender = message.senderId === authUser.id;
  useEffect(() => {
    if (message.image) setLoading(true);
  }, [message.image]);

  return (
    <div className={`message ${isSender ? "message-incoming" : "message-outgoing"}`}>
      <div className="avatar-wrapperr">
        <img src={isSender ? authUser.profilepic || authUser.profilePic || "./user.png" : selectedUser?.profilepic || selectedUser?.profilePic || "./user.png"} alt="profile pic" className="avatarr" />
      </div>
      <div className="message-contentt">
        <div className={message.image ? "message-bubble-image" : "message-bubble"}>
          {message.image && (
            <button className="delete-image" onClick={handleImageDelete(message.image, message.senderId)}>
              <Trash2 size={25} />
            </button>
          )}

          {message.image && (
            <>
              {Loading && (<div className="image-loading-spinner"><Loader2 /></div>)}
              <img
                src={message.image}
                alt="Attachment"
                className="message-image"
                style={Loading ? { display: "none" } : {}}
                onLoad={() => setLoading(false)}
                onError={() => setLoading(false)}
              />
            </>
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
