import { DragEvent, useMemo, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { safeRequest } from "../api/request";

interface Props {
  maxSizeMb?: number;
  onUploaded?: (data: unknown) => void;
}

export default function FileUpload({ maxSizeMb = 10, onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const maxBytes = useMemo(() => maxSizeMb * 1024 * 1024, [maxSizeMb]);

  function validate(selected: File | null) {
    if (!selected) {
      return false;
    }

    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return false;
    }

    if (selected.size > maxBytes) {
      setError(`File exceeds ${maxSizeMb}MB.`);
      return false;
    }

    setError("");
    return true;
  }

  function onSelect(selected: File | null) {
    if (!validate(selected)) {
      setFile(null);
      return;
    }

    setFile(selected);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    onSelect(event.dataTransfer.files?.[0] || null);
  }

  async function upload() {
    if (!file || uploading) {
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const data = await safeRequest(
        axios.post(`${API_BASE}/bi/upload`, formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        })
      );

      onUploaded?.(data);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        style={{ border: "1px dashed #999", borderRadius: 8, padding: 16, marginBottom: 10 }}
      >
        <p>Drag and drop a PDF here, or choose a file.</p>
        <input type="file" accept="application/pdf" onChange={(e) => onSelect(e.target.files?.[0] || null)} />
      </div>

      {file && <p>Ready: {file.name}</p>}
      {error && <p>{error}</p>}

      <button onClick={upload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>
  );
}
