import { useState, useMemo } from "react";
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
  FaCog,
  FaExternalLinkAlt,
  FaSave,
  FaCheck
} from "react-icons/fa";
import { saveJsonReport } from "../lib/tauri-api";

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
  filePath?: string;
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
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const downloadReport = async () => {
    if (!fileInfo) return;
    
    setSaveStatus('saving');
    try {
      const report = JSON.stringify(fileInfo, null, 2);
      const defaultFileName = `jhove-report-${fileInfo.name}.json`;
      const saved = await saveJsonReport(defaultFileName, report);
      
      if (saved) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        setSaveStatus('idle'); // User cancelled
      }
    } catch (error) {
      console.error('Failed to save report:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const getWikiLink = (messageId: string, module: string) => {
    // Extract the module name from formats like "PDF-hul" -> "PDF-hul"
    const moduleName = module || '';
    // Remove the "-hul" or other suffixes for the wiki page name
    const wikiModule = moduleName.replace(/-hul|-gdm|-ptc|-kb/gi, '-hul');
    // Convert message ID to lowercase anchor format: PDF-HUL-140 -> pdf-hul-140
    const anchor = messageId.toLowerCase();
    return `https://github.com/openpreserve/jhove/wiki/${wikiModule}-Messages#${anchor}`;
  };

  const openExternalLink = async (url: string) => {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
    } catch (error) {
      console.error('Failed to open external link:', error);
      // Fallback for web environment
      if (typeof window !== 'undefined') {
        window.open(url, '_blank');
      }
    }
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

  // Deduplicate messages using useMemo for performance
  const deduplicatedMessages = useMemo(() => {
    if (!fileInfo.rawApiOutput?.messages) return [];
    
    const messageMap = new Map<string, { msg: { id?: string; prefix?: string; message?: string; subMessage?: string }, count: number }>();
    
    fileInfo.rawApiOutput.messages.forEach((msg: { id?: string; prefix?: string; message?: string; subMessage?: string }) => {
      const key = `${msg.id || ''}_${msg.prefix || ''}_${msg.message || ''}_${msg.subMessage || ''}`;
      if (messageMap.has(key)) {
        messageMap.get(key)!.count++;
      } else {
        messageMap.set(key, { msg, count: 1 });
      }
    });
    
    return Array.from(messageMap.values());
  }, [fileInfo.rawApiOutput?.messages]);

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
            disabled={saveStatus === 'saving'}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              saveStatus === 'success' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : saveStatus === 'error'
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            } ${saveStatus === 'saving' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {saveStatus === 'saving' && <FaDownload className="animate-pulse" />}
            {saveStatus === 'success' && <FaCheck />}
            {saveStatus === 'idle' && <FaSave />}
            {saveStatus === 'error' && <FaExclamationTriangle />}
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save Report'}
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
                <div className="text-2xl font-semibold">{String(fileInfo.processedResult?.format || "Unknown")}</div>
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
                  <div className="text-lg font-bold text-gray-800">{String(fileInfo.processedResult?.mimeType || fileInfo.type)}</div>
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
                    <div className="font-medium text-gray-800 break-all">
                      {(fileInfo.rawApiOutput as any)?.jhove?.repInfo?.[0]?.uri || fileInfo.name}
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-500 mb-1">Module Used</div>
                    <div className="font-medium text-gray-800">
                      {fileInfo.module === 'AUTO' && (fileInfo.rawApiOutput as any)?.jhove?.repInfo?.[0]?.reportingModule?.name
                        ? `AUTO (${(fileInfo.rawApiOutput as any).jhove.repInfo[0].reportingModule.name})`
                        : fileInfo.module
                      }
                    </div>
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
                    <div className="font-medium text-gray-800">{String(fileInfo.processedResult?.mimeType || "Unknown")}</div>
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
                      {String(fileInfo.processedResult?.validMessage || "N/A")}
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
                      {String(fileInfo.processedResult?.wellFormedMessage || "N/A")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Messages */}
          {deduplicatedMessages.length > 0 && (
            <div className="bg-white rounded-lg shadow-md mb-4 overflow-hidden">
              <button
                onClick={() => toggleSection('messages')}
                className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaExclamationTriangle className="text-yellow-600" /> Validation Messages
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    {deduplicatedMessages.length}
                  </span>
                </h3>
                {expandedSections.messages ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {expandedSections.messages && (
                <div className="p-5 pt-0 border-t space-y-3">
                  {deduplicatedMessages.map(({ msg, count }, index) => {
                    const messageId = msg.id || '';
                    const prefix = msg.prefix || 'Info';
                    const message = msg.message || '';
                    const wikiLink = messageId ? getWikiLink(messageId, fileInfo.module || '') : null;
                    
                    // Determine color based on prefix
                    const colorClass = prefix === 'Error' 
                      ? 'border-red-500 bg-red-50' 
                      : prefix === 'Warning'
                      ? 'border-yellow-500 bg-yellow-50'
                      : 'border-blue-500 bg-blue-50';
                    
                    const textColor = prefix === 'Error'
                      ? 'text-red-800'
                      : prefix === 'Warning'
                      ? 'text-yellow-800'
                      : 'text-blue-800';

                    return (
                      <div key={index} className={`${colorClass} border-l-4 p-4 rounded`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`font-semibold ${textColor}`}>
                                {prefix}
                              </span>
                              {messageId && (
                                <span className={`text-xs ${textColor} bg-white px-2 py-1 rounded font-mono`}>
                                  {messageId}
                                </span>
                              )}
                              {count > 1 && (
                                <span className={`text-xs ${textColor} bg-white px-2 py-1 rounded font-semibold`}>
                                  ×{count}
                                </span>
                              )}
                            </div>
                            <p className={`text-sm ${textColor}`}>
                              {message}
                            </p>
                            {msg.subMessage && (
                              <p className={`text-xs ${textColor} mt-2 italic`}>
                                {msg.subMessage}
                              </p>
                            )}
                          </div>
                          {wikiLink && (
                            <button
                              onClick={() => openExternalLink(wikiLink)}
                              className={`flex items-center gap-1 text-xs ${textColor} hover:underline whitespace-nowrap cursor-pointer`}
                              title="View documentation"
                            >
                              <FaExternalLinkAlt className="text-xs" />
                              Wiki
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
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
