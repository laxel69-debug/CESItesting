import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Search, Filter, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import '../AdminWebsiteCSS/EnrollmentManagement.css';

/**
 * EnrollmentManagement Component
 * Manages student enrollments with add, edit, delete, and filter functionality
 * NOTE: This is a frontend-only component. Connect to backend API when ready.
 */
const EnrollmentManagement = () => {
  // Sample enrollment data - REPLACE with API call to backend
  const [enrollments, setEnrollments] = useState([
    { id: 1, studentName: 'John Smith', gradeLevel: 'Grade 1', enrollmentDate: '2026-01-10', status: 'Active', fee: 'Paid', parentName: 'Robert Smith', phone: '555-0101' },
    { id: 2, studentName: 'Sarah Johnson', gradeLevel: 'Kindergarten', enrollmentDate: '2025-12-15', status: 'Active', fee: 'Pending', parentName: 'Mary Johnson', phone: '555-0102' },
    { id: 3, studentName: 'Michael Davis', gradeLevel: 'Grade 2', enrollmentDate: '2026-01-05', status: 'Active', fee: 'Paid', parentName: 'James Davis', phone: '555-0103' },
    { id: 4, studentName: 'Emily Wilson', gradeLevel: 'Grade 1', enrollmentDate: '2026-01-12', status: 'Pending', fee: 'Not Paid', parentName: 'Linda Wilson', phone: '555-0104' },
    { id: 5, studentName: 'David Brown', gradeLevel: 'Grade 3', enrollmentDate: '2025-11-20', status: 'Active', fee: 'Overdue', parentName: 'Thomas Brown', phone: '555-0105' },
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    studentName: '',
    gradeLevel: '',
    enrollmentDate: '',
    status: 'Active',
    fee: 'Pending',
    parentName: '',
    phone: ''
  });

  // Filter enrollments based on search and status
  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.parentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'All' || enrollment.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Add new enrollment or update existing
  const handleSaveEnrollment = () => {
    if (!formData.studentName || !formData.parentName || !formData.phone) {
      alert('Please fill in all required fields');
      return;
    }

    if (editingId) {
      // UPDATE existing enrollment
      setEnrollments(enrollments.map(e => 
        e.id === editingId ? { ...formData, id: editingId } : e
      ));
      setEditingId(null);
    } else {
      // ADD new enrollment
      const newEnrollment = {
        id: Math.max(...enrollments.map(e => e.id), 0) + 1,
        ...formData
      };
      setEnrollments([...enrollments, newEnrollment]);
    }

    setFormData({
      studentName: '',
      gradeLevel: '',
      enrollmentDate: '',
      status: 'Active',
      fee: 'Pending',
      parentName: '',
      phone: ''
    });
    setShowForm(false);
  };

  // Edit enrollment
  const handleEditEnrollment = (enrollment) => {
    setFormData(enrollment);
    setEditingId(enrollment.id);
    setShowForm(true);
  };

  // Delete enrollment
  const handleDeleteEnrollment = (id) => {
    if (window.confirm('Are you sure you want to delete this enrollment?')) {
      setEnrollments(enrollments.filter(e => e.id !== id));
    }
  };

  // Cancel form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      studentName: '',
      gradeLevel: '',
      enrollmentDate: '',
      status: 'Active',
      fee: 'Pending',
      parentName: '',
      phone: ''
    });
  };

  // Get status badge color
  const getStatusBadgeClass = (status) => {
    return status === 'Active' ? 'status-badge active' : 'status-badge pending';
  };

  // Get fee badge color
  const getFeeBadgeClass = (fee) => {
    if (fee === 'Paid') return 'fee-badge paid';
    if (fee === 'Pending') return 'fee-badge pending';
    return 'fee-badge overdue';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    if (status === 'Active') return <CheckCircle size={16} />;
    return <Clock size={16} />;
  };

  // Get fee icon
  const getFeeIcon = (fee) => {
    if (fee === 'Paid') return <CheckCircle size={16} />;
    if (fee === 'Pending') return <Clock size={16} />;
    return <AlertCircle size={16} />;
  };

  // Summary statistics
  const stats = {
    total: enrollments.length,
    active: enrollments.filter(e => e.status === 'Active').length,
    pending: enrollments.filter(e => e.status === 'Pending').length,
    feePaid: enrollments.filter(e => e.fee === 'Paid').length
  };

  return (
    <div className="enrollment-management">
      {/* Header Section */}
      <div className="enrollment-header">
        <h1>Enrollment Management</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={18} /> Add New Enrollment
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Enrollments</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Active Students</h3>
          <p className="stat-number active">{stats.active}</p>
        </div>
        <div className="stat-card">
          <h3>Pending Enrollment</h3>
          <p className="stat-number pending">{stats.pending}</p>
        </div>
        <div className="stat-card">
          <h3>Fees Collected</h3>
          <p className="stat-number paid">{stats.feePaid}</p>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingId ? 'Edit Enrollment' : 'Add New Enrollment'}</h2>
            
            <div className="form-group">
              <label>Student Name *</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                onChange={handleInputChange}
                placeholder="Enter student name"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Grade Level</label>
                <select name="gradeLevel" value={formData.gradeLevel} onChange={handleInputChange}>
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

              <div className="form-group">
                <label>Enrollment Date</label>
                <input
                  type="date"
                  name="enrollmentDate"
                  value={formData.enrollmentDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="form-group">
                <label>Fee Status</label>
                <select name="fee" value={formData.fee} onChange={handleInputChange}>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Parent/Guardian Name *</label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleInputChange}
                placeholder="Enter parent/guardian name"
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter contact phone number"
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={handleCancel}>Cancel</button>
              <button className="btn-primary" onClick={handleSaveEnrollment}>
                {editingId ? 'Update Enrollment' : 'Save Enrollment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter Section */}
      <div className="enrollment-controls">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by student/parent name or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-box">
          <Filter size={18} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="All">All Status</option>
            <option value="Active">Active Only</option>
            <option value="Pending">Pending Only</option>
          </select>
        </div>
      </div>

      {/* Enrollments Table */}
      <div className="enrollments-container">
        {filteredEnrollments.length > 0 ? (
          <table className="enrollments-table">
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Grade Level</th>
                <th>Enrollment Date</th>
                <th>Status</th>
                <th>Fee Status</th>
                <th>Parent/Guardian</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEnrollments.map(enrollment => (
                <tr key={enrollment.id}>
                  <td>{enrollment.studentName}</td>
                  <td>{enrollment.gradeLevel}</td>
                  <td>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</td>
                  <td>
                    <span className={getStatusBadgeClass(enrollment.status)}>
                      {getStatusIcon(enrollment.status)}
                      {enrollment.status}
                    </span>
                  </td>
                  <td>
                    <span className={getFeeBadgeClass(enrollment.fee)}>
                      {getFeeIcon(enrollment.fee)}
                      {enrollment.fee}
                    </span>
                  </td>
                  <td>{enrollment.parentName}</td>
                  <td>{enrollment.phone}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-edit" 
                        onClick={() => handleEditEnrollment(enrollment)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => handleDeleteEnrollment(enrollment.id)}
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
            <p>No enrollments found. Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      {/* Footer note for developers */}
      <div className="note">
        📌 <strong>Development Note:</strong> Replace sample data with API calls. 
        Connect to backend endpoints for POST (create), GET (fetch), PUT (update), and DELETE operations.
      </div>
    </div>
  );
};

export default EnrollmentManagement;
