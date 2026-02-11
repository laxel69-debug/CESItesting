import React from "react";
import "../ParentWebsiteCSS/Attendance.css";

const Attendance = () => {
  const academicJourney = [
    { grade: "Grade 5", year: "2024-2025", rate: "97.3%" },
    { grade: "Grade 4", year: "2023-2024", rate: "94.7%" },
    { grade: "Grade 3", year: "2022-2023", rate: "98.9%" },
    { grade: "Grade 2", year: "2021-2022", rate: "92.1%" },
    { grade: "Grade 1", year: "2020-2021", rate: "95.8%" },
  ];

  return (
    <div className="attendance-content">
      <header className="attendance-header">
        <h2 style={{ fontWeight: 900, color: "#24148a" }}>
          ATTENDANCE MONITORING
        </h2>
        <p>
          S.Y. 2025–2026 | <strong>Grade 6</strong>
        </p>
      </header>

      <section className="stats-grid">
        <div className="stat-card bg-primary">
          <span>Present</span>
          <h2 style={{ margin: 0, fontWeight: 900 }}>42</h2>
        </div>

        <div className="stat-card bg-danger">
          <span>Absent</span>
          <h2 style={{ margin: 0, fontWeight: 900 }}>2</h2>
        </div>

        <div className="stat-card bg-warning">
          <span>Rate</span>
          <h2 style={{ margin: 0, fontWeight: 900 }}>95.4%</h2>
        </div>
      </section>

      <div className="attendance-main-container">
        <div className="container-header">Current Records</div>
        <table className="attendance-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Status</th>
              <th>Time In</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2026-01-13</td>
              <td>
                <span style={{ color: "green", fontWeight: "bold" }}>
                  Present
                </span>
              </td>
              <td>07:45 AM</td>
            </tr>
            <tr>
              <td>2026-01-12</td>
              <td>
                <span style={{ color: "green", fontWeight: "bold" }}>
                  Present
                </span>
              </td>
              <td>07:50 AM</td>
            </tr>
            <tr>
              <td>2026-01-13</td>
              <td>
                <span style={{ color: "red", fontWeight: "bold" }}>Absent</span>
              </td>
              <td>07:45 AM</td>
            </tr>
            <tr>
              <td>2026-01-12</td>
              <td>
                <span style={{ color: "red", fontWeight: "bold" }}>Absent</span>
              </td>
              <td>07:50 AM</td>
            </tr>
            <tr>
              <td>2026-01-13</td>
              <td>
                <span style={{ color: "orange", fontWeight: "bold" }}>Late</span>
              </td>
              <td>07:45 AM</td>
            </tr>
            <tr>
              <td>2026-01-12</td>
              <td>
                <span style={{ color: "orange", fontWeight: "bold" }}>Late</span>
              </td>
              <td>07:50 AM</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="history-section">
        <h3
          style={{
            fontWeight: 900,
            fontSize: "1.2rem",
            marginBottom: "1rem",
          }}
        >
          ACADEMIC HISTORY
        </h3>

        <div className="history-grid">
          {academicJourney.map((item, index) => (
            <div key={index} className="history-card">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span style={{ fontWeight: 900, color: "#24148a" }}>
                  {item.grade}
                </span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    background: "#eef6ff",
                    padding: "2px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {item.rate}
                </span>
              </div>

              <p style={{ fontSize: "0.85rem", color: "#666", margin: "5px 0" }}>
                {item.year}
              </p>

              <button className="view-archive-btn">View Full Report</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Attendance;
