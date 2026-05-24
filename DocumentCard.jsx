function fileIcon(mime, name) {
  const n = (name || "").toLowerCase();
  if (mime?.includes("pdf") || n.endsWith(".pdf")) return "PDF";
  if (mime?.includes("word") || n.endsWith(".doc") || n.endsWith(".docx"))
    return "DOC";
  if (mime?.includes("presentation") || n.endsWith(".ppt") || n.endsWith(".pptx"))
    return "PPT";
  return "FILE";
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function DocumentCard({
  doc,
  currentUserId,
  isStaff,
  onEdit,
  onDelete,
  onDownload,
}) {
  const canManage = doc.user_id === currentUserId || isStaff;

  return (
    <article className="doc-card">
      <div className={`doc-icon doc-icon-${fileIcon(doc.mime_type, doc.file_name).toLowerCase()}`}>
        {fileIcon(doc.mime_type, doc.file_name)}
      </div>
      <div className="doc-body">
        <h3>{doc.title}</h3>
        {doc.description && <p className="doc-desc">{doc.description}</p>}
        <div className="doc-meta">
          <span className="badge">{doc.category}</span>
          <span>{formatSize(doc.file_size)}</span>
          <span>By {doc.uploader_name}</span>
        </div>
      </div>
      <div className="doc-actions">
        <button type="button" className="btn btn-sm" onClick={() => onDownload(doc)}>
          Download
        </button>
        {canManage && (
          <>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => onEdit(doc)}>
              Edit
            </button>
            <button
              type="button"
              className="btn btn-sm btn-danger"
              onClick={() => onDelete(doc)}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </article>
  );
}
