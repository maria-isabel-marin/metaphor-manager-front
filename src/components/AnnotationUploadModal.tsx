import React, { useState, ChangeEvent, FormEvent } from 'react';
import api from '@/lib/api';
import ImportReportModal from './ImportReportModal';

interface ImportSummary {
  statistics: {
    totalProcessed: number;
    successful: number;
    failed: number;
    warnings: number;
    processingTime: number;
    fileSize: number;
    timestamp: Date;
  };
  successfulRecords: {
    customIds: string[];
    newDomains: { name: string; type: 'source' | 'target' }[];
    newPOS: string[];
  };
  errors: {
    row: number;
    customId: string;
    error: string;
    errorType: 'duplicate' | 'validation' | 'missing_field' | 'format' | 'unknown';
  }[];
  warnings: {
    row: number;
    customId: string;
    warning: string;
    warningType: 'missing_field' | 'default_value' | 'format_issue';
    field?: string;
    appliedValue?: string;
  }[];
  errorsByType: { [key: string]: number };
  warningsByType: { [key: string]: number };
}

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
  const [uploadResult, setUploadResult] = useState<ImportSummary | null>(null);
  const [showDetailedReport, setShowDetailedReport] = useState(false);

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
      onUploaded(resp.data.statistics.successful);
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
    setShowDetailedReport(false);
    onClose();
  }

  const handleViewDetailedReport = () => {
    setShowDetailedReport(true);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg w-full max-w-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Upload Annotated Metaphors
          </h2>
          
          {uploadResult ? (
            <div>
              <div className="mb-4 p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-700 mb-2">Upload Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-600">Successfully imported:</span>
                    <p className="text-green-800 font-semibold">{uploadResult.statistics.successful} metaphors</p>
                  </div>
                  <div>
                    <span className="font-medium text-red-600">Failed:</span>
                    <p className="text-red-800 font-semibold">{uploadResult.statistics.failed} records</p>
                  </div>
                  <div>
                    <span className="font-medium text-yellow-600">Warnings:</span>
                    <p className="text-yellow-800 font-semibold">{uploadResult.statistics.warnings} issues</p>
                  </div>
                  <div>
                    <span className="font-medium text-blue-600">Processing time:</span>
                    <p className="text-blue-800 font-semibold">
                      {uploadResult.statistics.processingTime < 1000 
                        ? `${uploadResult.statistics.processingTime}ms` 
                        : `${(uploadResult.statistics.processingTime / 1000).toFixed(2)}s`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick stats */}
              {uploadResult.successfulRecords.newDomains.length > 0 && (
                <div className="mb-3 p-3 bg-blue-50 rounded">
                  <p className="text-sm text-blue-700">
                    <span className="font-medium">{uploadResult.successfulRecords.newDomains.length} new domains</span> created
                  </p>
                </div>
              )}

              {uploadResult.successfulRecords.newPOS.length > 0 && (
                <div className="mb-3 p-3 bg-purple-50 rounded">
                  <p className="text-sm text-purple-700">
                    <span className="font-medium">{uploadResult.successfulRecords.newPOS.length} new POS tags</span> created
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <button
                  type="button"
                  onClick={handleViewDetailedReport}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Detailed Report
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Excel File
                </label>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileChange}
                  disabled={loading}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
              
              {loading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{progress < 100 ? 'Uploading file...' : 'Processing on server...'}</span>
                    {progress < 100 && <span>{progress}%</span>}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    {progress < 100 ? (
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    ) : (
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" />
                    )}
                  </div>
                  {progress === 100 && (
                    <p className="text-xs text-gray-500 text-center pt-1">
                      This might take a moment for large files. Please do not close this window.
                    </p>
                  )}
                </div>
              )}
              
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !file}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-colors w-28"
                >
                  {loading ? (progress < 100 ? `Uploading...` : 'Processing...') : 'Upload'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Detailed Report Modal */}
      {showDetailedReport && uploadResult && (
        <ImportReportModal
          isOpen={showDetailedReport}
          onClose={() => setShowDetailedReport(false)}
          report={uploadResult}
        />
      )}
    </>
  );
}

export default AnnotationUploadModal;
