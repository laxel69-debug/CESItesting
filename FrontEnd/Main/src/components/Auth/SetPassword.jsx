import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8000";

export default function SetPassword() {
  const { uidb64, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters.");
      return;
    }
    if (password !== password2) {
      setMsg("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/accounts/set-password/${uidb64}/${token}/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, password2 }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data?.detail || "Failed to set password. The link may be invalid/expired.");
        setLoading(false);
        return;
      }

      // OPTIONAL: auto-login by saving token
      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      setMsg("✅ Password set successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 800);
    } catch (err) {
      console.error(err);
      setMsg("Network error. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: 16 }}>
      <h2>Set Your Password</h2>
      <p style={{ opacity: 0.8 }}>
        Create a password for your Parent Portal account.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 10 }}>
          <label>New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: "100%", padding: 10 }}
            placeholder="Min 8 characters"
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Confirm Password</label>
          <input
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            style={{ width: "100%", padding: 10 }}
            placeholder="Re-type password"
          />
        </div>

        {msg && <div style={{ marginBottom: 10 }}>{msg}</div>}

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 12 }}
        >
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}