import { FaFolderOpen, FaInfoCircle, FaMagic, FaCogs, FaFile, FaExclamationTriangle, FaSpinner } from "react-icons/fa";

interface HomeSectionProps {
  selectedModule: string;
  availableModules: string[];
  isProcessing?: boolean;
  error?: string | null;
  onModuleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onFileSelect: () => void;
  onFolderSelect: () => void;
}

export default function HomeSection({
  selectedModule,
  availableModules,
  isProcessing = false,
  error = null,
  onModuleChange,
  onFileSelect,
  onFolderSelect,
}: HomeSectionProps) {
  return (
    <div className="flex items-center justify-center min-h-full p-8">
      <div className="max-w-4xl w-full">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-3">
            Validate Your Digital Files
          </h1>
          <p className="text-lg text-gray-600">
            Select a file or folder to validate against format specifications and preservation standards
          </p>
        </div>

      

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Step 1: Module Selection */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaCogs className="text-purple-600" />
                Select Validation Module
              </h3>
            </div>
            
            <select
              id="module"
              name="module"
              className="w-full px-4 py-3 text-lg rounded-lg border-2 border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all bg-white shadow-sm"
              value={selectedModule}
              onChange={onModuleChange}
            >
              {availableModules.map((module) => (
                <option key={module} value={module}>
                  {module === "AUTO" ? "Auto-detect (Recommended)" : module}
                </option>
              ))}
            </select>
            
            {selectedModule === "AUTO" && (
              <div className="mt-3 text-sm text-gray-600 bg-white/60 p-3 rounded-lg flex items-center gap-2">
                <FaInfoCircle className="text-indigo-600" />
                <span>AUTO mode lets JHOVE automatically detect and use the appropriate module for your file</span>
              </div>
            )}
          </div>

          {/* Step 2: File / Folder Scanning */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaFolderOpen className="text-indigo-600" />
                Select File or Folder
              </h3>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-sm mb-4" role="alert">
                <div className="flex items-start">
                  <FaExclamationTriangle className="text-xl mr-3 flex-shrink-0" />
                  <div>
                    <strong className="font-semibold">Error</strong>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            {isProcessing && (
              <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-800 px-4 py-3 rounded-lg shadow-sm mb-4" role="alert">
                <div className="flex items-start">
                  <FaSpinner className="text-xl mr-3 animate-spin flex-shrink-0" />
                  <div>
                    <strong className="font-semibold">Processing</strong>
                    <p className="text-sm mt-1">Validating files, please wait...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Selection */}
              <div
                className={`border-2 border-indigo-300 rounded-xl p-8 text-center transition-all duration-200 bg-white hover:shadow-lg ${
                  isProcessing ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <FaFile className="mx-auto text-4xl mb-4 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Select Single File
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Validate a single file
                </p>
                <button
                  onClick={onFileSelect}
                  disabled={isProcessing}
                  className={`w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-all ${
                    isProcessing 
                      ? "cursor-not-allowed opacity-50" 
                      : "hover:bg-indigo-700 hover:shadow-lg cursor-pointer"
                  }`}
                >
                  {isProcessing ? "Processing..." : "Select File"}
                </button>
              </div>

              {/* Folder Selection */}
              <div
                className={`border-2 border-purple-300 rounded-xl p-8 text-center transition-all duration-200 bg-white hover:shadow-lg ${
                  isProcessing ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                <FaCogs className="mx-auto text-4xl mb-4 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Select Folder
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Recursively validate all files in a folder
                </p>
                <button
                  onClick={onFolderSelect}
                  disabled={isProcessing}
                  className={`w-full px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md transition-all ${
                    isProcessing 
                      ? "cursor-not-allowed opacity-50" 
                      : "hover:bg-purple-700 hover:shadow-lg cursor-pointer"
                  }`}
                >
                  {isProcessing ? "Processing..." : "Select Folder"}
                </button>
              </div>
            </div>
            
            <p className="text-sm text-gray-500 mt-4 text-center">
              Supports: JPEG, PNG, PDF, TIFF, WAV, AIFF, HTML, XML, EPUB, and more
            </p>
          </div>
        </div>

          {/* How it Works Card */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-indigo-200 rounded-xl p-6 mb-8 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <FaInfoCircle className="text-2xl text-indigo-600 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-2">How It Works</h2>
              <div className="text-gray-700 space-y-2">
                <p className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">1.</span>
                  <span><strong>Select a module</strong> - Choose &ldquo;AUTO&rdquo; to let JHOVE detect your file format, or pick a specific format module.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">2.</span>
                  <span><strong>Select file or folder</strong> - Choose a single file or an entire folder for batch validation.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">3.</span>
                  <span><strong>View results</strong> - Get detailed validation reports instantly.</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/50 rounded-lg p-4 mt-4">
            <div className="flex items-start gap-2">
              <FaMagic className="text-indigo-600 mt-1" />
              <div className="text-sm">
                <strong className="text-gray-800">AUTO Mode:</strong>
                <span className="text-gray-700"> When you select AUTO, JHOVE will automatically detect the best validation module for your file format.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-sm text-gray-500">
          Powered by JHOVE (JSTOR/Harvard Object Validation Environment)
        </div>
      </div>
    </div>
  );
}
