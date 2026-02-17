import React, { useState } from 'react';
import { 
  FileText, Download, Upload, Calendar, Lock, Unlock, 
  AlertCircle, CheckCircle, Search, Filter, Edit, Eye, 
  Users, XCircle, Clock, TrendingUp
} from 'lucide-react';
import '../AdminWebsiteCSS/GradesRecords.css';

const GradesRecords = () => {
  const [activeTab, setActiveTab] = useState('grades');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState('2026-01-16');
  const [hoveredRow, setHoveredRow] = useState(null);

  // Deadline status
  const [deadlineStatus, setDeadlineStatus] = useState({
    isOpen: true,
    deadline: '2026-01-25',
    openedBy: 'Admin',
    openedDate: '2026-01-15'
  });

  // Stats
  const gradeStats = {
    totalStudents: 145,
    gradedStudents: 120,
    pendingGrades: 25,
    averageGrade: 88.5
  };

  const attendanceStats = {
    totalStudents: 145,
    present: 135,
    absent: 8,
    late: 2,
    attendanceRate: 93.1
  };

  // Student data with grades
  const studentsWithGrades = [
    {
      id: 1,
      studentId: 'STU-2026-001',
      name: 'Juan Dela Cruz',
      gradeLevel: 'Kindergarten',
      section: 'A',
      reading: 90,
      writing: 85,
      math: 92,
      science: 88,
      arts: 95,
      average: 90,
      gradeStatus: 'completed',
      attendanceStatus: 'present',
      timeIn: '07:45 AM',
      timeOut: '03:00 PM',
      remarks: ''
    },
    {
      id: 2,
      studentId: 'STU-2026-002',
      name: 'Maria Santos',
      gradeLevel: 'Pre-K',
      section: 'B',
      reading: 88,
      writing: 90,
      math: 85,
      science: 87,
      arts: 92,
      average: 88.4,
      gradeStatus: 'completed',
      attendanceStatus: 'present',
      timeIn: '07:50 AM',
      timeOut: '03:05 PM',
      remarks: ''
    },
    {
      id: 3,
      studentId: 'STU-2026-003',
      name: 'Pedro Reyes',
      gradeLevel: 'Nursery',
      section: 'A',
      reading: null,
      writing: null,
      math: null,
      science: null,
      arts: null,
      average: null,
      gradeStatus: 'pending',
      attendanceStatus: 'absent',
      timeIn: '-',
      timeOut: '-',
      remarks: 'Sick leave - parent notified'
    },
    {
      id: 4,
      studentId: 'STU-2026-004',
      name: 'Ana Garcia',
      gradeLevel: 'Kindergarten',
      section: 'B',
      reading: 95,
      writing: 93,
      math: 94,
      science: 96,
      arts: 97,
      average: 95,
      gradeStatus: 'completed',
      attendanceStatus: 'late',
      timeIn: '08:30 AM',
      timeOut: '03:00 PM',
      remarks: 'Traffic'
    },
    {
      id: 5,
      studentId: 'STU-2026-005',
      name: 'Carlos Martinez',
      gradeLevel: 'Pre-K',
      section: 'A',
      reading: 82,
      writing: 80,
      math: 85,
      science: 83,
      arts: 88,
      average: 83.6,
      gradeStatus: 'completed',
      attendanceStatus: 'present',
      timeIn: '07:40 AM',
      timeOut: '02:55 PM',
      remarks: ''
    },
    {
      id: 6,
      studentId: 'STU-2026-006',
      name: 'Sofia Reyes',
      gradeLevel: 'Kindergarten',
      section: 'A',
      reading: null,
      writing: null,
      math: null,
      science: null,
      arts: null,
      average: null,
      gradeStatus: 'pending',
      attendanceStatus: 'present',
      timeIn: '07:55 AM',
      timeOut: '03:10 PM',
      remarks: ''
    }
  ];

  const handleToggleDeadline = () => {
    setDeadlineStatus(prev => ({
      ...prev,
      isOpen: !prev.isOpen
    }));
    alert(deadlineStatus.isOpen ? 'Grade submission deadline closed!' : 'Grade submission deadline opened!');
  };

  const handleExport = () => {
    if (activeTab === 'grades') {
      alert('Exporting all grades to Excel...');
    } else {
      alert(`Exporting attendance for ${selectedDate}...`);
    }
  };

  const handleImport = () => {
    alert('Import grades from Excel file...');
  };

  const handleEdit = (student) => {
    if (activeTab === 'grades') {
      alert(`Editing grades for ${student.name}`);
    } else {
      alert(`Editing attendance for ${student.name}`);
    }
  };

  const handleView = (student) => {
    alert(`Viewing detailed report for ${student.name}`);
  };

  const filteredStudents = studentsWithGrades.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'all' || student.gradeLevel === filterGrade;
    
    if (activeTab === 'grades') {
      const matchesStatus = filterStatus === 'all' || student.gradeStatus === filterStatus;
      return matchesSearch && matchesGrade && matchesStatus;
    } else {
      const matchesStatus = filterStatus === 'all' || student.attendanceStatus === filterStatus;
      return matchesSearch && matchesGrade && matchesStatus;
    }
  });

  const getGradeColor = (grade) => {
    if (grade === null) return 'gr-grade-pending';
    if (grade >= 90) return 'gr-grade-excellent';
    if (grade >= 80) return 'gr-grade-good';
    if (grade >= 75) return 'gr-grade-fair';
    return 'gr-grade-needs-improvement';
  };

  return (
    <main className="grades-records-main">
      {/* Stats Overview */}
      <section className="gr-section">
        {activeTab === 'grades' ? (
          <div className="gr-stats-grid">
            <div className="gr-stat-card gr-stat-blue">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Total Students</span>
                <Users size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{gradeStats.totalStudents}</div>
              <div className="gr-stat-change">Enrolled this year</div>
            </div>

            <div className="gr-stat-card gr-stat-green">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Graded Students</span>
                <CheckCircle size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{gradeStats.gradedStudents}</div>
              <div className="gr-stat-change positive">
                {((gradeStats.gradedStudents / gradeStats.totalStudents) * 100).toFixed(1)}% completion
              </div>
            </div>

            <div className="gr-stat-card gr-stat-yellow">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Pending Grades</span>
                <AlertCircle size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{gradeStats.pendingGrades}</div>
              <div className="gr-stat-change">Need attention</div>
            </div>

            <div className="gr-stat-card gr-stat-purple">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Average Grade</span>
                <FileText size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{gradeStats.averageGrade}%</div>
              <div className="gr-stat-change positive">Above target</div>
            </div>
          </div>
        ) : (
          <div className="gr-stats-grid">
            <div className="gr-stat-card gr-stat-blue">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Total Students</span>
                <Users size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{attendanceStats.totalStudents}</div>
              <div className="gr-stat-change">Today</div>
            </div>

            <div className="gr-stat-card gr-stat-green">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Present</span>
                <CheckCircle size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{attendanceStats.present}</div>
              <div className="gr-stat-change positive">
                {attendanceStats.attendanceRate}% rate
              </div>
            </div>

            <div className="gr-stat-card gr-stat-red">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Absent</span>
                <XCircle size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{attendanceStats.absent}</div>
              <div className="gr-stat-change">Requires follow-up</div>
            </div>

            <div className="gr-stat-card gr-stat-yellow">
              <div className="gr-stat-header">
                <span className="gr-stat-label">Late</span>
                <Clock size={24} className="gr-stat-icon" />
              </div>
              <div className="gr-stat-value">{attendanceStats.late}</div>
              <div className="gr-stat-change">Students</div>
            </div>
          </div>
        )}
      </section>

      {/* Deadline Control - Only show for Grades tab */}
      {activeTab === 'grades' && (
        <section className="gr-section">
          <div className="gr-deadline-card">
            <div className="gr-deadline-header">
              <div className="gr-deadline-info">
                <div className="gr-deadline-icon">
                  {deadlineStatus.isOpen ? (
                    <Unlock size={32} className="gr-icon-open" />
                  ) : (
                    <Lock size={32} className="gr-icon-closed" />
                  )}
                </div>
                <div>
                  <h3 className="gr-deadline-title">
                    Grade Submission {deadlineStatus.isOpen ? 'Open' : 'Closed'}
                  </h3>
                  <p className="gr-deadline-subtitle">
                    {deadlineStatus.isOpen 
                      ? `Deadline: ${deadlineStatus.deadline}` 
                      : 'Teachers cannot submit grades'}
                  </p>
                  <div className="gr-deadline-meta">
                    <span>Last modified by {deadlineStatus.openedBy} on {deadlineStatus.openedDate}</span>
                  </div>
                </div>
              </div>
              <button 
                className={`gr-btn-toggle ${deadlineStatus.isOpen ? 'gr-btn-close' : 'gr-btn-open'}`}
                onClick={handleToggleDeadline}
              >
                {deadlineStatus.isOpen ? (
                  <>
                    <Lock size={18} />
                    Close Deadline
                  </>
                ) : (
                  <>
                    <Unlock size={18} />
                    Open Deadline
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Tab Navigation */}
      <div className="gr-tabs-container">
        <button 
          className={`gr-tab-button ${activeTab === 'grades' ? 'gr-tab-active' : ''}`}
          onClick={() => setActiveTab('grades')}
        >
          <FileText size={18} />
          Student Grades
        </button>
        <button 
          className={`gr-tab-button ${activeTab === 'attendance' ? 'gr-tab-active' : ''}`}
          onClick={() => setActiveTab('attendance')}
        >
          <Calendar size={18} />
          Attendance
        </button>
      </div>

      {/* Main Content */}
      <section className="gr-section">
        <div className="gr-section-header">
          <div>
            <h2 className="gr-section-title">
              {activeTab === 'grades' ? 'Student Grades' : 'Attendance Records'}
            </h2>
            <p className="gr-section-subtitle">
              {activeTab === 'grades' 
                ? 'View and manage all student grades' 
                : `Attendance for ${selectedDate}`}
            </p>
          </div>
          <div className="gr-header-actions">
            {activeTab === 'grades' && (
              <button className="gr-btn-secondary" onClick={handleImport}>
                <Upload size={18} />
                Import Grades
              </button>
            )}
            {activeTab === 'attendance' && (
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="gr-date-input"
              />
            )}
            <button className="gr-btn-primary" onClick={handleExport}>
              <Download size={18} />
              Export
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="gr-filters-container">
          <div className="gr-search-box">
            <Search size={20} className="gr-search-icon" />
            <input
              type="text"
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="gr-search-input"
            />
          </div>
          <div className="gr-filter-group">
            <Filter size={20} />
            <select 
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="gr-filter-select"
            >
              <option value="all">All Grade Levels</option>
              <option value="Nursery">Nursery</option>
              <option value="Pre-K">Pre-K</option>
              <option value="Kindergarten">Kindergarten</option>
            </select>
          </div>
          <div className="gr-filter-group">
            <Filter size={20} />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="gr-filter-select"
            >
              {activeTab === 'grades' ? (
                <>
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </>
              ) : (
                <>
                  <option value="all">All Status</option>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="gr-table-container">
          {activeTab === 'grades' ? (
            <table className="gr-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Grade Level</th>
                  <th>Section</th>
                  <th>Reading</th>
                  <th>Writing</th>
                  <th>Math</th>
                  <th>Science</th>
                  <th>Arts</th>
                  <th>Average</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr 
                    key={student.id}
                    className={hoveredRow === student.id ? 'gr-row-hover' : ''}
                    onMouseEnter={() => setHoveredRow(student.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="gr-student-id">{student.studentId}</td>
                    <td className="gr-student-name">{student.name}</td>
                    <td>{student.gradeLevel}</td>
                    <td>{student.section}</td>
                    <td>
                      <span className={`gr-grade ${getGradeColor(student.reading)}`}>
                        {student.reading ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`gr-grade ${getGradeColor(student.writing)}`}>
                        {student.writing ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`gr-grade ${getGradeColor(student.math)}`}>
                        {student.math ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`gr-grade ${getGradeColor(student.science)}`}>
                        {student.science ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`gr-grade ${getGradeColor(student.arts)}`}>
                        {student.arts ?? '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`gr-average ${getGradeColor(student.average)}`}>
                        {student.average ? student.average.toFixed(1) : '-'}
                      </span>
                    </td>
                    <td>
                      <span className={`gr-status-badge gr-status-${student.gradeStatus}`}>
                        {student.gradeStatus}
                      </span>
                    </td>
                    <td>
                      <div className="gr-action-buttons">
                        <button 
                          className="gr-btn-icon"
                          onClick={() => handleEdit(student)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="gr-btn-icon"
                          onClick={() => handleView(student)}
                          title="View"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="gr-table">
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>Student Name</th>
                  <th>Grade Level</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Time In</th>
                  <th>Time Out</th>
                  <th>Remarks</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr 
                    key={student.id}
                    className={hoveredRow === student.id ? 'gr-row-hover' : ''}
                    onMouseEnter={() => setHoveredRow(student.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td className="gr-student-id">{student.studentId}</td>
                    <td className="gr-student-name">{student.name}</td>
                    <td>{student.gradeLevel}</td>
                    <td>{student.section}</td>
                    <td>
                      <span className={`gr-attendance-badge gr-att-${student.attendanceStatus}`}>
                        {student.attendanceStatus}
                      </span>
                    </td>
                    <td>{student.timeIn}</td>
                    <td>{student.timeOut}</td>
                    <td className="gr-remarks">{student.remarks || '-'}</td>
                    <td>
                      <div className="gr-action-buttons">
                        <button 
                          className="gr-btn-icon"
                          onClick={() => handleEdit(student)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="gr-btn-icon"
                          onClick={() => handleView(student)}
                          title="History"
                        >
                          <Eye size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
};

export default GradesRecords;