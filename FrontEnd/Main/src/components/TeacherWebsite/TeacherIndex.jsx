import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PenLine,
  CalendarCheck,
  MessageCircle,
  CalendarDays,
  Users,
  TrendingUp,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../TeacherWebsiteCSS/Sidebar.css";
import { apiFetch } from "../api/apiFetch";

import Dashboard from "./Dashboard.jsx";
import Grade from "./Grade.jsx";
import AttendanceMonitoring from "./AttendanceMonitoring.jsx";
import Message from "./Message.jsx";
import TeacherClassSchedule from "./TeacherClassSchedule.jsx";
import Students from "./Students.jsx";
import SPerformance from "./SPerformance.jsx";

import { useAuth } from "../Auth/useAuth";

const pages = [
  { key: "dashboard", label: "Dashboard", component: <Dashboard /> },
  { key: "grade", label: "Grade Encode", component: <Grade /> },
  { key: "attendance", label: "Attendance", component: <AttendanceMonitoring /> },
  { key: "message", label: "Messages", component: <Message /> },
  { key: "schedule", label: "Class Schedule", component: <TeacherClassSchedule /> },
  { key: "students", label: "Students", component: <Students /> },
  { key: "performance", label: "Performance", component: <SPerformance /> },
];

const menuSections = [
  {
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "ACADEMICS",
    items: [
      { id: "grade", label: "Grade Encode", icon: PenLine },
      { id: "attendance", label: "Attendance", icon: CalendarCheck },
      { id: "schedule", label: "Class Schedule", icon: CalendarDays },
      { id: "students", label: "Students", icon: Users },
      { id: "performance", label: "Performance", icon: TrendingUp },
    ],
  },
  {
    label: "COMMUNICATION",
    items: [
      { id: "message", label: "Messages", icon: MessageCircle },
    ],
  },
];

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

function Sidebar() {
  const [activePage, setActivePage] = useState("dashboard");
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const sidebarRef = useRef(null);

  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const active = pages.find((p) => p.key === activePage) ?? pages[0];

  const displayName =
    user?.full_name || user?.name || user?.username || user?.email || "User";

  const handleLogout = async () => {
    try {
      await apiFetch("/api/accounts/logout/", {
        method: "POST",
      });
    } catch (err) {
      console.warn("Backend logout failed (continuing):", err);
    } finally {
      logout();
      window.location.href = "/";
    }
  };

  const handleMenuClick = (menuId) => {
    setActivePage(menuId);
    if (isMobile) setDrawerOpen(false);
  };

  // resize behavior
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // close drawer on outside click / ESC
  useEffect(() => {
    if (!drawerOpen) return;

    const onKey = (e) => e.key === "Escape" && setDrawerOpen(false);
    const onClickOutside = (e) => {
      if (!sidebarRef.current) return;
      if (!sidebarRef.current.contains(e.target)) setDrawerOpen(false);
    };

    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOutside);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [drawerOpen]);

  const visible = !isMobile || drawerOpen;
  const showLabels = !isCollapsed || isMobile;

  return (
    <div className="ts-layout">
      {/* Mobile topbar */}
      {isMobile && (
        <header className="ts-topbar">
          <button
            type="button"
            className="ts-iconbtn"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ts-topbar-title">TEACHER PORTAL</div>
          <div className="ts-topbar-spacer" />
        </header>
      )}

      {/* Mobile overlay */}
      {isMobile && drawerOpen && (
        <div className="ts-backdrop" onClick={() => setDrawerOpen(false)} />
      )}

      <aside
        ref={sidebarRef}
        className={[
          "ts-sidebar",
          visible ? "ts-visible" : "ts-hidden",
          !isMobile && isCollapsed ? "ts-collapsed" : "",
          isMobile ? "ts-mobile" : "ts-desktop",
        ].join(" ")}
      >
        {/* Fixed top section */}
        <div className="ts-top-section">
          {/* User card */}
          {user && showLabels && (
            <div className="ts-usercard">
              <div className="ts-avatar">{getInitials(displayName)}</div>
              <div className="ts-usermeta">
                <div className="ts-userrow">
                  <div className="ts-username">Teacher Portal</div>
                </div>
                <div className="ts-usersub">
                  <div className="ts-role">{roleLabel(user?.role)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed user avatar */}
          {user && isCollapsed && !isMobile && (
            <div className="ts-usercard-collapsed">
              <div className="ts-avatar">{getInitials(displayName)}</div>
            </div>
          )}

          {/* Fallback when no user */}
          {!user && showLabels && (
            <div className="ts-usercard">
              <div className="ts-avatar">U</div>
              <div className="ts-usermeta">
                <div className="ts-userrow">
                  <div className="ts-username">Teacher Portal</div>
                </div>
                <div className="ts-usersub">
                  <div className="ts-role">Faculty Member</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="ts-nav">
          {menuSections.map((section, sIdx) => (
            <div key={section.label} className="ts-section">
              {showLabels && (
                <div className="ts-section-label">{section.label}</div>
              )}
              {!showLabels && sIdx > 0 && <div className="ts-section-dot" />}

              {section.items.map((item) => {
                const isActive = item.id === activePage;

                return (
                  <div key={item.id} className="ts-navblock">
                    <button
                      type="button"
                      className={`ts-item ${isActive ? "active" : ""}`}
                      onClick={() => handleMenuClick(item.id)}
                      title={isCollapsed && !isMobile ? item.label : undefined}
                    >
                      <item.icon size={20} className="ts-ico" />
                      {showLabels && (
                        <span className="ts-label">{item.label}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout pinned at bottom */}
        <div className="ts-bottom">
          <button type="button" className="ts-item ts-logout" onClick={handleLogout}>
            <LogOut size={20} className="ts-ico" />
            {showLabels && <span className="ts-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className={`ts-content ${isCollapsed && !isMobile ? "ts-content-collapsed" : ""}`}>
        {active.component}
      </main>
    </div>
  );
}

export default Sidebar;
