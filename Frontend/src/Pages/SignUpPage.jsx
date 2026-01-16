import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../Store/useAuthStore";
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { Loader2, Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
import "../styles/SignUpPage.css";

const SignUpPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const { signup, isSigningUp } = useAuthStore();

  const validateForm = () => {
    const { fullname, email, password, confirmPassword } = formData;
    if (!fullname.trim()) {
      toast.error("Full name is required");
      return false;
    }
    if (!email.trim()) {
      toast.error("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Invalid email format");
      return false;
    }
    if (!password) {
      toast.error("Password is required");
      return false;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const isValid = validateForm();
    if (isValid === true) {
      const { fullname, email, password } = formData;
      signup({ fullname, email, password });
    }
  };

  return (
    <div className="loginnn">
      <div className="signup-container">
        <main>
          <form className="signup-form" onSubmit={handleSubmit}>
            <h1>Create an Account</h1>
            <p className="signup-subtext">It only takes a few seconds to get started!</p>
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={formData.fullname}
                  onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label>Email</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <label>Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                />
                <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FaLockOpen /> : <FaLock />}
                </button>
              </div>
            </div>

            <div className="input-group">
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                />
              </div>
            </div>

            <button type="submit" className={`submit-btn ${isSigningUp ? "disabled" : ""}`} disabled={isSigningUp}>
              {isSigningUp ? (
                <>
                  <div className="loader-container">
                    <div className="spinner"></div>
                    <span>Creating Account...</span>
                  </div>
                </>
              ) : (
                "Sign Up"
              )}
            </button>
            <p className="login-redirect">
              Already have an account? <Link to="/login">Log In</Link>
            </p>
          </form>
        </main>

        <footer>
          <p>&copy; 2025 Chat App. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
};

export default SignUpPage;
