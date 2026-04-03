import { DragEvent, useState } from "react";
import { enqueueUpload } from "../lib/uploadQueue";

interface Props {
  appId: string;
  onUploaded?: (data: unknown) => void;
}

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export default function FileUpload({ appId, onUploaded }: Props) {
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

      if (!navigator.onLine) {
        await enqueueUpload({
          url: `/api/v1/application/${appId}/documents`,
          formData
        });

        onUploaded?.({ queued: true });
        return;
      }

      const response = await fetch(`/api/v1/application/${appId}/documents`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });

      const data = await response.json().catch(() => null);
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
