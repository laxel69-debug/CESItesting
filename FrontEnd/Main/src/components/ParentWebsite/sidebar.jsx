import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BookText,
  GraduationCap,
  CalendarDays,
  CalendarCheck,
  MessageCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import "../ParentWebsiteCSS/sidebar.css";
import { useAuth } from "../Auth/useAuth";
import { apiFetch } from "../api/apiFetch";

const API_BASE = "";

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
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const sidebarRef = useRef(null);

  const menuSections = useMemo(
    () => [
      {
        label: "OVERVIEW",
        items: [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        ],
      },
      {
        label: "ACADEMICS",
        items: [
          { id: "profile", label: "Student Info", icon: User },
          { id: "grades", label: "Grades", icon: GraduationCap },
          { id: "schedule", label: "Schedule", icon: CalendarDays },
          { id: "attendance", label: "Attendance", icon: CalendarCheck },
        ],
      },
      {
        label: "FINANCE",
        items: [
          { id: "ledgers", label: "Ledger", icon: BookText },
        ],
      },
      {
        label: "COMMUNICATION",
        items: [
          { id: "messages", label: "Messages", icon: MessageCircle },
        ],
      },
    ],
    []
  );

  const displayName =
    user?.full_name || user?.name || user?.username || user?.email || "User";

  // resize behavior
  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setDrawerOpen(false);
      if (mobile) setIsCollapsed(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setIsCollapsed]);

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

  const handleMenuClick = (menuId) => {
    setPage(menuId);
    if (isMobile) setDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      await apiFetch(`${API_BASE}/api/accounts/logout/`, {
        method: "POST",
      });
    } catch {;}

    logout();
    window.location.href = "/";
  };

  const visible = !isMobile || drawerOpen;
  const showLabels = !isCollapsed || isMobile;

  return (
    <>
      {/* Mobile topbar */}
      {isMobile && (
        <header className="ps-topbar">
          <button
            type="button"
            className="ps-iconbtn"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="ps-topbar-title">STUDENT PORTAL</div>
          <div className="ps-topbar-spacer" />
        </header>
      )}

      {/* Mobile overlay */}
      {isMobile && drawerOpen && (
        <div className="ps-backdrop" onClick={() => setDrawerOpen(false)} />
      )}

      <aside
        ref={sidebarRef}
        className={[
          "ps-sidebar",
          visible ? "ps-visible" : "ps-hidden",
          !isMobile && isCollapsed ? "ps-collapsed" : "",
          isMobile ? "ps-mobile" : "ps-desktop",
        ].join(" ")}
      >
        {/* Fixed top section */}
        <div className="ps-top-section">
          {/* User card */}
          {user && showLabels && (
            <div className="ps-usercard">
              <div className="ps-avatar">{getInitials(displayName)}</div>
              <div className="ps-usermeta">
                <div className="ps-userrow">
                  <div className="ps-username">Student Portal</div>
                </div>
                <div className="ps-usersub">
                  <div className="ps-role">{roleLabel(user?.role)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed user avatar */}
          {user && isCollapsed && !isMobile && (
            <div className="ps-usercard-collapsed">
              <div className="ps-avatar">{getInitials(displayName)}</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="ps-nav">
          {menuSections.map((section, sIdx) => (
            <div key={section.label} className="ps-section">
              {showLabels && (
                <div className="ps-section-label">{section.label}</div>
              )}
              {!showLabels && sIdx > 0 && <div className="ps-section-dot" />}

              {section.items.map((item) => {
                const active = item.id === page;

                return (
                  <div key={item.id} className="ps-navblock">
                    <button
                      type="button"
                      className={`ps-item ${active ? "active" : ""}`}
                      onClick={() => handleMenuClick(item.id)}
                      title={isCollapsed && !isMobile ? item.label : undefined}
                    >
                      <item.icon size={20} className="ps-ico" />
                      {showLabels && (
                        <span className="ps-label">{item.label}</span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout pinned at bottom */}
        <div className="ps-bottom">
          <button type="button" className="ps-item ps-logout" onClick={handleLogout}>
            <LogOut size={20} className="ps-ico" />
            {showLabels && <span className="ps-label">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
