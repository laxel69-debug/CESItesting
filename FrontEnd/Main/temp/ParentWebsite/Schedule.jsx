import React, { useState } from "react";
import "../ParentWebsiteCSS/Schedule.css";

const Schedule = () => {
  const [view, setView] = useState("calendar");

  const scheduleData = [
    { id: 1, section: "Makabansa", subject: "English", days: ["Mon", "Wed"], time: "08:00 AM - 09:00 AM", room: "201", teacher: "Edi Boy", color: "cat-blue" },
    { id: 2, section: "Makabansa", subject: "Math", days: ["Tue", "Thu"], time: "10:30 AM - 11:00 AM", room: "201", teacher: "Ajinomoto", color: "cat-yellow" },
    { id: 3, section: "Makabansa", subject: "Science", days: ["Fri"], time: "01:00 PM - 02:00 PM", room: "201", teacher: "Lagda", color: "cat-blue" },
    { id: 4, section: "Makabansa", subject: "Filipino", days: ["Mon", "Wed"], time: "09:00 AM - 10:00 AM", room: "201", teacher: "Cynthia", color: "cat-yellow" },
    { id: 5, section: "Makabansa", subject: "Ap", days: ["Mon", "Wed"], time: "10:00 AM - 11:00 AM", room: "201", teacher: "Sigmund Froi", color: "cat-yellow" },
    { id: 6, section: "Makabansa", subject: "TLE", days: ["Mon", "Wed"], time: "11:00 AM - 12:00 PM", room: "201", teacher: "Dennis", color: "cat-yellow" },
  ];

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  const timeSlots = ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM"];

  return (
    <div className="schedule-content">
      <header className="schedule-header">
        <div className="header-title-area">
          <h2 className="title-text">Weekly Schedule</h2>
          <span className="sy-badge">S.Y. 2025–2026</span>
        </div>

        <div className="view-toggle">
          <button
            type="button"
            className={`toggle-btn ${view === "calendar" ? "active" : ""}`}
            onClick={() => setView("calendar")}
          >
            Calendar
          </button>
          <button
            type="button"
            className={`toggle-btn ${view === "table" ? "active" : ""}`}
            onClick={() => setView("table")}
          >
            List View
          </button>
        </div>
      </header>

      <div className="schedule-card-container">
        {view === "table" ? (
          <div className="table-responsive">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Days</th>
                  <th>Time</th>
                  <th>Room</th>
                  <th>Teacher</th>
                </tr>
              </thead>
              <tbody>
                {scheduleData.map((row) => (
                  <tr key={row.id}>
                    <td className="fw-bold text-blue">{row.subject}</td>
                    <td>{row.section}</td>
                    <td>
                      <span className="day-pill">{row.days.join(" / ")}</span>
                    </td>
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
              {days.map((day) => (
                <div key={day} className="day-header">{day}</div>
              ))}

              {timeSlots.map((time) => (
                <React.Fragment key={time}>
                  <div className="time-cell">{time}</div>
                  {days.map((day) => {
                    const hour = time.split(":")[0];
                    const period = time.split(" ")[1];

                    const sessions = scheduleData.filter(
                      (item) =>
                        item.days.includes(day) &&
                        item.time.startsWith(hour) &&
                        item.time.includes(period)
                    );

                    return (
                      <div key={`${day}-${time}`} className="grid-cell">
                        {sessions.map((item) => (
                          <div key={item.id} className={`event-card ${item.color}`}>
                            <div className="event-subject">{item.subject}</div>
                            <div className="event-info">
                              {item.room} • {item.teacher}
                            </div>
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
