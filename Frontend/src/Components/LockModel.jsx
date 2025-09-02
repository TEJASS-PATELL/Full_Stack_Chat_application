const LockModel = ({ setShowLockModal, pinInput, handlePinChange, handleBackspace, inputRefs, handlePinSubmit,}) => {
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
                            onChange={(e) => handlePinChange(e, index)}
                            onKeyDown={(e) => handleBackspace(e, index)}
                            ref={(el) => (inputRefs.current[index] = el)}
                        />
                    ))}
                </div>
                <div style={{ marginTop: "15px" }}>
                    <button onClick={handlePinSubmit}>Submit</button>
                    <button onClick={() => setShowLockModal(false)} style={{ marginLeft: "10px" }}>
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LockModel;