import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2, BookOpen, Save, X, UserCheck } from 'lucide-react';
import { apiFetch } from '../api/apiFetch';
import '../AdminWebsiteCSS/UserManagement.css'; /* reuse same table styles */

const Subjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);

  // create
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', assigned_teacher: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // inline edit
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', assigned_teacher: '' });

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await apiFetch('/api/accounts/subjects/');
      if (res.ok) setSubjects(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  const fetchTeachers = useCallback(async () => {
    try {
      const res = await apiFetch('/api/accounts/users/?role=TEACHER');
      if (res.ok) setTeachers(await res.json());
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchSubjects(), fetchTeachers()]);
      setLoading(false);
    })();
  }, [fetchSubjects, fetchTeachers]);

  // create
  const handleCreate = async () => {
    setFormError('');
    if (!form.name || !form.code) { setFormError('Name and code are required.'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, code: form.code };
      if (form.assigned_teacher) payload.assigned_teacher = Number(form.assigned_teacher);
      const res = await apiFetch('/api/accounts/subjects/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || JSON.stringify(err));
      }
      setShowForm(false);
      setForm({ name: '', code: '', assigned_teacher: '' });
      await Promise.all([fetchSubjects(), fetchTeachers()]);
    } catch (e) { setFormError(e.message); }
    finally { setSaving(false); }
  };

  // inline edit
  const startEdit = (subj) => {
    const currentTeacher = subj.teachers && subj.teachers.length > 0 ? String(subj.teachers[0].id) : '';
    setEditingId(subj.id);
    setEditForm({ name: subj.name, code: subj.code, assigned_teacher: currentTeacher });
  };

  const saveEdit = async (id) => {
    try {
      const payload = { name: editForm.name, code: editForm.code };
      if (editForm.assigned_teacher) {
        payload.assigned_teacher = Number(editForm.assigned_teacher);
      } else {
        payload.assigned_teacher = null; // unassign
      }
      const res = await apiFetch(`/api/accounts/subjects/${id}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to update');
      setEditingId(null);
      await Promise.all([fetchSubjects(), fetchTeachers()]);
    } catch (e) { alert(e.message); }
  };

  // delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject? Teachers assigned to it will become unassigned.')) return;
    try {
      await apiFetch(`/api/accounts/subjects/${id}/`, { method: 'DELETE' });
      await Promise.all([fetchSubjects(), fetchTeachers()]);
    } catch (e) { alert(e.message); }
  };

  // helpers — figure out which teachers are available for a dropdown
  // (not already assigned to another subject, unless it's the current subject)
  const getAvailableTeachers = (currentSubjectId = null) => {
    const assignedIds = new Set();
    subjects.forEach((s) => {
      if (s.id === currentSubjectId) return; // skip the subject being edited
      (s.teachers || []).forEach((t) => assignedIds.add(t.id));
    });
    return teachers.filter((t) => !assignedIds.has(t.id));
  };

  if (loading) {
    return (
      <div className="user-management">
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading subjects…</div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="user-header">
        <h1>Subjects</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add Subject
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card"><h3>Total Subjects</h3><p className="stat-number">{subjects.length}</p></div>
        <div className="stat-card"><h3>Teachers Available</h3><p className="stat-number">{teachers.length}</p></div>
      </div>

      {/* Create modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Subject</h2>
            {formError && <div className="form-error">{formError}</div>}
            <div className="form-group">
              <label>Subject Name *</label>
              <input type="text" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Mathematics" />
            </div>
            <div className="form-group">
              <label>Subject Code *</label>
              <input type="text" value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="e.g. MATH" />
            </div>
            <div className="form-group">
              <label>Assign Teacher</label>
              <select value={form.assigned_teacher}
                onChange={(e) => setForm({ ...form, assigned_teacher: e.target.value })}>
                <option value="">— No teacher —</option>
                {getAvailableTeachers().map((t) => (
                  <option key={t.id} value={t.id}>{t.username}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? 'Saving…' : 'Save Subject'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="users-container">
        {subjects.length > 0 ? (
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Subject Name</th>
                <th>Code</th>
                <th>Assigned Teacher</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.map((s) => {
                const isEditing = editingId === s.id;
                const assignedTeacher = s.teachers && s.teachers.length > 0 ? s.teachers[0] : null;
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>
                      {isEditing ? (
                        <input type="text" className="inline-input" value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                      ) : <strong>{s.name}</strong>}
                    </td>
                    <td>
                      {isEditing ? (
                        <input type="text" className="inline-input" value={editForm.code}
                          onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} />
                      ) : s.code}
                    </td>
                    <td>
                      {isEditing ? (
                        <select className="inline-select" value={editForm.assigned_teacher}
                          onChange={(e) => setEditForm({ ...editForm, assigned_teacher: e.target.value })}>
                          <option value="">— None —</option>
                          {getAvailableTeachers(s.id).map((t) => (
                            <option key={t.id} value={t.id}>{t.username}</option>
                          ))}
                          {/* Keep the currently assigned teacher in the list even if they'd normally be filtered */}
                          {assignedTeacher && !getAvailableTeachers(s.id).find((t) => t.id === assignedTeacher.id) && (
                            <option key={assignedTeacher.id} value={assignedTeacher.id}>{assignedTeacher.username}</option>
                          )}
                        </select>
                      ) : assignedTeacher ? (
                        <span className="badge-subject">
                          <UserCheck size={14} style={{ marginRight: 4 }} />
                          {assignedTeacher.username}
                        </span>
                      ) : (
                        <span className="badge-none">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {isEditing ? (
                          <>
                            <button className="btn-save" onClick={() => saveEdit(s.id)} title="Save"><Save size={16} /></button>
                            <button className="btn-cancel-sm" onClick={() => setEditingId(null)} title="Cancel"><X size={16} /></button>
                          </>
                        ) : (
                          <>
                            <button className="btn-edit" onClick={() => startEdit(s)} title="Edit"><Edit2 size={16} /></button>
                            <button className="btn-delete" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={16} /></button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="no-results">
            <BookOpen size={48} />
            <p>No subjects created yet. Add one above to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subjects;
