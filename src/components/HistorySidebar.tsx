import { FaFile, FaFolder, FaClock, FaCheckCircle, FaTimesCircle, FaExclamationTriangle } from "react-icons/fa";

interface HistoryEntry {
  timestamp: string;
  file: string;
  command: string;
  output: string;
  error?: string;
  fileInfo?: any; // The complete fileInfo object from the scan
}

interface HistorySidebarProps {
  history: HistoryEntry[];
  onSelectHistory: (entry: HistoryEntry) => void;
  currentTimestamp?: string;
}

export default function HistorySidebar({ history, onSelectHistory, currentTimestamp }: HistorySidebarProps) {
  const getStatusIcon = (entry: HistoryEntry) => {
    if (!entry.output) return <FaExclamationTriangle className="text-yellow-500" />;
    
    try {
      const output = JSON.parse(entry.output);
      const status = output?.jhove?.repInfo?.[0]?.status || output?.status || "";
      const statusLower = status.toLowerCase();
      
      if (statusLower.includes("valid") && !statusLower.includes("not valid")) {
        return <FaCheckCircle className="text-green-500" />;
      } else if (statusLower.includes("well-formed")) {
        return <FaExclamationTriangle className="text-yellow-500" />;
      } else {
        return <FaTimesCircle className="text-red-500" />;
      }
    } catch {
      return <FaExclamationTriangle className="text-gray-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const getFileName = (file: string) => {
    if (file.startsWith("Folder:")) {
      return file.substring(8); // Remove "Folder: " prefix
    }
    return file.split('/').pop() || file;
  };

  const isFolder = (file: string) => file.startsWith("Folder:");

  // Reverse to show most recent first
  const sortedHistory = [...history].reverse();

  return (
    <div className="w-80 bg-gradient-to-b from-gray-50 to-gray-100 border-l border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="text-white p-4 shadow-md" style={{ backgroundColor: '#001f3f' }}>
        <div className="flex items-center gap-2">
          <FaClock className="text-xl" />
          <h2 className="text-lg font-bold">Scan History</h2>
        </div>
        <p className="text-xs opacity-90 mt-1">{sortedHistory.length} scan{sortedHistory.length !== 1 ? 's' : ''}</p>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto">
        {sortedHistory.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <FaClock className="text-4xl mx-auto mb-3 opacity-30" />
            <p className="text-sm">No scans yet</p>
            <p className="text-xs mt-2">Scan history will appear here</p>
          </div>
        ) : (
          <div className="p-2">
            {sortedHistory.map((entry, index) => {
              const fileName = getFileName(entry.file);
              const isFolderScan = isFolder(entry.file);
              const isActive = currentTimestamp === entry.timestamp;
              
              return (
                <div
                  key={index}
                  onClick={() => onSelectHistory(entry)}
                  className={`
                    mb-2 p-3 rounded-lg border-2 transition-all cursor-pointer
                    ${isActive 
                      ? 'bg-indigo-100 border-indigo-400 shadow-md' 
                      : 'bg-white border-gray-200 hover:border-indigo-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start gap-2 mb-2">
                    {isFolderScan ? (
                      <FaFolder className="text-purple-600 mt-1 flex-shrink-0" />
                    ) : (
                      <FaFile className="text-indigo-600 mt-1 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-gray-800 truncate" title={fileName}>
                        {fileName}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <FaClock className="text-xs" />
                        {formatTimestamp(entry.timestamp)}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(entry)}
                    </div>
                  </div>
                  
                  {entry.error && (
                    <div className="text-xs text-red-600 bg-red-50 rounded px-2 py-1 mt-2">
                      Error
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-300 bg-gray-50">
        <p className="text-xs text-gray-600 text-center">
          Click any item to view results
        </p>
      </div>
    </div>
  );
}
