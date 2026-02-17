import React, { useEffect, useMemo, useState } from "react";
import "../ParentWebsiteCSS/Dashboard.css";
import { apiFetch } from "../api/apiFetch";

const API_BASE = "http://127.0.0.1:8000"; // only used if media path is /media/...

function toAbsUrl(path) {
  if (!path) return null;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

function getFirstImagePath(a) {
  const firstImage = a?.media?.find((m) =>
    /\.(jpg|jpeg|png|gif|webp)$/i.test(m?.file || m?.file_url || "")
  );
  return firstImage?.file_url || firstImage?.file || null;
}

const Dashboard = () => {
  // announcements
  const [announcements, setAnnouncements] = useState([]);
  const [annLoading, setAnnLoading] = useState(true);
  const [annError, setAnnError] = useState("");

  // modals
  const [listOpen, setListOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setAnnLoading(true);
      setAnnError("");
      try {
        // ✅ uses your apiFetch wrapper (adds auth when token exists)
        const res = await apiFetch("/api/announcements/");
        const data = await res.json();

        const list = Array.isArray(data) ? data : data.results || [];
        if (mounted) setAnnouncements(list);
      } catch (e) {
        console.error(e);
        if (mounted) setAnnError("Failed to load announcements.");
      } finally {
        if (mounted) setAnnLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // show latest 2 inside card
  const latestTwo = useMemo(() => announcements.slice(0, 2), [announcements]);

  return (
    <div className="dashboard-content">
      <header className="content-header">
        <h2 className="title-text">Dashboard</h2>
      </header>

      <div className="dashboard-grid">
        {/* Notifications Section (keep yours for now) */}
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
            <button type="button" className="view-all-link btn btn-link p-0">
              View All
            </button>
          </div>
        </section>

        {/* ✅ Announcements Section (dynamic) */}
        <section className="dashboard-card">
          <div className="card-header-red">
            <h6 className="header-title">
              <i className="bi bi-megaphone-fill me-2"></i>Announcements
            </h6>
          </div>

          <div className="card-body-padding">
            {annLoading ? (
              <p className="text-muted mb-0">Loading announcements…</p>
            ) : annError ? (
              <p className="text-danger mb-0">{annError}</p>
            ) : announcements.length === 0 ? (
              <p className="text-muted mb-0">No announcements yet.</p>
            ) : (
              <>
                {latestTwo.map((a, idx) => (
                  <React.Fragment key={a.id}>
                    <AnnouncementItem
                      title={a.title || "Untitled"}
                      detail={
                        a.publish_date || a.created_at
                          ? new Date(a.publish_date || a.created_at).toLocaleString()
                          : ""
                      }
                      icon="bi-clock"
                      type="danger"
                      onClick={() => setActiveAnnouncement(a)}
                    />
                    {idx === 0 && <hr className="divider" />}
                  </React.Fragment>
                ))}
              </>
            )}
          </div>

          <div className="card-footer-center">
            <button
              type="button"
              className="view-all-link btn btn-link p-0"
              onClick={() => setListOpen(true)}
              disabled={annLoading || announcements.length === 0}
            >
              View All
            </button>
          </div>
        </section>
      </div>

      {/* Info Sections (keep yours) */}
      <InfoSection
        title="ABOUT CESI"
        header="What is CESI Portal?"
        img="/port.png"
        tags={["Security", "Efficiency", "Accessibility"]}
        text="The CESI Portal is your all-in-one academic command center. Everything you need to manage your student life is organized into a single, user-friendly digital hub."
      />

      <InfoSection
        title="BACK TO SCHOOL"
        header="Back to School 2025-2026"
        img="/bsch.jpg"
        text="A Fresh Start Starts Now: Ready to learn, grow, and succeed together."
      />

      {/* ✅ List Modal */}
      {listOpen && (
        <div className="ann-modal-overlay" onClick={() => setListOpen(false)}>
          <div className="ann-modal" onClick={(e) => e.stopPropagation()}>
            <span className="ann-modal-close" onClick={() => setListOpen(false)}>
              ✕
            </span>

            <h3 className="ann-modal-title">Announcements</h3>

            <div className="ann-list">
              {announcements.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="ann-list-item"
                  onClick={() => {
                    setListOpen(false);
                    setActiveAnnouncement(a);
                  }}
                >
                  <div className="ann-list-title">{a.title || "Untitled"}</div>
                  <div className="ann-list-meta">
                    {(a.target_role || "all").toUpperCase()} •{" "}
                    {a.publish_date || a.created_at
                      ? new Date(a.publish_date || a.created_at).toLocaleString()
                      : ""}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ✅ Detail Modal */}
      {activeAnnouncement && (
        <AnnouncementDetailModal
          a={activeAnnouncement}
          onClose={() => setActiveAnnouncement(null)}
        />
      )}
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

const AnnouncementItem = ({ title, detail, icon, type, onClick }) => (
  <div
    className="announcement-block"
    onClick={onClick}
    style={onClick ? { cursor: "pointer" } : undefined}
  >
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

function AnnouncementDetailModal({ a, onClose }) {
  const img = toAbsUrl(getFirstImagePath(a));

  return (
    <div className="ann-modal-overlay" onClick={onClose}>
      <div className="ann-modal" onClick={(e) => e.stopPropagation()}>
        <span className="ann-modal-close" onClick={onClose}>
          ✕
        </span>

        {img && <img src={img} alt="" className="ann-modal-image" />}

        <h2 className="ann-modal-title">{a.title || "Untitled"}</h2>

        <div className="ann-modal-meta">
          {(a.target_role || "all").toUpperCase()} •{" "}
          {a.publish_date || a.created_at
            ? new Date(a.publish_date || a.created_at).toLocaleString()
            : ""}
        </div>

        <p className="ann-modal-content">{a.content || a.description || ""}</p>
      </div>
    </div>
  );
}

export default Dashboard;