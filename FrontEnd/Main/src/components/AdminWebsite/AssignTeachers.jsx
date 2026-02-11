import React, { useState } from 'react';
import { Users } from 'lucide-react';
import '../AdminWebsiteCSS/AssignTeachers.css';

const AssignTeachers = () => {
  // Sample classes data
  const [classes] = useState([
    { id: 1, name: 'Grade 1-A', gradeLevel: 'Grade 1', teacher: 'Mrs. Jennifer Johnson', capacity: 30, enrolled: 28, subjects: ['Math', 'Language Arts', 'Science'], schedule: 'Mon-Fri, 8:00 AM - 3:00 PM' },
    { id: 2, name: 'Grade 1-B', gradeLevel: 'Grade 1', teacher: 'Mr. David Santos', capacity: 30, enrolled: 26, subjects: ['Math', 'Language Arts', 'Social Studies'], schedule: 'Mon-Fri, 8:00 AM - 3:00 PM' },
    { id: 3, name: 'Grade 2-A', gradeLevel: 'Grade 2', teacher: 'Ms. Maria Garcia', capacity: 32, enrolled: 30, subjects: ['Math', 'Science', 'Physical Education'], schedule: 'Mon-Fri, 8:30 AM - 3:30 PM' },
    { id: 4, name: 'Kindergarten-A', gradeLevel: 'Kindergarten', teacher: 'Mrs. Susan Williams', capacity: 25, enrolled: 24, subjects: ['Art', 'Music', 'Science Basics'], schedule: 'Mon-Fri, 9:00 AM - 12:00 PM' },
  ]);

  // Available teachers
  const [availableTeachers] = useState([
    'Mrs. Jennifer Johnson',
    'Mr. David Santos',
    'Ms. Maria Garcia',
    'Mr. Robert Brown',
    'Mrs. Susan Williams',
  ]);

  return (
    <div className="admin-class-management">
      {/* Header */}
      <div className="admin-class-header">
        <h1>Teacher Assignments</h1>
      </div>

      {/* Statistics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Teachers</h3>
          <p className="admin-stat-number">{availableTeachers.length}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Classes Assigned</h3>
          <p className="admin-stat-number">{classes.length}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Total Students</h3>
          <p className="admin-stat-number">{classes.reduce((sum, c) => sum + c.enrolled, 0)}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Avg. Students/Teacher</h3>
          <p className="admin-stat-number">{Math.round(classes.reduce((sum, c) => sum + c.enrolled, 0) / availableTeachers.length)}</p>
        </div>
      </div>

      {/* ASSIGN TEACHERS VIEW */}
      <div className="admin-assign-teachers-view">
        <div className="admin-teacher-assignment-table">
          <table className="admin-assignments-table">
            <thead>
              <tr>
                <th>Teacher Name</th>
                <th>Classes Assigned</th>
                <th>Total Students</th>
                <th>Subjects Teaching</th>
              </tr>
            </thead>
            <tbody>
              {availableTeachers.map((teacher, idx) => {
                const teacherClasses = classes.filter(c => c.teacher === teacher);
                const totalStudents = teacherClasses.reduce((sum, cls) => sum + cls.enrolled, 0);
                const allSubjects = new Set();
                teacherClasses.forEach(cls => {
                  cls.subjects.forEach(s => allSubjects.add(s));
                });
                return (
                  <tr key={idx}>
                    <td><strong>{teacher}</strong></td>
                    <td>
                      <span className="admin-badge">{teacherClasses.length}</span>
                    </td>
                    <td>
                      <span className="admin-badge">{totalStudents}</span>
                    </td>
                    <td>
                      <div className="admin-subjects-list">
                        {Array.from(allSubjects).slice(0, 2).map((s, i) => (
                          <span key={i} className="admin-subject-tag-small">{s}</span>
                        ))}
                        {allSubjects.size > 2 && (
                          <span className="admin-subject-tag-small">+{allSubjects.size - 2}</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teacher Details */}
      <div className="admin-teacher-details">
        {availableTeachers.map((teacher, idx) => {
          const teacherClasses = classes.filter(c => c.teacher === teacher);
          if (teacherClasses.length === 0) return null;
          
          return (
            <div key={idx} className="admin-teacher-card">
              <h3>{teacher}</h3>
              <div className="admin-teacher-info">
                <p><strong>Classes:</strong></p>
                <ul>
                  {teacherClasses.map(cls => (
                    <li key={cls.id}>
                      {cls.name} ({cls.gradeLevel}) - {cls.enrolled} Students
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      {/* Developer Notes */}
      <div className="admin-note">
        📌 <strong>Development Notes:</strong> 
        <ul>
          <li>Implement drag-and-drop teacher assignment</li>
          <li>Track teacher qualifications and certifications</li>
          <li>Monitor workload distribution</li>
          <li>Implement substitute teacher management</li>
          <li>Add teacher performance metrics</li>
        </ul>
      </div>
    </div>
  );
};

export default AssignTeachers;
