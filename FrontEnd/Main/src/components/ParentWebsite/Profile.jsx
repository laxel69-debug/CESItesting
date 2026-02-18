import React, { useEffect, useMemo, useState } from "react";
import "../ParentWebsiteCSS/Profile.css";
import { apiFetch } from "../api/apiFetch";

const API_BASE = "";

const gradeLabelFromProfile = (raw) => {
  if (raw == null) return "—";
  const v = String(raw).trim();

  const pretty = new Set(["Pre-Kinder", "Kinder", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"]);
  if (pretty.has(v)) return v;

  if (/^\d+$/.test(v)) return `Grade ${v}`;

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
  return map[v.toLowerCase()] || v;
};

const Profile = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiFetch(`${API_BASE}/api/accounts/me/detail/`);

        // IMPORTANT: your apiFetch sometimes returns Response (like in UserManagement)
        // so handle both styles:
        if (res?.ok !== undefined) {
          const json = await res.json();
          setData(json);
        } else {
          // if apiFetch already returns json
          setData(res);
        }
      } catch (e) {
        console.error("Failed to load profile:", e);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const studentData = useMemo(() => {
    const u = data || {};
    const p = u.profile || {};

    const studentName = [p.student_first_name, p.student_middle_name, p.student_last_name]
      .filter(Boolean)
      .join(" ")
      .toUpperCase();

    const parentName = [p.parent_first_name, p.parent_middle_name, p.parent_last_name]
      .filter(Boolean)
      .join(" ");

    const grade = gradeLabelFromProfile(p.grade_level);
    const section = p.section?.name ? p.section.name : "—";

    return {
      name: studentName || (u.username ? String(u.username).toUpperCase() : "—"),
      lrn: p.lrn || "—",
      student_number: p.student_number || "—",
      grade_display: `${grade} - ${section}`,
      email: u.email || "—",
      address: p.address || "—",
      guardian: parentName || "—",
      contact: p.contact_number || "—",
      payment_mode: p.payment_mode || "—",
      status: u.status || "—",
      // not in your model yet:
      birthdate: "—",
      telephone: "—",
      schoolYear: "2025-2026",
    };
  }, [data]);

  if (loading) return <div className="profile-content">Loading profile...</div>;
  if (!data) return <div className="profile-content">Profile not found.</div>;

  // Optional: lock this page to student role
  if (data.role !== "PARENT_STUDENT") {
    return <div className="profile-content">Forbidden: not a student account.</div>;
  }

  return (
    <div className="profile-content">
      <header className="profile-header-flex">
        <h2 className="title-text">Student Profile</h2>
        <button type="button" className="edit-profile-btn">
          <i className="bi bi-pencil-square me-2"></i>Edit Profile
        </button>
      </header>

      <div className="profile-hero-card">
        <div className="hero-main-info">
          <div className="hero-avatar">
            <img src="https://via.placeholder.com/120" alt="Avatar" />
            <span className="status-badge">{studentData.status}</span>
          </div>

          <div className="hero-text">
            <h1 className="student-name">{studentData.name}</h1>

            <p className="student-lrn">
              LRN: <strong>{studentData.lrn}</strong>
            </p>

            <div className="student-tags">
              <span className="tag-pill">{studentData.grade_display}</span>
              <span className="tag-pill">S.Y. {studentData.schoolYear}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-details-grid">
        <section className="details-card">
          <div className="details-header">
            <i className="bi bi-person-lines-fill me-2"></i>
            Personal Information
          </div>

          <div className="details-body">
            <InfoRow label="Full Name" value={studentData.name} />
            <InfoRow label="Student Number" value={studentData.student_number} />
            <InfoRow label="Payment Mode" value={studentData.payment_mode} />
            <InfoRow label="Email" value={studentData.email} />
            <InfoRow label="Home Address" value={studentData.address} isLast />
          </div>
        </section>

        <section className="details-card">
          <div className="details-header red-header">
            <i className="bi bi-telephone-outbound-fill me-2"></i>
            Parent / Guardian Contact
          </div>

          <div className="details-body">
            <InfoRow label="Guardian" value={studentData.guardian} />
            <InfoRow label="Contact Number" value={studentData.contact} />
            <InfoRow label="Emergency Address" value={studentData.address} isLast />
          </div>
        </section>
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, isLast }) => (
  <div className={`info-entry ${!isLast ? "entry-border" : ""}`}>
    <span className="entry-label">{label}</span>
    <span className="entry-value">{value}</span>
  </div>
);

export default Profile;