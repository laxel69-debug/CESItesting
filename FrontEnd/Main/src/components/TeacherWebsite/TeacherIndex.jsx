import React from "react";
import { useNavigate } from "react-router-dom";
import "../TeacherWebsiteCSS/sidebar.css";
import { apiFetch } from "../api/apiFetch";

import Dashboard from "./Dashboard.jsx";
import Grade from "./Grade.jsx";
import AttendanceMonitoring from "./AttendanceMonitoring.jsx";
import Message from "./Message.jsx";
import TeacherClassSchedule from "./TeacherClassSchedule.jsx";
import Students from "./Students.jsx";
import SPerformance from "./SPerformance.jsx";

import { useAuth } from "../Auth/useAuth";
import { LogOut } from "lucide-react";

const pages = [
  { key: "dashboard", label: "Dashboard", icon: "🏠", component: <Dashboard /> },
  { key: "grade", label: "Grade Encode", icon: "✍️", component: <Grade /> },
  { key: "attendance", label: "Attendance", icon: "✅", component: <AttendanceMonitoring /> },
  { key: "message", label: "Messages", icon: "💬", component: <Message /> },
  { key: "schedule", label: "Class Schedule", icon: "🗓️", component: <TeacherClassSchedule /> },
  { key: "students", label: "Students", icon: "👥", component: <Students /> },
  { key: "performance", label: "Performance", icon: "📈", component: <SPerformance /> },
];

/* ============================= */
/* Helpers */
/* ============================= */

function getInitials(name = "User") {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "U";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

function roleLabel(role) {
  if (!role) return "Faculty Member";
  const r = String(role).toLowerCase();
  if (r.includes("admin")) return "Administrator";
  if (r.includes("teacher")) return "Faculty Member";
  return role;
}

/* ============================= */
/* Sidebar Content */
/* ============================= */

function NavContent({
  pages,
  activePage,
  setActivePage,
  onPick,
  isCollapsed,
  onLogout,
  user,
}) {
  const displayName =
    user?.full_name ||
    user?.name ||
    user?.username ||
    user?.email ||
    "User";

  return (
    <>
      <div className="sb__profile">
        <div className="sb__avatar">
          {getInitials(displayName)}
        </div>

        {!isCollapsed && (
          <div className="sb__profileText">
            <div className="sb__name">{displayName}</div>
            <div className="sb__role">{roleLabel(user?.role)}</div>
          </div>
        )}
      </div>

      {!isCollapsed && <div className="sb__section">MENU</div>}

      <nav className="sb__nav">
        {pages.map((item) => {
          const isActive = item.key === activePage;
          return (
            <button
              key={item.key}
              className={`sb__link ${isActive ? "sb__link--active" : ""}`}
              onClick={() => {
                setActivePage(item.key);
                onPick?.();
              }}
              title={isCollapsed ? item.label : undefined}
            >
              <span className="sb__icon">{item.icon}</span>
              {!isCollapsed && <span className="sb__label">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sb__footer">
        <button
          className="sb__logout"
          type="button"
          onClick={onLogout}
          title={isCollapsed ? "Log out" : undefined}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Log out</span>}
        </button>
      </div>
    </>
  );
}

/* ============================= */
/* Main Sidebar */
/* ============================= */

function Sidebar() {
  const [activePage, setActivePage] = React.useState("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navigate = useNavigate();
  const { user, logout } = useAuth();   // ✅ FIXED: include user

  const active = pages.find((p) => p.key === activePage) ?? pages[0];

  const handleLogout = async () => {
    try {
      await apiFetch("/api/accounts/logout/", { method: "POST" });
    } catch (err) {
      console.warn("Backend logout failed (continuing):", err);
    } finally {
      logout();
      navigate("/", { replace: true });
      window.location.reload();
    }
  };

  React.useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setMobileOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 900) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div className="layout">
      {/* Mobile Topbar */}
      <header className="topbar">
        <button className="topbar__menuBtn" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
        <div className="topbar__title">Teacher Portal</div>
        <div className="topbar__spacer" />
      </header>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <>
          <div className="drawerBackdrop" onClick={() => setMobileOpen(false)} />
          <aside className="drawer">
            <div className="drawer__head">
              <div className="drawer__title">Menu</div>
              <button className="drawer__close" onClick={() => setMobileOpen(false)}>
                ✕
              </button>
            </div>

            <NavContent
              pages={pages}
              activePage={activePage}
              setActivePage={setActivePage}
              isCollapsed={false}
              onPick={() => setMobileOpen(false)}
              onLogout={handleLogout}
              user={user}   // ✅ FIXED
            />
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className={`sb ${isCollapsed ? "sb--collapsed" : ""}`}>
        <NavContent
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          isCollapsed={isCollapsed}
          onLogout={handleLogout}
          user={user}   // ✅ FIXED
        />
      </aside>

      {/* Main Content */}
      <main className="content">{active.component}</main>
    </div>
  );
}

export default Sidebar;