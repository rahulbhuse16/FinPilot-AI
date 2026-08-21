import { api } from "./axios";
import type { FinDocument } from "../types/domain";

export const documentsApi = {
  list: (signal?: AbortSignal) =>
    api.get<FinDocument[]>("/documents", { signal }).then((r) => r.data),

  upload: (file: File, onProgress?: (percent: number) => void, signal?: AbortSignal) => {
    const formData = new FormData();
    formData.append("file", file);
    return api
      .post<FinDocument>("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        signal,
        onUploadProgress: (evt) => {
          if (onProgress && evt.total) {
            onProgress(Math.round((evt.loaded / evt.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },

  getStatus: (documentId: string, signal?: AbortSignal) =>
    api.get<FinDocument>(`/documents/${documentId}`, { signal }).then((r) => r.data),
};
