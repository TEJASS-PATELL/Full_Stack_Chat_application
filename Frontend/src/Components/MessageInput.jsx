import "./MessageInput.css";
import { useRef, useState } from "react";
import { useChatStore } from "../Store/useChatStore";
import { ArrowRight, Image, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../Store/useAuthStore";
import EmojiPicker from "emoji-picker-react";
import { BsEmojiSmile } from "react-icons/bs";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  const { authUser, socket } = useAuthStore();
  const { sendMessage, selectedUser } = useChatStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    if (!selectedUser || !authUser) return;

    const tempMsg = {
      id: Date.now(),
      senderId: authUser.id,
      receiverId: selectedUser.id,
      text: text.trim(),
      image: imagePreview,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setText("");
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    try {
      await sendMessage({
        text: tempMsg.text,
        image: tempMsg.image,
      });
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setText(value);
    if (selectedUser && authUser && socket) {
      socket.emit("typing", {
        toUserId: selectedUser.id,
        userId: authUser.id,
      });
    }
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="message-input">
      {imagePreview && (
        <div className="image-preview">
          <div className="relative">
            <img src={imagePreview} alt="Preview" className="preview-image" />
            <button onClick={removeImage} className="remove-button" type="button">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div className="emoji-picker">
          <div className="emoji-picker-header">
            <button className="remove-button" onClick={() => setShowEmojiPicker(false)}>
              <X size={18} />
            </button>
          </div>
          <EmojiPicker onEmojiClick={handleEmojiClick} height={350} />
        </div>
      )}

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          className="message-input-field"
          placeholder="Type a message..."
          value={text}
          onChange={handleTyping}
        />
        <input
          type="file"
          accept="image/*"
          className="file-input"
          ref={fileInputRef}
          onChange={handleImageChange}
        />
        <button
          type="button"
          className="icon-btn emoji-btn"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
        >
          <BsEmojiSmile size={25} />
        </button>
        <button
          type="button"
          className={`icon-btn image-upload-btn ${imagePreview ? "has-image" : ""}`}
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={25} />
        </button>
        <button
          type="submit"
          className="icon-btn send-buttonn"
          disabled={!text.trim() && !imagePreview}
        >
          <ArrowRight size={25} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
