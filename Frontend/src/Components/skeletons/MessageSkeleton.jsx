import "./MessageSkeleton.css"; 

const MessageSkeleton = () => {
  const skeletonMessages = Array(6).fill(null);

  return (
    <div className="message-skeleton-container">
      {skeletonMessages.map((_, idx) => (
        <div key={idx} className={`message ${idx % 2 === 0 ? "message-start" : "message-end"}`}>
          <div className="message-avatar">
            <div className="avatar-skeleton"></div>
          </div>

          <div className="message-header">
            <div className="header-skeleton"></div>
          </div>

          <div className="message-bubble">
            <div className="bubble-skeleton"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MessageSkeleton;
