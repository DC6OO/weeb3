import { Router } from "express";
import fs from "fs";
import path from "path";
import pool from "../db/pool.js";
import { requireAuth } from "../middleware/auth.js";
import { upload, uploadDir } from "../middleware/upload.js";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  const { q, category } = req.query;
  const params = [];
  let sql = `
    SELECT d.id, d.title, d.description, d.category, d.file_name, d.mime_type,
           d.file_size, d.created_at, d.updated_at, d.user_id,
           u.name AS uploader_name
    FROM documents d
    JOIN users u ON u.id = d.user_id
    WHERE 1=1`;

  if (q?.trim()) {
    params.push(`%${q.trim()}%`);
    sql += ` AND (d.title ILIKE $${params.length} OR d.description ILIKE $${params.length})`;
  }
  if (category?.trim()) {
    params.push(category.trim());
    sql += ` AND d.category = $${params.length}`;
  }
  sql += " ORDER BY d.created_at DESC";

  try {
    const { rows } = await pool.query(sql, params);
    res.json({ documents: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load documents." });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT d.*, u.name AS uploader_name
       FROM documents d
       JOIN users u ON u.id = d.user_id
       WHERE d.id = $1`,
      [req.params.id],
    );
    if (!rows[0]) return res.status(404).json({ error: "Document not found." });
    res.json({ document: rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load document." });
  }
});

router.get("/:id/download", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT file_name, stored_name, mime_type FROM documents WHERE id = $1",
      [req.params.id],
    );
    const doc = rows[0];
    if (!doc) return res.status(404).json({ error: "Document not found." });

    const filePath = path.join(uploadDir, doc.stored_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File missing on server." });
    }
    res.download(filePath, doc.file_name);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Download failed." });
  }
});

router.post("/", requireAuth, upload.single("file"), async (req, res) => {
  const { title, description, category } = req.body;
  if (!title?.trim()) {
    if (req.file) fs.unlinkSync(path.join(uploadDir, req.file.filename));
    return res.status(400).json({ error: "Title is required." });
  }
  if (!req.file) {
    return res.status(400).json({ error: "A file is required (PDF, Word, or PowerPoint)." });
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO documents
         (user_id, title, description, category, file_name, stored_name, mime_type, file_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        req.user.id,
        title.trim(),
        description?.trim() || null,
        category?.trim() || "General",
        req.file.originalname,
        req.file.filename,
        req.file.mimetype,
        req.file.size,
      ],
    );
    res.status(201).json({ document: rows[0] });
  } catch (err) {
    if (req.file) fs.unlinkSync(path.join(uploadDir, req.file.filename));
    console.error(err);
    res.status(500).json({ error: "Upload failed." });
  }
});

router.put("/:id", requireAuth, upload.single("file"), async (req, res) => {
  const { title, description, category } = req.body;

  try {
    const { rows: existing } = await pool.query(
      "SELECT * FROM documents WHERE id = $1",
      [req.params.id],
    );
    const doc = existing[0];
    if (!doc) return res.status(404).json({ error: "Document not found." });
    if (doc.user_id !== req.user.id && req.user.role !== "staff") {
      return res.status(403).json({ error: "You can only edit your own documents." });
    }

    const newTitle = title?.trim() || doc.title;
    const newDesc = description !== undefined ? description?.trim() || null : doc.description;
    const newCat = category?.trim() || doc.category;
    let storedName = doc.stored_name;
    let fileName = doc.file_name;
    let mimeType = doc.mime_type;
    let fileSize = doc.file_size;

    if (req.file) {
      const oldPath = path.join(uploadDir, doc.stored_name);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      storedName = req.file.filename;
      fileName = req.file.originalname;
      mimeType = req.file.mimetype;
      fileSize = req.file.size;
    }

    const { rows } = await pool.query(
      `UPDATE documents SET
         title = $1, description = $2, category = $3,
         file_name = $4, stored_name = $5, mime_type = $6, file_size = $7,
         updated_at = NOW()
       WHERE id = $8 RETURNING *`,
      [newTitle, newDesc, newCat, fileName, storedName, mimeType, fileSize, doc.id],
    );
    res.json({ document: rows[0] });
  } catch (err) {
    if (req.file) fs.unlinkSync(path.join(uploadDir, req.file.filename));
    console.error(err);
    res.status(500).json({ error: "Update failed." });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM documents WHERE id = $1",
      [req.params.id],
    );
    const doc = rows[0];
    if (!doc) return res.status(404).json({ error: "Document not found." });
    if (doc.user_id !== req.user.id && req.user.role !== "staff") {
      return res.status(403).json({ error: "You can only delete your own documents." });
    }

    await pool.query("DELETE FROM documents WHERE id = $1", [doc.id]);
    const filePath = path.join(uploadDir, doc.stored_name);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Document deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Delete failed." });
  }
});

export default router;
