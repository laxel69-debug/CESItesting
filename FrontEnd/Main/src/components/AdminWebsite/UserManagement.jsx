import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Search, Filter, Users,
  BookOpen, GraduationCap, Save, X,
} from 'lucide-react';
import { apiFetch } from '../api/apiFetch';
import '../AdminWebsiteCSS/UserManagement.css';

const UserManagement = () => {
  // ── data ──
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── UI ──
  const [activeTab, setActiveTab] = useState('students');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // create teacher modal
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    username: '', email: '', password: '',
    subject: '', section_teacher: '', employee_id: '',
  });
  const [createError, setCreateError] = useState('');
  const [creating, setCreating] = useState(false);

  // inline assignment editing
  const [editingId, setEditingId] = useState(null);
  const [assignForm, setAssignForm] = useState({ subject: '', section: '', employee_id: '' });
  const [assignError, setAssignError] = useState('');

  // ── fetchers ──
  const fetchStudents = useCallback(async () => {
    try {
      const res = await apiFetch('/api/accounts/users/?role=PARENT_STUDENT');
      if (res.ok) setStudents(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/accounts/users/?role=TEACHER');
      if (res.ok) setTeachers(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await apiFetch('/api/accounts/subjects/');
      if (res.ok) setSubjects(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchSections = useCallback(async () => {
    try {
      const res = await apiFetch('/api/accounts/sections/');
      if (res.ok) setSections(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchStudents(), fetchTeachers(), fetchSubjects(), fetchSections()]);
      setLoading(false);
    })();
  }, [fetchStudents, fetchTeachers, fetchSubjects, fetchSections]);

  // ── helpers ──
  const studentName = (u) => {
    const p = u.profile;
    if (!p) return u.username;
    return `${p.student_first_name} ${p.student_last_name}`;
  };
    const gradeLabelFromProfile = (raw) => {
    if (raw == null) return "—";

    const v = String(raw).trim();

    // Already pretty labels
    const pretty = new Set([
      "Pre-Kinder", "Kinder",
      "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6",
    ]);
    if (pretty.has(v)) return v;

    // Numeric legacy: "1".."6"
    if (/^\d+$/.test(v)) return `Grade ${v}`;

    // Code-based: prek/kinder/grade1..grade6
      const map = {
        prek: "Pre-Kinder",
        kinder: "Kinder",
        grade1: "Grade 1",
        grade2: "Grade 2",
        grade3: "Grade 3",
        grade4: "Grade 4",
        grade5: "Grade 5",
        grade6: "Grade 6",
      };
      const key = v.toLowerCase();
      return map[key] || v; // fallback: show whatever it is
    };

  const parentName = (u) => {
    const p = u.profile;
    if (!p) return '—';
    return `${p.parent_first_name} ${p.parent_last_name}`;
  };

  // ── filter ──
  const filteredStudents = students.filter((u) => {
    const name = studentName(u).toLowerCase();
    const parent = parentName(u).toLowerCase();
    const matchSearch =
      name.includes(searchTerm.toLowerCase()) ||
      parent.includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
      const statusCode = String(u.status || "INACTIVE").toUpperCase();
const matchStatus = filterStatus === "All" || statusCode === filterStatus.toUpperCase();
    return matchSearch && matchStatus;
  });

  const filteredTeachers = teachers.filter((u) => {
    const subjectName = u.teacher_profile?.subject?.name || '';
    const matchSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subjectName.toLowerCase().includes(searchTerm.toLowerCase());
   const statusCode = String(u.status || "INACTIVE").toUpperCase();
const matchStatus = filterStatus === "All" || statusCode === filterStatus.toUpperCase();
    return matchSearch && matchStatus;
  });

  // ── create teacher ──
  const handleCreateTeacher = async () => {
    setCreateError('');
    if (!createForm.username || !createForm.email || !createForm.password) {
      setCreateError('Username, email and password are required.');
      return;
    }
    setCreating(true);
    try {
      const body = {
        username: createForm.username,
        email: createForm.email,
        password: createForm.password,
        role: 'TEACHER',
        employee_id: createForm.employee_id || '',
      };
      if (createForm.subject) body.subject = parseInt(createForm.subject);
      if (createForm.section_teacher) body.section_teacher = parseInt(createForm.section_teacher);

      const res = await apiFetch('/api/accounts/admin/create-user/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || data.errors?.detail || JSON.stringify(data.errors || data));
      }
      setShowCreateForm(false);
      setCreateForm({ username: '', email: '', password: '', subject: '', section_teacher: '', employee_id: '' });
      fetchTeachers();
    } catch (e) {
      setCreateError(e.message);
    } finally {
      setCreating(false);
    }
  };

  // ── inline assignment ──
  const startEdit = (teacher) => {
    setEditingId(teacher.id);
    setAssignForm({
      subject: teacher.teacher_profile?.subject?.id || '',
      section: teacher.teacher_profile?.section?.id || '',
      employee_id: teacher.teacher_profile?.employee_id || '',
    });
    setAssignError('');
  };

  const cancelEdit = () => { setEditingId(null); setAssignError(''); };

  const saveAssignment = async (userId) => {
    setAssignError('');
    try {
      const body = {
        subject: assignForm.subject ? parseInt(assignForm.subject) : null,
        section: assignForm.section ? parseInt(assignForm.section) : null,
        employee_id: assignForm.employee_id || '',
      };
      const res = await apiFetch(`/api/accounts/users/${userId}/assign/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || JSON.stringify(err));
      }
      setEditingId(null);
      fetchTeachers();
    } catch (e) {
      setAssignError(e.message);
    }
  };

  // ── stats ──
  const studentStats = {
    total: students.length,
    active: students.filter((s) => s.status === 'ACTIVE').length,
    inactive: students.filter((s) => s.status !== 'ACTIVE').length,
  };
  const teacherStats = {
    total: teachers.length,
    active: teachers.filter((t) => t.status === 'ACTIVE').length,
    assigned: teachers.filter((t) => t.teacher_profile?.subject).length,
  };

  if (loading) {
    return (
      <div className="user-management">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading users…</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      {/* Header */}
      <div className="user-header">
        <h1>User Management</h1>
        {activeTab === 'teachers' && (
          <button className="btn-primary" onClick={() => setShowCreateForm(true)}>
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
          <GraduationCap size={18} /> Students ({studentStats.total})
        </button>
        <button
          className={`tab-btn ${activeTab === 'teachers' ? 'active' : ''}`}
          onClick={() => { setActiveTab('teachers'); setSearchTerm(''); setFilterStatus('All'); }}
        >
          <BookOpen size={18} /> Teachers ({teacherStats.total})
        </button>
      </div>

      {/* Stats */}
      {activeTab === 'students' && (
        <div className="stats-grid">
          <div className="stat-card"><h3>Total Students</h3><p className="stat-number">{studentStats.total}</p></div>
          <div className="stat-card"><h3>Active</h3><p className="stat-number active">{studentStats.active}</p></div>
          <div className="stat-card"><h3>Inactive</h3><p className="stat-number inactive">{studentStats.inactive}</p></div>
        </div>
      )}
      {activeTab === 'teachers' && (
        <div className="stats-grid">
          <div className="stat-card"><h3>Total Teachers</h3><p className="stat-number">{teacherStats.total}</p></div>
          <div className="stat-card"><h3>Active</h3><p className="stat-number active">{teacherStats.active}</p></div>
          <div className="stat-card"><h3>Assigned to Subject</h3><p className="stat-number">{teacherStats.assigned}</p></div>
        </div>
      )}

      {/* ── Create Teacher Modal ── */}
      {showCreateForm && (
        <div className="modal-overlay" onClick={() => setShowCreateForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Teacher</h2>
            {createError && <div className="form-error">{createError}</div>}

            <div className="form-group">
              <label>Username *</label>
              <input type="text" value={createForm.username}
                onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                placeholder="teacher_username" />
            </div>
            <div className="form-group">
              <label>Email *</label>
              <input type="email" value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                placeholder="teacher@school.edu" />
            </div>
            <div className="form-group">
              <label>Password *</label>
              <input type="password" value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                placeholder="Min 6 characters" />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Subject</label>
                <select value={createForm.subject}
                  onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}>
                  <option value="">— None —</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Section</label>
                <select value={createForm.section_teacher}
                  onChange={(e) => setCreateForm({ ...createForm, section_teacher: e.target.value })}>
                  <option value="">— None —</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>G{s.grade_level} – {s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Employee ID</label>
              <input type="text" value={createForm.employee_id}
                onChange={(e) => setCreateForm({ ...createForm, employee_id: e.target.value })}
                placeholder="Optional" />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowCreateForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreateTeacher} disabled={creating}>
                {creating ? 'Creating…' : 'Create Teacher'}
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
            placeholder={activeTab === 'students'
              ? 'Search students by name, parent, or email...'
              : 'Search teachers by name, subject, or email...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* ── STUDENTS TABLE ── */}
      {activeTab === 'students' && (
        <div className="users-container">
          {filteredStudents.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>LRN</th>
                  <th>Grade Level</th>
                  
                  <th>Section</th>
                  <th>Parent / Guardian</th>
                  <th>Email</th>
                  <th>Contact</th>
                  
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((u) => (
                  <tr key={u.id}>
                    <td><strong>{studentName(u)}</strong></td>
                    <td>{u.profile?.lrn || "—"}</td>
                    <td>{gradeLabelFromProfile(u.profile?.grade_level)}</td>
                    <td>{u.profile?.section ? u.profile.section.name : '—'}</td>
                    <td>{parentName(u)}</td>
                    <td><a href={`mailto:${u.email}`}>{u.email}</a></td>
                    <td>{u.profile?.contact_number || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-results"><Users size={48} /><p>No students found.</p></div>
          )}
        </div>
      )}

      {/* ── TEACHERS TABLE ── */}
      {activeTab === 'teachers' && (
        <div className="users-container">
          {assignError && <div className="form-error" style={{ marginBottom: '1rem' }}>{assignError}</div>}
          {filteredTeachers.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Employee ID</th>
                  <th>Subject</th>
                  <th>Section</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeachers.map((u) => {
                  const isEditing = editingId === u.id;
                  const tp = u.teacher_profile;
                  return (
                    <tr key={u.id}>
                      <td><strong>{u.username}</strong></td>
                      <td>{u.email}</td>
                      <td>
                        {isEditing ? (
                          <input type="text" className="inline-input" value={assignForm.employee_id}
                            onChange={(e) => setAssignForm({ ...assignForm, employee_id: e.target.value })} />
                        ) : (tp?.employee_id || '—')}
                      </td>
                      <td>
                        {isEditing ? (
                          <select className="inline-select" value={assignForm.subject}
                            onChange={(e) => setAssignForm({ ...assignForm, subject: e.target.value })}>
                            <option value="">— None —</option>
                            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        ) : tp?.subject ? (
                          <span className="badge-subject">{tp.subject.name}</span>
                        ) : (
                          <span className="badge-none">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <select className="inline-select" value={assignForm.section}
                            onChange={(e) => setAssignForm({ ...assignForm, section: e.target.value })}>
                            <option value="">— None —</option>
                            {sections.map((s) => (
                              <option key={s.id} value={s.id}>G{s.grade_level} – {s.name}</option>
                            ))}
                          </select>
                        ) : tp?.section ? `G${tp.section.grade_level} – ${tp.section.name}` : '—'}
                      </td>
                      <td><span className={`status-badge ${u.status.toLowerCase()}`}>{u.status}</span></td>
                      <td>
                        <div className="action-buttons">
                          {isEditing ? (
                            <>
                              <button className="btn-save" onClick={() => saveAssignment(u.id)} title="Save">
                                <Save size={16} />
                              </button>
                              <button className="btn-cancel-sm" onClick={cancelEdit} title="Cancel">
                                <X size={16} />
                              </button>
                            </>
                          ) : (
                            <button className="btn-edit" onClick={() => startEdit(u)} title="Edit Assignment">
                              <Edit2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="no-results"><BookOpen size={48} /><p>No teachers found.</p></div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
