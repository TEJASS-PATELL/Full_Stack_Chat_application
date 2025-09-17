import { Users } from "lucide-react";
import "./SidebarSkeleton.css";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
            <div className="sidebar-toggle">
                <div className="toggle-btn chat active">
                    <img src="person.png" className="sidebar-icon" alt="Contact" />
                    <span className="sidebar-btn-text">Contact</span>
                </div>
            </div>
        </div>

      <div className="sidebar-contacts">
        {skeletonContacts.map((_, idx) => (
          <div key={idx} className="skeleton-contact">
            <div className="avatar-skeleton"></div>
            <div className="user-info-skeleton">
              <div className="name-skeleton"></div>
              <div className="status-skeleton"></div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;

