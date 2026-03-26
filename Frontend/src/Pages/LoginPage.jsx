import { useState } from "react";
import { useAuthStore } from "../Store/useAuthStore";
import { Link } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, MessageSquare } from "lucide-react";
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
    <div className="auth-wrapper">
      <div className="login-card">
        <header className="login-header">
          <div className="logo-icon">
            <img src="whatsapp.png" className="image"/>
          </div>
          <h1>Welcome Back</h1>
          <p>Enter your details to start chatting</p>
        </header>

        <form className="login-form" onSubmit={handleSubmit}>
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
                placeholder="••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                className="toggle-btnn"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button className="login-btn" type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <footer className="login-footer">
          <p>
            New here? <Link to="/signup">Create-Account</Link>
          </p>
          <div className="copyright">© 2026 CHATAPP. Minimal Edition.</div>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;