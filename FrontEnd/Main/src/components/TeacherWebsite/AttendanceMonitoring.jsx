import React, { useState, useMemo } from "react";
import "../TeacherWebsiteCSS/AttendanceMonitoring.css";

const AttendanceMonitoring = () => {
  const [selectedClass, setSelectedClass] = useState("Grade 1 - Einstein");

  const classes = useMemo(
    () => [
      "Grade 1 - Einstein",
      "Grade 2 - Newton",
      "Grade 3 - Galileo",
      "Grade 4 - Pascal",
      "Grade 5 - Darwin",
      "Grade 6 - Atom",
    ],
    []
  );

  const generateInitialData = () => {
    const data = {};
    classes.forEach((className) => {
      data[className] = Array.from({ length: 10 }, (_, i) => ({
        id: `2026-${className.charAt(6)}-${100 + i}`,
        name: `Student ${i + 1} (${className.split(" - ")[1]})`,
        status: "Present",
      }));
    });
    return data;
  };

  const [attendanceStore, setAttendanceStore] = useState(generateInitialData);

  const updateStatus = (id, newStatus) => {
    setAttendanceStore((prev) => ({
      ...prev,
      [selectedClass]: prev[selectedClass].map((s) =>
        s.id === id ? { ...s, status: newStatus } : s
      ),
    }));
  };

  const currentStudents = attendanceStore[selectedClass] || [];

  const counts = useMemo(() => {
    return {
      P: currentStudents.filter((s) => s.status === "Present").length,
      A: currentStudents.filter((s) => s.status === "Absent").length,
      L: currentStudents.filter((s) => s.status === "Late").length,
    };
  }, [currentStudents]);

  return (
    <div className="am">
      {/* Header */}
      <header className="am__header">
        <div className="am__headerLeft">
          <h2 className="am__title">Attendance Monitoring</h2>
          <p className="am__date">{new Date().toDateString()}</p>
        </div>

        <div className="am__headerRight">
          <select
            className="am__select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button className="am__saveBtn" type="button">
            <span className="am__saveIcon" aria-hidden="true">☁️</span>
            Save Attendance
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
      </section>

      {/* Table/Card */}
      <section className="am__card">
        <div className="am__tableWrap">
          <table className="am__table">
            <thead>
              <tr>
                <th className="am__th am__th--left">Student Name</th>
                <th className="am__th">Attendance Status</th>
                <th className="am__th">Action Toggle</th>
              </tr>
            </thead>

            <tbody>
              {currentStudents.map((student) => (
                <tr className="am__tr" key={student.id}>
                  <td className="am__td am__td--left">
                    <div className="am__name">{student.name}</div>
                    <div className="am__id">{student.id}</div>
                  </td>

                  <td className="am__td">
                    <span
                      className={[
                        "am__badge",
                        student.status === "Present" && "am__badge--present",
                        student.status === "Absent" && "am__badge--absent",
                        student.status === "Late" && "am__badge--late",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {student.status.toUpperCase()}
                    </span>
                  </td>

                  <td className="am__td">
                    <div className="am__toggle">
                      <button
                        type="button"
                        onClick={() => updateStatus(student.id, "Present")}
                        className={
                          "am__toggleBtn " +
                          (student.status === "Present"
                            ? "am__toggleBtn--present"
                            : "am__toggleBtn--idle")
                        }
                      >
                        P
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(student.id, "Absent")}
                        className={
                          "am__toggleBtn " +
                          (student.status === "Absent"
                            ? "am__toggleBtn--absent"
                            : "am__toggleBtn--idle")
                        }
                      >
                        A
                      </button>

                      <button
                        type="button"
                        onClick={() => updateStatus(student.id, "Late")}
                        className={
                          "am__toggleBtn " +
                          (student.status === "Late"
                            ? "am__toggleBtn--late"
                            : "am__toggleBtn--idle")
                        }
                      >
                        L
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {currentStudents.length === 0 && (
                <tr>
                  <td className="am__td" colSpan={3}>
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AttendanceMonitoring;
