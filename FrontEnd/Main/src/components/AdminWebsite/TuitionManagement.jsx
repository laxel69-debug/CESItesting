import React, { useState } from 'react';
import { 
  Search, Filter, Download, Plus, Edit2, Trash2, 
  DollarSign, AlertCircle, CheckCircle, Clock, ToggleLeft, ToggleRight
} from 'lucide-react';
import '../AdminWebsiteCSS/TuitionManagement.css';

const TuitionManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [hoveredRow, setHoveredRow] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [selectedFee, setSelectedFee] = useState(null);
  const [viewMode, setViewMode] = useState('student'); // 'student' or 'grade'

  // Mock student data with tuition information
  const studentTuition = [
    {
      id: 1,
      studentName: 'John Smith',
      gradeLevel: 'Grade 1',
      parentName: 'Robert Smith',
      annualFee: 55000,
      monthlyFee: 4583,
      enrollmentFee: 5500,
      amountPaid: 15000,
      balance: 40000,
      status: 'pending',
      lastPaymentDate: '2026-01-15',
      enrollmentDate: '2026-01-10'
    },
    {
      id: 2,
      studentName: 'Sarah Johnson',
      gradeLevel: 'Kindergarten',
      parentName: 'Mary Johnson',
      annualFee: 52000,
      monthlyFee: 4333,
      enrollmentFee: 5000,
      amountPaid: 52000,
      balance: 0,
      status: 'paid',
      lastPaymentDate: '2025-12-20',
      enrollmentDate: '2025-12-15'
    },
    {
      id: 3,
      studentName: 'Michael Davis',
      gradeLevel: 'Grade 2',
      parentName: 'James Davis',
      annualFee: 57000,
      monthlyFee: 4750,
      enrollmentFee: 5500,
      amountPaid: 28500,
      balance: 28500,
      status: 'partial',
      lastPaymentDate: '2026-01-10',
      enrollmentDate: '2026-01-05'
    },
    {
      id: 4,
      studentName: 'Emily Wilson',
      gradeLevel: 'Grade 1',
      parentName: 'Linda Wilson',
      annualFee: 55000,
      monthlyFee: 4583,
      enrollmentFee: 5500,
      amountPaid: 0,
      balance: 60500,
      status: 'overdue',
      lastPaymentDate: null,
      enrollmentDate: '2026-01-12'
    },
    {
      id: 5,
      studentName: 'David Brown',
      gradeLevel: 'Grade 3',
      parentName: 'Thomas Brown',
      annualFee: 60000,
      monthlyFee: 5000,
      enrollmentFee: 6000,
      amountPaid: 30000,
      balance: 30000,
      status: 'pending',
      lastPaymentDate: '2025-12-28',
      enrollmentDate: '2025-11-20'
    },
    {
      id: 6,
      studentName: 'Lisa Martinez',
      gradeLevel: 'Kindergarten',
      parentName: 'Carmen Martinez',
      annualFee: 52000,
      monthlyFee: 4333,
      enrollmentFee: 5000,
      amountPaid: 10000,
      balance: 42000,
      status: 'pending',
      lastPaymentDate: '2026-01-20',
      enrollmentDate: '2025-11-10'
    }
  ];

  // Mock grade level tuition data
  const tuitionFees = [
    {
      id: 1,
      gradeLevel: 'Playgroup',
      annualFee: 45000,
      monthlyFee: 3750,
      enrollmentFee: 5000,
      description: 'Playgroup annual tuition',
      status: 'active',
      createdDate: '2025-06-01',
      updatedDate: '2025-06-01'
    },
    {
      id: 2,
      gradeLevel: 'Kindergarten',
      annualFee: 52000,
      monthlyFee: 4333,
      enrollmentFee: 5000,
      description: 'Kindergarten annual tuition',
      status: 'active',
      createdDate: '2025-06-01',
      updatedDate: '2025-06-01'
    },
    {
      id: 3,
      gradeLevel: 'Grade 1',
      annualFee: 55000,
      monthlyFee: 4583,
      enrollmentFee: 5500,
      description: 'Grade 1 annual tuition',
      status: 'active',
      createdDate: '2025-06-01',
      updatedDate: '2025-06-01'
    },
    {
      id: 4,
      gradeLevel: 'Grade 2',
      annualFee: 57000,
      monthlyFee: 4750,
      enrollmentFee: 5500,
      description: 'Grade 2 annual tuition',
      status: 'active',
      createdDate: '2025-06-01',
      updatedDate: '2025-06-01'
    },
    {
      id: 5,
      gradeLevel: 'Grade 3',
      annualFee: 60000,
      monthlyFee: 5000,
      enrollmentFee: 6000,
      description: 'Grade 3 annual tuition',
      status: 'active',
      createdDate: '2025-06-01',
      updatedDate: '2025-06-01'
    }
  ];

  const grades = ['all', 'Playgroup', 'Kindergarten', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6'];

  const [formData, setFormData] = useState({
    gradeLevel: '',
    annualFee: '',
    monthlyFee: '',
    enrollmentFee: '',
    description: ''
  });

  // Filter data based on view mode
  const getFilteredData = () => {
    if (viewMode === 'student') {
      return studentTuition.filter(student => {
        const matchesSearch = student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             student.parentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterGrade === 'all' || student.gradeLevel === filterGrade;
        return matchesSearch && matchesFilter;
      });
    } else {
      return tuitionFees.filter(fee => {
        const matchesSearch = fee.gradeLevel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             fee.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterGrade === 'all' || fee.gradeLevel === filterGrade;
        return matchesSearch && matchesFilter;
      });
    }
  };

  const getPaymentStats = () => {
    if (viewMode === 'student') {
      const totalBilled = studentTuition.reduce((sum, s) => sum + s.annualFee, 0);
      const totalPaid = studentTuition.reduce((sum, s) => sum + s.amountPaid, 0);
      const totalOverdue = studentTuition.filter(s => s.status === 'overdue').length;
      return { totalBilled, totalPaid, totalOverdue };
    } else {
      return { 
        totalBilled: tuitionFees.length,
        totalPaid: tuitionFees.filter(f => f.status === 'active').length,
        totalOverdue: 0
      };
    }
  };

  const handleAddNew = () => {
    setModalMode('add');
    setFormData({
      gradeLevel: '',
      annualFee: '',
      monthlyFee: '',
      enrollmentFee: '',
      description: ''
    });
    setShowModal(true);
  };

  const handleEdit = (fee) => {
    setModalMode('edit');
    setSelectedFee(fee);
    setFormData({
      gradeLevel: fee.gradeLevel,
      annualFee: fee.annualFee,
      monthlyFee: fee.monthlyFee,
      enrollmentFee: fee.enrollmentFee,
      description: fee.description
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this tuition record?')) {
      // Call API to delete
      console.log('Delete record:', id);
      alert('Record deleted successfully');
    }
  };

  const handleSave = () => {
    if (!formData.gradeLevel || !formData.annualFee || !formData.monthlyFee) {
      alert('Please fill in all required fields');
      return;
    }

    if (modalMode === 'add') {
      console.log('Add new tuition fee:', formData);
      alert('Tuition fee added successfully');
    } else {
      console.log('Update tuition fee:', selectedFee.id, formData);
      alert('Tuition fee updated successfully');
    }


    setShowModal(false);
    setFormData({
      gradeLevel: '',
      annualFee: '',
      monthlyFee: '',
      enrollmentFee: '',
      description: ''
    });
  };

  const handleExportData = () => {
    console.log('Exporting tuition fee data to Excel');
    alert('Exporting tuition fee data to Excel...');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredData = getFilteredData();
  const stats = getPaymentStats();

  return (
    <main className="tuition-management-main">
      {/* Statistics Overview */}
      <section className="tm-section">
        <div className="tm-stats-grid">
          <div className="tm-stat-card tm-stat-blue">
            <div className="tm-stat-header">
              <span className="tm-stat-label">{viewMode === 'student' ? 'Total Students' : 'Grade Levels'}</span>
              <DollarSign size={24} className="tm-stat-icon" />
            </div>
            <div className="tm-stat-value">{stats.totalBilled}</div>
            <div className="tm-stat-change">{viewMode === 'student' ? 'Enrolled students' : 'Fee structures configured'}</div>
          </div>

          <div className="tm-stat-card tm-stat-green">
            <div className="tm-stat-header">
              <span className="tm-stat-label">{viewMode === 'student' ? 'Total Paid' : 'Active Fees'}</span>
              <CheckCircle size={24} className="tm-stat-icon" />
            </div>
            <div className="tm-stat-value">
              {viewMode === 'student' ? `₱${stats.totalPaid.toLocaleString()}` : stats.totalPaid}
            </div>
            <div className="tm-stat-change">{viewMode === 'student' ? 'Amount collected' : 'Active fee structures'}</div>
          </div>

          <div className="tm-stat-card tm-stat-purple">
            <div className="tm-stat-header">
              <span className="tm-stat-label">{viewMode === 'student' ? 'Overdue Accounts' : 'Avg Annual Fee'}</span>
              <DollarSign size={24} className="tm-stat-icon" />
            </div>
            <div className="tm-stat-value">
              {viewMode === 'student' ? stats.totalOverdue : `₱${Math.round(tuitionFees.reduce((sum, f) => sum + f.annualFee, 0) / tuitionFees.length).toLocaleString()}`}
            </div>
            <div className="tm-stat-change">{viewMode === 'student' ? 'Need attention' : 'Across all grades'}</div>
          </div>
        </div>
      </section>

      {/* Tuition Management */}
      <section className="tm-section">
        <div className="tm-section-header">
          <div>
            <h2 className="tm-section-title">{viewMode === 'student' ? 'Student Tuition Records' : 'Tuition Fee Structure'}</h2>
            <p className="tm-section-subtitle">
              {viewMode === 'student' ? 'View and manage individual student tuition accounts' : 'Manage tuition fees for each grade level'}
            </p>
          </div>
          <div className="tm-button-group">
            <button 
              className={`tm-view-toggle ${viewMode === 'student' ? 'active' : ''}`}
              onClick={() => setViewMode(viewMode === 'student' ? 'grade' : 'student')}
              title={`Switch to ${viewMode === 'student' ? 'Grade Level' : 'Student'} View`}
            >
              {viewMode === 'student' ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
              {viewMode === 'student' ? 'Student View' : 'Grade View'}
            </button>
            <button className="tm-btn-secondary" onClick={handleExportData}>
              <Download size={18} />
              Export
            </button>
            <button className="tm-btn-primary" onClick={handleAddNew}>
              <Plus size={18} />
              Add New Fee
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="tm-filters-container">
          <div className="tm-search-box">
            <Search size={20} className="tm-search-icon" />
            <input
              type="text"
              placeholder="Search by grade level or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tm-search-input"
            />
          </div>
          <div className="tm-filter-group">
            <Filter size={20} />
            <select 
              value={filterGrade}
              onChange={(e) => setFilterGrade(e.target.value)}
              className="tm-filter-select"
            >
              <option value="all">All Grades</option>
              {grades.filter(g => g !== 'all').map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tuition Fees Table */}
        <div className="tm-table-container">
          <table className="tm-table">
            <thead>
              <tr>
                {viewMode === 'student' ? (
                  <>
                    <th>Student Name</th>
                    <th>Grade Level</th>
                    <th>Parent/Guardian</th>
                    <th>Annual Fee</th>
                    <th>Amount Paid</th>
                    <th>Balance</th>
                    <th>Payment Status</th>
                    <th>Last Payment</th>
                    <th>Actions</th>
                  </>
                ) : (
                  <>
                    <th>Grade Level</th>
                    <th>Annual Fee</th>
                    <th>Monthly Fee</th>
                    <th>Enrollment Fee</th>
                    <th>Description</th>
                    <th>Status</th>
                    <th>Last Updated</th>
                    <th>Actions</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map(item => (
                  <tr
                    key={item.id}
                    className={`tm-table-row ${hoveredRow === item.id ? 'tm-row-hover' : ''}`}
                    onMouseEnter={() => setHoveredRow(item.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {viewMode === 'student' ? (
                      <>
                        <td className="tm-table-cell tm-cell-bold">{item.studentName}</td>
                        <td className="tm-table-cell">{item.gradeLevel}</td>
                        <td className="tm-table-cell">{item.parentName}</td>
                        <td className="tm-table-cell">₱{item.annualFee.toLocaleString()}</td>
                        <td className="tm-table-cell">₱{item.amountPaid.toLocaleString()}</td>
                        <td className="tm-table-cell">₱{item.balance.toLocaleString()}</td>
                        <td className="tm-table-cell">
                          <span className={`tm-status tm-status-${item.status}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="tm-table-cell">{item.lastPaymentDate ? new Date(item.lastPaymentDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="tm-table-cell tm-actions-cell">
                          <button
                            className="tm-action-btn tm-edit-btn"
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="tm-action-btn tm-delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="tm-table-cell tm-cell-bold">{item.gradeLevel}</td>
                        <td className="tm-table-cell">₱{item.annualFee.toLocaleString()}</td>
                        <td className="tm-table-cell">₱{item.monthlyFee.toLocaleString()}</td>
                        <td className="tm-table-cell">₱{item.enrollmentFee.toLocaleString()}</td>
                        <td className="tm-table-cell">{item.description}</td>
                        <td className="tm-table-cell">
                          <span className={`tm-status tm-status-${item.status}`}>
                            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                          </span>
                        </td>
                        <td className="tm-table-cell">{new Date(item.updatedDate).toLocaleDateString()}</td>
                        <td className="tm-table-cell tm-actions-cell">
                          <button
                            className="tm-action-btn tm-edit-btn"
                            title="Edit"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            className="tm-action-btn tm-delete-btn"
                            title="Delete"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewMode === 'student' ? 9 : 8} className="tm-no-data">
                    <AlertCircle size={24} />
                    <p>No records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {showModal && (
        <div className="tm-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="tm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="tm-modal-header">
              <h3>{modalMode === 'add' ? 'Add New Tuition Fee' : 'Edit Tuition Fee'}</h3>
              <button
                className="tm-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>

            <div className="tm-modal-body">
              <div className="tm-form-group">
                <label>Grade Level *</label>
                <select
                  name="gradeLevel"
                  value={formData.gradeLevel}
                  onChange={handleInputChange}
                  className="tm-form-input"
                >
                  <option value="">Select Grade Level</option>
                  {grades.filter(g => g !== 'all').map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              <div className="tm-form-group">
                <label>Annual Fee (₱) *</label>
                <input
                  type="number"
                  name="annualFee"
                  value={formData.annualFee}
                  onChange={handleInputChange}
                  placeholder="Enter annual tuition fee"
                  className="tm-form-input"
                />
              </div>

              <div className="tm-form-group">
                <label>Monthly Fee (₱) *</label>
                <input
                  type="number"
                  name="monthlyFee"
                  value={formData.monthlyFee}
                  onChange={handleInputChange}
                  placeholder="Enter monthly tuition fee"
                  className="tm-form-input"
                />
              </div>

              <div className="tm-form-group">
                <label>Enrollment Fee (₱)</label>
                <input
                  type="number"
                  name="enrollmentFee"
                  value={formData.enrollmentFee}
                  onChange={handleInputChange}
                  placeholder="Enter enrollment fee"
                  className="tm-form-input"
                />
              </div>

              <div className="tm-form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  className="tm-form-input tm-form-textarea"
                  rows="3"
                />
              </div>
            </div>

            <div className="tm-modal-footer">
              <button
                className="tm-btn-secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="tm-btn-primary"
                onClick={handleSave}
              >
                {modalMode === 'add' ? 'Add Fee' : 'Update Fee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default TuitionManagement;
