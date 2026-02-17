import React, { useState, useEffect } from "react";
import { apiFetch } from "../api/apiFetch";
import "../ParentWebsiteCSS/Schedule.css";

const DAY_MAP = { MON: "Mon", TUE: "Tue", WED: "Wed", THU: "Thu", FRI: "Fri" };
const COLORS = ["cat-blue", "cat-yellow", "cat-blue", "cat-yellow", "cat-blue", "cat-yellow"];

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? "PM" : "AM";
  const d = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${String(d).padStart(2, "0")}:${m} ${ampm}`;
};

const Schedule = () => {
  const [view, setView] = useState("calendar");
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await apiFetch("/api/classmanagement/schedules/my/");
        if (r.ok) {
          const raw = await r.json();
          setScheduleData(
            raw.map((s, i) => ({
              id: s.id,
              subject: s.subject_name || "N/A",
              section: s.section_name || "N/A",
              teacher: s.teacher_name || "N/A",
              day_of_week: s.day_of_week,
              days: [DAY_MAP[s.day_of_week] || s.day_of_week],
              time: `${fmt12(s.start_time)} - ${fmt12(s.end_time)}`,
              room: s.room || "—",
              color: COLORS[i % COLORS.length],
            }))
          );
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM"];

  if (loading) return <div className="schedule-content"><div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading schedule…</div></div>;

  return (
    <div className="schedule-content">
      <header className="schedule-header">
        <div className="header-title-area">
          <h2 className="title-text">Weekly Schedule</h2>
          <span className="sy-badge">S.Y. 2025–2026</span>
        </div>
        <div className="view-toggle">
          <button type="button" className={`toggle-btn ${view === "calendar" ? "active" : ""}`} onClick={() => setView("calendar")}>Calendar</button>
          <button type="button" className={`toggle-btn ${view === "table" ? "active" : ""}`} onClick={() => setView("table")}>List View</button>
        </div>
      </header>

      <div className="schedule-card-container">
        {view === "table" ? (
          <div className="table-responsive">
            <table className="schedule-table">
              <thead><tr><th>Subject</th><th>Section</th><th>Day</th><th>Time</th><th>Room</th><th>Teacher</th></tr></thead>
              <tbody>
                {scheduleData.length === 0 && <tr><td colSpan="6" style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>No schedule entries.</td></tr>}
                {scheduleData.map((row) => (
                  <tr key={row.id}>
                    <td className="fw-bold text-blue">{row.subject}</td>
                    <td>{row.section}</td>
                    <td><span className="day-pill">{row.days.join(" / ")}</span></td>
                    <td className="font-monospace fw-bold">{row.time}</td>
                    <td>{row.room}</td>
                    <td className="text-muted">{row.teacher}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="calendar-scroll-area">
            <div className="calendar-grid">
              <div className="time-header">TIME</div>
              {days.map((day) => <div key={day} className="day-header">{day}</div>)}

              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="time-cell">{time}</div>
                  {days.map((day) => {
                    const hour = time.split(":")[0];
                    const period = time.split(" ")[1];
                    const sessions = scheduleData.filter(
                      (item) => item.days.includes(day) && item.time.startsWith(hour) && item.time.includes(period)
                    );
                    return (
                      <div key={`${day}-${time}`} className="grid-cell">
                        {sessions.map((item) => (
                          <div key={item.id} className={`event-card ${item.color}`}>
                            <div className="event-subject">{item.subject}</div>
                            <div className="event-info">{item.room} • {item.teacher}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
