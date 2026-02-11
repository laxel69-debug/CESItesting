import { getToken } from "../auth/auth";

const API_BASE = "";  // use Vite proxy

export async function fetchAnnouncements() {
  const token = getToken();

  const res = await fetch(`${API_BASE}/api/announcements/`, {
    headers: {
      ...(token ? { Authorization: `Token ${token}` } : {}),
    },
  });

  if (!res.ok) throw new Error("Failed to load announcements");
  return res.json();
}

export async function createAnnouncement({
  title,
  content,
  target_role,
  publish_date,
  files,
}) {
  const token = getToken();
  if (!token) throw new Error("Not authenticated");

  const form = new FormData();
  form.append("title", title);
  form.append("content", content);
  form.append("target_role", target_role);
  form.append("publish_date", publish_date);

  for (const file of files) {
    form.append("files", file);
  }

  const res = await fetch(
    `${API_BASE}/api/announcements/create-with-media/`,
    {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
      },
      body: form,
    }
  );

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Create failed");
  return data;
}
