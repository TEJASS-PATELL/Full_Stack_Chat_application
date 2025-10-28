import { useState, useEffect } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Camera, Mail, User, Loader2, CalendarDays } from "lucide-react";
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
      const base64Image = reader.result;
      try {
        const updatedUser = await updateProfile({ profilepic: base64Image });
        setSelectedImg(updatedUser.profilepic); 
      } catch (error) {
        toast.error("Failed to update profile picture.");
      }
    };
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone!"
    );
    if (!confirmDelete) return;
    try {
      await deleteAccount();
      toast.success("Account deleted successfully.");
    } catch (error) {
      toast.error("Failed to delete account.");
    }
  };

  const createdAt = authUser?.createdAt || authUser?.createdat;
  const formattedDate = createdAt ? new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(new Date(createdAt)) : "N/A";

  return (
    <div className="profile-container">
      <div className="profile-cardd">
        <div className="profile-header">
          <h1>Profile</h1>
          <p>Manage your account settings</p>
        </div>

        <div className="avatar-upload">
          <div className="avatar-wrapper">
            <img
              src={selectedImg || "/user.png"}
              alt="Profile"
              className="avatar-img"
            />
            <label htmlFor="avatar-upload" className="avatar-upload-btn">
              {isUpdatingProfile ? (
                <Loader2 className="icon animate-spin" />
              ) : (
                <Camera className="icon" />
              )}
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUpdatingProfile}
              />
            </label>
          </div>
          <p className="upload-text">
            {isUpdatingProfile
              ? "Uploading..."
              : "Click the camera icon to change your photo"}
          </p>
        </div>

        <div className="profile-grid">
          <div className="info-cardd">
            <div className="info-header">
              <User className="info-icon" />
              <h2>Full Name</h2>
            </div>
            <p>{authUser?.fullname || "N/A"}</p>
          </div>

          <div className="info-cardd">
            <div className="info-header">
              <Mail className="info-icon" />
              <h2>Email Address</h2>
            </div>
            <p>{authUser?.email || "N/A"}</p>
          </div>
        </div>

        <div className="account-itemm">
          <div className="info-cardd">
            <div className="info-header">
              <CalendarDays className="info-icon" />
              <h2>Member Since</h2>
            </div>
            <p className="p-icon">{formattedDate}</p>
          </div>

          <div>
            <button
              onClick={handleDeleteAccount}
              disabled={isDeletingAccount}
              className="delete_account"
            >
              {isDeletingAccount ? "Deleting..." : "Delete Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
