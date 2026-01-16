import { useState } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Link } from "react-router-dom";
import { FaComments, FaLock, FaLockOpen } from 'react-icons/fa';
import { Lock, Mail } from "lucide-react";
import "../styles/LoginPage.css";

const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const { login, isLoggingIn } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <section className="wrapper">
      <main className="login-container">
        <form className="glassmorphism-form" onSubmit={handleSubmit}>
          <header className="text-center">
            <FaComments className="images" />
            <h1>Let’s Get Talking!</h1>
            <p className="text-centre-p">Logged in to access your chats</p>
          </header>

          <div className="login-form">
            <label htmlFor="email" className="labell">Email</label>
            <div className="inputt-container">
              <Mail className="input-icon" />
              <input
              id="email"
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

            <label htmlFor="password" className="labell">Password</label>
            <div className="inputt-container">
              <Lock className="input-icon" />
              <input
              id="password"
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

            <button className="submit-btnn" type="submit" disabled={isLoggingIn}>
              {isLoggingIn ? "Logging in..." : "Log In"}
            </button>
          </div>

          <div className="text-center">
            <p className="login-p">
              Don't have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign Up
              </Link>
            </p>
          </div>
        </form>

        <footer className="login-footer">
          <p>&copy; 2025 Chat App. All rights reserved.</p>
        </footer>
      </main>
    </section>
  );
};

export default LoginPage;
