import React, { useEffect, useState } from "react";
import "../ParentWebsiteCSS/sidebar.css";

const navLinks = [
  { key: "dashboard", icon: "bi-speedometer2", label: "Dashboard" },
  { key: "profile", icon: "bi-person", label: "Student Info" },
  { key: "ledgers", icon: "bi-journal-text", label: "Ledger" },
  { key: "grades", icon: "bi-wallet2", label: "Grades" },
  { key: "schedule", icon: "bi-calendar-event", label: "Schedule" },
  { key: "attendance", icon: "bi-calendar-check", label: "Attendance" },
  { key: "messages", icon: "bi-chat-dots", label: "Messages" },
];

export default function Sidebar({ page, setPage, isCollapsed, setIsCollapsed }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const handleNavigate = (key) => {
    setPage(key);
    if (isMobile) setDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <header className="ps-topbar d-md-none">
        <button className="ps-iconbtn" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
          <i className="bi bi-list"></i>
        </button>
        <div className="ps-topbar-title">STUDENT PORTAL</div>
        <div className="ps-topbar-spacer" />
      </header>

      {/* Mobile Drawer */}
      {isMobile && drawerOpen && (
        <>
          <div className="ps-backdrop" onClick={() => setDrawerOpen(false)} />
          <aside className="ps-drawer">
            <div className="ps-drawer-head">
              <span className="ps-drawer-title">Menu</span>
              <button className="ps-iconbtn" onClick={() => setDrawerOpen(false)} aria-label="Close menu">
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
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
          </aside>
        </>
      )}

      {/* Desktop Sidebar */}
      <aside className={`ps-sidebar d-none d-md-flex ${isCollapsed ? "collapsed" : ""}`}>
        <div className="ps-sidebar-head">
          <div className="ps-avatar">JD</div>
          {!isCollapsed && <div className="ps-name">JHON DOE</div>}

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
          <button type="button" className="ps-logout" title={isCollapsed ? "Log out" : undefined}>
            <i className="bi bi-box-arrow-right" />
            {!isCollapsed && <span>Log out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
