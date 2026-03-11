import { useState, useMemo, useEffect } from "react";
import AnalyseSection from "./AnalyseSection";
import { calculateSha1, saveJsonReport } from "../lib/tauri-api";
import { 
  FaCheckCircle, 
  FaTimesCircle, 
  FaFolder,
  FaFolderOpen,
  FaFile,
  FaChevronDown, 
  FaChevronUp,
  FaChevronRight,
  FaExclamationTriangle,
  FaDownload,
  FaTimes,
  FaSave,
  FaCheck
} from "react-icons/fa";

interface RepInfo {
  uri: string;
  format?: string;
  status?: string;
  size?: number;
  mimeType?: string;
  messages?: Array<{ message: string; severity?: string; id?: string; subMessage?: string; prefix?: string }>;
  [key: string]: unknown;
}

interface JhoveResponse {
  jhove?: {
    name?: string;
    release?: string;
    date?: string;
    executionTime?: string;
    repInfo?: RepInfo[];
  };
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
  module?: string;
  filePath?: string;
  rawApiOutput?: JhoveResponse | any;
}

interface FolderAnalyseSectionProps {
  fileInfo: FileInfo | null;
  onRescan?: (newModule: string) => void;
  onRescanFile?: (filePath: string, newModule: string) => void;
  availableModules?: string[];
  currentModule?: string;
}

// Tree node structure for file paths
interface TreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: Map<string, TreeNode>;
  fileData?: RepInfo;
}

export default function FolderAnalyseSection({ 
  fileInfo, 
  onRescan,
  onRescanFile, 
  availableModules = [], 
  currentModule = "AUTO" 
}: FolderAnalyseSectionProps) {
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);
  const [selectedModule, setSelectedModule] = useState(currentModule);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    fileTree: true
  });
  const [fileChecksums, setFileChecksums] = useState<Map<string, string>>(new Map());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // Extract data early to use in hooks
  const jhoveResponse = fileInfo?.rawApiOutput as JhoveResponse | undefined;
  const repInfo = jhoveResponse?.jhove?.repInfo || [];

  // Calculate SHA-1 checksum for selected file lazily
  useEffect(() => {
    if (!fileInfo) return;
    
    const selectedFile = selectedFileIndex !== null ? repInfo[selectedFileIndex] : null;
    if (selectedFile && selectedFile.uri && !fileChecksums.has(selectedFile.uri)) {
      // Calculate checksum in background
      calculateSha1(selectedFile.uri)
        .then(checksum => {
          setFileChecksums(prev => {
            const updated = new Map(prev);
            updated.set(selectedFile.uri || '', checksum);
            return updated;
          });
        })
        .catch(err => {
          console.error('Failed to calculate SHA-1:', err);
        });
    }
  }, [selectedFileIndex, fileInfo, repInfo, fileChecksums]);

  if (!fileInfo) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 text-lg">No folder information available.</p>
      </div>
    );
  }
  // Build file tree from paths
  const fileTree = useMemo(() => {
    const root = new Map<string, TreeNode>();
    
    repInfo.forEach((file, index) => {
      const uri = file.uri || '';
      const parts = uri.split('/').filter(p => p);
      
      let currentLevel = root;
      let currentPath = '';
      
      parts.forEach((part, i) => {
        currentPath += (currentPath ? '/' : '') + part;
        const isLastPart = i === parts.length - 1;
        
        if (!currentLevel.has(part)) {
          currentLevel.set(part, {
            name: part,
            path: currentPath,
            isDirectory: !isLastPart,
            children: isLastPart ? undefined : new Map(),
            fileData: isLastPart ? file : undefined
          });
        }
        
        if (!isLastPart) {
          const node = currentLevel.get(part)!;
          currentLevel = node.children!;
        }
      });
    });
    
    // Collapse single-child folder chains (like VS Code)
    const collapseTree = (nodes: Map<string, TreeNode>): Map<string, TreeNode> => {
      const collapsed = new Map<string, TreeNode>();
      
      nodes.forEach((node, key) => {
        if (node.isDirectory && node.children) {
          // Check if this node has exactly one child that is also a directory
          let currentNode = node;
          let collapsedName = currentNode.name;
          let collapsedPath = currentNode.path;
          
          while (currentNode.children && currentNode.children.size === 1 && currentNode.isDirectory) {
            const [childKey, childNode] = Array.from(currentNode.children.entries())[0];
            
            // Only collapse if child is also a directory
            if (!childNode.isDirectory) {
              break;
            }
            
            collapsedName += '/' + childNode.name;
            collapsedPath = childNode.path;
            currentNode = childNode;
          }
          
          // Create collapsed node
          collapsed.set(key, {
            name: collapsedName,
            path: collapsedPath,
            isDirectory: true,
            children: currentNode.children ? collapseTree(currentNode.children) : undefined,
            fileData: undefined
          });
        } else if (node.isDirectory && node.children) {
          // Recursively collapse children
          collapsed.set(key, {
            ...node,
            children: collapseTree(node.children)
          });
        } else {
          // Leaf node (file)
          collapsed.set(key, node);
        }
      });
      
      return collapsed;
    };
    
    return collapseTree(root);
  }, [repInfo]);
  
  // Calculate summary statistics
  const totalFiles = repInfo.length;
  const validFiles = repInfo.filter(file => 
    file.status?.toLowerCase().includes("valid") && 
    !file.status?.toLowerCase().includes("not valid")
  ).length;
  const invalidFiles = repInfo.filter(file => 
    file.status?.toLowerCase().includes("not valid") ||
    file.status?.toLowerCase().includes("not well-formed")
  ).length;
  const wellFormedOnly = repInfo.filter(file =>
    file.status?.toLowerCase().includes("well-formed") &&
    !file.status?.toLowerCase().includes("valid")
  ).length;

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const downloadReport = async () => {
    if (!fileInfo) return;
    
    setSaveStatus('saving');
    try {
      const report = JSON.stringify(jhoveResponse, null, 2);
      const defaultFileName = `jhove-folder-report-${fileInfo.name}.json`;
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

  const getStatusColor = (status?: string) => {
    if (!status) return 'gray';
    const lower = status.toLowerCase();
    if (lower.includes("valid") && !lower.includes("not valid")) return 'green';
    if (lower.includes("well-formed") && !lower.includes("valid")) return 'yellow';
    return 'red';
  };

  const getWikiLink = (messageId: string, module: string) => {
    const moduleName = module || '';
    const wikiModule = moduleName.replace(/-hul|-gdm|-ptc|-kb/gi, '-hul');
    const anchor = messageId.toLowerCase();
    return `https://github.com/openpreserve/jhove/wiki/${wikiModule}-Messages#${anchor}`;
  };

  const openExternalLink = async (url: string) => {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
    } catch (error) {
      console.error('Failed to open external link:', error);
    }
  };

  // Render tree recursively
  const renderTree = (nodes: Map<string, TreeNode>, depth: number = 0): React.ReactElement[] => {
    return Array.from(nodes.entries()).map(([key, node]) => {
      if (node.isDirectory) {
        const isExpanded = expandedFolders.has(node.path);
        return (
          <div key={node.path} className="tree-node" data-depth={depth}>
            <div
              className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded cursor-pointer"
              style={{ paddingLeft: `${depth * 20 + 12}px` }}
              onClick={() => toggleFolder(node.path)}
            >
              {isExpanded ? <FaFolderOpen className="text-yellow-500" /> : <FaFolder className="text-yellow-600" />}
              <span className="font-medium text-gray-700">{node.name}</span>
              {isExpanded ? <FaChevronDown className="text-gray-400 text-xs" /> : <FaChevronRight className="text-gray-400 text-xs" />}
            </div>
            {isExpanded && node.children && (
              <div>{renderTree(node.children, depth + 1)}</div>
            )}
          </div>
        );
      } else {
        // It's a file
        const fileIndex = repInfo.findIndex(f => f.uri === node.fileData?.uri);
        const statusColor = getStatusColor(node.fileData?.status);
        const isSelected = selectedFileIndex === fileIndex;
        
        return (
          <div
            key={node.path}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
            className={`flex items-center justify-between py-2 px-3 rounded cursor-pointer transition-all ${
              isSelected 
                ? 'bg-indigo-100 border-l-4 border-indigo-600' 
                : 'hover:bg-gray-50 border-l-4 border-transparent'
            }`}
            onClick={() => setSelectedFileIndex(fileIndex)}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FaFile className={`text-${statusColor}-600 flex-shrink-0`} />
              <span className="text-gray-700 truncate">{node.name}</span>
            </div>
            <div className="flex items-center gap-2">
              {statusColor === 'green' && (
                <FaCheckCircle className="text-green-600" title="Valid" />
              )}
              {statusColor === 'yellow' && (
                <FaExclamationTriangle className="text-yellow-600" title="Well-Formed" />
              )}
              {statusColor === 'red' && (
                <FaTimesCircle className="text-red-600" title="Invalid" />
              )}
            </div>
          </div>
        );
      }
    });
  };

  const selectedFile = selectedFileIndex !== null ? repInfo[selectedFileIndex] : null;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <FaFolder className="text-yellow-600" />
            Folder Validation Results
          </h1>
          <p className="text-gray-600 mt-1">{fileInfo.filePath}</p>
        </div>
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
                    {module === "AUTO" ? "Auto-detect" : module === "BYTESTREAM" ? "BYTESTREAM (Generic)" : module}
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
                title="Re-scan entire folder with selected module"
              >
                Re-scan Folder
              </button>
            </div>
          )}
          <button
            onClick={downloadReport}
            disabled={saveStatus === 'saving'}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
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
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'success' ? 'Saved!' : saveStatus === 'error' ? 'Failed' : 'Save Full Report'}
          </button>
        </div>
      </div>

      {/* Summary Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
        <button
          onClick={() => toggleSection('summary')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl hover:from-blue-100 hover:to-indigo-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-800">Summary</h2>
          {expandedSections.summary ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {expandedSections.summary && (
          <div className="p-6 border-t">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                <div className="text-sm text-gray-600 mb-1">Total Files</div>
                <div className="text-3xl font-bold text-blue-700">{totalFiles}</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                <div className="text-sm text-gray-600 mb-1">Valid</div>
                <div className="text-3xl font-bold text-green-700">{validFiles}</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                <div className="text-sm text-gray-600 mb-1">Well-Formed Only</div>
                <div className="text-3xl font-bold text-yellow-700">{wellFormedOnly}</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
                <div className="text-sm text-gray-600 mb-1">Invalid/Failed</div>
                <div className="text-3xl font-bold text-red-700">{invalidFiles}</div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Success Rate</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${totalFiles > 0 ? (validFiles / totalFiles) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-lg font-semibold text-gray-800">
                  {totalFiles > 0 ? Math.round((validFiles / totalFiles) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* File Tree Section */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-6">
        <button
          onClick={() => toggleSection('fileTree')}
          className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-xl hover:from-purple-100 hover:to-pink-100 transition-colors"
        >
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <FaFolder className="text-yellow-600" />
            Files Scanned
          </h2>
          {expandedSections.fileTree ? <FaChevronUp /> : <FaChevronDown />}
        </button>
        {expandedSections.fileTree && (
          <div className="p-6 border-t">
            <div className="max-h-96 overflow-y-auto border rounded-lg p-2">
              {renderTree(fileTree)}
            </div>
          </div>
        )}
      </div>

      {/* Modal for Individual File Details */}
      {selectedFile && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFileIndex(null)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-indigo-50 to-purple-50">
              <h2 className="text-2xl font-bold text-gray-800">
                File Details: {selectedFile.uri?.split('/').pop()}
              </h2>
              <button
                onClick={() => setSelectedFileIndex(null)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Close"
              >
                <FaTimes className="text-2xl text-gray-600" />
              </button>
            </div>
            
            {/* Modal Body - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              <AnalyseSection
                fileInfo={{
                  name: selectedFile.uri?.split('/').pop() || '',
                  size: selectedFile.size || 0,
                  type: selectedFile.mimeType || 'Unknown',
                  module: (selectedFile as any).reportingModule?.name || fileInfo.module || currentModule,
                  filePath: selectedFile.uri,
                  checksum: fileChecksums.get(selectedFile.uri || ''),
                  processedResult: {
                    mimeType: selectedFile.mimeType || 'Unknown',
                    format: selectedFile.format || 'Unknown',
                    size: selectedFile.size ? `${selectedFile.size} bytes` : 'Unknown',
                    valid: selectedFile.status?.toLowerCase().includes("valid") && !selectedFile.status?.toLowerCase().includes("not valid") ? "Yes" : "No",
                    wellFormed: selectedFile.status?.toLowerCase().includes("well-formed") && !selectedFile.status?.toLowerCase().includes("not well-formed") ? "Yes" : "No",
                    status: selectedFile.status || 'Unknown',
                    validMessage: selectedFile.status || 'Unknown',
                    wellFormedMessage: selectedFile.status || 'Unknown',
                  },
                  rawApiOutput: {
                    ...selectedFile,
                    messages: selectedFile.messages || [],
                    jhove: {
                      repInfo: [selectedFile]
                    }
                  },
                }}
                availableModules={availableModules}
                currentModule={fileInfo.module || currentModule}
                onRescan={onRescanFile ? (newModule) => {
                  if (selectedFile.uri) {
                    onRescanFile(selectedFile.uri, newModule);
                    setSelectedFileIndex(null); // Close modal after rescan
                  }
                } : undefined}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
