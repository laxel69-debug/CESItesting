import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  UserPlus,
  Wallet,
  UsersRound,
  BookOpen,
  GraduationCap,
  Globe,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X,
  FileBarChart,
} from "lucide-react";
import "../AdminWebsiteCSS/Sidebar.css";
import { useAuth } from "../Auth/useAuth";
import { getToken } from "../Auth/auth";

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
  return role;
}

export default function Sidebar({ activeMenu, onMenuClick, isCollapsed, onToggleCollapse }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const sidebarRef = useRef(null);

  // Full menu definition
  const menuSections = useMemo(
    () => [
      {
        label: "OVERVIEW",
        items: [
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
        ],
      },
      {
        label: "MANAGEMENT",
        items: [
          { id: "users", label: "User Management", icon: UsersRound },
          { id: "enrollment", label: "Enrollment", icon: UserPlus },
          { id: "classes", label: "Class Management", icon: BookOpen },
          { id: "grades", label: "Grades & Records", icon: GraduationCap },
        ],
      },
      {
        label: "FINANCE",
        items: [
          {
            id: "financial",
            label: "Financial",
            icon: Wallet,
            subItems: [
              { id: "tuition_management", label: "Tuition Management" },
              { id: "transaction-history", label: "Transactions" },
              { id: "payment-reminders", label: "Payment Reminders" },
            ],
          },
        ],
      },
      {
        label: "SYSTEM",
        items: [
          { id: "cms", label: "CMS Module", icon: Globe },
          { id: "reports", label: "Reports", icon: FileBarChart },
        ],
      },
    ],
    []
  );

  // flatten for submenu tracking
  const allMenuItems = useMemo(
    () => menuSections.flatMap((s) => s.items),
    [menuSections]
  );

  // keep submenu open if active sub page
  useEffect(() => {
    allMenuItems.forEach((item) => {
      if (!item.subItems) return;
      const isSubActive = item.subItems.some((s) => s.id === activeMenu);
      if (isSubActive) setExpandedMenus((p) => ({ ...p, [item.id]: true }));
    });
  }, [activeMenu, allMenuItems]);

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

  const isMenuItemActive = (item) => {
    if (item.id === activeMenu) return true;
    if (item.subItems) return item.subItems.some((s) => s.id === activeMenu);
    return false;
  };

  const toggleMenu = (menuId) => setExpandedMenus((p) => ({ ...p, [menuId]: !p[menuId] }));

  const handleMenuClick = (menuId, hasSubItems) => {
    if (hasSubItems) {
      toggleMenu(menuId);
      return;
    }
    onMenuClick?.(menuId);
    if (isMobile) setDrawerOpen(false);
  };

  const handleSubMenuClick = (subItemId) => {
    onMenuClick?.(subItemId);
    if (isMobile) setDrawerOpen(false);
  };

  const handleLogout = async () => {
    try {
      const token = getToken();
      await fetch("/api/accounts/logout/", {
        method: "POST",
        credentials: "include",
        headers: {
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
      });
    } catch {;}

    logout();
    // Force full page reload to ensure clean state
    window.location.href = "/";
  };

  const visible = !isMobile || drawerOpen;
  const showLabels = !isCollapsed || isMobile;

  return (
    <>
      {/* Mobile topbar */}
      {isMobile && (
        <header className="as-topbar">
          <button
            type="button"
            className="as-iconbtn"
            onClick={() => setDrawerOpen((v) => !v)}
            aria-label={drawerOpen ? "Close menu" : "Open menu"}
          >
            {drawerOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="as-topbar-title">ADMIN PANEL</div>
          <div className="as-topbar-spacer" />
        </header>
      )}

      {/* mobile overlay */}
      {isMobile && drawerOpen && <div className="as-backdrop" onClick={() => setDrawerOpen(false)} />}

      <aside
        ref={sidebarRef}
        className={[
          "as-sidebar",
          visible ? "as-visible" : "as-hidden",
          !isMobile && isCollapsed ? "as-collapsed" : "",
          isMobile ? "as-mobile" : "as-desktop",
        ].join(" ")}
      >
        {/* Fixed top section */}
        <div className="as-top-section">
          {/* Admin Panel card */}
          {user && showLabels && (
            <div className="as-usercard">
              <div className="as-avatar">{getInitials(user?.full_name || user?.username || user?.email)}</div>
              <div className="as-usermeta">
                <div className="as-userrow">
                  <div className="as-username">Admin Panel</div>
                </div>
                <div className="as-usersub">
                  <div className="as-role">{roleLabel(user?.role)}</div>
                </div>
              </div>
            </div>
          )}

          {/* Collapsed user avatar */}
          {user && isCollapsed && !isMobile && (
            <div className="as-usercard-collapsed">
              <div className="as-avatar">{getInitials(user?.full_name || user?.username || user?.email)}</div>
            </div>
          )}
        </div>

        {/* nav */}
        <nav className="as-nav">
          {menuSections.map((section, sIdx) => (
            <div key={section.label} className="as-section">
              {showLabels && (
                <div className="as-section-label">{section.label}</div>
              )}
              {!showLabels && sIdx > 0 && <div className="as-section-dot" />}

              {section.items.map((item) => {
                const active = isMenuItemActive(item);
                const expanded = !!expandedMenus[item.id];

                return (
                  <div key={item.id} className="as-navblock">
                    <button
                      type="button"
                      className={`as-item ${active ? "active" : ""}`}
                      onClick={() => handleMenuClick(item.id, !!item.subItems)}
                      title={isCollapsed && !isMobile ? item.label : undefined}
                    >
                      <item.icon size={20} className="as-ico" />
                      {showLabels && (
                        <>
                          <span className="as-label">{item.label}</span>
                          {item.subItems &&
                            (expanded ? (
                              <ChevronDown size={16} className="as-chevron" />
                            ) : (
                              <ChevronRight size={16} className="as-chevron" />
                            ))}
                        </>
                      )}
                    </button>

                    {showLabels && item.subItems && expanded && (
                      <div className="as-subnav">
                        {item.subItems.map((sub) => (
                          <button
                            type="button"
                            key={sub.id}
                            className={`as-subitem ${sub.id === activeMenu ? "active" : ""}`}
                            onClick={() => handleSubMenuClick(sub.id)}
                          >
                            <span className="as-subdot" />
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Logout pinned at bottom */}
        <div className="as-bottom">
          <button type="button" className="as-item as-logout" onClick={handleLogout}>
            <LogOut size={20} className="as-ico" />
            {showLabels && <span className="as-label">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
