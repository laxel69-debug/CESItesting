import React, { useState } from "react";
import "../IndexWebsiteCSS/AnnouncementCard.css";

// const API_BASE = "http://127.0.0.1:8000";

// function AnnouncementCard({ title, date, image, description }) {
//   const [expanded, setExpanded] = useState(false);
//   const [zoomed, setZoomed] = useState(false);

//   const safeDescription = String(description || "");
//   const showToggle = safeDescription.length > 100;

//   const imageSrc = image
//     ? image.startsWith("http")
//       ? image
//       : `${API_BASE}${image}`
//     : null;

//   return (
//     <>
//       <div className="announcement-card">
//         <div className="announcement-body">
//           <h4>{title || "Untitled"}</h4>
//           <small>{date ? new Date(date).toLocaleDateString() : ""}</small>

//           <p className={expanded ? "expanded" : "collapsed"}>
//             {safeDescription}
//           </p>

//           {showToggle && (
//             <button
//               onClick={() => setExpanded((v) => !v)}
//               className="expand-btn"
//               type="button"
//             >
//               {expanded ? "Show Less" : "Read More"}
//             </button>
//           )}

//           {/* ✅ CLICK TO ZOOM */}
//           {imageSrc && (
//             <img
//               src={imageSrc}
//               alt={title}
//               className="announcement-image zoomable"
//               onClick={() => setZoomed(true)}
//             />
//           )}
//         </div>
//       </div>

//       {/* ✅ ZOOM OVERLAY */}
//       {zoomed && (
//         <div className="image-overlay" onClick={() => setZoomed(false)}>
//           <span className="close-btn">✕</span>
//           <img src={imageSrc} alt="Zoomed" className="zoomed-image" />
//         </div>
//       )}
//     </>
//   );
// }

function AnnouncementCard({ title, date, image, description }) {
  const [expanded, setExpanded] = useState(false);

  // Ensure description is a string
  const safeDescription = description || "";

  return (
    <div className="announcement-card">
      {image && <img src={`http://127.0.0.1:8000${image}`} alt={title} className="announcement-image" />}

      <div className="announcement-body">
        <h4>{title}</h4>
        <small>{date ? new Date(date).toLocaleDateString() : ""}</small>
        <p className={expanded ? "expanded" : "collapsed"}>
          {safeDescription}
        </p>
        {safeDescription.length > 100 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="expand-btn"
          >
            {expanded ? "Show Less" : "Read More"}
          </button>
        )}
      </div>
    </div>
  );
}
export default AnnouncementCard;
