import React, { useState } from 'react';
import { FileText, Download, Filter } from 'lucide-react';
import '../AdminWebsiteCSS/ClassManagement.css'; // Reusing similar styles

const Reports = () => {
  const [reportType, setReportType] = useState('students');
  const [dateRange, setDateRange] = useState('all');

  const reports = [
    { id: 1, name: 'Student Enrollment Report', type: 'students', date: '2026-01-16', format: 'PDF' },
    { id: 2, name: 'Financial Summary', type: 'financial', date: '2026-01-16', format: 'Excel' },
    { id: 3, name: 'Class Statistics', type: 'classes', date: '2026-01-15', format: 'PDF' },
    { id: 4, name: 'Teacher Performance', type: 'teachers', date: '2026-01-14', format: 'Excel' },
    { id: 5, name: 'Attendance Summary', type: 'attendance', date: '2026-01-13', format: 'PDF' },
  ];

  return (
    <div className="class-management">
      {/* Header */}
      <div className="class-header">
        <h1>Reports & Analytics</h1>
      </div>

      {/* Filters */}
      <div className="class-controls">
        <div className="filter-box">
          <Filter size={20} />
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="all">All Reports</option>
            <option value="students">Student Reports</option>
            <option value="financial">Financial Reports</option>
            <option value="classes">Class Reports</option>
            <option value="teachers">Teacher Reports</option>
          </select>
        </div>
        <div className="filter-box">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="classes-container">
        <div className="teacher-assignment-table">
          <table className="assignments-table">
            <thead>
              <tr>
                <th>Report Name</th>
                <th>Date Generated</th>
                <th>Format</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={18} />
                      <strong>{report.name}</strong>
                    </div>
                  </td>
                  <td>{report.date}</td>
                  <td><span className="badge">{report.format}</span></td>
                  <td>
                    <button className="btn-edit" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Download size={14} />
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Reports</h3>
          <p className="stat-number">{reports.length}</p>
        </div>
        <div className="stat-card">
          <h3>This Month</h3>
          <p className="stat-number">5</p>
        </div>
        <div className="stat-card">
          <h3>Pending</h3>
          <p className="stat-number">2</p>
        </div>
        <div className="stat-card">
          <h3>Generated Today</h3>
          <p className="stat-number">1</p>
        </div>
      </div>

      {/* Developer Notes */}
      <div className="note">
        📌 <strong>Development Notes:</strong> 
        <ul>
          <li>Connect to backend API for real report generation</li>
          <li>Implement PDF export functionality</li>
          <li>Add Excel export with multiple sheets</li>
          <li>Create scheduled report generation</li>
          <li>Add email delivery options for reports</li>
        </ul>
      </div>
    </div>
  );
};

export default Reports;
