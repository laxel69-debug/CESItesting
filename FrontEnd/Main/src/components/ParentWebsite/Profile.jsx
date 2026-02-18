import React from "react";
import "../ParentWebsiteCSS/Profile.css";

const Profile = () => {
  const studentData = {
    name: "JHON DOE",
    lrn: "136858100648",
    grade: "Grade 1 - Makabansa",
    email: "jhon.doe@school.edu",
    address: "123 Academic Lane, Manila",
    birthdate: "January 1, 2018",
    level: "3",
    guardian: "Jane Doe",
    telephone: "82878796",
    mobile: "09911140383",
    status: "Enrolled",
    schoolYear: "2025-2026",
  };

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
              <span className="tag-pill">{studentData.grade}</span>
              <span className="tag-pill">S.Y. {studentData.schoolYear}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-details-grid">
        {/* Personal Info */}
        <section className="details-card">
          <div className="details-header">
            <i className="bi bi-person-lines-fill me-2"></i>
            Personal Information
          </div>

          <div className="details-body">
            <InfoRow label="Full Name" value={studentData.name} />
            <InfoRow label="Birthdate" value={studentData.birthdate} />
            <InfoRow label="Level" value={`Level ${studentData.level}`} />
            <InfoRow label="Email" value={studentData.email} />
            <InfoRow
              label="Home Address"
              value={studentData.address}
              isLast={true}
            />
          </div>
        </section>

        {/* Emergency Info */}
        <section className="details-card">
          <div className="details-header red-header">
            <i className="bi bi-telephone-outbound-fill me-2"></i>
            Emergency Contact
          </div>

          <div className="details-body">
            <InfoRow label="Guardian" value={studentData.guardian} />
            <InfoRow label="Mobile" value={studentData.mobile} />
            <InfoRow label="Telephone" value={studentData.telephone} />
            <InfoRow
              label="Emergency Address"
              value={studentData.address}
              isLast={true}
            />
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
