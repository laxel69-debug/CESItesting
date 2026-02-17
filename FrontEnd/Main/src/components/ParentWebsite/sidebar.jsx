import React, { useEffect, useState } from "react";
import "../ParentWebsiteCSS/sidebar.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../Auth/useAuth";
import { apiFetch } from "../api/apiFetch";

const navLinks = [
  { key: "dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { key: "profile", icon: "bi-person", label: "Student Info" },
  { key: "ledgers", icon: "bi-journal-text", label: "Ledger" },
  { key: "grades", icon: "bi-wallet2", label: "Grades" },
  { key: "schedule", icon: "bi-calendar-event", label: "Schedule" },
  { key: "attendance", icon: "bi-calendar-check", label: "Attendance" },
  { key: "messages", icon: "bi-chat-dots", label: "Messages" },
];

const API_BASE = ""; // Vite proxy handles /api → Django

function getInitials(name = "User") {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function roleLabel(role) {
  if (!role) return "User";
  const r = String(role).toLowerCase();
  if (r.includes("admin")) return "Administrator";
  if (r.includes("teacher")) return "Teacher";
  if (r.includes("parent")) return "Parent";
  return role;
}

export default function Sidebar({ page, setPage, isCollapsed, setIsCollapsed }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth(); // ✅ single auth source

  const displayName =
    user?.full_name || user?.name || user?.username || user?.email || "User";

  const handleNavigate = (key) => {
    setPage(key);
    if (isMobile) setDrawerOpen(false);
  };

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      if (!mobile) setDrawerOpen(false);
      if (mobile) setIsCollapsed(false); // always expanded on mobile drawer
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setIsCollapsed]);

  // ✅ LOGOUT (same pattern as your admin sidebar)
  const handleLogout = async () => {
  try {
    await apiFetch(`/api/accounts/logout/`, { method: "POST" });
  } catch (e) {
    console.warn(e);
  } finally {
    logout();
    navigate("/", { replace: true });
    window.location.reload();
  }
  };

  const UserCard = ({ compact = false }) => (
    <div className={compact ? "ps-usercard ps-usercard-compact" : "ps-usercard"}>
      <div className="ps-avatar" aria-hidden="true" title={displayName}>
        {getInitials(displayName)}
      </div>

      {!compact && (
        <div className="ps-usermeta">
          <div className="ps-username">{displayName}</div>
          <div className="ps-role">{roleLabel(user?.role)}</div>
          <div className="ps-usersub">
            {user?.username && <span className="ps-handle">@{user.username}</span>}
            {user?.email && <span className="ps-email">{user.email}</span>}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="ps-topbar d-md-none">
        <button
          className="ps-iconbtn"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
        >
          <i className="bi bi-list"></i>
        </button>

        <div className="ps-topbar-title">STUDENT PORTAL</div>

        {/* small user initials on the right */}
        <div className="ps-topbar-spacer">
          {user ? <UserCard compact /> : <div className="ps-topbar-spacer" />}
        </div>
      </header>

      {/* Mobile Drawer */}
      {isMobile && drawerOpen && (
        <>
          <div className="ps-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="ps-drawer">
            <div className="ps-drawer-head">
              <span className="ps-drawer-title">Menu</span>
              <button
                className="ps-iconbtn"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close menu"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            {/* ✅ Who's logged in */}
            {user && (
              <div className="ps-drawer-userwrap">
                <UserCard />
              </div>
            )}

            <nav className="ps-nav">
              {navLinks.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`ps-navitem ${page === item.key ? "active" : ""}`}
                  onClick={() => handleNavigate(item.key)}
                >
                  <i className={`bi ${item.icon}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            <div className="ps-footer">
              <button type="button" className="ps-logout" onClick={handleLogout}>
                <i className="bi bi-box-arrow-right" />
                <span>Log out</span>
              </button>
            </div>
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className={`ps-sidebar d-none d-md-flex ${isCollapsed ? "collapsed" : ""}`}>
        <div className="ps-sidebar-head">
          {/* ✅ Who's logged in (desktop) */}
          {user ? (
            <>
              <div className="ps-avatar" title={displayName}>
                {getInitials(displayName)}
              </div>

              {!isCollapsed && (
                <div className="ps-namewrap">
                  <div className="ps-name">{displayName}</div>
                  <div className="ps-role">{roleLabel(user?.role)}</div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="ps-avatar">U</div>
              {!isCollapsed && <div className="ps-name">User</div>}
            </>
          )}

          <button
            type="button"
            className="ps-collapse"
            onClick={() => setIsCollapsed((v) => !v)}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand" : "Collapse"}
          >
            <i className={`bi ${isCollapsed ? "bi-chevron-right" : "bi-chevron-left"}`} />
          </button>
        </div>

        <nav className="ps-nav">
          {navLinks.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`ps-navitem ${page === item.key ? "active" : ""}`}
              onClick={() => handleNavigate(item.key)}
              title={isCollapsed ? item.label : undefined}
            >
              <i className={`bi ${item.icon}`} />
              {!isCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="ps-footer">
          <button
            type="button"
            className="ps-logout"
            onClick={handleLogout}
            title={isCollapsed ? "Log out" : undefined}
          >
            <i className="bi bi-box-arrow-right" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
