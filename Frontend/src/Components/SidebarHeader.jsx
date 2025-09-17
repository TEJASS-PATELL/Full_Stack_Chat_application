const SidebarHeader = () => {
    return (
        <div className="sidebar-header">
            <div className="sidebar-toggle">
                <div className="toggle-btn chat active">
                    <img src="person.png" className="sidebar-icon" alt="Contact" />
                    <span className="sidebar-btn-text">Contact's</span>
                </div>
            </div>
        </div>
    );
};

export default SidebarHeader;