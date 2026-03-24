import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../Store/useAuthStore";
import { Lock, Mail, User, Eye, EyeOff, MessageSquare, Loader2 } from "lucide-react";
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
    if (validateForm()) {
      const { fullname, email, password } = formData;
      signup({ fullname, email, password });
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card signup-card">
        <header className="auth-header">
          <h1>Create Account</h1>
          <p>Join the community and start chatting</p>
        </header>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <div className="input-wrapper">
              <User className="field-icon" size={18} />
              <input
                id="fullname"
                type="text"
                placeholder="John Doe"
                value={formData.fullname}
                onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <Mail className="field-icon" size={18} />
              <input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock className="field-icon" size={18} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="field-icon" size={18} />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>

          <button className="auth-btn" type="submit" disabled={isSigningUp}>
            {isSigningUp ? (
              <span className="btn-loading">
                <Loader2 className="animate-spin" size={18} /> Creating...
              </span>
            ) : (
              "Get Started"
            )}
          </button>
        </form>

        <footer className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
          <div className="copyright">© 2026 CHATAPP. Minimal Edition.</div>
        </footer>
      </div>
    </div>
  );
};

export default SignUpPage;