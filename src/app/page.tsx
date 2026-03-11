"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Rusha from "rusha";
import { FaHome, FaChartBar, FaInfoCircle, FaCog } from "react-icons/fa";
import HomeSection from "@/components/HomeSection";
import AnalyseSection from "@/components/AnalyseSection";
import FolderAnalyseSection from "@/components/FolderAnalyseSection";
import AboutSection from "@/components/AboutSection";
import SettingsSection from "@/components/SettingsSection";
import HistorySidebar from "@/components/HistorySidebar";
import { validateFile, getJhoveModules, pickFile, pickFolder, validateFolder, calculateSha1 } from "@/lib/tauri-api";

interface DebugEntry {
  timestamp: string;
  file: string;
  command: string;
  output: string;
  error?: string;
  fileInfo?: any; // Store complete fileInfo for history restoration
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("Home");
  type AdditionalData = Record<string, unknown>;
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string; checksum?: string; processedResult?: AdditionalData; rawApiOutput?: ApiResult; module?: string; filePath?: string } | null>(null);
  const [selectedModule, setSelectedModule] = useState("AUTO");
  const [availableModules, setAvailableModules] = useState<string[]>(["AUTO"]);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastFilePath, setLastFilePath] = useState<string | null>(null);
  const [lastFolderPath, setLastFolderPath] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<DebugEntry[]>([]);
  const [currentHistoryTimestamp, setCurrentHistoryTimestamp] = useState<string | null>(null);
  const [isTauri, setIsTauri] = useState(false);
  const [homeDirectory, setHomeDirectory] = useState<string | undefined>(undefined);

  // Check if we're in Tauri environment and load modules
  useEffect(() => {
    const checkTauri = async () => {
      try {
        await import('@tauri-apps/api/core');
        setIsTauri(true);
        
        // Get home directory
        try {
          const { homeDir } = await import('@tauri-apps/api/path');
          const home = await homeDir();
          setHomeDirectory(home);
        } catch (error) {
          console.error("Failed to get home directory:", error);
        }
        
        // Load available modules from JHOVE
        try {
          const modules = await getJhoveModules();
          setAvailableModules(modules);
        } catch (error) {
          console.error("Failed to load JHOVE modules:", error);
        }
      } catch {
        setIsTauri(false);
      }
    };
    checkTauri();
  }, []);

  const calculateChecksum = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const rushaWorker = Rusha.createWorker(); // Create a Rusha worker instance
      const reader = new FileReader(); // Create a FileReader instance

      reader.onload = function () {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          rushaWorker.onmessage = (e: MessageEvent) => {
            if (e.data.error) {
              reject(`Error calculating checksum: ${e.data.error}`);
            } else {
              resolve(e.data.hash); // Resolve with the calculated checksum
            }
          };

          rushaWorker.postMessage({ id: "1", data: arrayBuffer }); // Send data to the worker
        } catch (error) {
          reject(`Error processing file: ${error}`);
        }
      };

      reader.onerror = function () {
        reject("Error reading file for checksum calculation");
      };

      reader.readAsArrayBuffer(file); // Read the file as an ArrayBuffer
    });
  };

  const sendToJhove = async (filePath: string, module: string) => {
    const timestamp = new Date().toISOString();
    const fileName = filePath.split('/').pop() || filePath;
    // Show the actual full command being executed
    const command = module === "AUTO" || !module 
      ? `jhove -h JSON "${filePath}"`
      : `jhove -m ${module} -h JSON "${filePath}"`;

    try {
      const resultStr = await validateFile(filePath, module);
      const result = JSON.parse(resultStr);
      
      // Log success to debug
      setDebugLog(prev => [...prev, {
        timestamp,
        file: fileName,
        command,
        output: resultStr
      }]);
      
      return result;
    } catch (error) {
      console.error("Error validating file with JHOVE:", error);
      
      const errorMsg = error instanceof Error ? error.message : String(error);
      
      // Log error
      setDebugLog(prev => [...prev, {
        timestamp,
        file: fileName,
        command,
        output: '',
        error: errorMsg
      }]);
      
      throw new Error(errorMsg);
    }
  };

  const handleModuleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModule(event.target.value);
  };

  const handleFileSelect = async () => {
    try {
      // Use last folder path if available, otherwise use home directory
      const defaultPath = lastFolderPath || homeDirectory;
      const filePath = await pickFile(defaultPath);
      if (filePath) {
        // Remember the folder this file is in
        const folderPath = filePath.substring(0, filePath.lastIndexOf('/'));
        setLastFolderPath(folderPath);
        processFileByPath(filePath);
      }
    } catch (error) {
      console.error("Error selecting file:", error);
      alert("Failed to select file. Please try again.");
    }
  };

  const handleFolderSelect = async () => {
    try {
      // Use last folder path if available, otherwise use home directory
      const defaultPath = lastFolderPath || homeDirectory;
      const folderPath = await pickFolder(defaultPath);
      if (folderPath) {
        // Remember this folder for next time
        setLastFolderPath(folderPath);
        processFolderByPath(folderPath);
      }
    } catch (error) {
      console.error("Error selecting folder:", error);
      alert("Failed to select folder. Please try again.");
    }
  };

  const processFolderByPath = async (folderPath: string, moduleOverride?: string) => {
    setIsProcessing(true);
    setError(null);
    const moduleToUse = moduleOverride || selectedModule;
    
    try {
      const folderName = folderPath.split('/').pop() || folderPath;
      const timestamp = new Date().toISOString();
      // Show the actual folder command in logs
      const command = moduleToUse === "AUTO" || !moduleToUse 
        ? `jhove -h JSON "${folderPath}"`
        : `jhove -m ${moduleToUse} -h JSON "${folderPath}"`;
      
      const resultStr = await validateFolder(folderPath, moduleToUse);
      const jhoveResponse = JSON.parse(resultStr) as JhoveResponse;
      
      console.log("JHOVE Folder Response:", jhoveResponse);

      // Log folder scan to debug
      setDebugLog(prev => [...prev, {
        timestamp,
        file: `Folder: ${folderName}`,
        command,
        output: resultStr
      }]);

      // For folder validation, we'll show a summary or list of all files
      // Store the full response for now
      const newFileInfo = {
        name: `Folder: ${folderName}`,
        size: 0,
        type: "Folder",
        module: moduleToUse,
        filePath: folderPath,
        processedResult: { folderScan: true, totalFiles: jhoveResponse?.jhove?.repInfo?.length || 0 },
        rawApiOutput: jhoveResponse,
      };
      
      setFileInfo(newFileInfo);
      
      // Update the last debug log entry to include fileInfo and set current timestamp
      setDebugLog(prev => {
        if (prev.length > 0) {
          const updated = [...prev];
          const lastEntry = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastEntry,
            fileInfo: newFileInfo
          };
          setCurrentHistoryTimestamp(lastEntry.timestamp);
          return updated;
        }
        return prev;
      });
      
      setLastFilePath(folderPath);
      setActiveSection("Analyse");
    } catch (error) {
      console.error("Error processing folder:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process folder. Please try again.";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleHistorySelect = (entry: DebugEntry) => {
    if (entry.fileInfo) {
      setFileInfo(entry.fileInfo);
      setLastFilePath(entry.fileInfo.filePath || null);
      setCurrentHistoryTimestamp(entry.timestamp);
      setActiveSection("Analyse");
    }
  };

  const processFileByPath = async (filePath: string, moduleOverride?: string) => {
    setIsProcessing(true);
    setError(null);
    const moduleToUse = moduleOverride || selectedModule;
    
    try {
      // Get file info from path
      const fileName = filePath.split('/').pop() || filePath;
      
      // Calculate checksum and validate file in parallel
      const [checksumResult, jhoveResponseResult] = await Promise.all([
        calculateSha1(filePath).catch(err => {
          console.error("Failed to calculate checksum:", err);
          return null;
        }),
        sendToJhove(filePath, moduleToUse) as Promise<JhoveResponse>
      ]);
      
      const jhoveResponse = jhoveResponseResult;
      console.log("JHOVE Response:", jhoveResponse);

      // Extract the first repInfo entry from JHOVE CLI JSON
      const repInfo = jhoveResponse?.jhove?.repInfo?.[0];
      if (!repInfo) {
        throw new Error("No report information returned from JHOVE");
      }

      // Create ApiResult from repInfo with proper message structure
      const apiResult: ApiResult = {
        size: repInfo.size,
        format: repInfo.format,
        version: repInfo.version,
        status: repInfo.status,
        mimeType: repInfo.mimeType,
        messages: repInfo.messages || [],
        // Store the full jhove response for technical details
        jhove: jhoveResponse.jhove,
      };

      const processedResult = processApiResult(apiResult);

      // Use calculated checksum or fallback to undefined
      const newFileInfo = {
        name: fileName,
        size: apiResult.size || 0,
        type: apiResult.mimeType || "Unknown",
        checksum: checksumResult || undefined,
        module: moduleToUse,
        filePath: filePath,
        processedResult: processedResult,
        rawApiOutput: apiResult, // Pass the restructured data with messages at top level
      };
      
      setFileInfo(newFileInfo);
      
      // Update the last debug log entry to include fileInfo and set current timestamp
      setDebugLog(prev => {
        if (prev.length > 0) {
          const updated = [...prev];
          const lastEntry = updated[updated.length - 1];
          updated[updated.length - 1] = {
            ...lastEntry,
            fileInfo: newFileInfo
          };
          setCurrentHistoryTimestamp(lastEntry.timestamp);
          return updated;
        }
        return prev;
      });
      
      setLastFilePath(filePath);
      setActiveSection("Analyse");
    } catch (error) {
      console.error("Error processing file:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to process file. Please try again.";
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsProcessing(false);
    }
  };

  interface JhoveRepInfo {
    uri?: string;
    size?: number;
    format?: string;
    version?: string;
    status?: string;
    mimeType?: string;
    messages?: Array<{ message: string; severity?: string }>;
    [key: string]: unknown;
  }

  interface JhoveResponse {
    jhove?: {
      repInfo?: JhoveRepInfo[];
      [key: string]: unknown;
    };
  }

  interface ApiResult {
    mimeType?: string;
    format?: string;
    size?: number;
    status?: string;
    version?: string;
    messages?: Array<{ message: string; severity?: string }>;
    [key: string]: unknown;
  }

  const processApiResult = (apiResult: ApiResult): Record<string, unknown> => {
    // Parse JHOVE CLI status field
    const status = apiResult.status || "";
    const isValid = status.toLowerCase().includes("valid") && !status.toLowerCase().includes("not valid");
    const isWellFormed = status.toLowerCase().includes("well-formed") && !status.toLowerCase().includes("not well-formed");
    
    return {
      mimeType: apiResult.mimeType || "Unknown",
      format: apiResult.format || "Unknown",
      version: apiResult.version || "N/A",
      size: apiResult.size && apiResult.size >= 0 ? `${apiResult.size} bytes` : "Unknown",
      valid: isValid ? "Yes" : "No",
      wellFormed: isWellFormed ? "Yes" : "No",
      status: apiResult.status || "Unknown",
      messages: apiResult.messages?.map((msg) => msg.message).join("; ") || "None",
    };
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Home":
        return (
          <HomeSection
            selectedModule={selectedModule}
            availableModules={availableModules}
            isProcessing={isProcessing}
            error={error}
            onModuleChange={handleModuleChange}
            onFileSelect={handleFileSelect}
            onFolderSelect={handleFolderSelect}
          />
        );
      case "Analyse":
        // Check if this is a folder scan (multiple files in repInfo)
        const repInfo = (fileInfo?.rawApiOutput as any)?.jhove?.repInfo;
        const isFolderScan = Array.isArray(repInfo) && repInfo.length > 1;
        
        if (isFolderScan) {
          return (
            <FolderAnalyseSection
              fileInfo={fileInfo}
              onRescan={(newModule) => {
                if (lastFilePath) {
                  setSelectedModule(newModule);
                  processFolderByPath(lastFilePath, newModule);
                } else {
                  alert("Folder path no longer available. Please re-select the folder from the Home tab.");
                }
              }}
              onRescanFile={(filePath, newModule) => {
                // Rescan individual file from folder scan
                setSelectedModule(newModule);
                processFileByPath(filePath, newModule);
              }}
              availableModules={availableModules}
              currentModule={fileInfo?.module || selectedModule}
            />
          );
        }
        
        return (
          <AnalyseSection 
            fileInfo={fileInfo} 
            onRescan={(newModule) => {
              if (lastFilePath) {
                setSelectedModule(newModule);
                processFileByPath(lastFilePath, newModule);
              } else {
                alert("File path no longer available. Please re-select the file from the Home tab.");
              }
            }}
            availableModules={availableModules}
            currentModule={fileInfo?.module || selectedModule}
          />
        );
      case "About":
        return <AboutSection debugLog={debugLog} />;
      case "Settings":
        return <SettingsSection />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Menu Bar */}
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Image 
              src="/jhove-logo.png" 
              alt="JHOVE Logo" 
              width={48} 
              height={48}
              className="w-12 h-12"
            />
            <div className="text-3xl font-bold">JHOVE</div>
            <div className="text-sm opacity-90 hidden sm:block">
              Format Validation & Characterization
            </div>
          </div>
        </div>
      </header>
      
      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        <nav className="menu">
          <div
            className={`menu-item ${activeSection === "Home" ? "bg-opf-purple" : ""}`}
            onClick={() => setActiveSection("Home")}
          >
            <FaHome className="text-xl" /> <span>Home</span>
          </div>
          <div
            className={`menu-item ${activeSection === "Analyse" ? "bg-opf-purple" : ""}`}
            onClick={() => setActiveSection("Analyse")}
          >
            <FaChartBar className="text-xl" /> <span>Analyse</span>
          </div>
          <div
            className={`menu-item ${activeSection === "About" ? "bg-opf-purple" : ""}`}
            onClick={() => setActiveSection("About")}
          >
            <FaInfoCircle className="text-xl" /> <span>About</span>
          </div>
          <div
            className={`menu-item ${activeSection === "Settings" ? "bg-opf-purple" : ""}`}
            onClick={() => setActiveSection("Settings")}
          >
            <FaCog className="text-xl" /> <span>Settings</span>
          </div>
        </nav>
        <main className="main-content overflow-y-auto">{renderContent()}</main>
        {activeSection === "Analyse" && (
          <HistorySidebar
            history={debugLog}
            onSelectHistory={handleHistorySelect}
            currentTimestamp={currentHistoryTimestamp || undefined}
          />
        )}
      </div>
    </div>
  );
}
