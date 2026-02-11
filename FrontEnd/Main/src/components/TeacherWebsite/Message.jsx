import React, { useState } from "react";
import "../TeacherWebsiteCSS/Message.css";

const Message = () => {
  const [activeChat, setActiveChat] = useState({
    id: 101,
    type: "group",
    name: "Grade 1 - Einstein (Parents)",
    members: "30 Members",
  });

  const groups = [
    { id: 101, name: "Grade 1 - Einstein (Parents)", members: "30 Members", lastMsg: "Reminder: Field trip tomorrow.", time: "9:15 AM" },
    { id: 102, name: "Faculty Room 101", members: "12 Members", lastMsg: "Meeting moved to 3PM.", time: "Yesterday" },
  ];

  const contacts = [
    { id: 1, name: "Maria Clara", role: "Parent", lastMsg: "Thank you teacher!", time: "10:30 AM" },
    { id: 2, name: "Juan Dela Cruz", role: "Student", lastMsg: "Sir, I sent the file.", time: "8:45 AM" },
    { id: 3, name: "Principal Ramos", role: "Admin", lastMsg: "Reports received.", time: "Oct 17" },
  ];

  const isActive = (id) => activeChat?.id === id;

  return (
    <div className="msg">
      {/* Top bar */}
      <div className="msg__top">
        <h2 className="msg__title">Messages</h2>

        <button className="msg__newBtn" type="button">
          <span className="msg__icon" aria-hidden="true">➕</span>
          New Chat
        </button>
      </div>

      <div className="msg__shell">
        {/* LEFT: chat list */}
        <aside className="msg__listPane">
          <div className="msg__searchBar">
            <span className="msg__searchIcon" aria-hidden="true">🔎</span>
            <input className="msg__searchInput" type="text" placeholder="Search chats..." />
          </div>

          <div className="msg__scroll">
            <div className="msg__sectionTitle">GROUP CHATS</div>

            {groups.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveChat({ id: g.id, type: "group", name: g.name, members: g.members })}
                className={"msgItem " + (isActive(g.id) ? "msgItem--active" : "")}
              >
                <div className="msgItem__avatar msgItem__avatar--group" aria-hidden="true">👥</div>

                <div className="msgItem__main">
                  <div className="msgItem__row">
                    <div className="msgItem__name" title={g.name}>{g.name}</div>
                    <div className="msgItem__time">{g.time}</div>
                  </div>
                  <div className="msgItem__preview" title={g.lastMsg}>{g.lastMsg}</div>
                </div>
              </button>
            ))}

            <div className="msg__sectionTitle msg__sectionTitle--spaced">DIRECT MESSAGES</div>

            {contacts.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveChat({ id: c.id, type: "private", name: c.name, role: c.role })}
                className={"msgItem " + (isActive(c.id) ? "msgItem--active" : "")}
              >
                <div className="msgItem__avatar msgItem__avatar--user" aria-hidden="true">
                  {c.name.charAt(0)}
                </div>

                <div className="msgItem__main">
                  <div className="msgItem__row">
                    <div className="msgItem__name" title={c.name}>{c.name}</div>
                    <div className="msgItem__time">{c.time}</div>
                  </div>
                  <div className="msgItem__preview" title={c.lastMsg}>{c.lastMsg}</div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* RIGHT: chat window */}
        <section className="msg__chatPane">
          {/* chat header */}
          <div className="chatHead">
            <div className="chatHead__left">
              {activeChat.type === "group" ? (
                <div className="chatHead__avatar chatHead__avatar--group" aria-hidden="true">👥</div>
              ) : (
                <div className="chatHead__avatar chatHead__avatar--user" aria-hidden="true">
                  {activeChat.name?.charAt(0)}
                </div>
              )}

              <div className="chatHead__meta">
                <div className="chatHead__name">{activeChat.name}</div>
                <div className="chatHead__status">
                  {activeChat.type === "group" ? activeChat.members : "Online Now"}
                </div>
              </div>
            </div>

            <div className="chatHead__actions">
              <button className="iconBtn" type="button" aria-label="Call">📞</button>
              <button className="iconBtn" type="button" aria-label="Video">🎥</button>
              <button className="iconBtn" type="button" aria-label="Info">ℹ️</button>
            </div>
          </div>

          {/* chat body */}
          <div className="chatBody">
            {/* received */}
            <div className="bubbleWrap bubbleWrap--left">
              {activeChat.type === "group" && (
                <div className="bubbleMeta">Mrs. Rodriguez (Parent)</div>
              )}
              <div className="bubble bubble--recv">
                Good morning Teacher Jhon! Will the classroom be open early today for the project setup?
              </div>
              <div className="bubbleTime">9:10 AM</div>
            </div>

            {/* sent */}
            <div className="bubbleWrap bubbleWrap--right">
              <div className="bubble bubble--sent">
                Yes, I&apos;ll be there by 7:00 AM to assist everyone. See you!
              </div>
              <div className="bubbleTime bubbleTime--right">9:12 AM</div>
            </div>

            {/* received */}
            <div className="bubbleWrap bubbleWrap--left">
              {activeChat.type === "group" && <div className="bubbleMeta">Principal Ramos</div>}
              <div className="bubble bubble--recv">
                Please ensure all students bring their consent forms for the trip.
              </div>
              <div className="bubbleTime">10:05 AM</div>
            </div>
          </div>

          {/* input */}
          <div className="chatInput">
            <button className="iconBtn iconBtn--flat" type="button" aria-label="Add">➕</button>
            <button className="iconBtn iconBtn--flat" type="button" aria-label="Image">🖼️</button>

            <input className="chatInput__field" type="text" placeholder="Type a message..." />

            <button className="chatInput__send" type="button" aria-label="Send">
              ✈️
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Message;
