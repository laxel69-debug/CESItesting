import React, { useState, useEffect } from "react";
import { apiFetch } from "../api/apiFetch";
import "../TeacherWebsiteCSS/TeacherClassSchedule.css";

const DAY_MAP = { MON: "Monday", TUE: "Tuesday", WED: "Wednesday", THU: "Thursday", FRI: "Friday" };
const DAY_SHORT = { MON: "M", TUE: "T", WED: "W", THU: "TH", FRI: "F" };
const COLORS = ["#cfe2ff", "#d1e7dd", "#fff3cd", "#f8d7da", "#e2d9f3", "#d4edda", "#fce4ec", "#e0f7fa"];
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const timeSlots = ["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"];

const fmt12 = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":");
  const hr = parseInt(h, 10);
  const ampm = hr >= 12 ? "PM" : "AM";
  const d = hr > 12 ? hr - 12 : hr === 0 ? 12 : hr;
  return `${String(d).padStart(2, "0")}:${m} ${ampm}`;
};

const TeacherClassSchedule = () => {
  const [viewMode, setViewMode] = useState("table");
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
              day_of_week: s.day_of_week,
              days: [DAY_SHORT[s.day_of_week] || s.day_of_week],
              time: `${fmt12(s.start_time)} - ${fmt12(s.end_time)}`,
              startTime: fmt12(s.start_time),
              room: s.room || "—",
              color: COLORS[i % COLORS.length],
            }))
          );
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const uniqueClasses = [...new Set(scheduleData.map((s) => `${s.subject}-${s.section}`))].length;

  const getClassForSlot = (day, time) => {
    const dayCode = Object.entries(DAY_MAP).find(([, v]) => v === day)?.[0];
    return scheduleData.find((cls) => cls.day_of_week === dayCode && cls.startTime === time);
  };

  if (loading) return <div className="tcs"><div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>Loading schedule…</div></div>;

  return (
    <div className="tcs">
      <header className="tcs__header">
        <div className="tcs__headerLeft">
          <h3 className="tcs__title">Class Schedule</h3>
          <p className="tcs__subtitle">Academic Year 2025-2026</p>
        </div>
        <div className="tcs__toggle" role="tablist" aria-label="Schedule view toggle">
          <button type="button" className={"tcs__toggleBtn " + (viewMode === "table" ? "tcs__toggleBtn--active" : "")} onClick={() => setViewMode("table")}>Table</button>
          <button type="button" className={"tcs__toggleBtn " + (viewMode === "calendar" ? "tcs__toggleBtn--active" : "")} onClick={() => setViewMode("calendar")}>Calendar</button>
        </div>
      </header>

      <section className="tcs__stats">
        <div className="tcsStat">
          <div className="tcsStat__icon tcsStat__icon--primary" aria-hidden="true">📚</div>
          <div><div className="tcsStat__label">Total Classes</div><div className="tcsStat__value">{uniqueClasses} Classes</div></div>
        </div>
        <div className="tcsStat">
          <div className="tcsStat__icon tcsStat__icon--warn" aria-hidden="true">⏰</div>
          <div><div className="tcsStat__label">Schedule Entries</div><div className="tcsStat__value">{scheduleData.length}</div></div>
        </div>
      </section>

      {viewMode === "table" ? (
        <section className="tcsBlock">
          <div className="tcsTableWrap">
            <table className="tcsTable">
              <thead><tr><th className="tcsTh">Subject</th><th className="tcsTh">Section</th><th className="tcsTh">Day</th><th className="tcsTh">Time</th><th className="tcsTh">Room</th></tr></thead>
              <tbody>
                {scheduleData.length === 0 && <tr><td colSpan="5" style={{ textAlign: "center", padding: 24, color: "#94a3b8" }}>No schedule entries.</td></tr>}
                {scheduleData.map((cls) => (
                  <tr className="tcsTr" key={cls.id}>
                    <td className="tcsTd tcsTd--subject">{cls.subject}</td>
                    <td className="tcsTd"><span className="tcsPill">{cls.section}</span></td>
                    <td className="tcsTd">{DAY_MAP[cls.day_of_week] || cls.day_of_week}</td>
                    <td className="tcsTd">{cls.time}</td>
                    <td className="tcsTd">{cls.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section className="tcsBlock">
          <div className="tcsTableWrap">
            <table className="calTable">
              <thead><tr><th className="calTh calTh--time">Time</th>{daysOfWeek.map((day) => <th className="calTh" key={day}>{day}</th>)}</tr></thead>
              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="calTr">
                    <td className="calTime">{time}</td>
                    {daysOfWeek.map((day) => {
                      const cls = getClassForSlot(day, time);
                      return (
                        <td key={day} className="calTd" style={{ backgroundColor: cls ? cls.color : "transparent" }}>
                          {cls && (
                            <div className="calBlock">
                              <div className="calBlock__title">{cls.subject}</div>
                              <div className="calBlock__meta">{cls.section}</div>
                              <div className="calBlock__meta">{cls.room}</div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};

export default TeacherClassSchedule;
