const LockModal = ({
  setShowLockModal,
  pinInput,
  setPinInput,
  inputRefs,
  handlePinSubmit,
}) => {
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
    if (e.key === "Backspace" && !pinInput[index] && index > 0) {
      const newPin = [...pinInput];
      newPin[index - 1] = "";
      setPinInput(newPin);
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmitClick = async () => {
    await handlePinSubmit();
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
          <button onClick={handleSubmitClick}>Submit</button>
          <button className="cancel-btn" onClick={() => setShowLockModal(false)}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockModal;
