import React, { useState } from "react";
import "../ParentWebsiteCSS/Grades.css";

const Grades = () => {
  const [view, setView] = useState("current");

  const currentGrades = [
    { code: "ENG101", desc: "English", q1: "88", q2: "90", q3: "", q4: "", remark: "PASSED" },
    { code: "MAT101", desc: "Mathematics", q1: "85", q2: "87", q3: "", q4: "", remark: "PASSED" },
    { code: "AP101", desc: "Araling Panlipunan", q1: "92", q2: "91", q3: "", q4: "", remark: "PASSED" },
    { code: "FIL101", desc: "Filipino", q1: "89", q2: "88", q3: "", q4: "", remark: "PASSED" },
    { code: "SCI101", desc: "Science", q1: "84", q2: "86", q3: "", q4: "", remark: "PASSED" },
    { code: "TLE101", desc: "TLE", q1: "95", q2: "93", q3: "", q4: "", remark: "PASSED" },
  ];

  const historyData = [
    { sy: "2025-2026", level: "Grade 6", gwa: "0.00", status: "In Progress" },
    { sy: "2024-2025", level: "Grade 5", gwa: "89.50", status: "Completed" },
    { sy: "2023-2024", level: "Grade 4", gwa: "89.50", status: "Completed" },
    { sy: "2022-2023", level: "Grade 3", gwa: "88.25", status: "Completed" },
    { sy: "2021-2022", level: "Grade 2", gwa: "85.25", status: "Completed" },
    { sy: "2020-2021", level: "Grade 1", gwa: "75", status: "Completed" },
  ];

  return (
    <div className="grades-content">
      <header className="grades-header">
        <div className="header-title-area">
          <h2 className="title-text">Academic Grades</h2>

          <div className="view-toggle">
            <button
              type="button"
              className={`toggle-btn ${view === "current" ? "active" : ""}`}
              onClick={() => setView("current")}
            >
              Current
            </button>

            <button
              type="button"
              className={`toggle-btn ${view === "history" ? "active" : ""}`}
              onClick={() => setView("history")}
            >
              History
            </button>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-action btn-print"
            onClick={() => window.print()}
          >
            <i className="bi bi-printer-fill me-2"></i>Print Report
          </button>
        </div>
      </header>

      <section className="grades-section">
        <div className={`section-header ${view === "current" ? "blue-header" : "dark-header"}`}>
          <h5 className="mb-0 fw-bold">
            <i
              className={`bi ${view === "current" ? "bi-journal-check" : "bi-clock-history"} me-2`}
            ></i>
            {view === "current"
              ? "S.Y. 2025-2026 | Grade 6"
              : "Academic Grade History"}
          </h5>
        </div>

        <div className="table-responsive">
          <table className="grades-table">
            <thead>
              {view === "current" ? (
                <tr>
                  <th className="text-start ps-4">Subject Description</th>
                  <th>1st</th>
                  <th>2nd</th>
                  <th>3rd</th>
                  <th>4th</th>
                  <th>Remark</th>
                </tr>
              ) : (
                <tr>
                  <th>School Year</th>
                  <th>Level</th>
                  <th>GWA</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              )}
            </thead>

            <tbody>
              {view === "current"
                ? currentGrades.map((item, index) => (
                    <tr key={index}>
                      <td data-label="Subject" className="text-start-md fw-bold text-main">
                        {item.desc}
                      </td>
                      <td data-label="1st Quarter" className="fw-bold">{item.q1}</td>
                      <td data-label="2nd Quarter" className="fw-bold">{item.q2}</td>
                      <td data-label="3rd Quarter" className="text-muted">{item.q3 || "-"}</td>
                      <td data-label="4th Quarter" className="text-muted">{item.q4 || "-"}</td>
                      <td data-label="Remark">
                        <span className={`status-pill ${item.remark.toLowerCase()}`}>
                          {item.remark}
                        </span>
                      </td>
                    </tr>
                  ))
                : historyData.map((row, idx) => (
                    <tr key={idx}>
                      <td data-label="S.Y." className="fw-bold text-main">{row.sy}</td>
                      <td data-label="Level">{row.level}</td>
                      <td data-label="GWA" className="text-blue fw-bold">{row.gwa}</td>
                      <td data-label="Status">
                        <span
                          className={`status-pill ${row.status.replace(/\s+/g, "-").toLowerCase()}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td data-label="Action">
                        <button type="button" className="btn-details">
                          <i className="bi bi-eye-fill"></i> View
                        </button>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Grades;
