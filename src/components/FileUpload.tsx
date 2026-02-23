import { DragEvent, useState } from "react";
import axios from "axios";
import { API_BASE } from "../config";
import { safeRequest } from "../api/request";

interface Props {
  onUploaded?: (data: unknown) => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function FileUpload({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  function validate(selected: File | null) {
    if (!selected) {
      return false;
    }

    if (selected.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return false;
    }

    if (selected.size > MAX_FILE_BYTES) {
      setError("Max 5MB file size");
      return false;
    }

    setError("");
    return true;
  }

  function onSelect(files: FileList | null) {
    if (!files?.length) {
      setFile(null);
      return;
    }

    if (files.length > 1) {
      setError("Please upload a single file.");
      setFile(null);
      return;
    }

    const selected = files[0];

    if (!validate(selected)) {
      setFile(null);
      return;
    }

    setFile(selected);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    onSelect(event.dataTransfer.files);
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
        <p>Drag and drop one PDF (max 5MB), or choose a file.</p>
        <input
          type="file"
          accept="application/pdf"
          multiple={false}
          onChange={(e) => onSelect(e.target.files)}
        />
      </div>

      {file && <p>Ready: {file.name}</p>}
      {error && <p>{error}</p>}

      <button onClick={upload} disabled={!file || uploading}>
        {uploading ? "Uploading..." : "Upload PDF"}
      </button>
    </div>
  );
}
