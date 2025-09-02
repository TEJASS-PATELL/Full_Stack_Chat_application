const SidebarHeader = ({ viewType, setViewType }) => {
    return (
        <div className="sidebar-header">
            <div className="sidebar-toggle">
                <button
                    className={`toggle-btn ${viewType === "chat" ? "active" : ""}`}
                    onClick={() => setViewType("chat")}>
                    <img src="person.png" className="sidebar-icon" alt="Contact" />
                    <span className="sidebar-btn-text">Contact</span>
                </button>
            </div>
        </div>
    );
};

export default SidebarHeader;