import React from "react";
import "../ParentWebsiteCSS/Dashboard.css";

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <header className="content-header">
        <h2 className="title-text">Dashboard</h2>
      </header>

      <div className="dashboard-grid">
        {/* Notifications Section */}
        <section className="dashboard-card">
          <div className="card-header-blue">
            <h6 className="header-title">
              <i className="bi bi-bell-fill me-2"></i>Notifications
            </h6>
          </div>

          <div className="card-body-flush">
            <NotificationItem
              icon="bi-book"
              title="Bible Study Session"
              meta="Location: Chapel"
              time="10:00 AM"
              status="primary"
            />
            <NotificationItem
              icon="bi-exclamation-triangle"
              title="Library Notice"
              meta="Closing early at 3:00 PM today."
              time="8:30 AM"
              status="warning"
            />
          </div>

          <div className="card-footer-center">
            {/* we are not routing; just a placeholder */}
            <button type="button" className="view-all-link btn btn-link p-0">
              View All
            </button>
          </div>
        </section>

        {/* Announcements Section */}
        <section className="dashboard-card">
          <div className="card-header-red">
            <h6 className="header-title">
              <i className="bi bi-megaphone-fill me-2"></i>Announcements
            </h6>
          </div>

          <div className="card-body-padding">
            <AnnouncementItem
              title="Library is now Open"
              detail="8:00 AM - 5:00 PM"
              icon="bi-clock"
              type="danger"
            />
            <hr className="divider" />
            <AnnouncementItem
              title="Enrollment Period"
              detail="Second Semester starts July 15."
            />
          </div>

          <div className="card-footer-center">
            <button type="button" className="view-all-link btn btn-link p-0">
              View All
            </button>
          </div>
        </section>
      </div>

      {/* Info Section */}
      <InfoSection
        title="ABOUT CESI"
        header="What is CESI Portal?"
        img="/port.png"
        tags={["Security", "Efficiency", "Accessibility"]}
        text="The CESI Portal is your all-in-one academic command center. Everything you need to manage your student life is organized into a single, user-friendly digital hub."
      />

      {/* Info Section */}
      <InfoSection
        title="BACK TO SCHOOL"
        header="Back to School 2025-2026"
        img="/bsch.jpg"
        text="A Fresh Start Starts Now: Ready to learn, grow, and succeed together."
      />
    </div>
  );
};

/* --- Sub-Components --- */

const NotificationItem = ({ icon, title, meta, time, status }) => (
  <div className="list-item">
    <div className={`icon-circle status-${status}`}>
      <i className={`bi ${icon}`}></i>
    </div>
    <div className="item-content">
      <div className="item-main-row">
        <h6 className="item-title">{title}</h6>
        <span className={`item-time ${status === "primary" ? "active" : ""}`}>
          {time}
        </span>
      </div>
      <small className="item-meta">{meta}</small>
    </div>
  </div>
);

const AnnouncementItem = ({ title, detail, icon, type }) => (
  <div className="announcement-block">
    <h6 className={`announcement-title ${type ? `text-${type}` : ""}`}>
      {title}
    </h6>
    <p className="announcement-detail">
      {icon && <i className={`bi ${icon} me-1`}></i>} {detail}
    </p>
  </div>
);

const InfoSection = ({ title, header, img, text, tags }) => (
  <section className="dashboard-card info-card mt-4">
    <div className="card-header-blue">
      <h6 className="header-title">
        <i className="bi bi-stars me-2"></i>
        {title}
      </h6>
    </div>

    <div className="card-body-padding">
      <div className="info-layout">
        <div className="info-image-wrapper">
          <img src={img} alt={title} className="info-image" />
        </div>

        <div className="info-text-wrapper">
          <h5 className="info-header">{header}</h5>
          <p className="info-description">{text}</p>

          {tags && (
            <div className="tag-container">
              {tags.map((tag) => (
                <span key={tag} className="info-tag">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default Dashboard;
