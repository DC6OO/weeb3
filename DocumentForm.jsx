import { useState } from "react";

const CATEGORIES = [
  "General",
  "Lecture Notes",
  "Assignments",
  "Research",
  "Presentations",
  "Lab Manuals",
];

const ACCEPT =
  ".pdf,.doc,.docx,.ppt,.pptx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

export default function DocumentForm({ document, onSubmit, onCancel }) {
  const isEdit = Boolean(document);
  const [title, setTitle] = useState(document?.title || "");
  const [description, setDescription] = useState(document?.description || "");
  const [category, setCategory] = useState(document?.category || "General");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!isEdit && !file) {
      setError("Please choose a PDF, Word, or PowerPoint file.");
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", title);
      fd.append("description", description);
      fd.append("category", category);
      if (file) fd.append("file", file);
      await onSubmit(fd);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="doc-form" onSubmit={handleSubmit}>
      {error && <div className="alert alert-error">{error}</div>}
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Description
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </label>
      <label>
        Category
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="file-label">
        {isEdit ? "Replace file (optional)" : "File (PDF, Word, PowerPoint)"}
        <input
          type="file"
          accept={ACCEPT}
          onChange={(e) => setFile(e.target.files[0] || null)}
          required={!isEdit}
        />
        {file && <span className="file-name">{file.name}</span>}
        {isEdit && !file && (
          <span className="file-name muted">Current: {document.file_name}</span>
        )}
      </label>
      <div className="form-actions">
        <button type="button" className="btn btn-ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {busy ? "Saving…" : isEdit ? "Update" : "Upload"}
        </button>
      </div>
    </form>
  );
}
