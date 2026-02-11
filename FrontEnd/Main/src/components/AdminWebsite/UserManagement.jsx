import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Users, BookOpen, GraduationCap, Mail, Phone } from 'lucide-react';
import '../AdminWebsiteCSS/UserManagement.css';

/**
 * UserManagement Component
 * Manages both Students (auto-synced from enrollment) and Teachers (manually added)
 * NOTE: Frontend-only. Connect to backend API for real-time sync and data persistence.
 */
const UserManagement = () => {
  // AUTO-POPULATED STUDENTS - In production, fetch from Enrollment API
  const [students, setStudents] = useState([
    { id: 1, name: 'John Smith', gradeLevel: 'Grade 1', enrollmentDate: '2026-01-10', status: 'Active', parentName: 'Robert Smith', email: 'john.smith@school.edu', phone: '555-0101' },
    { id: 2, name: 'Sarah Johnson', gradeLevel: 'Kindergarten', enrollmentDate: '2025-12-15', status: 'Active', parentName: 'Mary Johnson', email: 'sarah.j@school.edu', phone: '555-0102' },
    { id: 3, name: 'Michael Davis', gradeLevel: 'Grade 2', enrollmentDate: '2026-01-05', status: 'Active', parentName: 'James Davis', email: 'michael.d@school.edu', phone: '555-0103' },
    { id: 4, name: 'Emily Wilson', gradeLevel: 'Grade 1', enrollmentDate: '2026-01-12', status: 'Inactive', parentName: 'Linda Wilson', email: 'emily.w@school.edu', phone: '555-0104' },
  ]);

  // MANUALLY MANAGED TEACHERS
  const [teachers, setTeachers] = useState([
    { id: 101, name: 'Mrs. Jennifer Johnson', subject: 'Mathematics', gradeLevel: 'Grade 1-2', email: 'jennifer.johnson@school.edu', phone: '555-2001', joinDate: '2023-08-15', status: 'Active' },
    { id: 102, name: 'Mr. David Santos', subject: 'Language Arts', gradeLevel: 'Grade 1', email: 'david.santos@school.edu', phone: '555-2002', joinDate: '2024-01-20', status: 'Active' },
    { id: 103, name: 'Ms. Maria Garcia', subject: 'Science', gradeLevel: 'Grade 2-3', email: 'maria.garcia@school.edu', phone: '555-2003', joinDate: '2023-09-01', status: 'Active' },
    { id: 104, name: 'Mr. Robert Brown', subject: 'Physical Education', gradeLevel: 'All', email: 'robert.brown@school.edu', phone: '555-2004', joinDate: '2022-07-10', status: 'Active' },
  ]);

  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [teacherFormData, setTeacherFormData] = useState({
    name: '',
    subject: '',
    gradeLevel: '',
    email: '',
    phone: '',
    joinDate: '',
    status: 'Active'
  });

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || student.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Filter teachers
  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || teacher.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle teacher form input
  const handleTeacherInputChange = (e) => {
    const { name, value } = e.target;
    setTeacherFormData({ ...teacherFormData, [name]: value });
  };

  // Save teacher
  const handleSaveTeacher = () => {
    if (!teacherFormData.name || !teacherFormData.subject || !teacherFormData.email) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingTeacherId) {
      // UPDATE teacher
      setTeachers(teachers.map(t => 
        t.id === editingTeacherId ? { ...teacherFormData, id: editingTeacherId } : t
      ));
      setEditingTeacherId(null);
    } else {
      // ADD new teacher
      const newTeacher = {
        id: Math.max(...teachers.map(t => t.id), 100) + 1,
        ...teacherFormData
      };
      setTeachers([...teachers, newTeacher]);
    }

    resetTeacherForm();
  };

  // Edit teacher
  const handleEditTeacher = (teacher) => {
    setTeacherFormData(teacher);
    setEditingTeacherId(teacher.id);
    setShowTeacherForm(true);
  };

  // Delete teacher
  const handleDeleteTeacher = (id) => {
    if (window.confirm('Are you sure you want to delete this teacher?')) {
      setTeachers(teachers.filter(t => t.id !== id));
    }
  };

  // Reset form
  const resetTeacherForm = () => {
    setTeacherFormData({
      name: '',
      subject: '',
      gradeLevel: '',
      email: '',
      phone: '',
      joinDate: '',
      status: 'Active'
    });
    setShowTeacherForm(false);
  };

  // Statistics
  const studentStats = {
    total: students.length,
    active: students.filter(s => s.status === 'Active').length,
    inactive: students.filter(s => s.status === 'Inactive').length
  };

  const teacherStats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'Active').length
  };

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-header">
        <h1>User Management</h1>
        {activeTab === 'teachers' && (
          <button className="btn-primary" onClick={() => setShowTeacherForm(true)}>
            <Plus size={18} /> Add New Teacher
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => { setActiveTab('students'); setSearchTerm(''); setFilterStatus('All'); }}
        >
          <GraduationCap size={18} />
          Students ({studentStats.total})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('teachers'); setSearchTerm(''); setFilterStatus('All'); }}
        >
          <BookOpen size={18} />
          Teachers ({teacherStats.total})
        </button>
      </div>

      {/* Statistics */}
      {activeTab === 'students' && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p className="stat-number">{studentStats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Active Students</h3>
            <p className="stat-number active">{studentStats.active}</p>
          </div>
          <div className="stat-card">
            <h3>Inactive Students</h3>
            <p className="stat-number inactive">{studentStats.inactive}</p>
          </div>
        </div>
      )}

      {activeTab === 'teachers' && (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Teachers</h3>
            <p className="stat-number">{teacherStats.total}</p>
          </div>
          <div className="stat-card">
            <h3>Active Teachers</h3>
            <p className="stat-number active">{teacherStats.active}</p>
          </div>
        </div>
      )}

      {/* Teacher Form Modal */}
      {showTeacherForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}</h2>
            
            <div className="form-group">
              <label>Teacher Name *</label>
              <input
                type="text"
                name="name"
                value={teacherFormData.name}
                onChange={handleTeacherInputChange}
                placeholder="Enter full name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Subject *</label>
                <select name="subject" value={teacherFormData.subject} onChange={handleTeacherInputChange}>
                  <option value="">Select Subject</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Language Arts">Language Arts</option>
                  <option value="Science">Science</option>
                  <option value="Social Studies">Social Studies</option>
                  <option value="Physical Education">Physical Education</option>
                  <option value="Art">Art</option>
                  <option value="Music">Music</option>
                </select>
              </div>

              <div className="form-group">
                <label>Grade Level</label>
                <input
                  type="text"
                  name="gradeLevel"
                  value={teacherFormData.gradeLevel}
                  onChange={handleTeacherInputChange}
                  placeholder="e.g., Grade 1-2, All"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Email *</label>
              <input
                type="email"
                name="email"
                value={teacherFormData.email}
                onChange={handleTeacherInputChange}
                placeholder="teacher@school.edu"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={teacherFormData.phone}
                  onChange={handleTeacherInputChange}
                  placeholder="555-0000"
                />
              </div>

              <div className="form-group">
                <label>Join Date</label>
                <input
                  type="date"
                  name="joinDate"
                  value={teacherFormData.joinDate}
                  onChange={handleTeacherInputChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={teacherFormData.status} onChange={handleTeacherInputChange}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={resetTeacherForm}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveTeacher}>
                {editingTeacherId ? 'Update Teacher' : 'Save Teacher'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="user-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder={activeTab === 'students' ? 'Search students by name, parent, or email...' : 'Search teachers by name, subject, or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            {activeTab === 'students' ? (
              <>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </>
            ) : (
              <>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
                <option value="On Leave">On Leave</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* STUDENTS TABLE */}
      {activeTab === 'students' && (
        <div className="users-container">
          {filteredStudents.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Grade Level</th>
                  <th>Parent/Guardian</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Enrollment Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map(student => (
                  <tr key={student.id}>
                    <td><strong>{student.name}</strong></td>
                    <td>{student.gradeLevel}</td>
                    <td>{student.parentName}</td>
                    <td><a href={`mailto:${student.email}`}>{student.email}</a></td>
                    <td><a href={`tel:${student.phone}`}>{student.phone}</a></td>
                    <td>{new Date(student.enrollmentDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${student.status.toLowerCase()}`}>
                        {student.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <Users size={48} />
              <p>No students found.</p>
            </div>
          )}
        </div>
      )}

      {/* TEACHERS TABLE */}
      {activeTab === 'teachers' && (
        <div className="users-container">
          {filteredTeachers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Teacher Name</th>
                  <th>Subject</th>
                  <th>Grade Level</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Join Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map(teacher => (
                  <tr key={teacher.id}>
                    <td><strong>{teacher.name}</strong></td>
                    <td>{teacher.subject}</td>
                    <td>{teacher.gradeLevel}</td>
                    <td><a href={`mailto:${teacher.email}`}>{teacher.email}</a></td>
                    <td><a href={`tel:${teacher.phone}`}>{teacher.phone}</a></td>
                    <td>{new Date(teacher.joinDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`status-badge ${teacher.status.toLowerCase()}`}>
                        {teacher.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-edit" 
                          onClick={() => handleEditTeacher(teacher)}
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className="btn-delete" 
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results">
              <BookOpen size={48} />
              <p>No teachers found.</p>
            </div>
          )}
        </div>
      )}

      {/* Developer Notes */}
      <div className="note">
        📌 <strong>Development Notes:</strong> 
        <ul>
          <li><strong>Students:</strong> Auto-synced from Enrollment Management. Fetch from enrollment API on component mount.</li>
          <li><strong>Teachers:</strong> Manually managed. Connect POST, PUT, DELETE endpoints to your backend.</li>
          <li>Add authentication to prevent unauthorized user creation.</li>
        </ul>
      </div>
    </div>
  );
};

export default UserManagement;
