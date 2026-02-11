import { useState } from "react";
import { MessageSquare, X } from "lucide-react";
import "../AdminWebsiteCSS/FloatingMessages.css";

export default function FloatingMessages() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);

  const openMessages = async () => {
    setOpen(true);

    try {
      const res = await fetch("http://localhost:5000/api/messages");
      const data = await res.json();
      setMessages(data);
    } catch {
      // fallback dummy so panel still works
      setMessages([
        { id: 1, text: "API not connected yet." },
        { id: 2, text: "This is your floating messages panel." }
      ]);
    }
  };

  return (
    <>
      <button className="floating-msg-btn" onClick={openMessages}>
        <MessageSquare size={28} />
      </button>

      {open && (
        <div className="msg-panel">
          <div className="msg-header">
            <span>Messages</span>
            <X size={18} onClick={() => setOpen(false)} className="close-btn"/>
          </div>

          <div className="msg-body">
            {messages.map(msg => (
              <div key={msg.id} className="msg-item">
                {msg.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
