import { FaUser } from 'react-icons/fa';

const SidebarHeader = () => {
    return (
        <div className="sidebar-header">
            <div className="sidebar-toggle">
                <div className="toggle-btn chat active">
                    <FaUser className="sidebar-icon"/>
                    <span className="sidebar-btn-text">Contact's</span>
                </div>
            </div>
        </div>
    );
};

export default SidebarHeader;