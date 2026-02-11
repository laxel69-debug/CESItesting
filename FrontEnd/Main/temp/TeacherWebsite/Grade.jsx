import React, { useMemo, useState } from "react";
import "../TeacherWebsiteCSS/Grade.css";

const Grade = () => {
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

  const generateInitialGrades = () => {
    const allData = {};
    classes.forEach((grade) => {
      allData[grade] = Array.from({ length: 10 }, (_, i) => ({
        id: `LRN-2026-${grade.charAt(6)}-${i + 1}`,
        name: `Student ${i + 1} (${grade.split(" - ")[1]})`,
        written: 75 + (i % 5) * 3,
        performance: 80 + (i % 3) * 4,
        exam: 70 + (i % 4) * 5,
      }));
    });
    return allData;
  };

  const [gradeData, setGradeData] = useState(generateInitialGrades);

  const calculateFinal = (s) =>
    Math.round(s.written * 0.3 + s.performance * 0.5 + s.exam * 0.2);

  const getRemarks = (avg) => (avg >= 75 ? "PASSED" : "FAILED");

  const handleGradeChange = (grade, id, field, value) => {
    const numericValue = parseInt(value, 10) || 0;
    setGradeData((prev) => ({
      ...prev,
      [grade]: prev[grade].map((s) =>
        s.id === id ? { ...s, [field]: numericValue } : s
      ),
    }));
  };

  const currentStudents = gradeData[selectedClass] || [];

  const passingCount = currentStudents.filter((s) => calculateFinal(s) >= 75).length;
  const failingCount = currentStudents.filter((s) => calculateFinal(s) < 75).length;

  return (
    <div className="ge">
      {/* Header */}
      <header className="ge__header">
        <div className="ge__headerLeft">
          <h2 className="ge__title">Grade Encoding</h2>
          <p className="ge__subtitle">
            Managing records for <span className="ge__classTag">{selectedClass}</span>
          </p>
        </div>

        <div className="ge__headerRight">
          <select
            className="ge__select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button className="ge__saveBtn" type="button">
            <span className="ge__saveIcon" aria-hidden="true">💾</span>
            Save Changes
          </button>
        </div>
      </header>

      {/* Breakdown */}
      <section className="ge__stats">
        <div className="geStat geStat--pass">
          <div className="geStat__label">TOTAL PASSING</div>
          <div className="geStat__value geStat__value--success">{passingCount}</div>
        </div>

        <div className="geStat geStat--fail">
          <div className="geStat__label">TOTAL FAILING</div>
          <div className="geStat__value geStat__value--danger">{failingCount}</div>
        </div>
      </section>

      {/* Table */}
      <section className="ge__card">
        <div className="ge__tableWrap">
          <table className="ge__table">
            <thead>
              <tr>
                <th className="ge__th ge__th--left">Student Name</th>
                <th className="ge__th ge__th--w">Written (30%)</th>
                <th className="ge__th ge__th--w">Performance (50%)</th>
                <th className="ge__th ge__th--w">Exam (20%)</th>
                <th className="ge__th">Final Grade</th>
                <th className="ge__th">Remarks</th>
              </tr>
            </thead>

            <tbody>
              {currentStudents.map((student) => {
                const final = calculateFinal(student);
                const remark = getRemarks(final);

                return (
                  <tr className="ge__tr" key={student.id}>
                    <td className="ge__td ge__td--left">
                      <div className="ge__name">{student.name}</div>
                      <div className="ge__id">{student.id}</div>
                    </td>

                    <td className="ge__td">
                      <input
                        type="number"
                        className="ge__input"
                        value={student.written}
                        onChange={(e) =>
                          handleGradeChange(selectedClass, student.id, "written", e.target.value)
                        }
                      />
                    </td>

                    <td className="ge__td">
                      <input
                        type="number"
                        className="ge__input"
                        value={student.performance}
                        onChange={(e) =>
                          handleGradeChange(selectedClass, student.id, "performance", e.target.value)
                        }
                      />
                    </td>

                    <td className="ge__td">
                      <input
                        type="number"
                        className="ge__input"
                        value={student.exam}
                        onChange={(e) =>
                          handleGradeChange(selectedClass, student.id, "exam", e.target.value)
                        }
                      />
                    </td>

                    <td className="ge__td">
                      <span className={"ge__final " + (final < 75 ? "ge__final--bad" : "ge__final--good")}>
                        {final}
                      </span>
                    </td>

                    <td className="ge__td">
                      <span className={"ge__badge " + (remark === "PASSED" ? "ge__badge--pass" : "ge__badge--fail")}>
                        {remark}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {currentStudents.length === 0 && (
                <tr>
                  <td className="ge__td" colSpan={6}>No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default Grade;
