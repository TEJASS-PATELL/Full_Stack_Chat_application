import { useState, useEffect } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Camera, Mail, User, Loader2, CalendarDays, ShieldCheck, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile, deleteAccount, isDeletingAccount } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    setSelectedImg(authUser?.profilepic || null);
  }, [authUser]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      try {
        const updatedUser = await updateProfile({ profilepic: reader.result });
        setSelectedImg(updatedUser.profilepic);
      } catch {
        toast.error("Failed to update profile picture.");
      }
    };
  };

  const createdAt = authUser?.createdAt || authUser?.createdat;
  const formattedDate = createdAt
    ? new Intl.DateTimeFormat("en-US", { year: "numeric", month: "long" }).format(new Date(createdAt))
    : "N/A";

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-banner">
          <div className="profile-banner-pattern" />
        </div>

        <div className="avatar-zone">
          <div className="avatar-wrapper">
            <img src={selectedImg || "/user.png"} alt="Profile" className="avatar-img" />
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              {isUpdatingProfile ? <Loader2 className="icon spin" /> : <Camera className="icon" />}
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
        </div>

        <div className="profile-name-section">
          <h1>{authUser?.fullname || "User"}</h1>
          <span>@{authUser?.fullname?.toLowerCase().replace(" ", ".") || "user"}</span>
        </div>

        <hr className="profile-divider" />

        <div className="info-grid">
          <div className="info-item">
            <div className="info-label"><User className="info-icon" /> Full name</div>
            <div className="info-value">{authUser?.fullname || "N/A"}</div>
          </div>
          <div className="info-item">
            <div className="info-label"><Mail className="info-icon" /> Email</div>
            <div className="info-value">{authUser?.email || "N/A"}</div>
          </div>
          <div className="info-item">
            <div className="info-label"><CalendarDays className="info-icon" /> Member since</div>
            <div className="info-value">{formattedDate}</div>
          </div>
          <div className="info-item">
            <div className="info-label"><ShieldCheck className="info-icon" /> Account status</div>
            <div className="info-value active">Active</div>
          </div>
        </div>

        <hr className="profile-divider" />

        <div className="profile-actions">
          <button onClick={deleteAccount} disabled={isDeletingAccount} className="delete-btn">
            <Trash2 size={15} />
            {isDeletingAccount ? "Deleting..." : "Delete account"}
          </button>
        </div>
        <p className="delete-warning">Deleting your account is permanent and cannot be undone.</p>
      </div>
    </div>
  );
};

export default ProfilePage;