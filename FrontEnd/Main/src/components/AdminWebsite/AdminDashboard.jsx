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

  const pageMeta = {
    dashboard: { title: "Dashboard", subtitle: "Welcome back! Here's what's happening today." },
    enrollment: { title: "Enrollment Management", subtitle: "Manage student enrollments and applications." },
    "transaction-history": { title: "Transaction History", subtitle: "View and track all financial transactions." },
    "payment-reminders": { title: "Payment Reminders", subtitle: "Manage and send payment reminders." },
    "generate-reports": { title: "Reports", subtitle: "Generate and view system reports." },
    users: { title: "User Management", subtitle: "Manage users, roles, and permissions." },
    classes: { title: "Class Management", subtitle: "Manage classes and sections." },
    subjects: { title: "Subjects", subtitle: "Manage subjects and curriculum." },
    "assign-teachers": { title: "Assign Teachers", subtitle: "Assign teachers to classes and subjects." },
    grades: { title: "Grades & Records", subtitle: "View and manage student grades and records." },
    cms: { title: "CMS Module", subtitle: "Manage announcements and content." },
    reports: { title: "Reports", subtitle: "Generate and view system reports." },
    tuition_management: { title: "Tuition Management", subtitle: "Manage tuition fees and payment plans." },
  };

  const currentPage = pageMeta[activeMenu] || pageMeta.dashboard;

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
          title={currentPage.title}
          subtitle={currentPage.subtitle}
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
