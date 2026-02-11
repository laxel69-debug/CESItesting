import React, { useEffect, useMemo, useState } from "react";
import Sidebar from "./Sidebar";

import Dashboard from "./Dashboard";
import Profile from "./Profile";
import Ledgers from "./Ledgers";
import Grades from "./Grades";
import Schedule from "./Schedule";
import Attendance from "./Attendance";
import Messages from "./Messages";

export default function Profmain() {
  const [page, setPage] = useState(() => localStorage.getItem("parent_page") || "dashboard");
  useEffect(() => localStorage.setItem("parent_page", page), [page]);

  const [isCollapsed, setIsCollapsed] = useState(false);

  // ✅ mobile detection so main margin-left is correct when sidebar is hidden
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const CurrentPage = useMemo(() => {
    switch (page) {
      case "dashboard": return <Dashboard />;
      case "profile": return <Profile />;
      case "ledgers": return <Ledgers />;
      case "grades": return <Grades />;
      case "schedule": return <Schedule />;
      case "attendance": return <Attendance />;
      case "messages": return <Messages />;
      default: return <Dashboard />;
    }
  }, [page]);

  const sidebarWidth = isMobile ? 0 : (isCollapsed ? 80 : 240);

  return (
    <div>
      <Sidebar
        page={page}
        setPage={setPage}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <main className={`p-3 parent-main ${isCollapsed ? "collapsed" : ""}`}>
        {CurrentPage}
      </main>
    </div>
  );
}
