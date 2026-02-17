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

function NavContent({
  pages,
  activePage,
  setActivePage,
  onPick,
  isCollapsed,
  onLogout,
}) {
  return (
    <>
      <div className="sb__profile">
        <div className="sb__avatar">U</div>

        {!isCollapsed && (
          <div className="sb__profileText">
            <div className="sb__name">Username</div>
            <div className="sb__role">Faculty Member</div>
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

function Sidebar() {
  const [activePage, setActivePage] = React.useState("dashboard");
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const navigate = useNavigate();
  const { logout } = useAuth(); // ✅ correct usage

  const active = pages.find((p) => p.key === activePage) ?? pages[0];

  const handleLogout = async () => {
    try {
      // OPTIONAL (recommended if using Django session auth)
      await apiFetch("/api/accounts/logout/", {
        method: "POST",
      });
    } catch (err) {
      console.warn("Backend logout failed (continuing):", err);
    } finally {
      logout();                // clear auth context + storage
      navigate("/login", { replace: true, state: {} });
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
      {/* Mobile topbar */}
      <header className="topbar">
        <button className="topbar__menuBtn" onClick={() => setMobileOpen(true)}>
          ☰
        </button>
        <div className="topbar__title">Teacher Portal</div>
        <div className="topbar__spacer" />
      </header>

      {/* Mobile drawer */}
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
            />
          </aside>
        </>
      )}

      {/* Desktop sidebar */}
      <aside className={`sb ${isCollapsed ? "sb--collapsed" : ""}`}>
        <div className="sb__collapseRow">
          {/* <button
            className="sb__collapseBtn"
            onClick={() => setIsCollapsed((v) => !v)}
          >
             {isCollapsed ? "➤" : "◀"} 
          </button> */}
        </div>

        <NavContent
          pages={pages}
          activePage={activePage}
          setActivePage={setActivePage}
          isCollapsed={isCollapsed}
          onLogout={handleLogout}
        />
      </aside>

      {/* Main content */}
      <main className="content">{active.component}</main>
    </div>
  );
}

export default Sidebar;
