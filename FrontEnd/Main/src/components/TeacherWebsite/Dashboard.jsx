import React, { useEffect, useMemo, useState } from "react";
import "../TeacherWebsiteCSS/Dashboard.css";
import { apiFetch } from "../api/apiFetch";

const API_BASE = "http://127.0.0.1:8000"; // only needed if file/file_url returns /media/...

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

function getFirstMedia(a) {
  return Array.isArray(a?.media) ? a.media[0] : null;
}

function TeacherAnnouncementsPanel() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setErr("");
      try {
        const res = await apiFetch("/api/announcements/");
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.results || [];
        if (mounted) setAnnouncements(list);
      } catch (e) {
        console.error(e);
        if (mounted) setErr("Failed to load announcements.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const latest = useMemo(() => announcements.slice(0, 3), [announcements]);

  return (
    <>
      <div className="card__body card__body--flush">
        {loading ? (
          <div className="list__staticItem">Loading announcements…</div>
        ) : err ? (
          <div className="list__staticItem" style={{ color: "crimson" }}>
            {err}
          </div>
        ) : announcements.length === 0 ? (
          <div className="list__staticItem">No announcements yet.</div>
        ) : (
          <div className="tann-list">
            {latest.map((a) => {
              const img = toAbsUrl(getFirstImagePath(a));
              const isImg = img && /\.(jpg|jpeg|png|gif|webp)$/i.test(img);

              return (
                <div
                  key={a.id}
                  className="tann-card tann-card--noimg"
                  onClick={() => setActive(a)}
                  style={{ cursor: "pointer" }}
                >
                  {/* {isImg && (
                    <div className="tann-thumb">
                      <img src={img} alt="" />
                    </div>
                  )} */}

                  <div className="tann-right">
                    <div className="tann-top">
                      <div className="tann-title">{a.title || "Untitled"}</div>

                      <div className="tann-meta">
                        <span className="tann-role">
                          {(a.target_role || "all").replace("_", " ")}
                        </span>
                        <span>
                          {a.publish_date || a.created_at
                            ? new Date(a.publish_date || a.created_at).toLocaleString()
                            : ""}
                        </span>
                      </div>
                    </div>

                    <p className="tann-desc">
                      {(a.content || "").slice(0, 120)}
                      {(a.content || "").length > 120 ? "…" : ""}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="card__footer">
        <button
          type="button"
          className="link link--danger"
          style={{ background: "transparent", border: 0, padding: 0 }}
          onClick={() => setListOpen(true)}
          disabled={loading || announcements.length === 0}
        >
          See All Updates
        </button>
      </div>

      {/* View All Modal */}
      {listOpen && (
        <div className="tann-modal-overlay" onClick={() => setListOpen(false)}>
          <div className="tann-modal" onClick={(e) => e.stopPropagation()}>
            <span className="tann-modal-close" onClick={() => setListOpen(false)}>
              ✕
            </span>

            <h3 className="tann-modal-title">Announcements</h3>

            <div className="tann-modal-list">
              {announcements.map((a) => {
                const img = toAbsUrl(getFirstImagePath(a));
                const isImg = img && /\.(jpg|jpeg|png|gif|webp)$/i.test(img);

                return (
                  <button
                    key={a.id}
                    type="button"
                    className="tann-modal-item"
                    onClick={() => {
                      setListOpen(false);
                      setActive(a);
                    }}
                  >
                    {/* {isImg && (
                      <div className="tann-modal-thumb">
                        <img src={img} alt="" />
                      </div>
                    )} */}

                    <div className="tann-modal-right">
                      <div className="tann-modal-itemTitle">{a.title || "Untitled"}</div>
                      <div className="tann-modal-itemMeta">
                        {(a.target_role || "all").replace("_", " ").toUpperCase()} •{" "}
                        {a.publish_date || a.created_at
                          ? new Date(a.publish_date || a.created_at).toLocaleString()
                          : ""}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {active && <TeacherAnnouncementDetailModal a={active} onClose={() => setActive(null)} />}
    </>
  );
}

function TeacherAnnouncementDetailModal({ a, onClose }) {
  const img = toAbsUrl(getFirstImagePath(a));
  const firstMedia = getFirstMedia(a);
  const firstUrl = toAbsUrl(firstMedia?.file_url || firstMedia?.file);
  const isVideo = firstUrl && /\.(mp4|webm|ogg|mov)$/i.test(firstUrl);

  return (
    <div className="tann-modal-overlay" onClick={onClose}>
      <div className="tann-modal" onClick={(e) => e.stopPropagation()}>
        <span className="tann-modal-close" onClick={onClose}>✕</span>

        {firstUrl && isVideo ? (
          <video src={firstUrl} controls className="tann-modal-image" />
        ) : (
          img && <img src={img} alt="" className="tann-modal-image" />
        )}

        <h2 className="tann-modal-title">{a.title || "Untitled"}</h2>

        <div className="tann-modal-meta">
          {(a.target_role || "all").replace("_", " ").toUpperCase()} •{" "}
          {a.publish_date || a.created_at
            ? new Date(a.publish_date || a.created_at).toLocaleString()
            : ""}
        </div>

        <p className="tann-modal-content">{a.content || ""}</p>
      </div>
    </div>
  );
}


const Dashboard = () => {
  return (
    <div className="dash">
      <header className="dash__header">
        <h2 className="dash__title">Dashboard</h2>
      </header>

      <div className="dash__grid">
        {/* Notifications */}
        <section className="card">
          <div className="card__header card__header--blue">
            <h6 className="card__headerTitle">
              <span className="icon icon--header" aria-hidden="true">🔔</span>
              Notifications
            </h6>
          </div>

          <div className="card__body card__body--flush">
            <div className="list">
              {/* Notification 1 */}
              <button className="list__item" type="button">
                <div className="list__row">
                  <div className="list__left">
                    <div className="iconBox iconBox--blue" aria-hidden="true">📘</div>
                    <div>
                      <div className="list__title">Encoding of Grades</div>
                      <div className="list__meta">
                        Submission of Grades due at January 1, 2025
                      </div>
                    </div>
                  </div>
                  <div className="list__time list__time--primary">10:00 AM</div>
                </div>
              </button>

              {/* Notification 2 */}
              <button className="list__item" type="button">
                <div className="list__row">
                  <div className="list__left">
                    <div className="iconBox iconBox--warn" aria-hidden="true">⚠️</div>
                    <div>
                      <div className="list__title">Library Notice</div>
                      <div className="list__meta">
                        The library will close early at 3:00 PM today.
                      </div>
                    </div>
                  </div>
                  <div className="list__time">10:30 AM</div>
                </div>
              </button>

              {/* Notification 3 */}
              <button className="list__item" type="button">
                <div className="list__row">
                  <div className="list__left">
                    <div className="iconBox iconBox--success" aria-hidden="true">✅</div>
                    <div>
                      <div className="list__title">CESI Portal Updated</div>
                      <div className="list__meta">
                        <span className="bold">CESI Portal</span> is now available. Thank you for waiting.
                      </div>
                    </div>
                  </div>
                  <div className="list__time">Yesterday</div>
                </div>
              </button>
            </div>
          </div>

          <div className="card__footer">
            <a className="link link--primary" href="#">View All Notifications</a>
          </div>
        </section>

        {/* Announcements */}
        <section className="card">
          <div className="card__header card__header--danger">
            <h6 className="card__headerTitle">
              <span className="icon icon--header" aria-hidden="true">📣</span>
              Announcements
            </h6>
          </div>

          <TeacherAnnouncementsPanel />
        </section>
      </div>

      {/* ABOUT CESI */}
      <section className="card card--roundedLg dash__section">
        <div className="card__header card__header--blue">
          <h6 className="card__headerTitle">
            <span className="icon icon--header" aria-hidden="true">✨</span>
            ABOUT CESI
          </h6>
        </div>

        <div className="card__body">
          <div className="media">
            <div className="media__imgWrap">
              <img className="media__img" src="/port.png" alt="CESI Portal" />
            </div>

            <div className="media__content">
              <h5 className="media__title">What is CESI Portal</h5>
              <p className="media__text">
                The CESI Portal is your all-in-one academic command center. Designed for efficiency and transparency,
                it allows students to seamlessly manage their educational journey. From monitoring real-time
                academic performance to tracking attendance and daily schedules, everything you need is organized
                into a single, user-friendly digital hub.
              </p>

              <div className="chips">
                <span className="chip">💻 Real-time Data</span>
                <span className="chip">🫶 Student-First</span>
                <span className="chip">🛡️ Secure Access</span>
                <span className="chip">📱 Mobile Ready</span>
                <span className="chip">🕒 24/7 Availability</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Back to School */}
      <section className="card card--roundedLg dash__section">
        <div className="card__header card__header--blue">
          <h6 className="card__headerTitle">
            <span className="icon icon--header" aria-hidden="true">✨</span>
            Back to School
          </h6>
        </div>

        <div className="card__body">
          <div className="media">
            <div className="media__imgWrap">
              <img className="media__img" src="/bsch.jpg" alt="Back to School" />
            </div>

            <div className="media__content">
              <h5 className="media__title media__title--plain">Back to School</h5>
              <p className="media__text">
                Welcome back Students! Get ready for exciting events, schedules, and enjoy your school days!
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
