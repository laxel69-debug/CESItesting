import React from "react";
import "../TeacherWebsiteCSS/Dashboard.css";

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

          <div className="card__body card__body--flush">
            <div className="list">
              <div className="list__staticItem">
                <div className="announce__title announce__title--danger">Library is now Open</div>
                <div className="announce__meta">⏰ 8:00 AM - 5:00 PM</div>
              </div>

              <div className="list__staticItem">
                <div className="announce__title">Enrollment Period</div>
                <div className="announce__meta">Second Semester enrollment starts on July 15.</div>
              </div>

              <div className="list__staticItem">
                <div className="announce__title">Uniform Policy</div>
                <div className="announce__meta">Full uniform is required starting Monday.</div>
              </div>
            </div>
          </div>

          <div className="card__footer">
            <a className="link link--danger" href="#">See All Updates</a>
          </div>
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
