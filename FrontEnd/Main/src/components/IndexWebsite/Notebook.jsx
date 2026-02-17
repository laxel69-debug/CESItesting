import React, { useState, useEffect } from "react";
import AnnouncementCard from "./AnnouncementCard";
import { useNavigate } from "react-router-dom";
import "../IndexWebsiteCSS/Notebook.css";

const API_BASE = "";  // use Vite proxy

const Notebook = ({ onClose, openEnrollment }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("announcements");
  const [announcements, setAnnouncements] = useState([]);

  // ✅ Fetch announcements (public endpoint, no auth needed)
  useEffect(() => {
    fetch(`${API_BASE}/api/announcements/`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setAnnouncements(list);
      })
      .catch((err) => console.error("Error fetching announcements:", err));
  }, []);

  // ✅ helper: pick first image from media[]
  function getFirstImagePath(a) {
    const firstImage = a?.media?.find((m) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(m?.file || m?.file_url || "")
    );
    return firstImage?.file || firstImage?.file_url || null;
  }

  const content = {
    announcements: {
      title: "Announcements",
      content: (
        <div className="announcements-container">
          {announcements.length === 0 ? (
            <p>No announcements yet.</p>
          ) : (
            announcements.map((a) => (
              <AnnouncementCard
                key={a.id}
                title={a.title || "Untitled"}
                date={a.publish_date || a.created_at}
                description={a.content || a.description || ""}
                image={getFirstImagePath(a)}
              />
            ))
          )}
        </div>
      ),
    },

    "school-info": {
      title: "School Information",
      content: (
        <>
          <h3>Welcome to CESI!</h3>
          <p>
            Caloocan Evangelical School Inc. (CESI) is a School Ministry of
            Caloocan Evangelical Church Inc., dedicated to providing quality
            Christian education since 1982. We nurture young minds from Nursery,
            Kindergarten, and Preparatory classes up to Grade 6.
          </p>
          <p>
            🏫 <strong>Founded:</strong> February 12, 1982
            <br />
            📚 <strong>Grade Levels:</strong> Nursery, Kindergarten, Preparatory,
            Grade 1-6
            <br />
            📖 <strong>Curriculum:</strong> DepEd-recognized Enhanced K-12
            Program (Government Recognition No. E-011 S.2011 &amp; P-014 S.2011)
            <br />
            📍 <strong>Location:</strong> #47 P. Zamora St., Caloocan City
          </p>
        </>
      ),
    },

    "mission-vision": {
      title: "Mission & Vision",
      content: (
        <>
          <h3>Philosophy</h3>
          <p style={{ textAlign: "justify", textIndent: "2em" }}>
            CESI shall train children in basic life concepts and in all phases
            of developments: socially, emotionally, physically, intellectually
            and spiritually with emphasis on the evidence of the Almighty God.
            The school adheres to the spiritual mandate “Train up a child in the
            way he should go, and when he is old, he will not turn from it.
            (Proverbs 22:6)"
          </p>

          <h3>Our Mission</h3>
          <p style={{ textAlign: "justify", textIndent: "2em" }}>
            The mission of the School aims to train young people in the basic
            skills necessary for success in everyday living through a effective,
            flexible and challenging curriculum and approaches that will develop
            in them autonomy, appropriate knowledge and attitude, proper study
            habits, desirable Christian values, acceptable social behavior,
            personal discipline, love of country, and respect for elders as a
            preparation for further education.
          </p>

          <h3>Our Vision</h3>
          <p style={{ textAlign: "justify", textIndent: "2em" }}>
            The vision of the School states that CESI shall serve as a nucleus
            for strong basic Christian education, proclaiming Jesus Christ as
            Lord and Savior, and developing children to become well-rounded
            persons: God-fearing, physically fit, emotionally stable, mentally
            alert, socially adaptable and law-abiding citizens of the Republic
            of the Philippines.
          </p>

          <h3>Core Values</h3>
          <div style={{ display: "table", margin: "0 auto" }}>
            <p style={{ textAlign: "left" }}>
              <strong>C</strong>reative and Holistic
              <br />
              <strong>E</strong>nglish Speaking Environment
              <br />
              <strong>S</strong>ingapore Mathematics
              <br />
              <strong>I</strong>ntegrated Christian Values
            </p>
          </div>
        </>
      ),
    },

    "enrollment-form": {
      title: "Enrollment Form",
      content: null,
    },

    contact: {
      title: "Contact & Inquiry",
      content: (
        <>
          <h3>📞 Get in Touch</h3>
          <p>
            <strong>Phone:</strong> (02) 8-285-3702 / 0905-299-6303
          </p>
          <p>
            <strong>Email:</strong> caloocanevangelicalschool@gmail.com
          </p>
          <p>
            <strong>Address:</strong> #47 P. Zamora St. Caloocan City, Metro
            Manila
          </p>

          <h3>⏰ Office Hours</h3>
          <p>Monday to Friday: 8:00 AM - 4:30 PM</p>

          <h3>💬 Social Media</h3>
          <p>Facebook: @cesicaloocan</p>
        </>
      ),
    },
  };

  return (
    <div className="notebook-container">
      <div className="notebook-header">
        <h2>CESI Student Manual</h2>
        <button className="close-btn" onClick={onClose}>
          ✕ Close Book
        </button>
      </div>

      <div className="notebook-content">
        {/* Left Bookmarks */}
        <div className="bookmarks-left">
          {[
            "announcements",
            "school-info",
            "mission-vision",
            "enrollment-form",
            "contact",
          ].map((tab) => (
            <button
              key={tab}
              className={`bookmark-btn ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {content[tab].title}
            </button>
          ))}
        </div>

        {/* Notebook Pages */}
        <div className="notebook-pages">
          {/* Left Page */}
          <div className="page-left">
            <div className="page-content">
              <h2>{content[activeTab].title}</h2>

              {activeTab === "enrollment-form" ? (
                <div>
                  <p>Click the button below to fill out the enrollment form:</p>
                  <button
                    className="apply-btn"
                    onClick={() => {
                      openEnrollment();
                      onClose();
                    }}
                  >
                    Apply Now
                  </button>
                </div>
              ) : (
                content[activeTab].content
              )}
            </div>

            <div className="page-footer">
              <div className="page-number">CESI Elementary</div>
              <div className="page-date">Student Edition</div>
            </div>
          </div>

          {/* Right Page */}
          <div className="page-right">
            <div className="action-section">
              <h3>📋 Quick Actions</h3>
              <button
                className="action-btn enrollment-btn"
                onClick={() => navigate("./login")}
              >
                👤 Login
              </button>
              <button
                className="action-btn enrollment-btn"
                onClick={() => setActiveTab("enrollment-form")}
              >
                🎓 Enrollment Procedure
              </button>

              <div className="quick-info">
                <h4>❓ Need Help?</h4>
                <p>
                  For admission inquiries, visit our Registrar's Office from
                  Monday to Friday, 8:00 AM to 4:30 PM.
                </p>
              </div>

              <div className="quick-links">
                <h4>🔗 Quick Links</h4>
                <a
                  href="https://www.facebook.com/cesicaloocan"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="link-btn">🔔 Facebook</button>
                </a>
                <a href="../../../public/oh.pdf" target="_blank" rel="noopener noreferrer">
                  <button className="link-btn">📅 School Calendar</button>
                </a>
                <a href="../../../public/oh.pdf" target="_blank" rel="noopener noreferrer">
                  <button className="link-btn">📚 Tuition Fees</button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notebook;
