import React, { useState } from "react";
import { Bell, Mail, MessageSquare, CheckCircle, Clock, Send } from "lucide-react";
import "../AdminWebsiteCSS/TransactionHistory.css";

const PaymentReminders = () => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const reminders = [
    {
      id: 1,
      student: "Miguel Torres",
      grade: "Grade 4",
      balance: 20000,
      dueDate: "2026-01-20",
      status: "pending"
    },
    {
      id: 2,
      student: "Elena Rodriguez",
      grade: "Grade 2",
      balance: 14500,
      dueDate: "2026-01-18",
      status: "reminded"
    },
    {
      id: 3,
      student: "Luis Fernandez",
      grade: "Kindergarten",
      balance: 12000,
      dueDate: "2026-01-16",
      status: "pending"
    },
    {
      id: 4,
      student: "Mark Johnson",
      grade: "Grade 6",
      balance: 16500,
      dueDate: "2026-01-22",
      status: "pending"
    },
    {
      id: 5,
      student: "Maria Garcia",
      grade: "Grade 1",
      balance: 14000,
      dueDate: "2026-01-19",
      status: "reminded"
    }
  ];

  const sendReminder = (student) => {
    alert(`Reminder sent to ${student} via SMS, Email, and Notification`);
  };

  return (
    <main className="transaction-history-main">
      {/* HEADER */}
      <section className="th-section">
        <h2 className="th-section-title">Payment Reminders</h2>
        <p className="th-section-subtitle">
          Manage overdue and upcoming payments with quick reminders
        </p>
      </section>
       {/* FLOATING QUICK ACTION */}
      <button
        className="floating-sms-button th-btn-primary justify-center"
        title="Send Bulk Reminders"
        onClick={() => alert("Bulk reminders sent via SMS & Email")}
      >
        <Bell />
      </button>

      {/* TABLE */}
      <section className="th-section">
        <div className="th-table-container">
          <table className="th-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Grade</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reminders.map((r) => (
                <tr
                  key={r.id}
                  className={hoveredRow === r.id ? "th-row-hover" : ""}
                  onMouseEnter={() => setHoveredRow(r.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <td className="th-student-name-cell">{r.student}</td>
                  <td>{r.grade}</td>
                  <td className="th-amount-cell">₱{r.balance.toLocaleString()}</td>
                  <td>{r.dueDate}</td>
                  <td>
                    <span className={`th-status-badge th-status-${r.status}`}>
                      {r.status === "pending" ? "Pending" : "Reminded"}
                    </span>
                  </td>
                  <td>
                    <button
                      className="th-btn-primary"
                      onClick={() => sendReminder(r.student)}
                    >
                      <Send size={16} /> Send
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

     
    </main>
  );
};

export default PaymentReminders;
