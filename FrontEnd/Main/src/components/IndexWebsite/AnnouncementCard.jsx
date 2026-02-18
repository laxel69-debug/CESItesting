import React, { useMemo, useState } from "react";
import "../IndexWebsiteCSS/AnnouncementCard.css";

const API_BASE = "http://127.0.0.1:8000";

function toAbsUrl(pathOrUrl) {
  if (!pathOrUrl) return null;
  return String(pathOrUrl).startsWith("http") ? pathOrUrl : `${API_BASE}${pathOrUrl}`;
}

function AnnouncementCard({ title, date, image, description, targetRole }) {
  const [expanded, setExpanded] = useState(false);
  const [zoomed, setZoomed] = useState(false);

  const safeDescription = String(description || "");
  const showToggle = safeDescription.length > 160;

  const imageSrc = useMemo(() => toAbsUrl(image), [image]);

  const formattedDate = useMemo(() => {
    if (!date) return "";
    const d = new Date(date);
    return Number.isNaN(d.getTime()) ? "" : d.toLocaleString();
  }, [date]);

  return (
    <>
      <div className={`ann-card ${imageSrc ? "ann-card--row" : "ann-card--noimg"}`}>
        {/* LEFT: thumbnail box (always visible) */}
        {imageSrc && (
          <div
            className="ann-thumb"
            onClick={() => setZoomed(true)}
            style={{ cursor: "pointer" }}
          >
            <img src={imageSrc} alt={title || "Announcement"} />
          </div>
        )}

        {/* RIGHT: content */}
        <div className="ann-right">
          <div className="ann-top">
            <div className="ann-title">{title || "Untitled"}</div>

            <div className="ann-meta">
              <span className="ann-role">{targetRole || "all"}</span>
              <span>{formattedDate}</span>
            </div>
          </div>

          <p className={`ann-desc ${expanded ? "expanded" : "collapsed"}`}>
            {safeDescription}
          </p>

          {showToggle && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="ann-expand-btn"
              type="button"
            >
              {expanded ? "Show Less" : "Read More"}
            </button>
          )}
        </div>
      </div>

      {/* ZOOM OVERLAY */}
      {zoomed && imageSrc && (
        <div className="image-overlay" onClick={() => setZoomed(false)}>
          <span className="close-btn" onClick={() => setZoomed(false)}>
            ✕
          </span>
          <img src={imageSrc} alt="Zoomed" className="zoomed-image" />
        </div>
      )}
    </>
  );
}

export default AnnouncementCard;