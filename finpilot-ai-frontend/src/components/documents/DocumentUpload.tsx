import { useCallback, useRef, useState } from "react";
import type { DragEvent } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { documentsApi } from "../../api/documents.api";
import { formatBytes } from "../../utils/format";
import { toApiError } from "../../api/axios";
import { cn } from "../../utils/cn";

const MAX_SIZE_BYTES = 10 * 1024 * 1024;

interface UploadTask {
  id: string;
  file: File;
  progress: number;
  state: "uploading" | "done" | "error";
  error?: string;
}

interface DocumentUploadProps {
  onUploaded?: () => void;
}

export function DocumentUpload({ onUploaded }: DocumentUploadProps) {
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(
    (file: File) => {
      if (file.type !== "application/pdf") {
        setTasks((prev) => [
          ...prev,
          { id: `${file.name}-${Date.now()}`, file, progress: 0, state: "error", error: "Only PDF files are supported." },
        ]);
        return;
      }
      if (file.size > MAX_SIZE_BYTES) {
        setTasks((prev) => [
          ...prev,
          { id: `${file.name}-${Date.now()}`, file, progress: 0, state: "error", error: "File exceeds the 10 MB limit." },
        ]);
        return;
      }

      const id = `${file.name}-${Date.now()}`;
      setTasks((prev) => [...prev, { id, file, progress: 0, state: "uploading" }]);

      documentsApi
        .upload(file, (percent) => {
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress: percent } : t)));
        })
        .then(() => {
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, progress: 100, state: "done" } : t)));
          onUploaded?.();
        })
        .catch((err) => {
          const { message } = toApiError(err);
          setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, state: "error", error: message } : t)));
        });
    },
    [onUploaded]
  );

  function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    Array.from(fileList).forEach(uploadFile);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        aria-label="Upload a PDF document"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-accent-teal bg-accent-teal-soft" : "border-slate-300 bg-white hover:border-slate-400"
        )}
      >
        <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent-teal-soft text-accent-teal">
          <UploadCloud className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <p className="font-display text-sm font-semibold text-navy-900">Drop a PDF here or click to browse</p>
        <p className="mt-1 text-xs text-slate-500">PDF only · Maximum 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {tasks.length > 0 && (
        <ul className="mt-4 space-y-2">
          {tasks.map((t) => (
            <li key={t.id} className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
              <FileText className="h-4 w-4 shrink-0 text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-navy-900">{t.file.name}</p>
                {t.state === "uploading" && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-accent-teal transition-all"
                      style={{ width: `${t.progress}%` }}
                    />
                  </div>
                )}
                {t.state === "error" && <p className="mt-0.5 text-xs text-risk">{t.error}</p>}
                {t.state === "done" && <p className="mt-0.5 text-xs text-positive">Uploaded · {formatBytes(t.file.size)}</p>}
              </div>
              <button
                onClick={() => setTasks((prev) => prev.filter((x) => x.id !== t.id))}
                aria-label={`Dismiss ${t.file.name}`}
                className="shrink-0 rounded-md p-1 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
