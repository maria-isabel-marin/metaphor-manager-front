import React, { useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

interface ImportError {
  row: number;
  customId: string;
  error: string;
  errorType: 'duplicate' | 'validation' | 'missing_field' | 'format' | 'unknown';
}

interface ImportWarning {
  row: number;
  customId: string;
  warning: string;
  warningType: 'missing_field' | 'default_value' | 'format_issue';
  field?: string;
  appliedValue?: string;
}

interface ImportStatistics {
  totalProcessed: number;
  successful: number;
  failed: number;
  warnings: number;
  processingTime: number;
  fileSize: number;
  timestamp: Date;
}

interface ImportSummary {
  statistics: ImportStatistics;
  successfulRecords: {
    customIds: string[];
    newDomains: { name: string; type: 'source' | 'target' }[];
    newPOS: string[];
  };
  errors: ImportError[];
  warnings: ImportWarning[];
  errorsByType: { [key: string]: number };
  warningsByType: { [key: string]: number };
}

interface ImportReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ImportSummary;
}

export default function ImportReportModal({ isOpen, onClose, report }: ImportReportModalProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'successful' | 'errors' | 'warnings'>('overview');
  const [errorFilter, setErrorFilter] = useState<string>('all');
  const [warningFilter, setWarningFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatProcessingTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const exportErrors = () => {
    const csvContent = [
      'Row,Custom ID,Error Type,Error Message',
      ...report.errors.map(e => `${e.row},"${e.customId}","${e.errorType}","${e.error}"`)
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredErrors = report.errors.filter(error => {
    const matchesFilter = errorFilter === 'all' || error.errorType === errorFilter;
    const matchesSearch = searchTerm === '' || 
      error.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      error.error.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filteredWarnings = report.warnings.filter(warning => {
    const matchesFilter = warningFilter === 'all' || warning.warningType === warningFilter;
    const matchesSearch = searchTerm === '' || 
      warning.customId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      warning.warning.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'successful', name: 'Successful', icon: CheckCircleIcon },
    { id: 'errors', name: 'Errors', icon: XCircleIcon, count: report.errors.length },
    { id: 'warnings', name: 'Warnings', icon: ExclamationTriangleIcon, count: report.warnings.length },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              Import Report
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.name}
                {tab.count !== undefined && (
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-600">Successful</p>
                      <p className="text-2xl font-bold text-green-900">{report.statistics.successful}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <XCircleIcon className="w-8 h-8 text-red-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-red-600">Failed</p>
                      <p className="text-2xl font-bold text-red-900">{report.statistics.failed}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-yellow-600">Warnings</p>
                      <p className="text-2xl font-bold text-yellow-900">{report.statistics.warnings}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <ClockIcon className="w-8 h-8 text-blue-600" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-600">Time</p>
                      <p className="text-2xl font-bold text-blue-900">{formatProcessingTime(report.statistics.processingTime)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Processing Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Processing Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Total Processed:</span>
                    <p className="text-gray-600">{report.statistics.totalProcessed}</p>
                  </div>
                  <div>
                    <span className="font-medium">File Size:</span>
                    <p className="text-gray-600">{formatFileSize(report.statistics.fileSize)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Success Rate:</span>
                    <p className="text-gray-600">
                      {((report.statistics.successful / report.statistics.totalProcessed) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Timestamp:</span>
                    <p className="text-gray-600">{new Date(report.statistics.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Error Types Chart */}
              {Object.keys(report.errorsByType).length > 0 && (
                <div className="bg-red-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-red-800">Error Types</h3>
                  <div className="space-y-2">
                    {Object.entries(report.errorsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize text-red-700">{type.replace('_', ' ')}</span>
                        <span className="font-semibold text-red-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning Types Chart */}
              {Object.keys(report.warningsByType).length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-yellow-800">Warning Types</h3>
                  <div className="space-y-2">
                    {Object.entries(report.warningsByType).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="capitalize text-yellow-700">{type.replace('_', ' ')}</span>
                        <span className="font-semibold text-yellow-900">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'successful' && (
            <div className="space-y-6">
              {/* New Domains */}
              {report.successfulRecords.newDomains.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-green-800">
                    New Domains Created ({report.successfulRecords.newDomains.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {report.successfulRecords.newDomains.map((domain, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="text-green-600 font-medium">{domain.name}</span>
                        <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                          {domain.type}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New POS */}
              {report.successfulRecords.newPOS.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-blue-800">
                    New POS Created ({report.successfulRecords.newPOS.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {report.successfulRecords.newPOS.map((pos, index) => (
                      <span key={index} className="bg-blue-200 text-blue-800 px-3 py-1 rounded-full text-sm">
                        {pos}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Successful Records */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">
                  Successfully Imported Records ({report.successfulRecords.customIds.length})
                </h3>
                <div className="max-h-60 overflow-y-auto">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {report.successfulRecords.customIds.map((customId, index) => (
                      <div key={index} className="bg-white p-2 rounded border text-sm">
                        {customId}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'errors' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by Custom ID or error message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4 text-gray-400" />
                  <select
                    value={errorFilter}
                    onChange={(e) => setErrorFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Error Types</option>
                    <option value="duplicate">Duplicate</option>
                    <option value="validation">Validation</option>
                    <option value="missing_field">Missing Field</option>
                    <option value="format">Format</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>
                <button
                  onClick={exportErrors}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  Export Errors
                </button>
              </div>

              {/* Errors List */}
              <div className="bg-red-50 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {filteredErrors.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No errors found with the current filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-red-200">
                      {filteredErrors.map((error, index) => (
                        <div key={index} className="p-4 hover:bg-red-100">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-red-800">Row {error.row}</span>
                                <span className="text-sm bg-red-200 text-red-800 px-2 py-1 rounded">
                                  {error.customId}
                                </span>
                                <span className="text-xs bg-red-300 text-red-800 px-2 py-1 rounded capitalize">
                                  {error.errorType.replace('_', ' ')}
                                </span>
                              </div>
                              <p className="text-red-700">{error.error}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'warnings' && (
            <div className="space-y-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by Custom ID or warning message..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <FunnelIcon className="w-4 h-4 text-gray-400" />
                  <select
                    value={warningFilter}
                    onChange={(e) => setWarningFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="all">All Warning Types</option>
                    <option value="missing_field">Missing Field</option>
                    <option value="default_value">Default Value</option>
                    <option value="format_issue">Format Issue</option>
                  </select>
                </div>
              </div>

              {/* Warnings List */}
              <div className="bg-yellow-50 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  {filteredWarnings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      No warnings found with the current filters.
                    </div>
                  ) : (
                    <div className="divide-y divide-yellow-200">
                      {filteredWarnings.map((warning, index) => (
                        <div key={index} className="p-4 hover:bg-yellow-100">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-yellow-800">Row {warning.row}</span>
                                <span className="text-sm bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                                  {warning.customId}
                                </span>
                                <span className="text-xs bg-yellow-300 text-yellow-800 px-2 py-1 rounded capitalize">
                                  {warning.warningType.replace('_', ' ')}
                                </span>
                                {warning.field && (
                                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded">
                                    {warning.field}
                                  </span>
                                )}
                              </div>
                              <p className="text-yellow-700">{warning.warning}</p>
                              {warning.appliedValue && (
                                <p className="text-sm text-yellow-600 mt-1">
                                  Applied value: <span className="font-medium">{warning.appliedValue}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 