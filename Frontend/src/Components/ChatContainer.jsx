import { useEffect, useRef, useMemo } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useAuthStore } from "../Store/useAuthStore";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import MessageContainer from "./MessageContainer";
import "./ChatContainer.css";
import { useChatScroll } from "../hooks/useChatScroll";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setTypingUserId,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useChatScroll(messages);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId }) => {
      setTypingUserId(userId);
      setTimeout(() => setTypingUserId(null), 2000);
      return () => clearTimeout(timer);
    };

    socket.on("showTyping", handleTyping);
    return () => socket.off("showTyping", handleTyping);
  }, [socket, setTypingUserId]);

  useEffect(() => {
    if (!selectedUser) return;
    getMessages(selectedUser.id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  const listData = useMemo(() => ({ messages, authUser, selectedUser }), [ messages, authUser, selectedUser ]);

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
        {messages.map((msg, index) => (
          <MessageContainer key={msg.id || index + 1} index={index} data={listData} />
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
