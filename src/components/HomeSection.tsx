import { FaUpload, FaInfoCircle, FaMagic, FaCogs } from "react-icons/fa";

interface HomeSectionProps {
  selectedModule: string;
  isDragging: boolean;
  isProcessing?: boolean;
  error?: string | null;
  onModuleChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function HomeSection({
  selectedModule,
  isDragging,
  isProcessing = false,
  error = null,
  onModuleChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileSelect,
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
            Upload a file to check if it meets format specifications and preservation standards
          </p>
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
                  <span><strong>Select a module</strong> - Choose "Auto-detect" to let us figure out your file type, or pick a specific format module.</span>
                </p>
                <p className="flex items-start gap-2">
                  <span className="font-bold text-indigo-600">2.</span>
                  <span><strong>Upload your file</strong> - Drag & drop or click to browse.</span>
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
                <strong className="text-gray-800">Auto-detect Feature:</strong>
                <span className="text-gray-700"> Our smart detection analyzes your file extension and type to automatically select the best validation module (JPEG, PDF, PNG, TIFF, WAV, and more).</span>
              </div>
            </div>
          </div>
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
              <option value="AUTO">🔍 Auto-detect (Recommended)</option>
              <option value="BYTESTREAM">BYTESTREAM (Generic)</option>
              <option value="AIFF-hul">AIFF-hul</option>
              <option value="ASCII-hul">ASCII-hul</option>
              <option value="EPUB-ptc">EPUB-ptc</option>
              <option value="GIF-hul">GIF-hul</option>
              <option value="GZIP-kb">GZIP-kb</option>
              <option value="HTML-hul">HTML-hul</option>
              <option value="JPEG-hul">JPEG-hul</option>
              <option value="JPEG2000-hul">JPEG2000-hul</option>
              <option value="PDF-hul">PDF-hul</option>
              <option value="PNG-gdm">PNG-gdm</option>
              <option value="TIFF-hul">TIFF-hul</option>
              <option value="UTF8-hul">UTF8-hul</option>
              <option value="WARC-kb">WARC-kb</option>
              <option value="WAVE-hul">WAVE-hul</option>
              <option value="XML-hul">XML-hul</option>
            </select>
            
            {selectedModule === "AUTO" && (
              <div className="mt-3 text-sm text-gray-600 bg-white/60 p-3 rounded-lg">
                ℹ️ Auto-detect will analyze your file and choose the best module automatically
              </div>
            )}
          </div>

          {/* Step 2: File Upload */}
          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                <FaUpload className="text-indigo-600" />
                Upload Your File
              </h3>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-4 py-3 rounded-lg shadow-sm mb-4" role="alert">
                <div className="flex items-start">
                  <span className="text-xl mr-3">⚠️</span>
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
                  <span className="text-xl mr-3 animate-pulse">⏳</span>
                  <div>
                    <strong className="font-semibold">Processing</strong>
                    <p className="text-sm mt-1">Validating your file, please wait...</p>
                  </div>
                </div>
              </div>
            )}
            
            <div
              className={`border-3 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                isDragging 
                  ? "border-green-500 bg-green-50 scale-105" 
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-gray-400"
              } ${isProcessing ? "opacity-50 pointer-events-none" : "cursor-pointer"}`}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
            >
              <FaUpload className={`mx-auto text-5xl mb-4 ${isDragging ? "text-green-500" : "text-gray-400"}`} />
              <p className="text-xl font-semibold text-gray-700 mb-2">
                {isDragging ? "Drop your file here" : "Drag & drop your file here"}
              </p>
              <p className="text-gray-500 mb-4">or</p>
              <input
                type="file"
                className="hidden"
                id="file-upload"
                onChange={onFileSelect}
                disabled={isProcessing}
              />
              <label
                htmlFor="file-upload"
                className={`inline-block px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition-all ${
                  isProcessing 
                    ? "cursor-not-allowed opacity-50" 
                    : "hover:bg-indigo-700 hover:shadow-lg cursor-pointer"
                }`}
              >
                {isProcessing ? "Processing..." : "Browse Files"}
              </label>
              <p className="text-sm text-gray-500 mt-4">
                Supports: JPEG, PNG, PDF, TIFF, WAV, AIFF, HTML, XML, EPUB, and more
              </p>
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
