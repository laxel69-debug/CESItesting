import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Search, Filter, Download, CreditCard,
  DollarSign, CheckCircle, Clock, TrendingUp,
  Plus, X, ChevronDown, ChevronUp, Edit2, Trash2
} from 'lucide-react';
import '../AdminWebsiteCSS/TransactionHistory.css';
import { getToken } from '../Auth/auth';

const API_BASE = '';

/** Build headers with auth token */
const authHeaders = (extra = {}) => {
  const token = getToken();
  return {
    ...(token ? { Authorization: `Token ${token}` } : {}),
    ...extra,
  };
};

const TRANSACTION_TYPES = [
  { value: 'TUITION', label: 'Tuition Fee' },
  { value: 'REGISTRATION', label: 'Registration Fee' },
  { value: 'MISC', label: 'Miscellaneous' },
  { value: 'BOOKS', label: 'Books & Materials' },
  { value: 'UNIFORM', label: 'Uniform' },
  { value: 'OTHER', label: 'Other' },
];

const PAYMENT_METHODS = [
  { value: 'CASH', label: 'Cash' },
  { value: 'BANK_TRANSFER', label: 'Bank Transfer' },
  { value: 'GCASH', label: 'GCash' },
  { value: 'PAYMAYA', label: 'PayMaya' },
  { value: 'CHECK', label: 'Check' },
  { value: 'OTHER', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 'PAID', label: 'Paid' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'OVERDUE', label: 'Overdue' },
];

const EMPTY_FORM = {
  parent: '',
  student_name: '',
  transaction_type: 'TUITION',
  amount: '',
  description: '',
  payment_method: 'CASH',
  due_date: '',
  status: 'PENDING',
};

const TransactionHistory = () => {
  // ── state ──
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ totalRevenue: 0, collected: 0, pending: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [hoveredRow, setHoveredRow] = useState(null);

  // expandable student detail row
  const [expandedRow, setExpandedRow] = useState(null);
  const [studentDetails, setStudentDetails] = useState({}); // keyed by parent id

  // modal (add + edit)
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null); // null = add mode, object = edit mode

  // delete confirmation
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // parent search dropdown
  const [parentOptions, setParentOptions] = useState([]);
  const [parentSearch, setParentSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedParent, setSelectedParent] = useState(null);
  const [parentLoading, setParentLoading] = useState(false);
  const dropdownRef = useRef(null);
  const debounceRef = useRef(null);

  // ── fetch transactions ──
  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      const res = await fetch(`${API_BASE}/api/finance/transactions/?${params}`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  }, [searchTerm, filterStatus]);

  // ── fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/finance/transactions/stats/`, {
        credentials: 'include',
        headers: authHeaders(),
      });
      if (!res.ok) return;
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [fetchTransactions, fetchStats]);

  // ── parent search ──
  const searchParents = useCallback(async (query) => {
    setParentLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/finance/parents/?search=${encodeURIComponent(query)}`,
        { credentials: 'include', headers: authHeaders() }
      );
      if (!res.ok) {
        console.error('Parent search failed:', res.status, res.statusText);
        if (res.status === 401 || res.status === 403) {
          setParentOptions([]);
          setShowDropdown(true); // show "not authorized" in empty state
        }
        return;
      }
      const data = await res.json();
      const list = Array.isArray(data) ? data : [];
      setParentOptions(list);
      setShowDropdown(true);
    } catch (err) {
      console.error('Error searching parents:', err);
    } finally {
      setParentLoading(false);
    }
  }, []);

  const handleParentSearchChange = (e) => {
    const val = e.target.value;
    setParentSearch(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.trim().length >= 1) {
      debounceRef.current = setTimeout(() => searchParents(val), 300);
    } else {
      // show all parents when field is focused/empty
      debounceRef.current = setTimeout(() => searchParents(''), 300);
    }
  };

  const selectParent = (parent) => {
    setSelectedParent(parent);
    setFormData((prev) => ({
      ...prev,
      parent: parent.id,
      student_name: parent.student_name || prev.student_name || '',
    }));
    const displayName = parent.student_name
      ? `${parent.username} — ${parent.student_name}`
      : `${parent.username} — ${parent.email}`;
    setParentSearch(displayName);
    setShowDropdown(false);
  };

  // close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── form helpers ──
  const openModal = () => {
    setEditingTxn(null);
    setFormData({ ...EMPTY_FORM });
    setParentSearch('');
    setSelectedParent(null);
    setFormError('');
    setShowModal(true);
    searchParents('');
  };

  const openEditModal = (txn) => {
    setEditingTxn(txn);
    setFormData({
      parent: txn.parent,
      student_name: txn.student_name || '',
      transaction_type: txn.transaction_type || 'TUITION',
      amount: txn.amount || '',
      description: txn.description || '',
      payment_method: txn.payment_method || 'CASH',
      due_date: txn.due_date || '',
      status: txn.status || 'PENDING',
    });
    const editDisplay = txn.parent_username
      ? `${txn.parent_username}${txn.student_name ? ' — ' + txn.student_name : ''}`
      : '';
    setParentSearch(editDisplay);
    setSelectedParent({ id: txn.parent, username: txn.parent_username });
    setFormError('');
    setShowModal(true);
    searchParents('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.parent) {
      setFormError('Please select a parent/student account.');
      return;
    }
    if (!formData.amount || Number(formData.amount) <= 0) {
      setFormError('Please enter a valid amount.');
      return;
    }

    setSubmitting(true);
    try {
      const body = { ...formData };
      body.amount = parseFloat(body.amount).toFixed(2);
      if (!body.due_date) body.due_date = null;

      const isEdit = !!editingTxn;
      const url = isEdit
        ? `${API_BASE}/api/finance/transactions/${editingTxn.id}/`
        : `${API_BASE}/api/finance/transactions/`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        credentials: 'include',
        headers: authHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || JSON.stringify(errData) || 'Server error');
      }

      setShowModal(false);
      setEditingTxn(null);
      fetchTransactions();
      fetchStats();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ──
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API_BASE}/api/finance/transactions/${deleteTarget.id}/`, {
        method: 'DELETE',
        credentials: 'include',
        headers: authHeaders(),
      });
      if (!res.ok && res.status !== 204) {
        throw new Error('Failed to delete');
      }
      setDeleteTarget(null);
      fetchTransactions();
      fetchStats();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // ── export placeholder ──
  const handleExportData = () => {
    alert('Exporting transaction data to Excel...');
  };

  // ── label helpers ──
  const typeLabel = (val) => TRANSACTION_TYPES.find((t) => t.value === val)?.label || val;
  const methodLabel = (val) => PAYMENT_METHODS.find((m) => m.value === val)?.label || val;
  const statusClass = (s) => {
    if (!s) return '';
    const lower = s.toLowerCase();
    if (lower === 'paid') return 'completed';
    return lower; // pending | overdue
  };

  // ── toggle student detail row ──
  const toggleStudentRow = async (txn) => {
    if (expandedRow === txn.id) {
      setExpandedRow(null);
      return;
    }
    setExpandedRow(txn.id);
    // fetch students for this parent (cache per parent id)
    if (!studentDetails[txn.parent]) {
      try {
        const res = await fetch(
          `${API_BASE}/api/finance/parents/${txn.parent}/students/`,
          { credentials: 'include', headers: authHeaders() }
        );
        if (res.ok) {
          const data = await res.json();
          setStudentDetails((prev) => ({ ...prev, [txn.parent]: data }));
        }
      } catch (err) {
        console.error('Error fetching students:', err);
      }
    }
  };

  return (
    <main className="transaction-history-main">
      {/* Stats Overview */}
      <section className="th-section">
        <div className="th-stats-grid">
          <div className="th-stat-card th-stat-blue">
            <div className="th-stat-header">
              <span className="th-stat-label">Total Revenue</span>
              <TrendingUp size={24} className="th-stat-icon" />
            </div>
            <div className="th-stat-value">₱{Number(stats.totalRevenue).toLocaleString()}</div>
            <div className="th-stat-change positive">All time</div>
          </div>

          <div className="th-stat-card th-stat-green">
            <div className="th-stat-header">
              <span className="th-stat-label">Collected</span>
              <CheckCircle size={24} className="th-stat-icon" />
            </div>
            <div className="th-stat-value">₱{Number(stats.collected).toLocaleString()}</div>
            <div className="th-stat-change positive">
              {stats.totalRevenue > 0
                ? `${Math.round((stats.collected / stats.totalRevenue) * 100)}% collection rate`
                : '—'}
            </div>
          </div>

          <div className="th-stat-card th-stat-yellow">
            <div className="th-stat-header">
              <span className="th-stat-label">Pending</span>
              <Clock size={24} className="th-stat-icon" />
            </div>
            <div className="th-stat-value">₱{Number(stats.pending).toLocaleString()}</div>
            <div className="th-stat-change">Outstanding</div>
          </div>
        </div>
      </section>

      {/* Transaction History */}
      <section className="th-section">
        <div className="th-section-header">
          <div>
            <h2 className="th-section-title">Transaction History</h2>
            <p className="th-section-subtitle">All payment transactions recorded in the system</p>
          </div>
          <div className="th-header-actions">
            <button className="th-btn-success" onClick={openModal}>
              <Plus size={18} /> Add Transaction
            </button>
            <button className="th-btn-primary" onClick={handleExportData}>
              <Download size={18} /> Export to Excel
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="th-filters-container">
          <div className="th-search-box">
            <Search size={20} className="th-search-icon" />
            <input
              type="text"
              placeholder="Search by student name, reference, or parent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="th-search-input"
            />
          </div>
          <div className="th-filter-group">
            <Filter size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="th-filter-select"
            >
              <option value="all">All Transactions</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="th-table-container">
          <table className="th-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference No.</th>
                <th>Parent Account</th>
                <th>Student Name</th>
                <th></th>
                <th>Transaction Type</th>
                <th>Payment Method</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                    No transactions found.
                  </td>
                </tr>
              ) : (
                transactions.map((txn) => (
                  <React.Fragment key={txn.id}>
                  <tr
                    className={hoveredRow === txn.id ? 'th-row-hover' : ''}
                    onMouseEnter={() => setHoveredRow(txn.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <td>{txn.date_created ? txn.date_created.split(' ')[0] : '—'}</td>
                    <td className="th-reference-cell">{txn.reference_number || '—'}</td>
                    <td>{txn.parent_username || '—'}</td>
                    <td className="th-student-name-cell">{txn.student_name}</td>
                    <td className="th-caret-cell">
                      <button
                        className="th-caret-btn"
                        onClick={() => toggleStudentRow(txn)}
                        title="View enrolled student(s)"
                      >
                        {expandedRow === txn.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </button>
                    </td>
                    <td>{typeLabel(txn.transaction_type)}</td>
                    <td>
                      <span className="th-payment-method">
                        <CreditCard size={16} />
                        {methodLabel(txn.payment_method)}
                      </span>
                    </td>
                    <td className="th-amount-cell">₱{Number(txn.amount).toLocaleString()}</td>
                    <td>
                      <span className={`th-status-badge th-status-${statusClass(txn.status)}`}>
                        {txn.status}
                      </span>
                    </td>
                    <td className="th-actions-cell">
                      <button
                        className="th-action-btn th-edit-btn"
                        onClick={() => openEditModal(txn)}
                        title="Edit"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        className="th-action-btn th-delete-btn"
                        onClick={() => setDeleteTarget(txn)}
                        title="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                  {/* Expandable student detail row */}
                  {expandedRow === txn.id && (
                    <tr className="th-expanded-row">
                      <td colSpan="10">
                        <div className="th-student-detail-panel">
                          <h4 className="th-detail-title">Enrolled Student(s) — {txn.parent_username}</h4>
                          {studentDetails[txn.parent] ? (
                            studentDetails[txn.parent].length > 0 ? (
                              <div className="th-student-cards">
                                {studentDetails[txn.parent].map((s, idx) => (
                                  <div key={idx} className="th-student-card">
                                    <div className="th-student-card-name">{s.student_name}</div>
                                    <div className="th-student-card-info">
                                      <span>Grade {s.grade_level}</span>
                                      <span className="th-dot">•</span>
                                      <span>{s.section}</span>
                                    </div>
                                    <div className="th-student-card-parent">
                                      Parent: {s.parent_name} · {s.contact_number}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="th-detail-empty">No student profile found.</p>
                            )
                          ) : (
                            <p className="th-detail-loading">Loading…</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Add Transaction Modal ── */}
      {showModal && (
        <div className="th-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="th-modal" onClick={(e) => e.stopPropagation()}>
            <div className="th-modal-header">
              <h3>{editingTxn ? 'Edit Transaction' : 'Add New Transaction'}</h3>
              <button className="th-modal-close" onClick={() => { setShowModal(false); setEditingTxn(null); }}>
                <X size={20} />
              </button>
            </div>

            <form className="th-modal-form" onSubmit={handleSubmit}>
              {formError && <div className="th-form-error">{formError}</div>}

              {/* Parent search */}
              <div className="th-form-group" ref={dropdownRef}>
                <label>Parent / Student Account *</label>
                <input
                  type="text"
                  placeholder="Search by name, username, or email..."
                  value={parentSearch}
                  onChange={handleParentSearchChange}
                  onFocus={() => {
                    if (parentOptions.length) setShowDropdown(true);
                    else searchParents('');
                  }}
                  className="th-form-input"
                  autoComplete="off"
                />
                {showDropdown && parentOptions.length > 0 && (
                  <ul className="th-dropdown-list">
                    {parentOptions.map((p) => (
                      <li
                        key={p.id}
                        className={`th-dropdown-item ${selectedParent?.id === p.id ? 'active' : ''}`}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectParent(p)}
                      >
                        <strong>{p.username}</strong>
                        <span className="th-dropdown-sub">
                          {p.student_name
                            ? `Student: ${p.student_name}`
                            : p.email}
                          {p.parent_name ? ` · Parent: ${p.parent_name}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                {showDropdown && parentOptions.length === 0 && (
                  <ul className="th-dropdown-list">
                    <li className="th-dropdown-item th-dropdown-empty">
                      {parentLoading ? 'Searching...' : 'No accounts found'}
                    </li>
                  </ul>
                )}
              </div>

              {/* Student name (auto-filled, editable) */}
              <div className="th-form-group">
                <label>Student Name</label>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleFormChange}
                  className="th-form-input"
                  placeholder="Auto-filled from parent profile"
                />
              </div>

              {/* Two columns */}
              <div className="th-form-row">
                <div className="th-form-group">
                  <label>Transaction Type *</label>
                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleFormChange}
                    className="th-form-input"
                  >
                    {TRANSACTION_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div className="th-form-group">
                  <label>Amount (₱) *</label>
                  <input
                    type="number"
                    name="amount"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={handleFormChange}
                    className="th-form-input"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="th-form-row">
                <div className="th-form-group">
                  <label>Payment Method</label>
                  <select
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleFormChange}
                    className="th-form-input"
                  >
                    {PAYMENT_METHODS.map((m) => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
                <div className="th-form-group">
                  <label>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="th-form-input"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="th-form-row">
                <div className="th-form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    name="due_date"
                    value={formData.due_date}
                    onChange={handleFormChange}
                    className="th-form-input"
                  />
                </div>
              </div>
              {!editingTxn && (
                <p className="th-auto-ref-note">Reference number will be auto-generated (e.g. CESI-2026-00001)</p>
              )}

              <div className="th-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleFormChange}
                  className="th-form-input"
                  placeholder="Optional notes..."
                />
              </div>

              <div className="th-modal-footer">
                <button
                  type="button"
                  className="th-btn-cancel"
                  onClick={() => { setShowModal(false); setEditingTxn(null); }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="th-btn-success"
                  disabled={submitting}
                >
                  {submitting ? 'Saving...' : editingTxn ? 'Update Transaction' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleteTarget && (
        <div className="th-modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="th-delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="th-delete-icon-wrap">
              <Trash2 size={28} />
            </div>
            <h3>Delete Transaction</h3>
            <p>
              Are you sure you want to delete <strong>{deleteTarget.reference_number || `#${deleteTarget.id}`}</strong> for
              <strong> {deleteTarget.student_name}</strong>?
            </p>
            <p className="th-delete-warning">This action cannot be undone.</p>
            <div className="th-delete-actions">
              <button className="th-btn-cancel" onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button className="th-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TransactionHistory;