import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Link } from "react-router-dom";
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { Lock, Mail } from "lucide-react";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { login, isLoggingIn } = useAuthStore();
  const formRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="wrapper">
      <div className="login-container">
        <main className="login-form-container">
          <div className="glassmorphism-form" ref={formRef}>
            <div className="text-center">
              <img className="images" src="chat.png" alt="Chat Icon" />
              <h1>Welcome Back!!</h1>
              <p>Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="login-form">
              <label className="labell">Email</label>
              <div className="inputt-container">
                <Mail className="input-icon" />
                <input
                  className="input-login"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                />
              </div>

              <label className="labell">Password</label>
              <div className="inputt-container">
                <Lock className="input-icon" />
                <input
                  className="input-login"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaLockOpen /> : <FaLock />}
                </button>
              </div>

              <button type="submit" className="submit-btnn" disabled={isLoggingIn}>
                {isLoggingIn ? (
                  <div className="loader-container">
                    <div className="spinner"></div>
                    <span>Loading....</span>
                  </div>
                ) : (
                  "Login"
                )}
              </button>
            </form>

            <div className="text-center">
              <p>
                Don't have an account?{" "}
                <Link to="/signup" className="signup-link">
                  Sign Up
                </Link>
              </p>
            </div>
          </div>
        </main>

        <footer className="login-footer">
          <p>&copy; 2025 Chat App. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;
