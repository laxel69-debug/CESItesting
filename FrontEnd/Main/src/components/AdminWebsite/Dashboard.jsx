import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from 'recharts';
import {
  Users, TrendingUp, DollarSign, GraduationCap,
  AlertTriangle, Bell, Briefcase, BookOpen, Wrench,
} from 'lucide-react';
import { apiFetch } from '../api/apiFetch';
import { useRBAC } from '../Auth/RBACContext';
import {
  DASHBOARD_SECTION_KEYS as DS,
  canViewDashboardSection,
  getDashboardSectionAccess,
} from '../../config/rbacConfig';
import '../AdminWebsiteCSS/Dashboard.css';

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
const COLORS = ['#10b981', '#fbbf24', '#ef4444'];
const GRADE_LEVELS = [
  'Pre-Kinder', 'Kinder 1', 'Kinder 2',
  'Grade 1', 'Grade 2', 'Grade 3',
  'Grade 4', 'Grade 5', 'Grade 6',
];
const fmt = (n) => (n ?? 0).toLocaleString();
const pct = (n) => `${(n ?? 0).toFixed(1)}%`;

/* ──────────────────────────────────────────────
   Dashboard Component
   ────────────────────────────────────────────── */
const Dashboard = () => {
  /* ---------- RBAC ---------- */
  const { subRole } = useRBAC();
  const role = subRole || 'admin';

  /** Shorthand: is this dashboard section visible? */
  const canSee = (key) => canViewDashboardSection(role, key);
  /** Shorthand: access level for a section */
  const access = (key) => getDashboardSectionAccess(role, key);

  /* ---------- state ---------- */
  const [users, setUsers] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [financeStats, setFinanceStats] = useState({});
  const [announcements, setAnnouncements] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ---------- fetch on mount ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const [uRes, aRes, tRes, fRes, annRes, secRes] = await Promise.all([
          apiFetch('/api/accounts/users/'),
          apiFetch('/api/attendance/records/'),
          apiFetch('/api/finance/transactions/'),
          apiFetch('/api/finance/transactions/stats/'),
          apiFetch('/api/announcements/'),
          apiFetch('/api/accounts/sections/'),
        ]);

        const [uData, aData, tData, fData, annData, secData] = await Promise.all([
          uRes.ok ? uRes.json() : [],
          aRes.ok ? aRes.json() : [],
          tRes.ok ? tRes.json() : [],
          fRes.ok ? fRes.json() : {},
          annRes.ok ? annRes.json() : [],
          secRes.ok ? secRes.json() : [],
        ]);

        setUsers(Array.isArray(uData) ? uData : uData.results ?? []);
        setAttendance(Array.isArray(aData) ? aData : aData.results ?? []);
        setTransactions(Array.isArray(tData) ? tData : tData.results ?? []);
        setFinanceStats(fData);
        setAnnouncements(Array.isArray(annData) ? annData : annData.results ?? []);
        setSections(Array.isArray(secData) ? secData : secData.results ?? []);
      } catch (err) {
        console.error('Dashboard fetch error', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* ---------- derived data ---------- */
  const students = useMemo(() => users.filter((u) => u.role === 'PARENT_STUDENT'), [users]);
  const teachers = useMemo(() => users.filter((u) => u.role === 'TEACHER'), [users]);

  // Attendance average %
  const avgAttendance = useMemo(() => {
    if (!attendance.length) return 0;
    const present = attendance.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    return (present / attendance.length) * 100;
  }, [attendance]);

  // Fee collection %
  const feeCollectionPct = useMemo(() => {
    const total = transactions.length;
    if (!total) return 0;
    const paid = transactions.filter((t) => t.status === 'PAID').length;
    return (paid / total) * 100;
  }, [transactions]);

  // Average grade per class (grade_level)
  const avgGradesPerClass = useMemo(() => {
    // Group attendance as a proxy; real grade computation would use /api/grades/
    // Using sections to show placeholder bars
    return GRADE_LEVELS.map((lvl, i) => {
      const sectionStudents = students.filter(
        (s) => s.profile?.grade_level === lvl
      );
      // Placeholder average — replace with real grade API data
      return { level: lvl, avg: sectionStudents.length ? 80 + Math.round(Math.random() * 12) : 0 };
    }).filter((g) => g.avg > 0);
  }, [students]);

  // Attendance trend (last 7 unique dates)
  const attendanceTrend = useMemo(() => {
    const byDate = {};
    attendance.forEach((a) => {
      if (!byDate[a.date]) byDate[a.date] = { total: 0, present: 0 };
      byDate[a.date].total += 1;
      if (a.status === 'PRESENT' || a.status === 'LATE') byDate[a.date].present += 1;
    });
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-7)
      .map(([date, { total, present }]) => ({
        date: date.slice(5), // MM-DD
        attendance: total ? Math.round((present / total) * 100) : 0,
      }));
  }, [attendance]);

  // At-risk students (attendance < 75%)
  const atRiskStudents = useMemo(() => {
    const byStudent = {};
    attendance.forEach((a) => {
      const id = a.student;
      if (!byStudent[id]) byStudent[id] = { total: 0, present: 0 };
      byStudent[id].total += 1;
      if (a.status === 'PRESENT' || a.status === 'LATE') byStudent[id].present += 1;
    });
    return Object.entries(byStudent)
      .map(([id, { total, present }]) => ({
        id,
        pct: total ? (present / total) * 100 : 0,
        total,
        present,
      }))
      .filter((s) => s.pct < 75)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 10)
      .map((s) => {
        const user = users.find((u) => String(u.id) === String(s.id));
        return {
          ...s,
          name: user?.profile
            ? `${user.profile.student_first_name ?? ''} ${user.profile.student_last_name ?? ''}`.trim()
            : user?.username ?? `Student #${s.id}`,
          grade: user?.profile?.grade_level ?? '—',
        };
      });
  }, [attendance, users]);

  // Staff table: classes per teacher
  const staffRows = useMemo(() => {
    return teachers.map((t) => {
      const tp = t.teacher_profile ?? {};
      const assignedSections = sections.filter(
        (sec) => sec.adviser === tp.id
      );
      // Teacher attendance (use attendance records where marked_by === teacher id)
      const marked = attendance.filter((a) => a.marked_by === t.id);
      const uniqueDays = new Set(marked.map((a) => a.date)).size;
      return {
        id: t.id,
        name: t.username,
        subject: tp.subject_name ?? '—',
        sections: assignedSections.length,
        daysActive: uniqueDays,
      };
    });
  }, [teachers, sections, attendance]);

  // Finance: paid vs pending vs overdue
  const feePieData = useMemo(() => {
    const paid = transactions.filter((t) => t.status === 'PAID').length;
    const pending = transactions.filter((t) => t.status === 'PENDING').length;
    const overdue = transactions.filter((t) => t.status === 'OVERDUE').length;
    return [
      { name: 'Paid', value: paid, color: '#10b981' },
      { name: 'Pending', value: pending, color: '#fbbf24' },
      { name: 'Overdue', value: overdue, color: '#ef4444' },
    ].filter((d) => d.value > 0);
  }, [transactions]);

  // Budget overview per transaction type
  const budgetData = useMemo(() => {
    const byType = {};
    transactions.forEach((t) => {
      byType[t.transaction_type] = (byType[t.transaction_type] ?? 0) + Number(t.amount ?? 0);
    });
    return Object.entries(byType).map(([type, amount]) => ({ type, amount: Math.round(amount) }));
  }, [transactions]);

  // Fee defaulters (overdue)
  const feeDefaulters = useMemo(
    () => transactions.filter((t) => t.status === 'OVERDUE').slice(0, 8),
    [transactions],
  );

  // Low attendance alerts
  const lowAttendanceAlerts = atRiskStudents.slice(0, 5);

  /* ---------- render ---------- */
  if (loading) {
    return (
      <main className="dashboard-main">
        <div className="dash-loading">Loading dashboard data…</div>
      </main>
    );
  }

  return (
    <main className="dashboard-main">

      {/* ═══════════ 1. TOP KPI CARDS ═══════════ */}
      {(canSee(DS.KPI_STUDENTS) || canSee(DS.KPI_ATTENDANCE) || canSee(DS.KPI_STAFF) || canSee(DS.KPI_FEES)) && (
      <section className="dashboard-section">
        <h2 className="section-title">Overview</h2>
        <div className="stats-grid stats-grid-4">
          {canSee(DS.KPI_STUDENTS) && (
          <div className="stat-card stat-card-blue">
            <div className="stat-header">
              <span className="stat-label">Total Students</span>
              <Users size={28} className="stat-icon" />
            </div>
            <div className="stat-value">{fmt(students.length)}</div>
          </div>
          )}

          {canSee(DS.KPI_ATTENDANCE) && (
          <div className="stat-card stat-card-purple">
            <div className="stat-header">
              <span className="stat-label">Avg Attendance</span>
              <TrendingUp size={28} className="stat-icon" />
            </div>
            <div className="stat-value">{pct(avgAttendance)}</div>
          </div>
          )}

          {canSee(DS.KPI_STAFF) && (
          <div className="stat-card stat-card-green">
            <div className="stat-header">
              <span className="stat-label">Teachers / Staff</span>
              <Briefcase size={28} className="stat-icon" />
            </div>
            <div className="stat-value">{fmt(teachers.length)}</div>
          </div>
          )}

          {canSee(DS.KPI_FEES) && (
          <div className="stat-card stat-card-yellow">
            <div className="stat-header">
              <span className="stat-label">Fee Collection</span>
              <DollarSign size={28} className="stat-icon" />
            </div>
            <div className="stat-value">{pct(feeCollectionPct)}</div>
          </div>
          )}
        </div>
      </section>
      )}

      {/* ═══════════ 2. STUDENTS ═══════════ */}
      {canSee(DS.STUDENTS) && (
      <section className="dashboard-section">
        <h2 className="section-title">
          <GraduationCap size={22} className="title-icon" /> Students
          {access(DS.STUDENTS) === 'view' && (
            <span className="rbac-badge rbac-badge-view" style={{ marginLeft: 10, fontSize: 12 }}>Read-Only</span>
          )}
        </h2>

        <div className="charts-grid">
          {/* Average Grades per Class — hidden for treasurer/auditor */}
          {canSee(DS.STUDENTS_GRADES) && (
          <div className="chart-card">
            <h3 className="chart-title">Average Grades per Class</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={avgGradesPerClass}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="level" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="avg" fill="#6366f1" radius={[4, 4, 0, 0]} name="Avg Grade" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}

          {/* Attendance Trend */}
          {canSee(DS.STUDENTS_ATTENDANCE) && (
          <div className="chart-card">
            <h3 className="chart-title">Attendance Trend (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="attendance"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Attendance %"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>

        {/* At-Risk Students Table */}
        {canSee(DS.STUDENTS_AT_RISK) && (
        <div className="chart-card dash-table-card">
          <h3 className="chart-title">
            <AlertTriangle size={16} style={{ color: '#ef4444', marginRight: 6 }} />
            Students at Risk (Attendance &lt; 75%)
          </h3>
          {atRiskStudents.length === 0 ? (
            <p className="dash-empty">No at-risk students found.</p>
          ) : (
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Grade Level</th>
                    <th>Present / Total</th>
                    <th>Attendance %</th>
                  </tr>
                </thead>
                <tbody>
                  {atRiskStudents.map((s) => (
                    <tr key={s.id}>
                      <td>{s.name}</td>
                      <td>{s.grade}</td>
                      <td>{s.present} / {s.total}</td>
                      <td className={s.pct < 50 ? 'text-danger' : 'text-warning'}>
                        {s.pct.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        )}
      </section>
      )}

      {/* ═══════════ 3. STAFF ═══════════ */}
      {canSee(DS.STAFF) && (
      <section className="dashboard-section">
        <h2 className="section-title">
          <Briefcase size={22} className="title-icon" /> Staff
          {access(DS.STAFF) === 'view' && (
            <span className="rbac-badge rbac-badge-view" style={{ marginLeft: 10, fontSize: 12 }}>Read-Only</span>
          )}
        </h2>
        <div className="chart-card dash-table-card">
          <h3 className="chart-title">Teacher Overview</h3>
          {staffRows.length === 0 ? (
            <p className="dash-empty">No teacher data available.</p>
          ) : (
            <div className="dash-table-wrapper">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Teacher</th>
                    <th>Subject</th>
                    <th>Sections Assigned</th>
                    <th>Days Active</th>
                  </tr>
                </thead>
                <tbody>
                  {staffRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.name}</td>
                      <td>{r.subject}</td>
                      <td>{r.sections}</td>
                      <td>{r.daysActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
      )}

      {/* ═══════════ 4. FINANCES ═══════════ */}
      {canSee(DS.FINANCES) && (
      <section className="dashboard-section">
        <h2 className="section-title">
          <DollarSign size={22} className="title-icon" /> Finances
          {access(DS.FINANCES) === 'view' && (
            <span className="rbac-badge rbac-badge-view" style={{ marginLeft: 10, fontSize: 12 }}>Read-Only</span>
          )}
        </h2>
        <div className="charts-grid">
          {/* Fees Pie */}
          <div className="chart-card">
            <h3 className="chart-title">Fees — Paid vs Pending</h3>
            {feePieData.length === 0 ? (
              <p className="dash-empty">No transaction data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={feePieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {feePieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Budget Bar */}
          <div className="chart-card">
            <h3 className="chart-title">Revenue by Type</h3>
            {budgetData.length === 0 ? (
              <p className="dash-empty">No revenue data.</p>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip formatter={(v) => `₱${v.toLocaleString()}`} />
                  <Bar dataKey="amount" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Amount (₱)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </section>
      )}

      {/* ═══════════ 5. ALERTS / NOTIFICATIONS ═══════════ */}
      {(canSee(DS.ALERTS_ATTENDANCE) || canSee(DS.ALERTS_FEES) || canSee(DS.ALERTS_ANNOUNCEMENTS)) && (
      <section className="dashboard-section">
        <h2 className="section-title">
          <Bell size={22} className="title-icon" /> Alerts &amp; Notifications
        </h2>
        <div className="alerts-grid">
          {/* Low Attendance — hidden for treasurer */}
          {canSee(DS.ALERTS_ATTENDANCE) && (
          <div className="alert-card alert-card-red">
            <h4 className="alert-card-title">
              <AlertTriangle size={16} /> Low Attendance Students
            </h4>
            {lowAttendanceAlerts.length === 0 ? (
              <p className="dash-empty">All students have healthy attendance.</p>
            ) : (
              <ul className="alert-list">
                {lowAttendanceAlerts.map((s) => (
                  <li key={s.id}>
                    <span className="alert-name">{s.name}</span>
                    <span className="alert-badge badge-red">{s.pct.toFixed(0)}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          )}

          {/* Fee Defaulters — hidden for registrar / secretary */}
          {canSee(DS.ALERTS_FEES) && (
          <div className="alert-card alert-card-yellow">
            <h4 className="alert-card-title">
              <DollarSign size={16} /> Fee Defaulters
            </h4>
            {feeDefaulters.length === 0 ? (
              <p className="dash-empty">No overdue payments.</p>
            ) : (
              <ul className="alert-list">
                {feeDefaulters.map((t) => (
                  <li key={t.id}>
                    <span className="alert-name">{t.student_name || `Txn #${t.id}`}</span>
                    <span className="alert-badge badge-yellow">₱{Number(t.amount).toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          )}

          {/* Upcoming Announcements — visible for all who can see alerts */}
          {canSee(DS.ALERTS_ANNOUNCEMENTS) && (
          <div className="alert-card alert-card-blue">
            <h4 className="alert-card-title">
              <BookOpen size={16} /> Recent Announcements
            </h4>
            {announcements.length === 0 ? (
              <p className="dash-empty">No announcements.</p>
            ) : (
              <ul className="alert-list">
                {announcements.slice(0, 5).map((a) => (
                  <li key={a.id}>
                    <span className="alert-name">{a.title}</span>
                    <span className="alert-date">{a.publish_date ?? a.created_at?.slice(0, 10)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          )}
        </div>
      </section>
      )}

      {/* ═══════════ 6. OPERATIONS / RESOURCES ═══════════ */}
      {canSee(DS.OPERATIONS) && (
      <section className="dashboard-section">
        <h2 className="section-title">
          <Wrench size={22} className="title-icon" /> Operations &amp; Resources
          {access(DS.OPERATIONS) === 'view' && (
            <span className="rbac-badge rbac-badge-view" style={{ marginLeft: 10, fontSize: 12 }}>Read-Only</span>
          )}
        </h2>
        <div className="chart-card dash-table-card">
          <p className="dash-empty" style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
            Operations &amp; resource management module — coming soon.
          </p>
        </div>
      </section>
      )}

    </main>
  );
};

export default Dashboard;