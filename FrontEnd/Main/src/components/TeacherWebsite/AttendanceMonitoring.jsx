import React, { useState, useEffect, useMemo, useCallback } from "react";
import "../TeacherWebsiteCSS/AttendanceMonitoring.css";
import { getToken } from "../Auth/auth";

const API_BASE = "http://127.0.0.1:8000/api";

const AttendanceMonitoring = () => {
  // Core state
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({}); // { [studentId]: { status, notes } }
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // History view state
  const [activeTab, setActiveTab] = useState("today"); // "today" or "history"
  const [history, setHistory] = useState([]);
  
  // Edit modal state
  const [editModal, setEditModal] = useState(null); // date string or null
  const [editAttendance, setEditAttendance] = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const token = getToken();

  // Fetch sections the teacher teaches
  useEffect(() => {
    if (!token) return;
    const fetchSections = async () => {
      try {
        const res = await fetch(`${API_BASE}/attendance/my-sections/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) throw new Error("Failed to fetch sections");
        const data = await res.json();
        setSections(data);
        if (data.length > 0 && !selectedSection) {
          setSelectedSection(data[0].id);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSections();
  }, [token]);

  // Fetch students when section changes
  useEffect(() => {
    if (!selectedSection || !token) return;
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/attendance/records/section_students/?section=${selectedSection}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch students");
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, [selectedSection, token]);

  // Fetch existing attendance for selected date and section
  useEffect(() => {
    if (!selectedSection || !selectedDate || !token) return;
    const fetchAttendance = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/attendance/records/?section=${selectedSection}&date=${selectedDate}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch attendance");
        const data = await res.json();
        // Map to { [studentId]: { status, notes, id } }
        const attMap = {};
        data.forEach((rec) => {
          attMap[rec.student] = { status: rec.status, notes: rec.notes || "", id: rec.id };
        });
        setAttendance(attMap);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchAttendance();
  }, [selectedSection, selectedDate, token]);

  // Fetch history for the section
  const fetchHistory = useCallback(async () => {
    if (!selectedSection || !token) return;
    try {
      const res = await fetch(
        `${API_BASE}/attendance/records/history/?section=${selectedSection}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch history");
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      setError(err.message);
    }
  }, [selectedSection, token]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // Update local attendance status
  const updateStatus = (studentId, newStatus) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status: newStatus, notes: prev[studentId]?.notes || "" },
    }));
  };

  // Save attendance
  const saveAttendance = async () => {
    if (!selectedSection || !selectedDate) return;
    setSaving(true);
    setError(null);
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: attendance[s.id]?.status || "PRESENT",
        notes: attendance[s.id]?.notes || "",
      }));
      const res = await fetch(`${API_BASE}/attendance/records/bulk_upsert/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: selectedSection,
          date: selectedDate,
          records,
        }),
      });
      if (!res.ok) throw new Error("Failed to save attendance");
      const result = await res.json();
      alert(`Attendance saved! ${result.created} created, ${result.updated} updated.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Open edit modal for a historical date
  const openEditModal = async (histDate) => {
    setEditModal(histDate);
    // Fetch attendance for that date
    try {
      const res = await fetch(
        `${API_BASE}/attendance/records/?section=${selectedSection}&date=${histDate}`,
        { headers: { Authorization: `Token ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to fetch attendance");
      const data = await res.json();
      const attMap = {};
      data.forEach((rec) => {
        attMap[rec.student] = { status: rec.status, notes: rec.notes || "", id: rec.id };
      });
      setEditAttendance(attMap);
    } catch (err) {
      setError(err.message);
    }
  };

  // Update status in edit modal
  const updateEditStatus = (studentId, newStatus) => {
    setEditAttendance((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status: newStatus, notes: prev[studentId]?.notes || "" },
    }));
  };

  // Save edited attendance
  const saveEditAttendance = async () => {
    if (!selectedSection || !editModal) return;
    setEditSaving(true);
    setError(null);
    try {
      const records = students.map((s) => ({
        student_id: s.id,
        status: editAttendance[s.id]?.status || "PRESENT",
        notes: editAttendance[s.id]?.notes || "",
      }));
      const res = await fetch(`${API_BASE}/attendance/records/bulk_upsert/`, {
        method: "POST",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          section: selectedSection,
          date: editModal,
          records,
        }),
      });
      if (!res.ok) throw new Error("Failed to save attendance");
      const result = await res.json();
      alert(`Attendance updated! ${result.created} created, ${result.updated} updated.`);
      setEditModal(null);
      fetchHistory(); // Refresh history
    } catch (err) {
      setError(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  // Edit modal counts
  const editCounts = useMemo(() => {
    const c = { P: 0, A: 0, L: 0, E: 0 };
    students.forEach((s) => {
      const st = editAttendance[s.id]?.status || "PRESENT";
      if (st === "PRESENT") c.P++;
      else if (st === "ABSENT") c.A++;
      else if (st === "LATE") c.L++;
      else if (st === "EXCUSED") c.E++;
    });
    return c;
  }, [students, editAttendance]);

  // Counts
  const counts = useMemo(() => {
    const c = { P: 0, A: 0, L: 0, E: 0 };
    students.forEach((s) => {
      const st = attendance[s.id]?.status || "PRESENT";
      if (st === "PRESENT") c.P++;
      else if (st === "ABSENT") c.A++;
      else if (st === "LATE") c.L++;
      else if (st === "EXCUSED") c.E++;
    });
    return c;
  }, [students, attendance]);

  const selectedSectionName = sections.find((s) => s.id === selectedSection)?.name || "";

  return (
    <div className="am">
      {/* Tabs */}
      <div className="am__tabs">
        <button
          className={`am__tab ${activeTab === "today" ? "am__tab--active" : ""}`}
          onClick={() => setActiveTab("today")}
        >
          Today's Attendance
        </button>
        <button
          className={`am__tab ${activeTab === "history" ? "am__tab--active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          Attendance History
        </button>
      </div>

      {error && <div className="am__error">{error}</div>}

      {activeTab === "today" && (
        <>
          {/* Header */}
          <header className="am__header">
            <div className="am__headerLeft">
              <h2 className="am__title">Attendance Monitoring</h2>
              <p className="am__date">{selectedSectionName}</p>
            </div>

            <div className="am__headerRight">
              <input
                type="date"
                className="am__dateInput"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />

              <select
                className="am__select"
                value={selectedSection || ""}
                onChange={(e) => setSelectedSection(Number(e.target.value))}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.grade_level} - {s.name}
                  </option>
                ))}
              </select>

              <button
                className="am__saveBtn"
                type="button"
                onClick={saveAttendance}
                disabled={saving || students.length === 0}
              >
                <span className="am__saveIcon" aria-hidden="true">💾</span>
                {saving ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          </header>

          {/* Stats */}
          <section className="am__stats">
            <div className="stat stat--present">
              <div className="stat__label">PRESENT</div>
              <div className="stat__value stat__value--success">{counts.P}</div>
            </div>
            <div className="stat stat--absent">
              <div className="stat__label">ABSENT</div>
              <div className="stat__value stat__value--danger">{counts.A}</div>
            </div>
            <div className="stat stat--late">
              <div className="stat__label">LATE</div>
              <div className="stat__value stat__value--warn">{counts.L}</div>
            </div>
            <div className="stat stat--excused">
              <div className="stat__label">EXCUSED</div>
              <div className="stat__value stat__value--info">{counts.E}</div>
            </div>
          </section>

          {/* Table */}
          <section className="am__card">
            {loading ? (
              <div className="am__loading">Loading students...</div>
            ) : (
              <div className="am__tableWrap">
                <table className="am__table">
                  <thead>
                    <tr>
                      <th className="am__th am__th--left">Student Name</th>
                      <th className="am__th">Status</th>
                      <th className="am__th">Action Toggle</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => {
                      const st = attendance[student.id]?.status || "PRESENT";
                      return (
                        <tr className="am__tr" key={student.id}>
                          <td className="am__td am__td--left">
                            <div className="am__name">{student.name}</div>
                            <div className="am__id">{student.username}</div>
                          </td>
                          <td className="am__td">
                            <span
                              className={[
                                "am__badge",
                                st === "PRESENT" && "am__badge--present",
                                st === "ABSENT" && "am__badge--absent",
                                st === "LATE" && "am__badge--late",
                                st === "EXCUSED" && "am__badge--excused",
                              ]
                                .filter(Boolean)
                                .join(" ")}
                            >
                              {st}
                            </span>
                          </td>
                          <td className="am__td">
                            <div className="am__toggle">
                              <button
                                type="button"
                                onClick={() => updateStatus(student.id, "PRESENT")}
                                className={`am__toggleBtn ${st === "PRESENT" ? "am__toggleBtn--present" : "am__toggleBtn--idle"}`}
                                title="Present"
                              >
                                P
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStatus(student.id, "ABSENT")}
                                className={`am__toggleBtn ${st === "ABSENT" ? "am__toggleBtn--absent" : "am__toggleBtn--idle"}`}
                                title="Absent"
                              >
                                A
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStatus(student.id, "LATE")}
                                className={`am__toggleBtn ${st === "LATE" ? "am__toggleBtn--late" : "am__toggleBtn--idle"}`}
                                title="Late"
                              >
                                L
                              </button>
                              <button
                                type="button"
                                onClick={() => updateStatus(student.id, "EXCUSED")}
                                className={`am__toggleBtn ${st === "EXCUSED" ? "am__toggleBtn--excused" : "am__toggleBtn--idle"}`}
                                title="Excused"
                              >
                                E
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr>
                        <td className="am__td" colSpan={3}>
                          {sections.length === 0
                            ? "You don't have any assigned sections."
                            : "No students enrolled in this section."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}

      {activeTab === "history" && (
        <>
          <header className="am__header">
            <div className="am__headerLeft">
              <h2 className="am__title">Attendance History</h2>
              <p className="am__date">Click a date to view/edit that day's attendance</p>
            </div>
            <div className="am__headerRight">
              <select
                className="am__select"
                value={selectedSection || ""}
                onChange={(e) => setSelectedSection(Number(e.target.value))}
              >
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.grade_level} - {s.name}
                  </option>
                ))}
              </select>
            </div>
          </header>

          <section className="am__card">
            <div className="am__tableWrap">
              <table className="am__table">
                <thead>
                  <tr>
                    <th className="am__th">Date</th>
                    <th className="am__th">Present</th>
                    <th className="am__th">Absent</th>
                    <th className="am__th">Late</th>
                    <th className="am__th">Excused</th>
                    <th className="am__th">Total</th>
                    <th className="am__th">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr className="am__tr" key={h.date}>
                      <td className="am__td">{h.date}</td>
                      <td className="am__td">
                        <span className="am__badge am__badge--present">{h.present}</span>
                      </td>
                      <td className="am__td">
                        <span className="am__badge am__badge--absent">{h.absent}</span>
                      </td>
                      <td className="am__td">
                        <span className="am__badge am__badge--late">{h.late}</span>
                      </td>
                      <td className="am__td">
                        <span className="am__badge am__badge--excused">{h.excused}</span>
                      </td>
                      <td className="am__td">{h.total}</td>
                      <td className="am__td">
                        <button
                          className="am__editBtn"
                          onClick={() => openEditModal(h.date)}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td className="am__td" colSpan={7}>
                        No attendance records found for this section.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {/* Edit History Modal */}
      {editModal && (
        <div className="am__overlay" onClick={() => setEditModal(null)}>
          <div className="am__modal" onClick={(e) => e.stopPropagation()}>
            <div className="am__modalHeader">
              <h3>Edit Attendance - {editModal}</h3>
              <button className="am__modalClose" onClick={() => setEditModal(null)}>✕</button>
            </div>

            <div className="am__modalStats">
              <span className="am__modalStat am__modalStat--present">P: {editCounts.P}</span>
              <span className="am__modalStat am__modalStat--absent">A: {editCounts.A}</span>
              <span className="am__modalStat am__modalStat--late">L: {editCounts.L}</span>
              <span className="am__modalStat am__modalStat--excused">E: {editCounts.E}</span>
            </div>

            <div className="am__modalBody">
              <table className="am__table am__table--modal">
                <thead>
                  <tr>
                    <th className="am__th am__th--left">Student</th>
                    <th className="am__th">Status</th>
                    <th className="am__th">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const st = editAttendance[student.id]?.status || "PRESENT";
                    return (
                      <tr className="am__tr" key={student.id}>
                        <td className="am__td am__td--left">
                          <div className="am__name">{student.name}</div>
                        </td>
                        <td className="am__td">
                          <span
                            className={[
                              "am__badge",
                              st === "PRESENT" && "am__badge--present",
                              st === "ABSENT" && "am__badge--absent",
                              st === "LATE" && "am__badge--late",
                              st === "EXCUSED" && "am__badge--excused",
                            ].filter(Boolean).join(" ")}
                          >
                            {st}
                          </span>
                        </td>
                        <td className="am__td">
                          <div className="am__toggle">
                            <button
                              type="button"
                              onClick={() => updateEditStatus(student.id, "PRESENT")}
                              className={`am__toggleBtn ${st === "PRESENT" ? "am__toggleBtn--present" : "am__toggleBtn--idle"}`}
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEditStatus(student.id, "ABSENT")}
                              className={`am__toggleBtn ${st === "ABSENT" ? "am__toggleBtn--absent" : "am__toggleBtn--idle"}`}
                            >
                              A
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEditStatus(student.id, "LATE")}
                              className={`am__toggleBtn ${st === "LATE" ? "am__toggleBtn--late" : "am__toggleBtn--idle"}`}
                            >
                              L
                            </button>
                            <button
                              type="button"
                              onClick={() => updateEditStatus(student.id, "EXCUSED")}
                              className={`am__toggleBtn ${st === "EXCUSED" ? "am__toggleBtn--excused" : "am__toggleBtn--idle"}`}
                            >
                              E
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="am__modalFooter">
              <button className="am__cancelBtn" onClick={() => setEditModal(null)}>Cancel</button>
              <button
                className="am__saveBtn"
                onClick={saveEditAttendance}
                disabled={editSaving}
              >
                {editSaving ? "Saving..." : "💾 Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceMonitoring;

