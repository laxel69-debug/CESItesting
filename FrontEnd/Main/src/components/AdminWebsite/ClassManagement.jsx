import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, Clock, Users, BookOpen, Calendar } from 'lucide-react';
import '../AdminWebsiteCSS/AdminClassManagement.css';

/**
 * ClassManagement Component
 * Manages classes with teacher assignments and subject scheduling
 * NOTE: Frontend-only. Connect to backend API for data persistence.
 */
const ClassManagement = ({ initialTab = 'classes' }) => {
  // Sample classes data
  const [classes, setClasses] = useState([
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

  // Available subjects
  const [availableSubjects, setAvailableSubjects] = useState([
    'Math', 'Language Arts', 'Science', 'Social Studies', 
    'Physical Education', 'Art', 'Music', 'Science Basics',
    'Computer Science', 'Environmental Studies'
  ]);

  // Teachers state (editable) - now with assignments
  const [teachers, setTeachers] = useState([
    { id: 1, name: 'Mrs. Jennifer Johnson', qualifications: 'B.A. Education', experience: '8 years' },
    { id: 2, name: 'Mr. David Santos', qualifications: 'B.S. Mathematics', experience: '5 years' },
    { id: 3, name: 'Ms. Maria Garcia', qualifications: 'B.S. Science', experience: '6 years' },
    { id: 4, name: 'Mr. Robert Brown', qualifications: 'B.Ed. Physical Education', experience: '10 years' },
    { id: 5, name: 'Mrs. Susan Williams', qualifications: 'B.A. Early Childhood', experience: '7 years' },
  ]);

  // Teacher assignments: { teacherId: { classId: [subjects] } }
  const [teacherAssignments, setTeacherAssignments] = useState({
    1: { 1: ['Math', 'Language Arts'] },
    2: { 2: ['Math', 'Language Arts', 'Social Studies'] },
    3: { 3: ['Math', 'Science'] },
    5: { 4: ['Art', 'Music'] },
  });

  const [activeTab, setActiveTab] = useState(initialTab || 'classes');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('All');
  const [showClassForm, setShowClassForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [editingTeacherId, setEditingTeacherId] = useState(null);
  const [selectedTeacherForAssignment, setSelectedTeacherForAssignment] = useState(null);
  const [assignmentFormData, setAssignmentFormData] = useState({
    classId: '',
    teacherId: '',
    subjects: []
  });
  const [classFormData, setClassFormData] = useState({
    name: '',
    gradeLevel: '',
    teacher: '',
    capacity: '',
    enrolled: '',
    subjects: [],
    schedule: ''
  });
  const [newSubject, setNewSubject] = useState('');
  const [newTeacher, setNewTeacher] = useState('');

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cls.teacher.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = filterGrade === 'All' || cls.gradeLevel === filterGrade;
    return matchesSearch && matchesGrade;
  });

  // Get unique grade levels
  const gradelevels = ['All', ...new Set(classes.map(c => c.gradeLevel))];

  // Handle form input
  const handleClassInputChange = (e) => {
    const { name, value } = e.target;
    setClassFormData({ ...classFormData, [name]: value });
  };

  // Handle subject selection
  const handleSubjectToggle = (subject) => {
    setClassFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  // Save class
  const handleSaveClass = () => {
    if (!classFormData.name || !classFormData.gradeLevel || !classFormData.teacher) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingClassId) {
      // UPDATE class
      setClasses(classes.map(c => 
        c.id === editingClassId ? { ...classFormData, id: editingClassId } : c
      ));
      setEditingClassId(null);
    } else {
      // ADD new class
      const newClass = {
        id: Math.max(...classes.map(c => c.id), 0) + 1,
        ...classFormData
      };
      setClasses([...classes, newClass]);
    }

    resetClassForm();
  };

  // Edit class
  const handleEditClass = (classItem) => {
    setClassFormData(classItem);
    setEditingClassId(classItem.id);
    setShowClassForm(true);
  };

  // Delete class
  const handleDeleteClass = (id) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      setClasses(classes.filter(c => c.id !== id));
    }
  };

  // Reset form
  const resetClassForm = () => {
    setClassFormData({
      name: '',
      gradeLevel: '',
      teacher: '',
      capacity: '',
      enrolled: '',
      subjects: [],
      schedule: ''
    });
    setShowClassForm(false);
  };

  // Subject management
  const handleAddSubject = () => {
    if (newSubject.trim() && !availableSubjects.includes(newSubject.trim())) {
      setAvailableSubjects([...availableSubjects, newSubject.trim()]);
      setNewSubject('');
    }
  };

  const handleDeleteSubject = (subject) => {
    if (window.confirm(`Delete subject "${subject}"?`)) {
      setAvailableSubjects(availableSubjects.filter(s => s !== subject));
      setClasses(classes.map(c => ({
        ...c,
        subjects: c.subjects.filter(s => s !== subject)
      })));
    }
  };

  // Teacher management
  const handleAddTeacher = () => {
    if (newTeacher.trim() && !teachers.some(t => t.name === newTeacher.trim())) {
      setTeachers([...teachers, { id: Math.max(...teachers.map(t => t.id), 0) + 1, name: newTeacher.trim() }]);
      setNewTeacher('');
    }
  };

  const handleDeleteTeacher = (teacherId, teacherName) => {
    if (window.confirm(`Delete teacher "${teacherName}"?`)) {
      setTeachers(teachers.filter(t => t.id !== teacherId));
      // Remove from assignments
      setTeacherAssignments(prev => {
        const updated = { ...prev };
        delete updated[teacherId];
        return updated;
      });
      // Remove from classes
      setClasses(classes.map(c => ({
        ...c,
        teacher: c.teacher === teacherName ? '' : c.teacher
      })));
    }
  };

  // Assignment management
  const handleOpenAssignmentForm = (teacherId) => {
    setSelectedTeacherForAssignment(teacherId);
    setAssignmentFormData({
      classId: '',
      teacherId: teacherId,
      subjects: []
    });
    setShowAssignmentForm(true);
  };

  const handleAssignmentSubjectToggle = (subject) => {
    setAssignmentFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSaveAssignment = () => {
    const { classId, teacherId, subjects } = assignmentFormData;
    if (!classId || subjects.length === 0) {
      alert('Please select a class and at least one subject');
      return;
    }

    setTeacherAssignments(prev => ({
      ...prev,
      [teacherId]: {
        ...prev[teacherId],
        [classId]: subjects
      }
    }));

    resetAssignmentForm();
  };

  const handleRemoveAssignment = (teacherId, classId) => {
    setTeacherAssignments(prev => {
      const updated = { ...prev };
      if (updated[teacherId]) {
        const newClasses = { ...updated[teacherId] };
        delete newClasses[classId];
        if (Object.keys(newClasses).length === 0) {
          delete updated[teacherId];
        } else {
          updated[teacherId] = newClasses;
        }
      }
      return updated;
    });
  };

  const resetAssignmentForm = () => {
    setShowAssignmentForm(false);
    setSelectedTeacherForAssignment(null);
    setAssignmentFormData({
      classId: '',
      teacherId: '',
      subjects: []
    });
  };

  // Statistics
  const stats = {
    totalClasses: classes.length,
    totalStudents: classes.reduce((sum, c) => sum + c.enrolled, 0),
    avgCapacity: Math.round(classes.reduce((sum, c) => sum + c.capacity, 0) / classes.length),
    gradeCount: new Set(classes.map(c => c.gradeLevel)).size
  };

  return (
    <div className="admin-class-management">
      {/* Header */}
      <div className="admin-class-header">
        <h1>Class Management</h1>
        {activeTab === 'classes' && (
          <button className="admin-btn-primary" onClick={() => setShowClassForm(true)}>
            <Plus size={18} /> Add New Class
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="admin-tabs-container">
        <button 
          className={`admin-tab-btn ${activeTab === 'classes' ? 'active' : ''}`}
          onClick={() => { setActiveTab('classes'); setSearchTerm(''); setFilterGrade('All'); }}
        >
          <BookOpen size={18} />
          Classes ({stats.totalClasses})
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => { setActiveTab('schedule'); setSearchTerm(''); }}
        >
          <Calendar size={18} />
          Schedules
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`}
          onClick={() => { setActiveTab('subjects'); setSearchTerm(''); }}
        >
          <BookOpen size={18} />
          Subjects
        </button>
        <button 
          className={`admin-tab-btn ${activeTab === 'assign-teachers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('assign-teachers'); setSearchTerm(''); }}
        >
          <Users size={18} />
          Assign Teachers
        </button>
      </div>

      {/* Statistics */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <h3>Total Classes</h3>
          <p className="admin-stat-number">{stats.totalClasses}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Total Students</h3>
          <p className="admin-stat-number">{stats.totalStudents}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Grade Levels</h3>
          <p className="admin-stat-number">{stats.gradeCount}</p>
        </div>
        <div className="admin-stat-card">
          <h3>Avg. Capacity</h3>
          <p className="admin-stat-number">{stats.avgCapacity}</p>
        </div>
      </div>

      {/* Class Form Modal */}
      {showClassForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h2>{editingClassId ? 'Edit Class' : 'Add New Class'}</h2>
            
            <div className="admin-form-group">
              <label>Class Name *</label>
              <input
                type="text"
                name="name"
                value={classFormData.name}
                onChange={handleClassInputChange}
                placeholder="e.g., Grade 1-A"
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Grade Level *</label>
                <select name="gradeLevel" value={classFormData.gradeLevel} onChange={handleClassInputChange}>
                  <option value="">Select Grade Level</option>
                  <option value="Kindergarten">Kindergarten</option>
                  <option value="Grade 1">Grade 1</option>
                  <option value="Grade 2">Grade 2</option>
                  <option value="Grade 3">Grade 3</option>
                  <option value="Grade 4">Grade 4</option>
                  <option value="Grade 5">Grade 5</option>
                  <option value="Grade 6">Grade 6</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label>Teacher *</label>
                <select name="teacher" value={classFormData.teacher} onChange={handleClassInputChange}>
                  <option value="">Select Teacher</option>
                  {teachers.map(teacher => (
                    <option key={teacher.id} value={teacher.name}>{teacher.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  value={classFormData.capacity}
                  onChange={handleClassInputChange}
                  placeholder="e.g., 30"
                />
              </div>

              <div className="admin-form-group">
                <label>Currently Enrolled</label>
                <input
                  type="number"
                  name="enrolled"
                  value={classFormData.enrolled}
                  onChange={handleClassInputChange}
                  placeholder="e.g., 28"
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Schedule</label>
              <input
                type="text"
                name="schedule"
                value={classFormData.schedule}
                onChange={handleClassInputChange}
                placeholder="e.g., Mon-Fri, 8:00 AM - 3:00 PM"
              />
            </div>

            <div className="admin-form-group">
              <label>Subjects</label>
              <div className="admin-subjects-grid">
                {availableSubjects.map(subject => (
                  <label key={subject} className="admin-subject-checkbox">
                    <input
                      type="checkbox"
                      checked={classFormData.subjects.includes(subject)}
                      onChange={() => handleSubjectToggle(subject)}
                    />
                    {subject}
                  </label>
                ))}
              </div>
            </div>

            <div className="admin-form-actions">
              <button className="admin-btn-secondary" onClick={resetClassForm}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSaveClass}>
                {editingClassId ? 'Update Class' : 'Save Class'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="admin-class-controls">
        <div className="admin-search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by class name or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {activeTab === 'classes' && (
          <div className="admin-filter-box">
            <Filter size={18} />
            <select value={filterGrade} onChange={(e) => setFilterGrade(e.target.value)}>
              {gradelevels.map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* CLASSES VIEW */}
      {activeTab === 'classes' && (
        <div className="admin-classes-container">
          {filteredClasses.length > 0 ? (
            <div className="admin-classes-grid">
              {filteredClasses.map(cls => (
                <div key={cls.id} className="admin-class-card">
                  <div className="admin-class-card-header">
                    <div>
                      <h3>{cls.name}</h3>
                      <p className="admin-class-grade">{cls.gradeLevel}</p>
                    </div>
                    <div className="admin-card-actions">
                      <button 
                        className="admin-btn-edit" 
                        onClick={() => handleEditClass(cls)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="admin-btn-delete" 
                        onClick={() => handleDeleteClass(cls.id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="admin-class-card-body">
                    <div className="admin-info-row">
                      <span className="label">Teacher:</span>
                      <span className="value">{cls.teacher}</span>
                    </div>

                    <div className="admin-info-row">
                      <span className="label">Enrollment:</span>
                      <span className="value admin-enrollment-bar">
                        {cls.enrolled}/{cls.capacity}
                        <div className="admin-progress-bar">
                          <div className="admin-progress-fill" style={{ width: `${(cls.enrolled/cls.capacity)*100}%` }}></div>
                        </div>
                      </span>
                    </div>

                    <div className="admin-info-row">
                      <span className="label">Schedule:</span>
                      <span className="value"><Clock size={14} /> {cls.schedule}</span>
                    </div>

                    <div className="admin-subjects-section">
                      <p className="admin-subjects-label">Subjects:</p>
                      <div className="admin-subjects-list">
                        {cls.subjects.map((subject, idx) => (
                          <span key={idx} className="admin-subject-tag">{subject}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="admin-no-results">
              <BookOpen size={48} />
              <p>No classes found. Try adjusting your search or filters.</p>
            </div>
          )}
        </div>
      )}

      {/* SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div className="admin-schedule-container">
          <table className="admin-schedule-table">
            <thead>
              <tr>
                <th>Class</th>
                <th>Grade</th>
                <th>Teacher</th>
                <th>Schedule</th>
                <th>Students</th>
                <th>Subjects</th>
              </tr>
            </thead>
            <tbody>
              {filteredClasses.map(cls => (
                <tr key={cls.id}>
                  <td><strong>{cls.name}</strong></td>
                  <td>{cls.gradeLevel}</td>
                  <td>{cls.teacher}</td>
                  <td><Calendar size={14} /> {cls.schedule}</td>
                  <td>
                    <span className="admin-enrollment-badge">
                      <Users size={14} /> {cls.enrolled}/{cls.capacity}
                    </span>
                  </td>
                  <td>
                    <div className="admin-subjects-list">
                      {cls.subjects.slice(0, 2).map((s, i) => (
                        <span key={i} className="admin-subject-tag-small">{s}</span>
                      ))}
                      {cls.subjects.length > 2 && (
                        <span className="admin-subject-tag-small">+{cls.subjects.length - 2}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* SUBJECTS VIEW */}
      {activeTab === 'subjects' && (
        <div className="admin-subjects-view">
          <div className="admin-section-header">
            <h2>Subject Management</h2>
            <button className="admin-btn-primary" onClick={() => setShowSubjectForm(!showSubjectForm)}>
              <Plus size={18} /> Add Subject
            </button>
          </div>

          {showSubjectForm && (
            <div className="admin-form-card">
              <div className="admin-form-group">
                <label>New Subject</label>
                <div className="admin-input-group">
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="Enter subject name..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddSubject()}
                  />
                  <button className="admin-btn-primary" onClick={handleAddSubject}>Add</button>
                  <button className="admin-btn-secondary" onClick={() => { setShowSubjectForm(false); setNewSubject(''); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <div className="admin-subjects-grid-view">
            {availableSubjects.map((subject, idx) => {
              const classesWithSubject = classes.filter(c => c.subjects.includes(subject));
              return (
                <div key={idx} className="admin-subject-card">
                  <div className="admin-subject-card-header">
                    <h3>{subject}</h3>
                    <button 
                      className="admin-btn-delete" 
                      onClick={() => handleDeleteSubject(subject)}
                      title="Delete subject"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="admin-subject-info">
                    <p><strong>Classes: {classesWithSubject.length}</strong></p>
                    {classesWithSubject.length > 0 && (
                      <div className="admin-classes-list">
                        {classesWithSubject.map(cls => (
                          <span key={cls.id} className="admin-class-tag">{cls.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ASSIGN TEACHERS FORM MODAL */}
      {showAssignmentForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h2>Assign Teacher to Class</h2>
            
            <div className="admin-form-group">
              <label>Select Class *</label>
              <select 
                value={assignmentFormData.classId} 
                onChange={(e) => setAssignmentFormData({ ...assignmentFormData, classId: e.target.value })}
              >
                <option value="">Select a class...</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name} - {cls.gradeLevel}</option>
                ))}
              </select>
            </div>

            {assignmentFormData.classId && (
              <div className="admin-form-group">
                <label>Select Subjects to Teach *</label>
                <div className="admin-subjects-grid">
                  {classes.find(c => c.id == assignmentFormData.classId)?.subjects.map(subject => (
                    <label key={subject} className="admin-subject-checkbox">
                      <input
                        type="checkbox"
                        checked={assignmentFormData.subjects.includes(subject)}
                        onChange={() => handleAssignmentSubjectToggle(subject)}
                      />
                      {subject}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="admin-form-actions">
              <button className="admin-btn-secondary" onClick={resetAssignmentForm}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSaveAssignment}>Save Assignment</button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN TEACHERS VIEW */}
      {activeTab === 'assign-teachers' && (
        <div className="admin-assign-teachers-view">
          <div className="admin-section-header">
            <h2>Teacher Assignments & Management</h2>
            <button className="admin-btn-primary" onClick={() => setShowTeacherForm(!showTeacherForm)}>
              <Plus size={18} /> Add Teacher
            </button>
          </div>

          {showTeacherForm && (
            <div className="admin-form-card">
              <div className="admin-form-group">
                <label>New Teacher Name</label>
                <div className="admin-input-group">
                  <input
                    type="text"
                    value={newTeacher}
                    onChange={(e) => setNewTeacher(e.target.value)}
                    placeholder="Enter teacher name..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTeacher()}
                  />
                  <button className="admin-btn-primary" onClick={handleAddTeacher}>Add</button>
                  <button className="admin-btn-secondary" onClick={() => { setShowTeacherForm(false); setNewTeacher(''); }}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          {/* Teacher Cards with Assignments */}
          <div className="admin-teachers-grid">
            {teachers.map((teacher) => {
              const assignments = teacherAssignments[teacher.id] || {};
              const assignedClasses = Object.keys(assignments).map(classId => 
                classes.find(c => c.id == classId)
              ).filter(Boolean);
              const totalStudents = assignedClasses.reduce((sum, cls) => sum + cls.enrolled, 0);

              return (
                <div key={teacher.id} className="admin-teacher-card-large">
                  <div className="admin-teacher-card-header-large">
                    <div>
                      <h3>{teacher.name}</h3>
                      <p className="admin-teacher-credentials">{teacher.qualifications}</p>
                    </div>
                    <button 
                      className="admin-btn-delete" 
                      onClick={() => handleDeleteTeacher(teacher.id, teacher.name)}
                      title="Delete teacher"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="admin-teacher-card-body-large">
                    <div className="admin-teacher-stats">
                      <div className="admin-teacher-stat">
                        <span className="admin-stat-label">Experience</span>
                        <span className="admin-stat-value">{teacher.experience}</span>
                      </div>
                      <div className="admin-teacher-stat">
                        <span className="admin-stat-label">Classes Assigned</span>
                        <span className="admin-stat-value">{assignedClasses.length}</span>
                      </div>
                      <div className="admin-teacher-stat">
                        <span className="admin-stat-label">Total Students</span>
                        <span className="admin-stat-value">{totalStudents}</span>
                      </div>
                    </div>

                    {/* Assignments List */}
                    <div className="admin-assignments-section">
                      <h4>Class Assignments</h4>
                      {assignedClasses.length > 0 ? (
                        <div className="admin-assignments-list">
                          {assignedClasses.map(cls => (
                            <div key={cls.id} className="admin-assignment-item">
                              <div className="admin-assignment-info">
                                <strong>{cls.name}</strong>
                                <span className="admin-assignment-grade">{cls.gradeLevel}</span>
                              </div>
                              <div className="admin-assignment-subjects">
                                {assignments[cls.id]?.map(subject => (
                                  <span key={subject} className="admin-assignment-subject-tag">{subject}</span>
                                ))}
                              </div>
                              <button
                                className="admin-btn-delete-small"
                                onClick={() => handleRemoveAssignment(teacher.id, cls.id)}
                                title="Remove assignment"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="admin-no-assignments">No classes assigned yet</p>
                      )}
                    </div>

                    {/* Add Assignment Button */}
                    <button 
                      className="admin-btn-primary-outline"
                      onClick={() => handleOpenAssignmentForm(teacher.id)}
                    >
                      <Plus size={16} /> Add Class Assignment
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {teachers.length === 0 && (
            <div className="admin-no-results">
              <Users size={48} />
              <p>No teachers added yet. Create a teacher to get started.</p>
            </div>
          )}
        </div>
      )}

      {/* Developer Notes */}
      <div className="admin-note">
        📌 <strong>Development Notes:</strong> 
        <ul>
          <li>Connect to backend API for class CRUD operations (POST, PUT, DELETE)</li>
          <li>Sync teacher assignments with User Management (Teachers)</li>
          <li>Implement real schedule/timetable system</li>
          <li>Add room management and capacity alerts</li>
        </ul>
      </div>
    </div>
  );
};

export default ClassManagement;
