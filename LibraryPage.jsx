import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { documentsApi } from "../api.js";
import DocumentCard from "../components/DocumentCard.jsx";
import DocumentForm from "../components/DocumentForm.jsx";

export default function LibraryPage() {
  const { user, logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (search.trim()) params.q = search.trim();
      if (category) params.category = category;
      const { documents: list } = await documentsApi.list(params);
      setDocuments(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  async function handleCreate(formData) {
    await documentsApi.create(formData);
    setModal(null);
    load();
  }

  async function handleUpdate(formData) {
    await documentsApi.update(modal.id, formData);
    setModal(null);
    load();
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.title}"?`)) return;
    try {
      await documentsApi.remove(doc.id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  function handleDownload(doc) {
    const token = localStorage.getItem("token");
    const url = documentsApi.downloadUrl(doc.id);
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => {
        if (!res.ok) throw new Error("Download failed");
        return res.blob();
      })
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = doc.file_name;
        a.click();
        URL.revokeObjectURL(a.href);
      })
      .catch((err) => alert(err.message));
  }

  return (
    <div className="library">
      <header className="library-header">
        <div>
          <p className="eyebrow">Zambia University of Technology</p>
          <h1>Digital Resource Library</h1>
          <p className="subtitle">
            Upload and share PDF, Word, and PowerPoint materials
          </p>
        </div>
        <div className="header-user">
          <span>
            {user.name} <em>({user.role})</em>
          </span>
          <button type="button" className="btn btn-ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <section className="toolbar">
        <input
          type="search"
          placeholder="Search title or description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="General">General</option>
          <option value="Lecture Notes">Lecture Notes</option>
          <option value="Assignments">Assignments</option>
          <option value="Research">Research</option>
          <option value="Presentations">Presentations</option>
          <option value="Lab Manuals">Lab Manuals</option>
        </select>
        <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: "create" })}>
          + Upload document
        </button>
      </section>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="doc-list">
        {loading ? (
          <p className="muted">Loading documents…</p>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <p>No documents yet.</p>
            <button type="button" className="btn btn-primary" onClick={() => setModal({ mode: "create" })}>
              Upload the first file
            </button>
          </div>
        ) : (
          documents.map((doc) => (
            <DocumentCard
              key={doc.id}
              doc={doc}
              currentUserId={user.id}
              isStaff={user.role === "staff"}
              onEdit={(d) => setModal({ mode: "edit", ...d })}
              onDelete={handleDelete}
              onDownload={handleDownload}
            />
          ))
        )}
      </section>

      {modal && (
        <div className="modal-backdrop" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{modal.mode === "create" ? "Upload document" : "Edit document"}</h2>
            <DocumentForm
              document={modal.mode === "edit" ? modal : null}
              onSubmit={modal.mode === "create" ? handleCreate : handleUpdate}
              onCancel={() => setModal(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
