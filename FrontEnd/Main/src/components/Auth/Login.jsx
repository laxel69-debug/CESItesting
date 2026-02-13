import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";
import "../AuthCSS/Login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const from = location.state?.from?.pathname;

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

      login({ user: data.user, token: data.token });

      if (from) {
        navigate(from, { replace: true });
        return;
      }

      const normalizedRole = data?.user?.role?.toLowerCase();
      if (normalizedRole === "admin") navigate("/admin", { replace: true });
      else if (normalizedRole === "teacher") navigate("/teacher", { replace: true });
      else if (normalizedRole === "parent_student") navigate("/parent", { replace: true });
      else navigate("/", { replace: true });

    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>CESI Portal</h1>
        {error && <div className="error-msg">{error}</div>}
        <form onSubmit={handleLogin}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Email or Username"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <span className="forgot-pass">Forgot your password?</span>
          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
