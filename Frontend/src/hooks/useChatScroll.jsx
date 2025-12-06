import { useEffect, useRef } from "react";

export const useChatScroll = (messages, selectedUser) => {
  const bottomRef = useRef(null);
  const prevMessagesLengthRef = useRef(messages.length);
  const prevSelectedUserIdRef = useRef(selectedUser?.id);

  useEffect(() => {
    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;
    const currentUserId = selectedUser?.id;
    const prevUserId = prevSelectedUserIdRef.current;

    const isNewUser = currentUserId !== prevUserId;
    const isNewMessage = currentLength > prevLength;

    if (isNewUser || isNewMessage) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    prevMessagesLengthRef.current = currentLength;
    prevSelectedUserIdRef.current = currentUserId;
  }, [messages, selectedUser]);

  return bottomRef;
};
