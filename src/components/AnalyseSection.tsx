import { useState } from "react";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFile, 
  FaHdd, 
  FaFingerprint, 
  FaCopy, 
  FaDownload, 
  FaChevronDown, 
  FaChevronUp,
  FaShieldAlt,
  FaExclamationTriangle,
  FaEye,
  FaEyeSlash,
  FaCog
} from "react-icons/fa";

interface ApiResult {
  mimeType?: string;
  format?: string;
  size?: number;
  valid?: number;
  wellFormed?: number;
  validMessage?: string;
  wellFormedMessage?: string;
  messages?: { message: string }[];
  [key: string]: unknown;
}

type AdditionalData = Record<string, unknown>;

interface FileInfo {
  name: string;
  size: number;
  type: string;
  checksum?: string;
  processedResult?: AdditionalData;
  rawApiOutput?: ApiResult;
  module?: string;
}

interface AnalyseSectionProps {
  fileInfo: FileInfo | null;
  onRescan?: (newModule: string) => void;
  availableModules?: string[];
  currentModule?: string;
}

export default function AnalyseSection({ fileInfo, onRescan, availableModules = [], currentModule = "AUTO" }: AnalyseSectionProps) {
  const [showRawResults, setShowRawResults] = useState(false);
  const [selectedModule, setSelectedModule] = useState(currentModule);
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    validation: true,
    messages: true,
    technical: false
  });
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadReport = () => {
    if (!fileInfo) return;
    const report = JSON.stringify(fileInfo, null, 2);
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jhove-report-${fileInfo.name}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!fileInfo) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 text-lg">No file information available. Please upload and analyze a file first.</p>
      </div>
    );
  }

  const isValid = fileInfo.processedResult?.valid === "Yes";
  const isWellFormed = fileInfo.processedResult?.wellFormed === "Yes";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Validation Result</h1>
        <div className="flex gap-3 items-center">
          {/* Module Selector for Re-scanning */}
          {availableModules.length > 0 && onRescan && (
            <div className="flex items-center gap-2">
              <label htmlFor="rescan-module" className="text-sm font-medium text-gray-700">
                Module:
              </label>
              <select
                id="rescan-module"
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {availableModules.map((module) => (
                  <option key={module} value={module}>
                    {module === "AUTO" ? "🔍 Auto-detect" : module === "BYTESTREAM" ? "BYTESTREAM (Generic)" : module}
                  </option>
                ))}
              </select>
              <button
                onClick={() => {
                  if (selectedModule !== currentModule) {
                    onRescan(selectedModule);
                  } else {
                    alert("Please select a different module to re-scan.");
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                title="Re-scan with selected module"
              >
                Re-scan
              </button>
            </div>
          )}
          <button
            onClick={() => setShowRawResults(!showRawResults)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            {showRawResults ? <FaEyeSlash /> : <FaEye />}
            {showRawResults ? "Hide Raw" : "Show Raw"}
          </button>
          <button
            onClick={downloadReport}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <FaDownload /> Download Report
          </button>
        </div>
      </div>

      {showRawResults ? (
        /* Raw Results View */
        <div className="bg-gray-900 text-green-400 rounded-lg p-6 overflow-x-auto">
          <pre className="text-sm font-mono">
            {JSON.stringify(fileInfo.rawApiOutput, null, 2)}
          </pre>
        </div>
      ) : (
        /* Enhanced Results View */
        <>
          {/* Status Badge */}
          <div className={`${isValid ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-red-500 to-red-600'} rounded-xl p-6 mb-6 text-white shadow-lg`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {isValid ? (
                  <FaCheckCircle className="text-5xl" />
                ) : (
                  <FaTimesCircle className="text-5xl" />
                )}
                <div>
                  <h2 className="text-3xl font-bold">
                    {isValid ? "VALID" : "INVALID"}
                  </h2>
                  <p className="text-sm opacity-90 mt-1">
                    {isValid ? "File passed validation checks" : "File failed validation"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-90">Format</div>
                <div className="text-2xl font-semibold">{fileInfo.processedResult?.format || "Unknown"}</div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-blue-500">
              <div className="flex items-center gap-3">
                <FaFile className="text-2xl text-blue-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">File Type</div>
                  <div className="text-lg font-bold text-gray-800">{fileInfo.processedResult?.mimeType || fileInfo.type}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-5 border-l-4 border-purple-500">
              <div className="flex items-center gap-3">
                <FaHdd className="text-2xl text-purple-500" />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">File Size</div>
                  <div className="text-lg font-bold text-gray-800">{formatBytes(fileInfo.size)}</div>
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${isValid ? 'border-green-500' : 'border-red-500'}`}>
              <div className="flex items-center gap-3">
                <FaShieldAlt className={`text-2xl ${isValid ? 'text-green-500' : 'text-red-500'}`} />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Validation</div>
                  <div className={`text-lg font-bold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                    {isValid ? "Valid" : "Invalid"}
                  </div>
                </div>
              </div>
            </div>

            <div className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${isWellFormed ? 'border-green-500' : 'border-yellow-500'}`}>
              <div className="flex items-center gap-3">
                <FaExclamationTriangle className={`text-2xl ${isWellFormed ? 'text-green-500' : 'text-yellow-500'}`} />
                <div>
                  <div className="text-xs text-gray-500 uppercase font-semibold">Well-Formed</div>
                  <div className={`text-lg font-bold ${isWellFormed ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isWellFormed ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Collapsible Sections */}
          
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('basicInfo')}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaFile className="text-indigo-600" /> Basic Information
              </h3>
              {expandedSections.basicInfo ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {expandedSections.basicInfo && (
              <div className="p-5 pt-0 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">File Name</div>
                    <div className="font-medium text-gray-800">{fileInfo.name}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Module Used</div>
                    <div className="font-medium text-gray-800">{fileInfo.module}</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg relative">
                    <div className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <FaFingerprint /> SHA-1 Checksum
                    </div>
                    <div className="font-mono text-sm text-gray-800 break-all">{fileInfo.checksum}</div>
                    <button
                      onClick={() => copyToClipboard(fileInfo.checksum || '', 'checksum')}
                      className="absolute top-4 right-4 p-2 hover:bg-gray-200 rounded transition-colors"
                      title="Copy checksum"
                    >
                      <FaCopy className={copiedField === 'checksum' ? 'text-green-600' : 'text-gray-600'} />
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">MIME Type</div>
                    <div className="font-medium text-gray-800">{fileInfo.processedResult?.mimeType || "Unknown"}</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Validation Status */}
          <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('validation')}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaShieldAlt className="text-indigo-600" /> Validation Status
              </h3>
              {expandedSections.validation ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {expandedSections.validation && (
              <div className="p-5 pt-0 border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className={`p-4 rounded-lg ${isValid ? 'bg-green-50' : 'bg-red-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isValid ? (
                        <FaCheckCircle className="text-green-600 text-xl" />
                      ) : (
                        <FaTimesCircle className="text-red-600 text-xl" />
                      )}
                      <div className={`font-semibold ${isValid ? 'text-green-800' : 'text-red-800'}`}>
                        Valid: {String(fileInfo.processedResult?.valid)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      {fileInfo.processedResult?.validMessage || "N/A"}
                    </div>
                  </div>
                  <div className={`p-4 rounded-lg ${isWellFormed ? 'bg-green-50' : 'bg-yellow-50'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {isWellFormed ? (
                        <FaCheckCircle className="text-green-600 text-xl" />
                      ) : (
                        <FaExclamationTriangle className="text-yellow-600 text-xl" />
                      )}
                      <div className={`font-semibold ${isWellFormed ? 'text-green-800' : 'text-yellow-800'}`}>
                        Well-Formed: {String(fileInfo.processedResult?.wellFormed)}
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      {fileInfo.processedResult?.wellFormedMessage || "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {fileInfo.processedResult?.messages && fileInfo.processedResult.messages !== "None" && (
            <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
              <button
                onClick={() => toggleSection('messages')}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-600" /> Validation Messages
                </h3>
                {expandedSections.messages ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedSections.messages && (
                <div className="p-5 pt-0 border-t">
                  <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
                    <div className="text-sm text-gray-800 whitespace-pre-wrap">
                      {String(fileInfo.processedResult?.messages)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Technical Details */}
          <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
            <button
              onClick={() => toggleSection('technical')}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
            >
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaCog className="text-indigo-600" /> Technical Details
              </h3>
              {expandedSections.technical ? <FaChevronUp /> : <FaChevronDown />}
            </button>
            {expandedSections.technical && (
              <div className="p-5 pt-0 border-t">
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto text-gray-800">
                    {JSON.stringify(fileInfo.rawApiOutput, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
