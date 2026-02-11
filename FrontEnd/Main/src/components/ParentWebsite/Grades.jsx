import React, { useState, useEffect } from "react";
import "../ParentWebsiteCSS/Grades.css";
import { apiFetch } from "../api/apiFetch";

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch("/api/grades/my-grades/");
        if (res.ok) {
          setGrades(await res.json());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // compute GWA from all subjects' final grades
  const validFinals = grades.filter((g) => g.final_grade !== null);
  const gwa = validFinals.length
    ? (validFinals.reduce((s, g) => s + g.final_grade, 0) / validFinals.length).toFixed(2)
    : null;

  return (
    <div className="grades-content">
      <header className="grades-header">
        <div className="header-title-area">
          <h2 className="title-text">Academic Grades</h2>
          {gwa && (
            <div className="gwa-chip">
              GWA: <strong>{gwa}</strong>
            </div>
          )}
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="btn-action btn-print"
            onClick={() => window.print()}
          >
            🖨️ Print Report
          </button>
        </div>
      </header>

      {/* ── Report Card ── */}
      <section className="grades-section">
        <div className="section-header blue-header">
          <h5 className="mb-0 fw-bold">
            📋 Report Card — Current School Year
          </h5>
        </div>

        {loading ? (
          <div className="grades-loading">Loading grades…</div>
        ) : grades.length === 0 ? (
          <div className="grades-loading">No grades available yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="grades-table">
              <thead>
                <tr>
                  <th className="text-start ps-4">Subject</th>
                  <th>1st</th>
                  <th>2nd</th>
                  <th>3rd</th>
                  <th>4th</th>
                  <th>Final</th>
                  <th>Remark</th>
                </tr>
              </thead>
              <tbody>
                {grades.map((subj, idx) => {
                  const q = (val) =>
                    val !== null ? (
                      <span className="fw-bold">{val.toFixed(1)}</span>
                    ) : (
                      <span className="text-muted">—</span>
                    );

                  return (
                    <tr key={idx}>
                      <td data-label="Subject" className="text-start-md fw-bold text-main">
                        <div className="subj-name">{subj.subject_name}</div>
                        <div className="subj-code">{subj.subject_code}</div>
                      </td>
                      <td data-label="1st Quarter">{q(subj.q1)}</td>
                      <td data-label="2nd Quarter">{q(subj.q2)}</td>
                      <td data-label="3rd Quarter">{q(subj.q3)}</td>
                      <td data-label="4th Quarter">{q(subj.q4)}</td>
                      <td data-label="Final Grade">
                        {subj.final_grade !== null ? (
                          <span className={`grade-final ${subj.final_grade >= 75 ? "grade-pass" : "grade-fail"}`}>
                            {subj.final_grade.toFixed(1)}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td data-label="Remark">
                        {subj.remarks ? (
                          <span className={`status-pill ${subj.remarks.toLowerCase()}`}>
                            {subj.remarks}
                          </span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};

export default Grades;
