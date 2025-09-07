import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./Store/useAuthStore";
import { connectSocket, socket } from "./lib/socket.js";
import { Loader } from "lucide-react";
import { Toaster, toast } from "react-hot-toast";
import HomePage from "./Pages/HomePage";
import SignUpPage from "./Pages/SignUpPage";
import LoginPage from "./Pages/LoginPage";
import ProfilePage from "./Pages/ProfilePage";
import { useChatStore } from "./Store/useChatStore";
import "./App.css";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();
  const { subscribeToMessages, unsubscribeFromMessages } = useChatStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (authUser?.id) {
      connectSocket(authUser.id);
      subscribeToMessages();
      if (socket) {
        socket.on("notification", (notif) => {
          const shortMsg = notif.message
            ? notif.message.split(" ").slice(0, 10).join(" ")
            : "📩 New message";
          toast(`🔔 ${notif.senderName} sends: ${shortMsg}...`);
        });
      }

      return () => {
        unsubscribeFromMessages();
        if (socket) socket.off("notification");
      };
    }
  }, [authUser, subscribeToMessages, unsubscribeFromMessages]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="loader-wrapper">
        <Loader className="loader" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
      </Routes>
      <Toaster />
    </>
  );
};

export default App;
