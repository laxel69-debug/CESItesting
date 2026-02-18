import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import { clearAuth } from "./auth";
import { ArrowLeft } from "lucide-react";
import "../AuthCSS/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname;

  // Clear auth when landing on login page to prevent stale tokens
  useEffect(() => {
    clearAuth();
  }, []);

  const handleBack = () => {
    navigate("/", { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/accounts/login/", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok || !data?.success) {
        setError(data?.message || "Invalid credentials");
        return;
      }

      // Store login info
      login({ user: data.user, token: data.token });

      // Small delay to ensure auth context updates before navigation
      setTimeout(() => {
        if (from) {
          navigate(from, { replace: true });
          return;
        }

        const normalizedRole = data?.user?.role?.toLowerCase();
        if (normalizedRole === "admin") navigate("/admin", { replace: true });
        else if (normalizedRole === "teacher") navigate("/teacher", { replace: true });
        else if (normalizedRole === "parent_student") navigate("/parent", { replace: true });
        else navigate("/", { replace: true });
      }, 100);

    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <button type="button" className="back-btn" onClick={handleBack} title="Go Back">
            <ArrowLeft size={20} />
          </button>
          <h1>CESI Portal</h1>
        </div>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email or Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <span className="forgot-pass">Forgot your password?</span>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
