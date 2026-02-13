import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Dashboard from "./Dashboard";
import EnrollmentManagement from "./EnrollmentManagement";
import TransactionHistory from "./TransactionHistory";
import PaymentReminders from "./PaymentReminders";
import Reports from "./Reports";
import UserManagement from "./UserManagement";
import ClassManagement from "./ClassManagement";
import Subjects from "./Subjects";
import AssignTeachers from "./AssignTeachers";
import GradesRecords from "./GradesRecords";
import FloatingMessages from "./FloatingMessages";
import CMSModule from "./CMSModule";
import TuitionManagement from "./TuitionManagement";
import "../AdminWebsiteCSS/AdminDashboard.css";

function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleMenuClick = (menuId) => setActiveMenu(menuId);

  const handleToggleSidebar = () => setSidebarCollapsed((v) => !v);

  const renderContent = () => {
    switch (activeMenu) {
      case "dashboard":
        return <Dashboard />;
      case "enrollment":
        return <EnrollmentManagement />;
      case "transaction-history":
        return <TransactionHistory />;
      case "payment-reminders":
        return <PaymentReminders />;
      case "generate-reports":
        return <Reports />;
      case "users":
        return <UserManagement />;
      case "classes":
        return <ClassManagement />;
      case "subjects":
        return <Subjects />;
      case "assign-teachers":
        return <AssignTeachers />;
      case "grades":
        return <GradesRecords />;
      case "cms":
        return <CMSModule />;
      case "reports":
        return <Reports />;
      case "tuition_management":
        return <TuitionManagement />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: "Dashboard",
      enrollment: "Enrollment Management",
      financial: "Financial Management",
      users: "User Management",
      classes: "Classes",
      subjects: "Subjects",
      "assign-teachers": "Assign Teachers",
      grades: "Grades & Records",
      cms: "CMS Module",
      reports: "Reports",
      
      tuition: "Tuition Management",
      notifications: "SMS & Email",
    };
    return titles[activeMenu] || "Dashboard";
  };

  return (
    <div className="admin-app-container">
      <Sidebar
        activeMenu={activeMenu}
        onMenuClick={handleMenuClick}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
      />

      {/* ✅ This is the important change: admin-main drives layout with the sidebar CSS */}
      <main className={`admin-main ${sidebarCollapsed ? "collapsed" : ""}`}>
        <Header
          title={getPageTitle()}
          subtitle="Welcome back! Here's what's happening today."
          onToggleCollapse={handleToggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
        />

        {renderContent()}
      </main>

      <FloatingMessages />
    </div>
  );
}

export default AdminDashboard;
