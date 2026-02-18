import React, { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  XCircle,
  Eye,
} from "lucide-react";
import "../AdminWebsiteCSS/EnrollmentManagement.css";
import { getToken } from "../Auth/auth";

const API_BASE = "http://127.0.0.1:8000";

function authHeaders(json = true) {
  const token = getToken();
  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Token ${token}` } : {}),
  };
}

const gradeLabel = (code) => {
  const map = {
    prek: "Pre-Kinder",
    kinder: "Kindergarten",
    grade1: "Grade 1",
    grade2: "Grade 2",
    grade3: "Grade 3",
    grade4: "Grade 4",
    grade5: "Grade 5",
    grade6: "Grade 6",
  };
  return map[code] || code || "";
};

const statusLabel = (s) => {
  const m = {
    ACTIVE: "Active",
    PENDING: "Pending",
    DROPPED: "Dropped",
    COMPLETED: "Completed",
  };
  return m[s] || s || "";
};

const emptyForm = () => ({
  // student
  first_name: "",
  last_name: "",
  middle_name: "",
  birth_date: "",
  gender: "",

  lrn: "",

  // academic
  education_level: "",
  grade_level: "",
  student_type: "",
  academic_year: "2024-2025",
  status: "PENDING",
  payment_mode: "",

  // contact
  email: "",
  address: "",
  religion: "",
  telephone_number: "",
  mobile_number: "",
  parent_facebook: "",

  remarks: "",

  // nested parent
  parent_info: {
    father_name: "",
    father_contact: "",
    father_occupation: "",
    mother_name: "",
    mother_contact: "",
    mother_occupation: "",
    guardian_name: "",
    guardian_contact: "",
    guardian_relationship: "",
  },
});

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");

  // One modal for view + edit + create
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit"
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(emptyForm());

  // ✅ tracks current enrollment status in modal (backend codes: PENDING/ACTIVE/DROPPED/COMPLETED)
  const [modalStatus, setModalStatus] = useState(null);

  // ---------- API ----------
  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/enrollments/`, {
        method: "GET",
        headers: authHeaders(true),
        credentials: "include",
      });

      const data = await res.json().catch(() => []);
      if (!res.ok) {
        console.error("Fetch error:", data);
        throw new Error("Failed to load enrollments.");
      }

      setEnrollments(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      alert("Failed to load enrollments. Check admin login/token + backend permissions.");
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnrollments();
  }, []);

  // ✅ return data so modal can update instantly
  const callAction = async (id, actionName) => {
    const res = await fetch(`${API_BASE}/api/enrollments/${id}/${actionName}/`, {
      method: "POST",
      headers: authHeaders(true),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error(`${actionName} error:`, data);
      throw new Error("Action failed.");
    }

    await fetchEnrollments();
    return data; // return updated enrollment if your serializer returns it
  };

  const handleApprove = async (id) => callAction(id, "mark_active");
  const handleDecline = async (id) => callAction(id, "mark_dropped");

  const handleDeleteEnrollment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this enrollment?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/enrollments/${id}/`, {
        method: "DELETE",
        headers: authHeaders(false),
        credentials: "include",
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Delete error:", data);
        throw new Error("Delete failed.");
      }

      await fetchEnrollments();
      if (editingId === id) {
        setModalOpen(false);
        setEditingId(null);
        setModalStatus(null);
      }
    } catch (e) {
      console.error(e);
      alert("Delete failed. Check permissions/token.");
    }
  };

  // ---------- Normalize backend -> table rows ----------
    const normalized = useMemo(() => {
      return enrollments.map((e) => {
        const studentName = `${e.first_name || ""} ${e.last_name || ""}`.trim();

        const parentName =
          e?.parent_info?.guardian_name ||
          e?.parent_info?.mother_name ||
          e?.parent_info?.father_name ||
          "(not set)";

        const phone =
          e?.parent_info?.guardian_contact ||
          e?.parent_info?.mother_contact ||
          e?.parent_info?.father_contact ||
          e?.mobile_number ||
          e?.telephone_number ||
          "(not set)";

        const enrollmentDate = e.enrolled_at || e.created_at || null;

        // ✅ IMPORTANT: keep code + label
        const statusCode = String(e.status || "PENDING").toUpperCase();
        const statusText = statusLabel(statusCode);

        return {
          id: e.id,
          raw: e,
          studentName,
          gradeLevel: gradeLabel(e.grade_level),
          enrollmentDate,

          statusCode,      // "ACTIVE" | "PENDING" ...
          statusText,      // "Active" | "Pending" ...

          fee: e.payment_mode || "Pending",
          parentName,
          phone,
        };
      });
    }, [enrollments]);


  const filteredEnrollments = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    return normalized.filter((row) => {
      const matchesSearch =
        !s ||
        row.studentName.toLowerCase().includes(s) ||
        row.parentName.toLowerCase().includes(s) ||
        String(row.phone).includes(searchTerm);

      const matchesStatus = filterStatus === "All" || row.statusText === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [normalized, searchTerm, filterStatus]);

  const stats = useMemo(() => {
    return {
      total: normalized.length,
      active: normalized.filter((e) => e.statusCode  === "Active").length,
      pending: normalized.filter((e) => e.statusCode === "Pending").length,
      dropped: normalized.filter((e) => e.statusCode  === "Dropped").length,
    };
  }, [normalized]);

  const gradeOptions = useMemo(() => {
    if (formData.education_level === "preschool") {
      return [
        { value: "prek", label: "Pre-Kinder" },
        { value: "kinder", label: "Kindergarten" },
      ];
    }
    if (formData.education_level === "elementary") {
      return [
        { value: "grade1", label: "Grade 1" },
        { value: "grade2", label: "Grade 2" },
        { value: "grade3", label: "Grade 3" },
        { value: "grade4", label: "Grade 4" },
        { value: "grade5", label: "Grade 5" },
        { value: "grade6", label: "Grade 6" },
      ];
    }
    return [];
  }, [formData.education_level]);

  const todayISO = () => new Date().toISOString().split("T")[0];

  const calcAge = (yyyyMMdd) => {
    if (!yyyyMMdd) return null;
    const bd = new Date(yyyyMMdd + "T00:00:00");
    const today = new Date();

    let age = today.getFullYear() - bd.getFullYear();
    const m = today.getMonth() - bd.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bd.getDate())) age--;
    return age;
  };

  const validateBirthDate = (yyyyMMdd) => {
    if (!yyyyMMdd) return true; // optional

    const bd = new Date(yyyyMMdd + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (bd >= today) return "Birth date must be in the past.";

    const age = calcAge(yyyyMMdd);
    if (age < 3) return "Student must be at least 3 years old.";
    if (age > 18) return "Student age exceeds allowed school range.";

    return true;
  };

  const normalizePHMobile = (number) => {
    if (!number) return "";
    let cleaned = number.replace(/\s+/g, "");

    if (/^09\d{9}$/.test(cleaned)) return "+63" + cleaned.slice(1);
    if (/^\+639\d{9}$/.test(cleaned)) return cleaned;

    return null;
  };

  // ---------- UI helpers ----------
    const getStatusBadgeClass = (code) => {
      if (code === "ACTIVE") return "status-badge active";
      if (code === "DROPPED") return "status-badge dropped";
      if (code === "COMPLETED") return "status-badge completed";
      return "status-badge pending";
    };

  const getFeeBadgeClass = (fee) => {
    if (fee === "cash") return "fee-badge paid";
    if (fee === "installment") return "fee-badge pending";
    if (fee === "Paid") return "fee-badge paid";
    if (fee === "Pending") return "fee-badge pending";
    return "fee-badge overdue";
  };

    const getStatusIcon = (code) => {
      if (code === "ACTIVE") return <CheckCircle size={16} />;
      if (code === "DROPPED") return <XCircle size={16} />;
      if (code === "COMPLETED") return <CheckCircle size={16} />;
      return <Clock size={16} />;
    };
  const getCurrentAcademicYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Jan, 5 = June

  // School year starts June (month 5)
  if (month >= 5) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}; 

  const getFeeIcon = (fee) => {
    if (fee === "Paid" || fee === "cash") return <CheckCircle size={16} />;
    if (fee === "Pending" || fee === "installment") return <Clock size={16} />;
    return <AlertCircle size={16} />;
  };

  // ---------- Modal open (view/edit) ----------
  const openModal = (row, mode = "view") => {
    const e = row.raw;
    setEditingId(e.id);
    setModalMode(mode);

    // ✅ set backend status code for modal
    setModalStatus(e.status || "PENDING");

    const inferredEdu =
      e.education_level ||
      (["prek", "kinder"].includes(e.grade_level)
        ? "preschool"
        : ["grade1", "grade2", "grade3", "grade4", "grade5", "grade6"].includes(e.grade_level)
        ? "elementary"
        : "");

    setFormData({
      ...emptyForm(),
      first_name: e.first_name || "",
      last_name: e.last_name || "",
      middle_name: e.middle_name || "",
      birth_date: e.birth_date || "",
      gender: e.gender || "",

      lrn: e.lrn || "",

      education_level: inferredEdu,
      grade_level: e.grade_level || "",
      student_type: e.student_type || "",
      academic_year: e.academic_year ||  getCurrentAcademicYear(),
      status: e.status || "PENDING",
      payment_mode: e.payment_mode || "",

      email: e.email || "",
      address: e.address || "",
      religion: e.religion || "",
      telephone_number: e.telephone_number || "",
      mobile_number: e.mobile_number || "",
      parent_facebook: e.parent_facebook || "",

      remarks: e.remarks || "",

      parent_info: {
        father_name: e?.parent_info?.father_name || "",
        father_contact: e?.parent_info?.father_contact || "",
        father_occupation: e?.parent_info?.father_occupation || "",
        mother_name: e?.parent_info?.mother_name || "",
        mother_contact: e?.parent_info?.mother_contact || "",
        mother_occupation: e?.parent_info?.mother_occupation || "",
        guardian_name: e?.parent_info?.guardian_name || "",
        guardian_contact: e?.parent_info?.guardian_contact || "",
        guardian_relationship: e?.parent_info?.guardian_relationship || "",
      },
    });

    setModalOpen(true);
  };

  // Create mode
  const openCreateModal = () => {
    setEditingId(null);
    setModalMode("edit");
    setModalStatus(null);
    setFormData(emptyForm());
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode("view");
    setEditingId(null);
    setModalStatus(null);
  };

  const isReadOnly = modalMode === "view" && editingId !== null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => {
      if (name === "education_level") {
        return { ...p, education_level: value, grade_level: "" };
      }
      return { ...p, [name]: value };
    });
  };

  const handleParentChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({
      ...p,
      parent_info: { ...p.parent_info, [name]: value },
    }));
  };

  const validateCreate = () => {
    const missing = [];
    if (!formData.first_name?.trim()) missing.push("First Name");
    if (!formData.last_name?.trim()) missing.push("Last Name");
    if (!formData.grade_level) missing.push("Grade Level");
    if (!formData.education_level) missing.push("Education Level");
    if (!formData.student_type) missing.push("Student Type");
    if (!formData.payment_mode) missing.push("Payment Mode");
    if (!formData.academic_year) missing.push("Academic Year");

    if (missing.length) {
      alert("Please fill required:\n- " + missing.join("\n- "));
      return false;
    }
    return true;
  };

  // ✅ modal approve/decline (updates modalStatus + formData.status)
  const handleApproveModal = async () => {
    if (!editingId) return;
    try {
      const updated = await handleApprove(editingId);
      setModalStatus("ACTIVE");
      setFormData((p) => ({ ...p, status: "ACTIVE", remarks: updated?.remarks ?? p.remarks }));
      setModalMode("view");
    } catch (e) {
      console.error(e);
      alert("Approve failed. Check backend/permissions.");
    }
  };

  const handleDeclineModal = async () => {
    if (!editingId) return;
    try {
      const updated = await handleDecline(editingId);
      setModalStatus("DROPPED");
      setFormData((p) => ({ ...p, status: "DROPPED", remarks: updated?.remarks ?? p.remarks }));
      setModalMode("view");
    } catch (e) {
      console.error(e);
      alert("Decline failed. Check backend/permissions.");
    }
  };

  // Save = PATCH if editingId exists, else POST
  const handleSaveEnrollment = async () => {
    if (!editingId && !validateCreate()) return;

    const bdCheck = validateBirthDate(formData.birth_date);
    if (bdCheck !== true) {
      alert(bdCheck);
      return;
    }

    let normalizedMobile = null;
    if (formData.mobile_number?.trim()) {
      normalizedMobile = normalizePHMobile(formData.mobile_number);
      if (!normalizedMobile) {
        alert("Invalid PH mobile number.\nUse 09XXXXXXXXX or +639XXXXXXXXX format.");
        return;
      }
    }

    const payload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      middle_name: formData.middle_name,
      birth_date: formData.birth_date || null,
      gender: formData.gender,

      lrn: formData.lrn,

      education_level: formData.education_level,
      grade_level: formData.grade_level,
      student_type: formData.student_type,
      academic_year: formData.academic_year,
      status: formData.status,
      payment_mode: formData.payment_mode,

      email: formData.email,
      address: formData.address,
      religion: formData.religion,
      telephone_number: formData.telephone_number,
      mobile_number: normalizedMobile ?? formData.mobile_number,

      parent_facebook: formData.parent_facebook,
      remarks: formData.remarks,
      parent_info: formData.parent_info,
    };

    const url = editingId
      ? `${API_BASE}/api/enrollments/${editingId}/`
      : `${API_BASE}/api/enrollments/`;

    const method = editingId ? "PATCH" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: authHeaders(true),
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error("Save error:", data);
        alert("Save error: " + JSON.stringify(data));
        return;
      }

      await fetchEnrollments();

      if (!editingId) closeModal();
      else {
        setModalMode("view");
        setModalStatus(data?.status ?? formData.status);
      }
    } catch (e) {
      console.error(e);
      alert("Save failed. Check backend validation.");
    }
  };

  return (
    <div className="enrollment-management">
      <div className="enrollment-header">
        <h1>Enrollment Management</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn-primary" onClick={openCreateModal}>
            + Add Enrollee
          </button>
          <button className="btn-primary" onClick={fetchEnrollments}>
            Refresh
          </button>
        </div>
      </div>

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
          <h3>Dropped</h3>
          <p className="stat-number overdue">{stats.dropped}</p>
        </div>
      </div>

      {/* Controls */}
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
            <option value="Dropped">Dropped Only</option>
            <option value="Completed">Completed Only</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="enrollments-container">
        {loading ? (
          <div className="no-results"><p>Loading…</p></div>
        ) : filteredEnrollments.length > 0 ? (
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
                <th>Approve/Decline</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredEnrollments.map((row) => (
                <tr key={row.id}>
                  <td>{row.studentName}</td>
                  <td>{row.gradeLevel}</td>
                  <td>{row.enrollmentDate ? new Date(row.enrollmentDate).toLocaleDateString() : "-"}</td>

                  <td>
                    <span className={getStatusBadgeClass(row.statusCode)}>
                    {getStatusIcon(row.statusCode)}
                    {row.statusText}
                  </span>
                  </td>

                  <td>
                    <span className={getFeeBadgeClass(row.fee)}>
                      {getFeeIcon(row.fee)}
                      {String(row.fee).toUpperCase()}
                    </span>
                  </td>

                  <td>{row.parentName}</td>
                  <td>{row.phone}</td>

                  <td>
                    {row.statusCode === "PENDING" ? (
                      <div className="action-buttons">
                        <button className="btn-edit" title="Approve" onClick={() => handleApprove(row.id)}>
                          <CheckCircle size={16} />
                        </button>
                        <button className="btn-delete" title="Decline" onClick={() => handleDecline(row.id)}>
                          <XCircle size={16} />
                        </button>
                      </div>
                    ) : (
                      <span style={{ opacity: 0.7 }}>—</span>
                    )}
                  </td>

                  <td>
                    <div className="action-buttons">
                      <button className="btn-edit" title="View" onClick={() => openModal(row, "view")}>
                        <Eye size={16} />
                      </button>

                      <button className="btn-edit" title="Edit" onClick={() => openModal(row, "edit")}>
                        <Edit2 size={16} />
                      </button>

                      <button className="btn-delete" title="Delete" onClick={() => handleDeleteEnrollment(row.id)}>
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

      {/* ✅ Unified Modal (Create + View + Edit) */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>
                {editingId ? "Enrollment Details" : "Add Enrollee"}
              </h2>

              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                {/* toggle only for existing records */}
                {editingId && (
                  modalMode === "view" ? (
                    <button className="btn-primary" onClick={() => setModalMode("edit")}>
                      Edit
                    </button>
                  ) : (
                    <button className="btn-secondary" onClick={() => setModalMode("view")}>
                      View
                    </button>
                  )
                )}

                {/* ✅ Approve/Decline ONLY when PENDING */}
                {editingId && modalStatus === "PENDING" && (
                  <>
                    <button className="btn-primary" onClick={handleApproveModal}>
                      Approve
                    </button>
                    <button className="btn-secondary" onClick={handleDeclineModal}>
                      Decline
                    </button>
                  </>
                )}

                {/* ✅ After action: show status line only */}
                {editingId && modalStatus === "ACTIVE" && (
                  <span style={{ color: "#16a34a", fontWeight: 700 }}>
                    ✔ Approved
                  </span>
                )}
                {editingId && modalStatus === "DROPPED" && (
                  <span style={{ color: "#dc2626", fontWeight: 700 }}>
                    ✖ Declined
                  </span>
                )}
                {editingId && modalStatus === "COMPLETED" && (
                  <span style={{ color: "#0ea5e9", fontWeight: 700 }}>
                    ✔ Completed
                  </span>
                )}
              </div>
            </div>

            {/* ---- STUDENT INFO ---- */}
            <h3 style={{ marginTop: 14 }}>Student Info</h3>
            <div className="form-row">
              <div className="form-group">
                <label>First Name *</label>
                <input name="first_name" value={formData.first_name} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input name="last_name" value={formData.last_name} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Middle Name</label>
                <input name="middle_name" value={formData.middle_name} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Birth Date</label>
                <input
                  type="date"
                  name="birth_date"
                  value={formData.birth_date || ""}
                  onChange={handleInputChange}
                  disabled={isReadOnly}
                  max={todayISO()}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} disabled={isReadOnly}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
              <div className="form-group">
                <label>LRN</label>
                <input name="lrn" value={formData.lrn} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
            </div>

            <div className="form-row">
      
              <div className="form-group">
                <label>Academic Year *</label>
                <input name="academic_year" value={formData.academic_year} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
            </div>

            {/* ---- ACADEMIC ---- */}
            <h3 style={{ marginTop: 14 }}>Academic</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Education Level *</label>
                <select name="education_level" value={formData.education_level} onChange={handleInputChange} disabled={isReadOnly}>
                  <option value="">Select</option>
                  <option value="preschool">Preschool</option>
                  <option value="elementary">Elementary</option>
                </select>
              </div>

              <div className="form-group">
                <label>Student Type *</label>
                <select name="student_type" value={formData.student_type} onChange={handleInputChange} disabled={isReadOnly}>
                  <option value="">Select</option>
                  <option value="new">New / Transferee</option>
                  <option value="old">Old Student</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Grade Level *</label>
                <select
                  name="grade_level"
                  value={formData.grade_level}
                  onChange={handleInputChange}
                  disabled={isReadOnly || !formData.education_level}
                >
                  <option value="">Select</option>
                  {gradeOptions.map((g) => (
                    <option key={g.value} value={g.value}>
                      {g.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleInputChange} disabled={isReadOnly}>
                  <option value="PENDING">PENDING</option>
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DROPPED">DROPPED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Payment Mode *</label>
                <select name="payment_mode" value={formData.payment_mode} onChange={handleInputChange} disabled={isReadOnly}>
                  <option value="">Select</option>
                  <option value="cash">Cash</option>
                  <option value="installment">Installment</option>
                </select>
              </div>

              <div className="form-group">
                <label>Remarks</label>
                <input name="remarks" value={formData.remarks} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
            </div>

            {/* ---- CONTACT ---- */}
            <h3 style={{ marginTop: 14 }}>Contact</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input name="email" value={formData.email} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Mobile</label>
                <input
                  name="mobile_number"
                  value={formData.mobile_number}
                  onChange={handleInputChange}
                  onBlur={() => {
                    const n = normalizePHMobile(formData.mobile_number);
                    if (n) setFormData((p) => ({ ...p, mobile_number: n }));
                  }}
                  disabled={isReadOnly}
                  placeholder="09XXXXXXXXX or +639XXXXXXXXX"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Telephone</label>
                <input name="telephone_number" value={formData.telephone_number} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Religion</label>
                <input name="religion" value={formData.religion} onChange={handleInputChange} disabled={isReadOnly} />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input name="address" value={formData.address} onChange={handleInputChange} disabled={isReadOnly} />
            </div>

            <div className="form-group">
              <label>Parent Facebook</label>
              <input name="parent_facebook" value={formData.parent_facebook} onChange={handleInputChange} disabled={isReadOnly} />
            </div>

            {/* ---- PARENT / GUARDIAN ---- */}
            <h3 style={{ marginTop: 14 }}>Parent / Guardian</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Guardian Name</label>
                <input name="guardian_name" value={formData.parent_info.guardian_name} onChange={handleParentChange} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Guardian Contact</label>
                <input name="guardian_contact" value={formData.parent_info.guardian_contact} onChange={handleParentChange} disabled={isReadOnly} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Guardian Relationship</label>
                <input name="guardian_relationship" value={formData.parent_info.guardian_relationship} onChange={handleParentChange} disabled={isReadOnly} />
              </div>
              <div className="form-group" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Mother Name</label>
                <input name="mother_name" value={formData.parent_info.mother_name} onChange={handleParentChange} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Mother Contact</label>
                <input name="mother_contact" value={formData.parent_info.mother_contact} onChange={handleParentChange} disabled={isReadOnly} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Father Name</label>
                <input name="father_name" value={formData.parent_info.father_name} onChange={handleParentChange} disabled={isReadOnly} />
              </div>
              <div className="form-group">
                <label>Father Contact</label>
                <input name="father_contact" value={formData.parent_info.father_contact} onChange={handleParentChange} disabled={isReadOnly} />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="form-actions">
              <button className="btn-secondary" onClick={closeModal}>Close</button>
              {modalMode === "edit" && (
                <button className="btn-primary" onClick={handleSaveEnrollment}>
                  {editingId ? "Save Changes" : "Create Enrollee"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}