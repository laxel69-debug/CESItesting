import React, { useState, useEffect, useRef } from "react";
import "../ParentWebsiteCSS/Messages.css";

const Messages = () => {
  const [currentTab, setCurrentTab] = useState("group"); // 'group' or 'private'
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);

  const [groupMessages, setGroupMessages] = useState([
    {
      id: 1,
      sender: "Ms. Garcia (Teacher)",
      text: "Good morning! Please check the new schedule in the portal.",
      type: "teacher",
      time: "08:00 AM",
    },
    { id: 2, sender: "Mark's Mom", text: "Received, thank you!", type: "parent-other", time: "08:15 AM" },
  ]);

  const [privateMessages, setPrivateMessages] = useState([
    {
      id: 1,
      sender: "Ms. Garcia (Teacher)",
      text: "Hello! Jhon's project is due tomorrow. Just a friendly reminder.",
      type: "teacher",
      time: "09:30 AM",
    },
  ]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [groupMessages, privateMessages, currentTab]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now(),
      sender: "You",
      text: input,
      type: "parent-me",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    if (currentTab === "group") {
      setGroupMessages((prev) => [...prev, newMessage]);
    } else {
      setPrivateMessages((prev) => [...prev, newMessage]);
    }
    setInput("");
  };

  const activeMessages = currentTab === "group" ? groupMessages : privateMessages;

  return (
    <div className="chat-main-layout">
      {/* left sub-nav inside content */}
      <aside className="chat-nav-sidebar">
        <div className="chat-nav-header">Messages</div>

        <button
          type="button"
          className={`chat-nav-item ${currentTab === "group" ? "active" : ""}`}
          onClick={() => setCurrentTab("group")}
        >
          <i className="bi bi-people-fill"></i>
          <span>Class Group Chat</span>
        </button>

        <button
          type="button"
          className={`chat-nav-item ${currentTab === "private" ? "active" : ""}`}
          onClick={() => setCurrentTab("private")}
        >
          <i className="bi bi-person-badge-fill"></i>
          <span>Ms. Garcia (Adviser)</span>
        </button>
      </aside>

      {/* chat panel */}
      <section className="chat-container">
        <header className="chat-header">
          <div
            className="avatar-circle"
            style={{
              width: "45px",
              height: "45px",
              backgroundColor: "#24148a",
              color: "#fff",
            }}
          >
            {currentTab === "group" ? "G6" : "MG"}
          </div>

          <div>
            <h4 style={{ margin: 0, fontWeight: 900, color: "#24148a" }}>
              {currentTab === "group" ? "Grade 6 - Section A" : "Ms. Elena Garcia"}
            </h4>
            <small>
              <span className="status-dot"></span> Active Now
            </small>
          </div>
        </header>

        <div className="messages-area" ref={scrollRef}>
          {activeMessages.map((msg) => {
            const isMine = msg.type === "parent-me";
            const isTeacher = msg.type === "teacher";

            return (
              <div
                key={msg.id}
                className={`message-bubble ${isTeacher ? "teacher-msg" : "parent-msg"} ${
                  isMine ? "my-msg" : ""
                }`}
              >
                {currentTab === "group" && !isMine && (
                  <span
                    className="sender-name"
                    style={{ color: isTeacher ? "#24148a" : "#e63946" }}
                  >
                    {msg.sender}
                  </span>
                )}

                <p style={{ margin: 0, fontWeight: 500 }}>{msg.text}</p>
                <span className="timestamp">{msg.time}</span>
              </div>
            );
          })}
        </div>

        <form className="chat-input-area" onSubmit={handleSend}>
          <input
            type="text"
            className="chat-input"
            placeholder={currentTab === "group" ? "Talk to the class..." : "Send private message..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="send-btn">
            SEND <i className="bi bi-send-fill ms-1"></i>
          </button>
        </form>
      </section>
    </div>
  );
};

export default Messages;
