const API = "/api";

function headers(includeJson = true) {
  const h = {};
  if (includeJson) h["Content-Type"] = "application/json";
  const token = localStorage.getItem("token");
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(url, options = {}) {
  const res = await fetch(`${API}${url}`, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const authApi = {
  register: (body) =>
    request("/auth/register", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }),
  login: (body) =>
    request("/auth/login", {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(body),
    }),
  me: () => request("/auth/me", { headers: headers() }),
};

export const documentsApi = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/documents${q ? `?${q}` : ""}`, { headers: headers() });
  },
  get: (id) => request(`/documents/${id}`, { headers: headers() }),
  create: (formData) =>
    fetch(`${API}/documents`, {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      return data;
    }),
  update: (id, formData) =>
    fetch(`${API}/documents/${id}`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      return data;
    }),
  remove: (id) =>
    request(`/documents/${id}`, { method: "DELETE", headers: headers() }),
  downloadUrl: (id) => `${API}/documents/${id}/download`,
};
