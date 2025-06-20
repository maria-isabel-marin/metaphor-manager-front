import React, { useState, ChangeEvent, FormEvent } from 'react';
import api from '@/lib/api';

interface Props {
  projectId: string;
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onUploaded: (count: number) => void;
}

function AnnotationUploadModal({
  projectId,
  documentId,
  isOpen,
  onClose,
  onUploaded,
}: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ created: any[], errors: any[] } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError(null);
    setUploadResult(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select an Excel file.');
      return;
    }
    setLoading(true);
    setProgress(0);

    const form = new FormData();
    form.append('file', file);

    try {
      const resp = await api.post(
        `/projects/${projectId}/documents/${documentId}/annotations/bulk-import`,
        form,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (ev) => {
            if (ev.total) {
              setProgress(Math.round((ev.loaded / ev.total) * 100));
            }
          },
        }
      );
      setUploadResult(resp.data);
      onUploaded(resp.data.created.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setUploadResult(null);
    setError(null);
    setFile(null);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Upload Annotated Metaphors
        </h2>
        
        {uploadResult ? (
          <div>
            <h3 className="font-semibold text-green-700">Upload Complete</h3>
            <p>{uploadResult.created.length} metaphors created successfully.</p>
            {uploadResult.errors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-red-700">{uploadResult.errors.length} Errors Found:</h4>
                <ul className="list-disc list-inside text-sm max-h-48 overflow-y-auto bg-gray-50 p-2 rounded">
                  {uploadResult.errors.map((e, i) => (
                    <li key={i}>Row {e.row}: {e.error} (CustomId: {e.customId})</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={loading}
            />
            {error && <p className="text-red-600">{error}</p>}
            {loading && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="flex justify-end space-x-2 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? `Uploading ${progress}%` : 'Upload'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AnnotationUploadModal;
