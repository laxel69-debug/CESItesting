import React, { useState } from "react";
import "../TeacherWebsiteCSS/TeacherClassSchedule.css";

const TeacherClassSchedule = () => {
  const [viewMode, setViewMode] = useState("table"); // 'table' | 'calendar'

  const scheduleData = [
    { id: 1, subject: "Mathematics 10", section: "Grade 10 - Einstein", days: ["M", "W", "F"], time: "08:00 AM - 09:00 AM", startTime: "08:00 AM", room: "Room 302", students: 42, color: "#cfe2ff" },
    { id: 2, subject: "Advanced Algebra", section: "Grade 11 - Newton", days: ["T", "TH"], time: "10:30 AM - 12:00 PM", startTime: "10:00 AM", room: "Lab 1", students: 35, color: "#d1e7dd" },
    { id: 3, subject: "Mathematics 10", section: "Grade 10 - Galileo", days: ["M", "W", "F"], time: "01:00 PM - 02:00 PM", startTime: "01:00 PM", room: "Room 302", students: 40, color: "#fff3cd" },
    { id: 4, subject: "Statistics", section: "Grade 12 - Pascal", days: ["T", "TH"], time: "02:00 PM - 03:30 PM", startTime: "02:00 PM", room: "Room 405", students: 38, color: "#f8d7da" },
  ];

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  const timeSlots = ["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"];

  const getClassForSlot = (day, time) => {
    const dayInitial = day === "Thursday" ? "TH" : day.charAt(0);
    return scheduleData.find((cls) => cls.days.includes(dayInitial) && cls.startTime === time);
  };

  return (
    <div className="tcs">
      {/* Header */}
      <header className="tcs__header">
        <div className="tcs__headerLeft">
          <h3 className="tcs__title">Class Schedule</h3>
          <p className="tcs__subtitle">Academic Year 2025-2026 | Second Semester</p>
        </div>

        <div className="tcs__toggle" role="tablist" aria-label="Schedule view toggle">
          <button
            type="button"
            className={"tcs__toggleBtn " + (viewMode === "table" ? "tcs__toggleBtn--active" : "")}
            onClick={() => setViewMode("table")}
          >
            📋 Table
          </button>
          <button
            type="button"
            className={"tcs__toggleBtn " + (viewMode === "calendar" ? "tcs__toggleBtn--active" : "")}
            onClick={() => setViewMode("calendar")}
          >
            🗓️ Calendar
          </button>
        </div>
      </header>

      {/* Stats */}
      <section className="tcs__stats">
        <div className="tcsStat">
          <div className="tcsStat__icon tcsStat__icon--primary" aria-hidden="true">📚</div>
          <div>
            <div className="tcsStat__label">Total Classes</div>
            <div className="tcsStat__value">8 Classes</div>
          </div>
        </div>

        <div className="tcsStat">
          <div className="tcsStat__icon tcsStat__icon--success" aria-hidden="true">👥</div>
          <div>
            <div className="tcsStat__label">Total Students</div>
            <div className="tcsStat__value">312 Students</div>
          </div>
        </div>

        <div className="tcsStat">
          <div className="tcsStat__icon tcsStat__icon--warn" aria-hidden="true">⏰</div>
          <div>
            <div className="tcsStat__label">Hours / Week</div>
            <div className="tcsStat__value">18 Hours</div>
          </div>
        </div>
      </section>

      {/* Content */}
      {viewMode === "table" ? (
        <section className="tcsBlock">
          <div className="tcsTableWrap">
            <table className="tcsTable">
              <thead>
                <tr>
                  <th className="tcsTh">Subject</th>
                  <th className="tcsTh">Section</th>
                  <th className="tcsTh">Days</th>
                  <th className="tcsTh">Time</th>
                  <th className="tcsTh">Room</th>
                  <th className="tcsTh">Action</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((cls) => (
                  <tr className="tcsTr" key={cls.id}>
                    <td className="tcsTd tcsTd--subject">{cls.subject}</td>
                    <td className="tcsTd">
                      <span className="tcsPill">{cls.section}</span>
                    </td>
                    <td className="tcsTd">{cls.days.join("-")}</td>
                    <td className="tcsTd">{cls.time}</td>
                    <td className="tcsTd">{cls.room}</td>
                    <td className="tcsTd">
                      <button className="tcsBtn" type="button">View Class</button>
                    </td>
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
              <thead>
                <tr>
                  <th className="calTh calTh--time">Time</th>
                  {daysOfWeek.map((day) => (
                    <th className="calTh" key={day}>{day}</th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {timeSlots.map((time) => (
                  <tr key={time} className="calTr">
                    <td className="calTime">{time}</td>
                    {daysOfWeek.map((day) => {
                      const cls = getClassForSlot(day, time);
                      return (
                        <td
                          key={day}
                          className="calTd"
                          style={{ backgroundColor: cls ? cls.color : "transparent" }}
                        >
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
