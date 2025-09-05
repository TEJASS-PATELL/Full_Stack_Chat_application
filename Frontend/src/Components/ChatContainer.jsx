import { useChatStore } from "../Store/useChatStore";
import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../Store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import "./ChatContainer.css";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser.id);
      subscribeToMessages();
      const handleTyping = ({ userId }) => {
        useChatStore.getState().setTypingUserId(userId);
        setTimeout(() => {
          useChatStore.getState().setTypingUserId(null);
        }, 2000);
      };

      const handleNewMessage = (message) => {
        const currentUser = useAuthStore.getState().authUser;
        const selectedUser = useChatStore.getState().selectedUser;

        const isSenderOrReceiver =
          (message.senderId === currentUser.id && message.receiverId === selectedUser?.id) ||
          (message.senderId === selectedUser?.id && message.receiverId === currentUser.id);

        if (!isSenderOrReceiver) return;

        useChatStore.getState().addMessage(message);

        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("New message from " + (selectedUser?.username || "Someone"), {
            body: message.text || "Attachment",
            icon: selectedUser?.profilepic || "./user.png",
          });
        }
      };

      socket.on("showTyping", handleTyping);
      socket.on("newMessage", handleNewMessage);

      return () => {
        unsubscribeFromMessages();
        socket.off("showTyping");
        socket.off("newMessage", handleNewMessage);
      };
    }
  }, [selectedUser]);

  useEffect(() => {
    if (messageEndRef.current && messages.length > 0) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="chat-container">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatHeader />
      <div className="messages-wrapper">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`message ${message.senderId === authUser.id ? "message-outgoing" : "message-incoming"}`}
          >
            <div className="avatar-wrapperr">
              <img
                src={
                  message.senderId === authUser.id
                    ? authUser.profilepic || authUser.profilePic || "./user.png"
                    : selectedUser?.profilepic || selectedUser?.profilePic || "./user.png"
                }
                alt="profile pic"
                className="avatarr"
              />

            </div>
            <div className="message-contentt">
              <div className="message-bubble">
                {message.image && <img src={message.image} alt="Attachment" className="message-image" />}
                {message.text && (
                  <p
                    className="message-text"
                    dangerouslySetInnerHTML={{
                      __html: message.text.replace(
                        /\[(.*?)\]\((.*?)\)/g,
                        '<a href="$2" target="_blank" class="message-link">$1</a>'
                      ),
                    }}
                  />
                )}
                <time className="timestamp">{formatMessageTime(message.createdAt || message.createdat)}</time>
              </div>
            </div>
          </div>
        ))}

        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
