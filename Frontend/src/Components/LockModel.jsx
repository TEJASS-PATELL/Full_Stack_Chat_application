import { useState, useRef } from "react";
import { useChatStore } from "../Store/useChatStore";
import { useChatLockStore } from "../Store/useChatLockStore";
import toast from "react-hot-toast";

const LockModal = ({ setShowLockModal, currentLockUserId }) => {
  const { users, setSelectedUser } = useChatStore();
  const { lockChat, unlockChat, isUserLocked } = useChatLockStore();

  const [pinInput, setPinInput] = useState(Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;

    const newPin = [...pinInput];
    newPin[index] = value.slice(-1);
    setPinInput(newPin);

    if (index < inputRefs.current.length - 1) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleBackspace = (e, index) => {
    if (e.key === "Backspace") {
      const newPin = [...pinInput];

      if (pinInput[index]) {
        newPin[index] = "";
        setPinInput(newPin);
      } else if (index > 0) {
        newPin[index - 1] = "";
        setPinInput(newPin);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePinSubmit = async () => {
    const pin = pinInput.join("");

    if (pin.length !== 6 || !currentLockUserId) {
      toast.error("Please enter a valid 6-digit PIN");
      return;
    }

    try {
      if (isUserLocked(currentLockUserId)) {
        await unlockChat(currentLockUserId, pin);
        if (!isUserLocked(currentLockUserId)) {
          const unlockedUser = users.find((u) => u.id === currentLockUserId);
          if (unlockedUser) setSelectedUser(unlockedUser);
        }
      } else {
        await lockChat(currentLockUserId, pin);
      }
    } finally {
      setShowLockModal(false);
      setPinInput(Array(6).fill(""));
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setShowLockModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Enter Chat PIN</h3>

        <div className="pin-input-container">
          {pinInput.map((digit, index) => (
            <input
              key={index}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleBackspace(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
              autoFocus={index === 0}
              className="pin-input"
            />
          ))}
        </div>

        <div className="modal-actions">
          <button onClick={handlePinSubmit}>Submit</button>
          <button className="cancel-btn" onClick={() => setShowLockModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockModal;
