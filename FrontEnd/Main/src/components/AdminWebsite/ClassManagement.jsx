import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, Search, Filter, Clock, Users, BookOpen,
  Calendar, Save, X, UserCheck, Zap, ChevronDown, CheckSquare,
} from 'lucide-react';
import StatCard, { StatsGrid } from './StatCard';
import { apiFetch } from '../api/apiFetch';
import '../AdminWebsiteCSS/AdminClassManagement.css';

/* ───────────────────────── helpers ───────────────────────── */
const GRADE_LEVELS = [
  { value: 0, label: 'Kinder' },
  { value: 1, label: 'Grade 1' },
  { value: 2, label: 'Grade 2' },
  { value: 3, label: 'Grade 3' },
  { value: 4, label: 'Grade 4' },
  { value: 5, label: 'Grade 5' },
  { value: 6, label: 'Grade 6' },
];

const DAYS = [
  { value: 'MON', label: 'Monday' },
  { value: 'TUE', label: 'Tuesday' },
  { value: 'WED', label: 'Wednesday' },
  { value: 'THU', label: 'Thursday' },
  { value: 'FRI', label: 'Friday' },
];

const TIME_SLOTS = [];
for (let h = 8; h <= 15; h++) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  TIME_SLOTS.push({ hour: h, label: `${display}:00 ${ampm}` });
}

const gradeLabel = (lvl) => GRADE_LEVELS.find((g) => g.value === lvl)?.label ?? `Grade ${lvl}`;
const dayLabel = (code) => DAYS.find((d) => d.value === code)?.label ?? code;

const COLORS = [
  '#cfe2ff', '#d1e7dd', '#fff3cd', '#f8d7da',
  '#e2d9f3', '#d4edda', '#fce4ec', '#e0f7fa',
];
const colorFor = (id) => COLORS[id % COLORS.length];

/* helper: does this schedule overlap the given hour? */
const overlapsHour = (s, dayCode, hour) => {
  if (s.day_of_week !== dayCode) return false;
  const sh = parseInt(s.start_time, 10);
  const eh = parseInt(s.end_time, 10);
  return sh <= hour && eh > hour;
};

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */
const ClassManagement = () => {
  const [activeTab, setActiveTab] = useState('classes');
  const [loading, setLoading] = useState(true);

  /* data from API */
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [schedules, setSchedules] = useState([]);

  /* fetchers */
  const fetchSections = useCallback(async () => {
    try { const r = await apiFetch('/api/accounts/sections/'); if (r.ok) setSections(await r.json()); } catch (e) { console.error(e); }
  }, []);
  const fetchSubjects = useCallback(async () => {
    try { const r = await apiFetch('/api/accounts/subjects/'); if (r.ok) setSubjects(await r.json()); } catch (e) { console.error(e); }
  }, []);
  const fetchTeachers = useCallback(async () => {
    try { const r = await apiFetch('/api/accounts/users/?role=TEACHER'); if (r.ok) setTeachers(await r.json()); } catch (e) { console.error(e); }
  }, []);
  const fetchSchedules = useCallback(async () => {
    try { const r = await apiFetch('/api/classmanagement/schedules/'); if (r.ok) setSchedules(await r.json()); } catch (e) { console.error(e); }
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await Promise.all([fetchSections(), fetchSubjects(), fetchTeachers(), fetchSchedules()]);
      setLoading(false);
    })();
  }, [fetchSections, fetchSubjects, fetchTeachers, fetchSchedules]);

  /* stats */
  const totalStudents = sections.reduce((s, sec) => s + (sec.student_count || 0), 0);

  /* single refresh-all helper so deletes in one tab update counts everywhere */
  const refreshAll = useCallback(() =>
    Promise.all([fetchSections(), fetchSubjects(), fetchTeachers(), fetchSchedules()]),
    [fetchSections, fetchSubjects, fetchTeachers, fetchSchedules]);

  if (loading) return (
    <div className="admin-class-management">
      <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Loading…</div>
    </div>
  );

  return (
    <div className="admin-class-management">
      <div className="admin-class-header"><h1>Class Management</h1></div>

      {/* Tabs */}
      <div className="admin-tabs-container">
        <button className={`admin-tab-btn ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>
          <BookOpen size={18} /> Classes ({sections.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`} onClick={() => setActiveTab('schedule')}>
          <Calendar size={18} /> Schedules ({schedules.length})
        </button>
        <button className={`admin-tab-btn ${activeTab === 'subjects' ? 'active' : ''}`} onClick={() => setActiveTab('subjects')}>
          <BookOpen size={18} /> Subjects ({subjects.length})
        </button>
      </div>

      <StatsGrid>
        <StatCard label="Sections" value={sections.length} icon={<BookOpen size={22} />} color="blue" />
        <StatCard label="Total Students" value={totalStudents} icon={<Users size={22} />} color="green" />
        <StatCard label="Subjects" value={subjects.length} icon={<BookOpen size={22} />} color="yellow" />
        <StatCard label="Schedule Entries" value={schedules.length} icon={<Clock size={22} />} color="purple" />
      </StatsGrid>

      {activeTab === 'classes' && (
        <ClassesTab sections={sections} teachers={teachers} schedules={schedules}
          onRefresh={refreshAll} />
      )}
      {activeTab === 'schedule' && (
        <SchedulesTab sections={sections} subjects={subjects} teachers={teachers} schedules={schedules} onRefresh={refreshAll} />
      )}
      {activeTab === 'subjects' && (
        <SubjectsTab subjects={subjects} teachers={teachers} onRefresh={refreshAll} />
      )}
    </div>
  );
};

/* ═════════════════════════════════════════════════════════
   CLASSES TAB — sections list + homeroom teacher
   ═════════════════════════════════════════════════════════ */
function ClassesTab({ sections, teachers, schedules, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', grade_level: '', adviser: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const teacherProfiles = teachers.filter((t) => t.teacher_profile).map((t) => ({
    userId: t.id, profileId: t.teacher_profile.id, username: t.username,
  }));

  const openNew = () => { setEditId(null); setForm({ name: '', grade_level: '', adviser: '' }); setError(''); setShowForm(true); };
  const openEdit = (sec) => {
    setEditId(sec.id);
    setForm({ name: sec.name, grade_level: String(sec.grade_level), adviser: sec.adviser ? String(sec.adviser) : '' });
    setError(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name || form.grade_level === '') { setError('Name and grade level are required.'); return; }
    setSaving(true); setError('');
    try {
      const payload = { name: form.name, grade_level: Number(form.grade_level), adviser: form.adviser ? Number(form.adviser) : null };
      const url = editId ? `/api/accounts/sections/${editId}/` : '/api/accounts/sections/';
      const r = await apiFetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || JSON.stringify(e)); }
      setShowForm(false); await onRefresh();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this section? This will also remove related schedules.')) return;
    try {
      const r = await apiFetch(`/api/accounts/sections/${id}/`, { method: 'DELETE' });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `Delete failed (${r.status})`);
      }
      await onRefresh();
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  return (
    <>
      <div className="admin-section-header" style={{ marginBottom: 16 }}>
        <h2>Sections &amp; Homeroom Teachers</h2>
        <button className="admin-btn-primary" onClick={openNew}><Plus size={18} /> Add Section</button>
      </div>

      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content">
            <h2>{editId ? 'Edit Section' : 'Add Section'}</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: 8 }}>{error}</div>}
            <div className="admin-form-group">
              <label>Section Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Gentleness" />
            </div>
            <div className="admin-form-group">
              <label>Grade Level *</label>
              <select value={form.grade_level} onChange={(e) => setForm({ ...form, grade_level: e.target.value })}>
                <option value="">Select…</option>
                {GRADE_LEVELS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label>Homeroom Teacher (Adviser)</label>
              <select value={form.adviser} onChange={(e) => setForm({ ...form, adviser: e.target.value })}>
                <option value="">— None —</option>
                {teacherProfiles.map((t) => <option key={t.profileId} value={t.profileId}>{t.username}</option>)}
              </select>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-classes-grid">
        {sections.length === 0 && (
          <div className="admin-no-results"><BookOpen size={48} /><p>No sections yet. Add one to get started.</p></div>
        )}
        {sections.map((sec) => {
          const sectionSchedules = schedules.filter((s) => s.section === sec.id);
          const subjectIds = [...new Set(sectionSchedules.map((s) => s.subject))];
          return (
            <div key={sec.id} className="admin-class-card">
              <div className="admin-class-card-header">
                <div>
                  <h3>{gradeLabel(sec.grade_level)} — {sec.name}</h3>
                  <p className="admin-class-grade">{gradeLabel(sec.grade_level)}</p>
                </div>
                <div className="admin-card-actions">
                  <button className="admin-btn-edit" onClick={() => openEdit(sec)} title="Edit"><Edit2 size={16} /></button>
                  <button className="admin-btn-delete" onClick={() => handleDelete(sec.id)} title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="admin-class-card-body">
                <div className="admin-info-row"><span className="label">Homeroom:</span><span className="value">{sec.adviser_name || <em style={{ color: '#94a3b8' }}>Unassigned</em>}</span></div>
                <div className="admin-info-row"><span className="label">Students:</span><span className="value"><Users size={14} /> {sec.student_count ?? 0}</span></div>
                <div className="admin-info-row"><span className="label">Subjects:</span><span className="value">{subjectIds.length} scheduled</span></div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ═════════════════════════════════════════════════════════
   SCHEDULES TAB — table + visual timeline + section filter
   ═════════════════════════════════════════════════════════ */
function SchedulesTab({ sections, subjects, teachers, schedules, onRefresh }) {
  const [filterSection, setFilterSection] = useState('');
  const [view, setView] = useState('timeline');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ teacher: '', subject: '', section: '', day_of_week: '', start_time: '', end_time: '', room: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [showBulkEdit, setShowBulkEdit] = useState(false);
  const [bulkForm, setBulkForm] = useState({ teacher: '', subject: '', section: '', day_of_week: '', start_time: '', end_time: '', room: '' });
  const [bulkSaving, setBulkSaving] = useState(false);

  const filtered = filterSection ? schedules.filter((s) => String(s.section) === filterSection) : schedules;

  /* selection helpers */
  const toggleSelect = (id) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((s) => s.id)));
  };
  const allSelected = filtered.length > 0 && selected.size === filtered.length;

  const handleBulkDelete = async () => {
    const ids = [...selected].filter((id) => filtered.some((s) => s.id === id));
    if (ids.length === 0) return;
    if (!window.confirm(`Delete ${ids.length} selected schedule entries?`)) return;
    setBulkDeleting(true);
    try {
      const r = await apiFetch('/api/classmanagement/schedules/bulk-delete/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Failed');
      setSelected(new Set());
      await onRefresh();
    } catch (e) { alert(e.message); }
    finally { setBulkDeleting(false); }
  };

  const openBulkEdit = () => {
    setBulkForm({ teacher: '', subject: '', section: '', day_of_week: '', start_time: '', end_time: '', room: '' });
    setShowBulkEdit(true);
  };
  const handleBulkEdit = async () => {
    const ids = [...selected].filter((id) => filtered.some((s) => s.id === id));
    if (ids.length === 0) return;
    const updates = {};
    Object.entries(bulkForm).forEach(([k, v]) => { if (v) updates[k] = k === 'start_time' || k === 'end_time' ? v + ':00' : v; });
    if (Object.keys(updates).length === 0) { alert('Fill in at least one field to update.'); return; }
    setBulkSaving(true);
    try {
      const r = await apiFetch('/api/classmanagement/schedules/bulk-update/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ids, updates }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Failed');
      alert(`Updated ${data.updated_count} schedule entries.`);
      setShowBulkEdit(false);
      setSelected(new Set());
      await onRefresh();
    } catch (e) { alert(e.message); }
    finally { setBulkSaving(false); }
  };

  const openNew = () => {
    setEditId(null);
    setForm({ teacher: '', subject: '', section: filterSection || '', day_of_week: '', start_time: '', end_time: '', room: '' });
    setError(''); setShowForm(true);
  };
  const openEdit = (sch) => {
    setEditId(sch.id);
    setForm({ teacher: String(sch.teacher), subject: String(sch.subject), section: String(sch.section),
      day_of_week: sch.day_of_week, start_time: sch.start_time?.slice(0, 5) || '', end_time: sch.end_time?.slice(0, 5) || '', room: sch.room || '' });
    setError(''); setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.teacher || !form.subject || !form.section || !form.day_of_week || !form.start_time || !form.end_time) {
      setError('All fields except Room are required.'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = { teacher: Number(form.teacher), subject: Number(form.subject), section: Number(form.section),
        day_of_week: form.day_of_week, start_time: form.start_time + ':00', end_time: form.end_time + ':00', room: form.room };
      const url = editId ? `/api/classmanagement/schedules/${editId}/` : '/api/classmanagement/schedules/';
      const r = await apiFetch(url, { method: editId ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || JSON.stringify(e)); }
      setShowForm(false); await onRefresh();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule entry?')) return;
    try {
      const r = await apiFetch(`/api/classmanagement/schedules/${id}/`, { method: 'DELETE' });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `Delete failed (${r.status})`);
      }
      await onRefresh();
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  const handleAutoGenerate = async () => {
    if (!window.confirm('Auto-generate schedules for empty slots? This fills Mon–Fri 8 AM–3 PM.')) return;
    setGenerating(true);
    try {
      const payload = filterSection ? { section: Number(filterSection) } : {};
      const r = await apiFetch('/api/classmanagement/schedules/auto-generate/', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (!r.ok) throw new Error(data.detail || 'Failed');
      alert(`Created ${data.created_count} schedule entries.`);
      await onRefresh();
    } catch (e) { alert(e.message); } finally { setGenerating(false); }
  };

  return (
    <>
      {/* Controls */}
      <div className="admin-class-controls schedule-controls">
        <div className="admin-filter-box">
          <Filter size={18} />
          <select value={filterSection} onChange={(e) => setFilterSection(e.target.value)}>
            <option value="">All Sections</option>
            {sections.map((sec) => <option key={sec.id} value={sec.id}>{gradeLabel(sec.grade_level)} — {sec.name}</option>)}
          </select>
        </div>
        <div className="schedule-view-toggle">
          <button className={`admin-tab-btn small ${view === 'timeline' ? 'active' : ''}`} onClick={() => setView('timeline')}>Timeline</button>
          <button className={`admin-tab-btn small ${view === 'table' ? 'active' : ''}`} onClick={() => setView('table')}>Table</button>
        </div>
        <button className="admin-btn-primary" onClick={openNew}><Plus size={18} /> Add Entry</button>
        <button className="admin-btn-primary" onClick={handleAutoGenerate} disabled={generating} style={{ background: '#8b5cf6' }}>
          <Zap size={18} /> {generating ? 'Generating…' : 'Auto-fill'}
        </button>
        {selected.size > 0 && (
          <>
            <button className="admin-btn-primary" onClick={openBulkEdit} style={{ background: '#f59e0b' }}>
              <Edit2 size={18} /> Edit Selected ({selected.size})
            </button>
            <button className="admin-btn-delete" onClick={handleBulkDelete} disabled={bulkDeleting} style={{ padding: '10px 20px' }}>
              <Trash2 size={18} /> {bulkDeleting ? 'Deleting…' : `Delete Selected (${selected.size})`}
            </button>
          </>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: 620 }}>
            <h2>{editId ? 'Edit Schedule Entry' : 'New Schedule Entry'}</h2>
            {error && <div style={{ color: '#ef4444', marginBottom: 8 }}>{error}</div>}
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Section *</label>
                <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })}>
                  <option value="">Select…</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>{gradeLabel(s.grade_level)} — {s.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Subject *</label>
                <select value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}>
                  <option value="">Select…</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Teacher *</label>
                <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">Select…</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.username}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Day *</label>
                <select value={form.day_of_week} onChange={(e) => setForm({ ...form, day_of_week: e.target.value })}>
                  <option value="">Select…</option>
                  {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="admin-form-group">
                <label>Start Time *</label>
                <input type="time" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>End Time *</label>
                <input type="time" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Room</label>
                <input type="text" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} placeholder="e.g. Room 201" />
              </div>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Create'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Edit Modal */}
      {showBulkEdit && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-content" style={{ maxWidth: 620 }}>
            <h2>Bulk Edit — {selected.size} Entries</h2>
            <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 12 }}>Only fields you fill in will be changed. Leave blank to keep current values.</p>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Section</label>
                <select value={bulkForm.section} onChange={(e) => setBulkForm({ ...bulkForm, section: e.target.value })}>
                  <option value="">— Keep current —</option>
                  {sections.map((s) => <option key={s.id} value={s.id}>{gradeLabel(s.grade_level)} — {s.name}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Subject</label>
                <select value={bulkForm.subject} onChange={(e) => setBulkForm({ ...bulkForm, subject: e.target.value })}>
                  <option value="">— Keep current —</option>
                  {subjects.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
            </div>
            <div className="admin-form-row">
              <div className="admin-form-group">
                <label>Teacher</label>
                <select value={bulkForm.teacher} onChange={(e) => setBulkForm({ ...bulkForm, teacher: e.target.value })}>
                  <option value="">— Keep current —</option>
                  {teachers.map((t) => <option key={t.id} value={t.id}>{t.username}</option>)}
                </select>
              </div>
              <div className="admin-form-group">
                <label>Day</label>
                <select value={bulkForm.day_of_week} onChange={(e) => setBulkForm({ ...bulkForm, day_of_week: e.target.value })}>
                  <option value="">— Keep current —</option>
                  {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </div>
            </div>
            <div className="admin-form-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="admin-form-group">
                <label>Start Time</label>
                <input type="time" value={bulkForm.start_time} onChange={(e) => setBulkForm({ ...bulkForm, start_time: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>End Time</label>
                <input type="time" value={bulkForm.end_time} onChange={(e) => setBulkForm({ ...bulkForm, end_time: e.target.value })} />
              </div>
              <div className="admin-form-group">
                <label>Room</label>
                <input type="text" value={bulkForm.room} onChange={(e) => setBulkForm({ ...bulkForm, room: e.target.value })} placeholder="e.g. Room 201" />
              </div>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-secondary" onClick={() => setShowBulkEdit(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleBulkEdit} disabled={bulkSaving} style={{ background: '#f59e0b' }}>
                {bulkSaving ? 'Updating…' : `Update ${selected.size} Entries`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TABLE VIEW */}
      {view === 'table' && (
        <div className="admin-schedule-container">
          <table className="admin-schedule-table">
            <thead><tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} title="Select all" />
              </th>
              <th>Section</th><th>Subject</th><th>Teacher</th><th>Day</th><th>Time</th><th>Room</th><th>Actions</th>
            </tr></thead>
            <tbody>
              {filtered.length === 0 && <tr><td colSpan="8" style={{ textAlign: 'center', color: '#94a3b8', padding: 24 }}>No schedule entries.</td></tr>}
              {filtered.map((s) => (
                <tr key={s.id} style={selected.has(s.id) ? { background: '#eff6ff' } : undefined}>
                  <td style={{ textAlign: 'center' }}>
                    <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleSelect(s.id)} />
                  </td>
                  <td><strong>{s.section_name}</strong></td>
                  <td>{s.subject_name}</td>
                  <td>{s.teacher_name}</td>
                  <td>{dayLabel(s.day_of_week)}</td>
                  <td><Clock size={14} /> {s.start_time?.slice(0, 5)} – {s.end_time?.slice(0, 5)}</td>
                  <td>{s.room || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="admin-btn-edit" onClick={() => openEdit(s)} title="Edit"><Edit2 size={16} /></button>
                      <button className="admin-btn-delete" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TIMELINE VIEW */}
      {view === 'timeline' && (
        <>
          {filtered.length > 0 && (
            <div className="bulk-select-bar">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#4b5563' }}>
                <input type="checkbox" checked={allSelected} onChange={toggleAll} />
                {allSelected ? 'Deselect all' : `Select all ${filtered.length} entries`}
              </label>
              {selected.size > 0 && <span style={{ fontSize: 13, color: '#3b82f6', fontWeight: 600 }}>{selected.size} selected</span>}
            </div>
          )}
          <div className="admin-schedule-container" style={{ overflowX: 'auto' }}>
          <table className="schedule-timeline-table">
            <thead><tr><th className="timeline-time-col">Time</th>{DAYS.map((d) => <th key={d.value}>{d.label}</th>)}</tr></thead>
            <tbody>
              {TIME_SLOTS.map((slot) => (
                <tr key={slot.hour}>
                  <td className="timeline-time-cell">{slot.label}</td>
                  {DAYS.map((d) => {
                    const entries = filtered.filter((s) => overlapsHour(s, d.value, slot.hour));
                    return (
                      <td key={d.value} className="timeline-cell">
                        {entries.map((entry) => (
                          <div key={entry.id} className={`timeline-block ${selected.has(entry.id) ? 'timeline-block--selected' : ''}`}
                            style={{ backgroundColor: colorFor(entry.subject) }}
                            title={`${entry.subject_name} — ${entry.teacher_name}\n${entry.start_time?.slice(0, 5)}–${entry.end_time?.slice(0, 5)}${entry.room ? ' • ' + entry.room : ''}\nClick to select · Double-click to edit`}
                            onClick={() => toggleSelect(entry.id)}
                            onDoubleClick={() => openEdit(entry)}>
                            <input type="checkbox" checked={selected.has(entry.id)} readOnly
                              style={{ position: 'absolute', top: 2, right: 2, width: 14, height: 14, cursor: 'pointer' }} />
                            <div className="timeline-block-title">{entry.subject_name}</div>
                            <div className="timeline-block-meta">{entry.teacher_name}</div>
                            {entry.room && <div className="timeline-block-meta">{entry.room}</div>}
                          </div>
                        ))}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}
    </>
  );
}

/* ═════════════════════════════════════════════════════════
   SUBJECTS TAB — full CRUD + teacher assignment
   ═════════════════════════════════════════════════════════ */
function SubjectsTab({ subjects, teachers, onRefresh }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', assigned_teacher: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', assigned_teacher: '' });

  const handleCreate = async () => {
    setFormError('');
    if (!form.name || !form.code) { setFormError('Name and code are required.'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, code: form.code };
      if (form.assigned_teacher) payload.assigned_teacher = Number(form.assigned_teacher);
      const r = await apiFetch('/api/accounts/subjects/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) { const e = await r.json().catch(() => ({})); throw new Error(e.detail || JSON.stringify(e)); }
      setShowForm(false); setForm({ name: '', code: '', assigned_teacher: '' }); await onRefresh();
    } catch (e) { setFormError(e.message); } finally { setSaving(false); }
  };

  const startEdit = (subj) => {
    const cur = subj.teachers?.length > 0 ? String(subj.teachers[0].id) : '';
    setEditingId(subj.id); setEditForm({ name: subj.name, code: subj.code, assigned_teacher: cur });
  };

  const saveEdit = async (id) => {
    try {
      const payload = { name: editForm.name, code: editForm.code, assigned_teacher: editForm.assigned_teacher ? Number(editForm.assigned_teacher) : null };
      const r = await apiFetch(`/api/accounts/subjects/${id}/`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!r.ok) throw new Error('Failed to update');
      setEditingId(null); await onRefresh();
    } catch (e) { alert(e.message); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this subject? Related schedules and grades will also be removed.')) return;
    try {
      const r = await apiFetch(`/api/accounts/subjects/${id}/`, { method: 'DELETE' });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        throw new Error(err.detail || `Delete failed (${r.status})`);
      }
      await onRefresh();
    } catch (e) { alert('Delete failed: ' + e.message); }
  };

  const getAvailableTeachers = (curSubjId = null) => {
    const assigned = new Set();
    subjects.forEach((s) => { if (s.id === curSubjId) return; (s.teachers || []).forEach((t) => assigned.add(t.id)); });
    return teachers.filter((t) => !assigned.has(t.id));
  };

  return (
    <>
      <div className="admin-section-header" style={{ marginBottom: 16 }}>
        <h2>Subject Management</h2>
        <button className="admin-btn-primary" onClick={() => setShowForm(true)}><Plus size={18} /> Add Subject</button>
      </div>

      {showForm && (
        <div className="admin-modal-overlay" onClick={() => setShowForm(false)}>
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add Subject</h2>
            {formError && <div style={{ color: '#ef4444', marginBottom: 8 }}>{formError}</div>}
            <div className="admin-form-group">
              <label>Subject Name *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Mathematics" />
            </div>
            <div className="admin-form-group">
              <label>Subject Code *</label>
              <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="e.g. MATH" />
            </div>
            <div className="admin-form-group">
              <label>Assign Teacher</label>
              <select value={form.assigned_teacher} onChange={(e) => setForm({ ...form, assigned_teacher: e.target.value })}>
                <option value="">— No teacher —</option>
                {getAvailableTeachers().map((t) => <option key={t.id} value={t.id}>{t.username}</option>)}
              </select>
            </div>
            <div className="admin-form-actions">
              <button className="admin-btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="admin-btn-primary" onClick={handleCreate} disabled={saving}>{saving ? 'Saving…' : 'Save Subject'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-schedule-container">
        {subjects.length > 0 ? (
          <table className="admin-schedule-table">
            <thead><tr><th>ID</th><th>Subject Name</th><th>Code</th><th>Assigned Teacher</th><th>Actions</th></tr></thead>
            <tbody>
              {subjects.map((s) => {
                const isEditing = editingId === s.id;
                const assigned = s.teachers?.length > 0 ? s.teachers[0] : null;
                return (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{isEditing ? <input className="inline-input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} style={{ width: '100%' }} /> : <strong>{s.name}</strong>}</td>
                    <td>{isEditing ? <input className="inline-input" value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value })} style={{ width: 80 }} /> : s.code}</td>
                    <td>
                      {isEditing ? (
                        <select className="inline-select" value={editForm.assigned_teacher} onChange={(e) => setEditForm({ ...editForm, assigned_teacher: e.target.value })} style={{ width: '100%' }}>
                          <option value="">— None —</option>
                          {getAvailableTeachers(s.id).map((t) => <option key={t.id} value={t.id}>{t.username}</option>)}
                          {assigned && !getAvailableTeachers(s.id).find((t) => t.id === assigned.id) && <option value={assigned.id}>{assigned.username}</option>}
                        </select>
                      ) : assigned ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><UserCheck size={14} />{assigned.username}</span> : <span style={{ color: '#94a3b8' }}>Unassigned</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {isEditing ? (
                          <><button className="admin-btn-edit" onClick={() => saveEdit(s.id)} title="Save"><Save size={16} /></button>
                          <button className="admin-btn-delete" onClick={() => setEditingId(null)} title="Cancel"><X size={16} /></button></>
                        ) : (
                          <><button className="admin-btn-edit" onClick={() => startEdit(s)} title="Edit"><Edit2 size={16} /></button>
                          <button className="admin-btn-delete" onClick={() => handleDelete(s.id)} title="Delete"><Trash2 size={16} /></button></>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="admin-no-results"><BookOpen size={48} /><p>No subjects yet. Add one above.</p></div>
        )}
      </div>
    </>
  );
}

export default ClassManagement;
