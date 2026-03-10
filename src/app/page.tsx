"use client";

import { useState, useEffect } from "react";
import Rusha from "rusha";
import { FaHome, FaChartBar, FaInfoCircle } from "react-icons/fa";
import HomeSection from "@/components/HomeSection";
import AnalyseSection from "@/components/AnalyseSection";
import AboutSection from "@/components/AboutSection";

declare global {
  interface Window {
    env?: {
      API_BASE_URL?: string;
    };
  }
}

export default function Home() {
  const [activeSection, setActiveSection] = useState("Home");
  type AdditionalData = Record<string, unknown>; // Define a specific type for additionalData
  const [fileInfo, setFileInfo] = useState<{ name: string; size: number; type: string; checksum?: string; processedResult?: AdditionalData; rawApiOutput?: ApiResult; module?: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModule, setSelectedModule] = useState("AUTO");
  const [apiBaseUrl, setApiBaseUrl] = useState("https://jhove-rs.openpreservation.org"); // Default value
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);


  useEffect(() => {
    if (typeof window !== "undefined" && window.env?.API_BASE_URL) {
      setApiBaseUrl(window.env.API_BASE_URL);
    }
  }, []);

  const detectModuleFromFile = (file: File): string => {
    // Get file extension
    const fileName = file.name.toLowerCase();
    const extension = fileName.substring(fileName.lastIndexOf('.') + 1);
    const mimeType = file.type.toLowerCase();

    // Map extensions and MIME types to JHOVE modules
    const moduleMap: { [key: string]: string } = {
      // Images
      'jpg': 'JPEG-hul',
      'jpeg': 'JPEG-hul',
      'jp2': 'JPEG2000-hul',
      'jpx': 'JPEG2000-hul',
      'png': 'PNG-gdm',
      'gif': 'GIF-hul',
      'tif': 'TIFF-hul',
      'tiff': 'TIFF-hul',
      
      // Documents
      'pdf': 'PDF-hul',
      'html': 'HTML-hul',
      'htm': 'HTML-hul',
      'xml': 'XML-hul',
      'epub': 'EPUB-ptc',
      
      // Audio
      'wav': 'WAVE-hul',
      'wave': 'WAVE-hul',
      'aif': 'AIFF-hul',
      'aiff': 'AIFF-hul',
      
      // Archives
      'gz': 'GZIP-kb',
      'gzip': 'GZIP-kb',
      'warc': 'WARC-kb',
      
      // Text
      'txt': 'UTF8-hul',
      'text': 'ASCII-hul',
      'asc': 'ASCII-hul',
    };

    // Try extension first
    if (moduleMap[extension]) {
      console.log(`Auto-detected module from extension .${extension}: ${moduleMap[extension]}`);
      return moduleMap[extension];
    }

    // Try MIME type mapping
    const mimeMap: { [key: string]: string } = {
      'image/jpeg': 'JPEG-hul',
      'image/jp2': 'JPEG2000-hul',
      'image/png': 'PNG-gdm',
      'image/gif': 'GIF-hul',
      'image/tiff': 'TIFF-hul',
      'application/pdf': 'PDF-hul',
      'text/html': 'HTML-hul',
      'application/xhtml+xml': 'HTML-hul',
      'text/xml': 'XML-hul',
      'application/xml': 'XML-hul',
      'application/epub+zip': 'EPUB-ptc',
      'audio/wav': 'WAVE-hul',
      'audio/x-wav': 'WAVE-hul',
      'audio/aiff': 'AIFF-hul',
      'audio/x-aiff': 'AIFF-hul',
      'application/gzip': 'GZIP-kb',
      'application/warc': 'WARC-kb',
      'text/plain': 'UTF8-hul',
    };

    if (mimeType && mimeMap[mimeType]) {
      console.log(`Auto-detected module from MIME type ${mimeType}: ${mimeMap[mimeType]}`);
      return mimeMap[mimeType];
    }

    // Fallback to BYTESTREAM
    console.log('Could not auto-detect specific module, using BYTESTREAM');
    return 'BYTESTREAM';
  };

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

  const sendToApi = async (file: File, module: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("module", module);

    try {
      const response = await fetch(`${apiBaseUrl}/api/jhove/validate`, {
        method: "POST",
        body: formData,
        mode: "cors",
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => response.statusText);
        throw new Error(`API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Error sending data to API:", error);
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error("Network error: Unable to connect to JHOVE API. Please check your internet connection.");
      }
      throw error;
    }
  };

  const handleFileDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleModuleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModule(event.target.value);
  };

  const processFile = async (file: File, moduleOverride?: string) => {
    setIsProcessing(true);
    setError(null);
    let moduleToUse = moduleOverride || selectedModule;
    
    // If AUTO is selected, detect the module from the file
    if (moduleToUse === "AUTO") {
      moduleToUse = detectModuleFromFile(file);
    }
    
    try {
      const checksum = await calculateChecksum(file);
      const apiResult = await sendToApi(file, moduleToUse);
      const processedResult = processApiResult(apiResult);

      console.log("API Result:", apiResult);

      setFileInfo({
        name: file.name,
        size: file.size,
        type: file.type,
        checksum: checksum,
        module: moduleToUse,
        processedResult: processedResult,
        rawApiOutput: apiResult,
      });
      setLastUploadedFile(file);
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

  interface ApiResult {
    mimeType?: string;
    format?: string;
    size?: number;
    valid?: number;
    wellFormed?: number;
    validMessage?: string;
    wellFormedMessage?: string;
    messages?: { message: string }[];
    [key: string]: unknown; // Allow additional properties
  }

  const processApiResult = (apiResult: ApiResult): Record<string, unknown> => {
    return {
      mimeType: apiResult.mimeType || "Unknown",
      format: apiResult.format || "Unknown",
      size: apiResult.size && apiResult.size >= 0 ? `${apiResult.size} bytes` : "Unknown",
      valid: apiResult.valid === 1 ? "Yes" : "No",
      wellFormed: apiResult.wellFormed === 1 ? "Yes" : "No",
      validMessage: apiResult.validMessage || "N/A",
      wellFormedMessage: apiResult.wellFormedMessage || "N/A",
      messages: apiResult.messages?.map((msg) => msg.message).join("; ") || "None",
    };
  };

  const renderContent = () => {
    switch (activeSection) {
      case "Home":
        return (
          <HomeSection
            selectedModule={selectedModule}
            isDragging={isDragging}
            isProcessing={isProcessing}
            error={error}
            onModuleChange={handleModuleChange}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onFileSelect={handleFileSelect}
          />
        );
      case "Analyse":
        return (
          <AnalyseSection 
            fileInfo={fileInfo} 
            onRescan={(newModule) => {
              if (lastUploadedFile) {
                setSelectedModule(newModule);
                processFile(lastUploadedFile, newModule);
              } else {
                alert("File no longer available. Please re-upload the file from the Home tab.");
              }
            }}
            availableModules={[
              "AUTO",
              "BYTESTREAM",
              "AIFF-hul",
              "ASCII-hul",
              "EPUB-ptc",
              "GIF-hul",
              "GZIP-kb",
              "HTML-hul",
              "JPEG-hul",
              "JPEG2000-hul",
              "PDF-hul",
              "PNG-gdm",
              "TIFF-hul",
              "UTF8-hul",
              "WARC-kb",
              "WAVE-hul",
              "XML-hul"
            ]}
            currentModule={fileInfo?.module || selectedModule}
          />
        );
      case "About":
        return <AboutSection />;
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
        </nav>
        <main className="main-content overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
}
