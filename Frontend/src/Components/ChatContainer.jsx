import { useEffect, useRef, useMemo, useCallback } from "react";
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
    loadMoreMessages,
    isMessagesLoading,
    isLoadingMore,
    hasMoreMessages,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setTypingUserId,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useChatScroll(messages);
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!socket) return;
    let timer;

    const handleTyping = ({ userId }) => {
      setTypingUserId(userId);
      clearTimeout(timer);
      timer = setTimeout(() => setTypingUserId(null), 2000);
  };

  socket.on("showTyping", handleTyping);
    return () => {
      socket.off("showTyping", handleTyping);
      clearTimeout(timer);
    };
  }, [socket, setTypingUserId]);

  useEffect(() => {
    if (!selectedUser) return;

    getMessages(selectedUser.id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [selectedUser, getMessages, subscribeToMessages, unsubscribeFromMessages]);

  const handleScroll = useCallback(() => {
    const div = wrapperRef.current;
    if (!div || !hasMoreMessages || isLoadingMore) return;

    if (div.scrollTop === 0) {
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  useEffect(() => {
    const div = wrapperRef.current;
    if (!div) return;
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const listData = useMemo(
    () => ({ messages, authUser, selectedUser }),
    [messages, authUser, selectedUser]
  );

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
      <div className="messages-wrapper" ref={wrapperRef}>
        {isLoadingMore && <div className="loading-more">Loading older messages...</div>}
        {messages.map((msg, index) => (
          <MessageContainer key={msg.id || index} index={index} data={listData} />
        ))}
        <div ref={messageEndRef} />
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
