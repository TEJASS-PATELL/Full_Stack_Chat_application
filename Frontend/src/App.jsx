import HomePage from "./Pages/HomePage";
import SignUpPage from "./Pages/SignUpPage";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./Store/useAuthStore";
import { useEffect, useState } from "react";
import "./App.css";
import { Loader } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import { socket, connectSocket } from "./lib/socket";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser?.id) {
      connectSocket(authUser.id);

      if (socket) {
        socket.on("newMessage", (msg) => {
          toast.success(`New message from ${msg.senderid}`);
        });
        socket.on("notification", (notif) => {
          setNotifications((prev) => [...prev, notif]);
          toast(`${notif.text}`, { icon: "🔔" });
        });
      }
    }

    return () => {
      if (socket) {
        socket.off("newMessage");
        socket.off("notification");
      }
    };
  }, [authUser]);

  if (isCheckingAuth && !authUser)
    return (
      <div className="loader-wrapper">
        <Loader className="loader" />
      </div>
    );

  return (
    <>
      <div>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />}/>
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />}/>
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />}/>
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />}/>
        </Routes>

        <Toaster position="top-right" />
        {authUser && (
          <div className="notification-box">
            🔔 Notifications: {notifications.length}
          </div>
        )}
      </div>
    </>
  );
};

export default App;
