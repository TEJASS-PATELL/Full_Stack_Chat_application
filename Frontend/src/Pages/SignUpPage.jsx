import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../Store/useAuthStore";
import { FaLock, FaLockOpen } from "react-icons/fa";
import { Lock, Mail, User } from "lucide-react";
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

    if (!fullname.trim()) return toast.error("Full name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (!/\S+@\S+\.\S+/.test(email)) return toast.error("Invalid email format");
    if (password.length < 6)
      return toast.error("Password must be at least 6 characters");
    if (password !== confirmPassword)
      return toast.error("Passwords do not match");

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      signup({
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
      });
    }
  };

  return (
    <section className="signup-page">
      <main className="signup-container">
        <form className="signup-form" onSubmit={handleSubmit}>
          
          <header>
            <h1>Join the Conversation</h1>
            <p className="signup-subtext">
              Create your account and start chatting instantly
            </p>
          </header>

          <div className="input-group">
            <label htmlFor="fullname">Full Name</label>
            <div className="input-wrapper">
              <User />
              <input
                id="fullname"
                type="text"
                placeholder="John Doe"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail />
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock />
              <input
                id="password"
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
                className="toggle-password"
                aria-label="Toggle password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaLockOpen /> : <FaLock />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock />
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    confirmPassword: e.target.value,
                  })
                }
                required
              />
            </div>
          </div>

          <button type="submit" disabled={isSigningUp}>
            {isSigningUp ? "Creating account..." : "Sign Up"}
          </button>

          <p className="login-redirect">
            Already have an account? <Link to="/login">Log In</Link>
          </p>
        </form>
      </main>

      <footer>
        <p>&copy; 2025 Chat App. All rights reserved.</p>
      </footer>
    </section>
  );
};

export default SignUpPage;
