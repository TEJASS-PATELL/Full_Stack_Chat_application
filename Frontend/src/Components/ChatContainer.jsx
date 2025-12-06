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
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    setTypingUserId,
    loadMoreMessages,
    hasMoreMessages,
    isLoadingMore,
  } = useChatStore();

  const { authUser, socket } = useAuthStore();
  const messageEndRef = useChatScroll(messages, selectedUser);
  const wrapperRef = useRef(null);
  const prevScrollHeightRef = useRef(0);

  useEffect(() => {
    if (!socket) return;

    const handleTyping = ({ userId }) => {
      setTypingUserId(userId);
      const timer = setTimeout(() => setTypingUserId(null), 2000);
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

  const handleScroll = useCallback(() => {
    const div = wrapperRef.current;
    if (!div || !hasMoreMessages || isLoadingMore) return;

    if (div.scrollTop === 0) {
      prevScrollHeightRef.current = div.scrollHeight;
      loadMoreMessages();
    }
  }, [hasMoreMessages, isLoadingMore, loadMoreMessages]);

  useEffect(() => {
    const div = wrapperRef.current;
    if (!div) return;
    div.addEventListener("scroll", handleScroll);
    return () => div.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    const div = wrapperRef.current;
    if (!div || isLoadingMore) return;

    if (prevScrollHeightRef.current > 0) {
      const newScrollHeight = div.scrollHeight;
      const addedHeight = newScrollHeight - prevScrollHeightRef.current;
      div.scrollTop = addedHeight;
      prevScrollHeightRef.current = 0;
    }
  }, [messages, isLoadingMore]);

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