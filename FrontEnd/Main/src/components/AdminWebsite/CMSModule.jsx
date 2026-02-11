import { useEffect, useMemo, useState } from "react";
import "../AdminWebsiteCSS/CMSModule.css";
import { useAuth } from "../Auth/useAuth";
import { getToken } from "../Auth/auth";

const API_BASE = "http://127.0.0.1:8000";

function toLocalDatetimeInputValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// Auto-detect JWT vs DRF Token
function authHeader(token) {
  if (!token) return {};
  const isJwt = token.split(".").length === 3;
  return { Authorization: `${isJwt ? "Bearer" : "Token"} ${token}` };
}

function isAdmin(user) {
  if (!user) return false;
  const isStaff = user.is_staff === true || user.is_staff === 1;
  const isSuper = user.is_superuser === true || user.is_superuser === 1;
  const role = String(user.role || "").toLowerCase();
  return isStaff || isSuper || role.includes("admin");
}

function MediaPreview({ media }) {
  if (!media?.length) return null;

  return (
    <div className="cms-media-grid">
      {media.map((m) => {
        const url = m.file_url || m.file;
        const name = String(m.file || "").toLowerCase();

        if (!url) return null;

        if (name.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
          return <img key={m.id} src={url} alt="" className="cms-post-media" />;
        }

        if (name.match(/\.(mp4|webm|ogg|mov)$/)) {
          return (
            <video key={m.id} controls className="cms-post-media">
              <source src={url} />
            </video>
          );
        }

        return (
          <a key={m.id} href={url} target="_blank" rel="noreferrer">
            Open file
          </a>
        );
      })}
    </div>
  );
}

export default function CMSModule() {
  const { user } = useAuth();
  const canPost = useMemo(() => isAdmin(user), [user]);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState("all");
  const [publishDate, setPublishDate] = useState(() =>
    toLocalDatetimeInputValue()
  );
  const [files, setFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function readError(res) {
    const text = await res.text().catch(() => "");
    return `HTTP ${res.status} ${res.statusText}${text ? ` — ${text}` : ""}`;
  }

  async function load() {
    setError("");
    setLoading(true);

    try {
      const token = getToken();
      const res = await fetch(`${API_BASE}/api/announcements/`, {
        headers: authHeader(token),
      });

      if (!res.ok) throw new Error(await readError(res));

      const data = await res.json();
      setPosts(Array.isArray(data) ? data : data.results || []);
    } catch (e) {
      setError(e.message || "Failed to load announcements");
    } finally {
      setLoading(false);
    }
  }

  // Load once
  useEffect(() => {
    load();
  }, []);

  // Cleanup previews whenever they change/unmount
  useEffect(() => {
    return () => imagePreviews.forEach((u) => URL.revokeObjectURL(u));
  }, [imagePreviews]);

  const handleFiles = (e) => {
    const list = Array.from(e.target.files || []);
    setFiles(list);

    // cleanup old previews
    imagePreviews.forEach((u) => URL.revokeObjectURL(u));

    // preview only images
    const previews = list
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => URL.createObjectURL(f));

    setImagePreviews(previews);
  };

  const handlePost = async () => {
    if (!canPost) {
      setError("Admins only can publish announcements.");
      return;
    }

    const token = getToken();
    if (!token) {
      setError("No token found. Your login API isn’t returning a token yet.");
      return;
    }

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    setError("");

    const form = new FormData();
    form.append("title", title);
    form.append("content", content);
    form.append("target_role", targetRole);
    form.append("publish_date", new Date(publishDate).toISOString());
    files.forEach((f) => form.append("files", f));

    try {
      const res = await fetch(`${API_BASE}/api/announcements/`, {
        method: "POST",
        headers: authHeader(token),
        body: form,
      });

      if (!res.ok) throw new Error(await readError(res));

      const created = await res.json();

      setPosts((prev) => [created, ...prev]);

      // reset form
      setTitle("");
      setContent("");
      setTargetRole("all");
      setPublishDate(toLocalDatetimeInputValue());
      setFiles([]);

      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
      setImagePreviews([]);
    } catch (e) {
      setError(e.message || "Failed to publish announcement");
    }
  };

  return (
    <div className="cms-container">
      <div className="cms-header">
        <h2>CMS Module (CESI Website Control)</h2>
        <button className="cms-refresh" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {!canPost && (
        <div className="cms-warning">Admins only can publish announcements.</div>
      )}

      {error && <div className="cms-error">{error}</div>}

      {canPost && (
        <div className="cms-card">
          <div className="cms-form-grid">
            <div className="cms-field">
              <label>Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Announcement title"
              />
            </div>

            <div className="cms-field">
              <label>Target role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="all">All</option>
                <option value="students">Students</option>
                <option value="teachers">Teachers</option>
                <option value="parents">Parents</option>
              </select>
            </div>

            <div className="cms-field">
              <label>Publish date</label>
              <input
                type="datetime-local"
                value={publishDate}
                onChange={(e) => setPublishDate(e.target.value)}
              />
            </div>

            <div className="cms-field cms-field-full">
              <label>Content</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write announcement..."
                rows={5}
              />
            </div>

            <div className="cms-field cms-field-full">
              <label>Photos / Videos</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={handleFiles}
              />
              {imagePreviews.length > 0 && (
                <div className="cms-preview-grid">
                  {imagePreviews.map((src, idx) => (
                    <img key={idx} src={src} className="preview-img" alt="" />
                  ))}
                </div>
              )}
            </div>

            <div className="cms-actions">
              <button className="cms-publish" onClick={handlePost}>
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="cms-posts">
        <h3>Posted Announcements</h3>

        {loading ? (
          <p>Loading…</p>
        ) : posts.length === 0 ? (
          <p>No announcements yet.</p>
        ) : (
          posts.map((post) => (
            <div key={post.id} className="cms-post">
              <div className="cms-post-top">
                <div className="cms-post-title">{post.title}</div>
                <div className="cms-post-meta">
                  <span className="cms-badge">{post.target_role}</span>
                  <span>
                    {post.publish_date
                      ? new Date(post.publish_date).toLocaleString()
                      : ""}
                  </span>
                </div>
              </div>

              <p className="cms-post-content">{post.content}</p>

              <MediaPreview media={post.media} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
