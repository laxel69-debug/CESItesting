import React, { useMemo, useState } from "react";
import "../TeacherWebsiteCSS/Students.css";

const Students = () => {
  const [selectedClass, setSelectedClass] = useState("Grade 1 - Einstein");
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedStudentId, setExpandedStudentId] = useState(null);

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

  const generateStudents = () => {
    const allStudents = [];
    classes.forEach((gradeName, gradeIdx) => {
      for (let i = 1; i <= 10; i++) {
        allStudents.push({
          id: `LRN-10${gradeIdx + 1}${i.toString().padStart(2, "0")}`,
          name: `Student ${i} (${gradeName.split(" - ")[0]})`,
          grade: gradeName,
          gender: i % 2 === 0 ? "Female" : "Male",
          age: 6 + gradeIdx,
          email: `student${i}.g${gradeIdx + 1}@school.edu`,
          guardian: "Juan Dela Cruz",
          guardianContact: "0917-000-0000",
        });
      }
    });
    return allStudents;
  };

  const [studentData] = useState(generateStudents);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return studentData.filter(
      (s) =>
        s.grade === selectedClass &&
        (s.name.toLowerCase().includes(term) || s.id.toLowerCase().includes(term))
    );
  }, [studentData, selectedClass, searchTerm]);

  const toggleStudent = (id) => {
    setExpandedStudentId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="sr">
      {/* Header */}
      <header className="sr__header">
        <div className="sr__headerLeft">
          <h2 className="sr__title">Students Roster</h2>
          <p className="sr__subtitle">
            Managing students for <span className="sr__classTag">{selectedClass}</span>
          </p>
        </div>

        <div className="sr__headerRight">
          <div className="srSearch">
            <span className="srSearch__icon" aria-hidden="true">🔎</span>
            <input
              type="text"
              className="srSearch__input"
              placeholder="Search name or LRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            className="sr__select"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setExpandedStudentId(null);
            }}
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* Table */}
      <section className="sr__card">
        <div className="sr__tableWrap">
          <table className="srTable">
            <thead>
              <tr>
                <th className="srTh srTh--left">Student Name</th>
                <th className="srTh">LRN (Student ID)</th>
                <th className="srTh">Gender</th>
                <th className="srTh">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredStudents.map((student) => {
                const isOpen = expandedStudentId === student.id;
                const initial =
                  student.name
                    .replace("Student ", "")
                    .trim()
                    .charAt(0) || "S";

                return (
                  <React.Fragment key={student.id}>
                    <tr className="srTr">
                      <td className="srTd srTd--left">
                        <div className="srRow">
                          <div className="srAvatar" aria-hidden="true">
                            {initial.toUpperCase()}
                          </div>

                          <div className="srMain">
                            <div className="srName">{student.name}</div>
                            <div className="srEmail">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="srTd srId">{student.id}</td>
                      <td className="srTd">{student.gender}</td>

                      <td className="srTd">
                        <button
                          type="button"
                          className={"srBtn " + (isOpen ? "srBtn--dark" : "srBtn--outline")}
                          onClick={() => toggleStudent(student.id)}
                        >
                          {isOpen ? "Hide Info" : "View Info"}
                        </button>
                      </td>
                    </tr>

                    {isOpen && (
                      <tr className="srDetailRow">
                        <td colSpan={4} className="srDetailCell">
                          <div className="srDetail">
                            <div className="srDetail__grid">
                              <div className="srField">
                                <div className="srLabel">Age</div>
                                <div className="srValue">{student.age} Years</div>
                              </div>

                              <div className="srField">
                                <div className="srLabel">Guardian Name</div>
                                <div className="srValue">{student.guardian}</div>
                              </div>

                              <div className="srField">
                                <div className="srLabel">Guardian Contact</div>
                                <div className="srValue">📞 {student.guardianContact}</div>
                              </div>

                              <div className="srActions">
                                <button className="srMiniBtn srMiniBtn--light" type="button">
                                  Edit
                                </button>
                                <button className="srMiniBtn srMiniBtn--primary" type="button">
                                  Message
                                </button>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredStudents.length === 0 && (
                <tr>
                  <td className="srTd" colSpan={4}>
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

export default Students;
