import { useState, useEffect } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Camera, Mail, User, Loader2, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const {
    authUser,
    isUpdatingProfile,
    updateProfile,
    deleteAccount,
    isDeletingAccount,
  } = useAuthStore();

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
    ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(createdAt))
    : "N/A";

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <p>Manage your personal information</p>
        </div>

        <div className="avatar-section">
          <div className="avatar-wrapper">
            <img
              src={selectedImg || "/user.png"}
              alt="Profile"
              className="avatar-img"
            />

            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              {isUpdatingProfile ? (
                <Loader2 className="icon spin" />
              ) : (
                <Camera className="icon" />
              )}
              <input
                type="file"
                id="avatar-upload"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>

          <p className="upload-text">
            {isUpdatingProfile ? "Updating..." : "Change profile picture"}
          </p>
        </div>

        <div className="info-grid">
          <div className="info-card">
            <div className="info-header">
              <User className="info-icon" />
              <h2>Name</h2>
            </div>
            <p>{authUser?.fullname || "N/A"}</p>
          </div>

          <div className="info-card">
            <div className="info-header">
              <Mail className="info-icon" />
              <h2>Email</h2>
            </div>
            <p>{authUser?.email || "N/A"}</p>
          </div>

          <div className="info-card">
            <div className="info-header">
              <CalendarDays className="info-icon" />
              <h2>Member Since</h2>
            </div>
            <p>{formattedDate}</p>
          </div>

          <div className="info-card">
            <div className="info-header">
              
            </div>
            
          </div>
        </div>

        <button
          onClick={deleteAccount}
          disabled={isDeletingAccount}
          className="delete-btn"
        >
          {isDeletingAccount ? "Deleting..." : "Delete Account"}
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
