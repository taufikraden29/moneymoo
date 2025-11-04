import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { formatDate } from '../utils/formatters';

// LogService to handle local storage of audit logs
class LogService {
  static LOG_STORAGE_KEY = 'money_moo_audit_logs';
  static MAX_LOGS = 1000; // Keep only the latest 1000 logs

  // Add a log entry
  static addLog(event, details = {}) {
    const logEntry = {
      id: Date.now() + Math.random(), // Unique ID
      event,
      details: {
        ...details,
        timestamp: new Date().toISOString(),
        page: window.location.pathname,
        userAgent: navigator.userAgent
      }
    };

    const logs = this.getLogs();
    logs.push(logEntry);

    // Keep only the latest logs to prevent storage overflow
    if (logs.length > this.MAX_LOGS) {
      logs.shift(); // Remove the oldest log
    }

    localStorage.setItem(this.LOG_STORAGE_KEY, JSON.stringify(logs));
  }

  // Get all logs
  static getLogs() {
    const logsStr = localStorage.getItem(this.LOG_STORAGE_KEY);
    return logsStr ? JSON.parse(logsStr) : [];
  }

  // Clear all logs
  static clearLogs() {
    localStorage.removeItem(this.LOG_STORAGE_KEY);
  }

  // Filter logs by type
  static getLogsByType(type) {
    const allLogs = this.getLogs();
    return type ? allLogs.filter(log => log.event.toLowerCase().includes(type.toLowerCase())) : allLogs;
  }

  // Get unique log types for filtering
  static getLogTypes() {
    const allLogs = this.getLogs();
    const types = [...new Set(allLogs.map(log => log.event))];
    return types;
  }
}

// Function to log events (to be used throughout the app)
export const logEvent = (event, details = {}) => {
  LogService.addLog(event, details);
};

const LogPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [filterType, setFilterType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedLog, setSelectedLog] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  // Load logs on component mount
  useEffect(() => {
    const loadedLogs = LogService.getLogs().reverse(); // Show newest first
    setLogs(loadedLogs);
    setFilteredLogs(loadedLogs);
  }, []);

  // Apply filters whenever filters change
  useEffect(() => {
    let result = logs;

    // Apply type filter
    if (filterType) {
      result = result.filter(log => log.event.toLowerCase().includes(filterType.toLowerCase()));
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(log => 
        log.event.toLowerCase().includes(term) || 
        JSON.stringify(log.details).toLowerCase().includes(term)
      );
    }

    // Apply date range filter
    if (dateRange.start || dateRange.end) {
      result = result.filter(log => {
        const logDate = new Date(log.details.timestamp);
        const startDate = dateRange.start ? new Date(dateRange.start) : new Date(0);
        const endDate = dateRange.end ? new Date(dateRange.end) : new Date();
        
        return logDate >= startDate && logDate <= endDate;
      });
    }

    setFilteredLogs(result);
  }, [logs, filterType, searchTerm, dateRange]);

  // Get unique log types for filter dropdown
  const logTypes = LogService.getLogTypes();

  // Clear all logs
  const handleClearLogs = () => {
    if (window.confirm('Apakah Anda yakin ingin menghapus semua log? Tindakan ini tidak dapat dibatalkan.')) {
      LogService.clearLogs();
      setLogs([]);
      setFilteredLogs([]);
    }
  };

  // Format log details for display
  const formatLogDetails = (details) => {
    const { timestamp, email, userId, error, page, ...otherDetails } = details;
    const formattedDetails = [];

    if (email) formattedDetails.push(`Email: ${email}`);
    if (userId) formattedDetails.push(`User ID: ${userId}`);
    if (page) formattedDetails.push(`Halaman: ${page}`);
    if (error) formattedDetails.push(`Error: ${error}`);

    // Add other details
    Object.keys(otherDetails).forEach(key => {
      if (!['timestamp', 'email', 'userId', 'error', 'page'].includes(key)) {
        formattedDetails.push(`${key}: ${JSON.stringify(otherDetails[key])}`);
      }
    });

    return formattedDetails.join(', ');
  };

  // Show detail modal
  const showLogDetail = (log) => {
    setSelectedLog(log);
    setShowDetailModal(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedLog(null);
  };

  // Render log detail modal
  const renderDetailModal = () => {
    if (!selectedLog) return null;

    const { timestamp, email, userId, error, page, userAgent, ...otherDetails } = selectedLog.details;

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div 
              className="absolute inset-0 bg-gray-500 opacity-75"
              onClick={closeDetailModal}
            ></div>
          </div>

          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Detail Log
                    </h3>
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={closeDetailModal}
                    >
                      <span className="text-2xl">&times;</span>
                    </button>
                  </div>
                  
                  <div className="mt-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Jenis Event</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded break-words">
                          {selectedLog.event}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tanggal & Waktu</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded">
                          {formatDate(new Date(selectedLog.details.timestamp))} {new Date(selectedLog.details.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    {email && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded break-words">
                          {email}
                        </div>
                      </div>
                    )}

                    {userId && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User ID</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded break-words">
                          {userId}
                        </div>
                      </div>
                    )}

                    {page && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Halaman</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded break-words">
                          {page}
                        </div>
                      </div>
                    )}

                    {error && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Error</label>
                        <div className="mt-1 text-sm text-gray-900 bg-red-100 p-2 rounded break-words text-red-700">
                          {error}
                        </div>
                      </div>
                    )}

                    {userAgent && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">User Agent</label>
                        <div className="mt-1 text-sm text-gray-900 bg-gray-100 p-2 rounded break-words">
                          {userAgent}
                        </div>
                      </div>
                    )}

                    {Object.keys(otherDetails).length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Detail Tambahan</label>
                        <div className="bg-gray-50 p-3 rounded border">
                          <pre className="text-xs text-gray-700 overflow-auto max-h-60">
                            {JSON.stringify(otherDetails, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={closeDetailModal}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showDetailModal ? 'blur-sm' : ''}`}>
      <div className="mb-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Kembali ke Dashboard
        </button>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Log Aktivitas</h1>
          <button
            onClick={handleClearLogs}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Bersihkan Log
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label htmlFor="filterType" className="block text-sm font-medium text-gray-700 mb-1">
              Filter Jenis Log
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            >
              <option value="">Semua Jenis</option>
              {logTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="searchTerm" className="block text-sm font-medium text-gray-700 mb-1">
              Cari
            </label>
            <input
              type="text"
              id="searchTerm"
              placeholder="Cari dalam log..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai
              </label>
              <input
                type="date"
                id="startDate"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Akhir
              </label>
              <input
                type="date"
                id="endDate"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600">
            Menampilkan {filteredLogs.length} dari {logs.length} log
          </p>
        </div>

        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                  Tanggal & Waktu
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                  Jenis Event
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 sm:hidden md:table-cell">
                  Detail
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Lihat Detail</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-500 sm:pl-6">
                    Tidak ada log yang ditemukan
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="text-gray-900">
                        {formatDate(new Date(log.details.timestamp))}
                      </div>
                      <div className="text-gray-500 md:hidden">
                        {new Date(log.details.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 truncate max-w-xs">
                        {log.event}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-3 py-4 text-sm text-gray-500 max-w-md">
                      <div className="truncate" title={formatLogDetails(log.details)}>
                        {formatLogDetails(log.details)}
                      </div>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <button
                        onClick={() => showLogDetail(log)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && renderDetailModal()}
    </div>
  );
};

export default LogPage;