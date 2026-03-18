import { FaImage, FaFileAlt, FaMusic, FaFileCode, FaArchive, FaCog, FaBook, FaBug, FaTerminal } from "react-icons/fa";

interface DebugEntry {
  timestamp: string;
  file: string;
  command: string;
  output: string;
  error?: string;
}

interface AboutSectionProps {
  debugLog?: DebugEntry[];
}

export default function AboutSection({ debugLog = [] }: AboutSectionProps) {
  const openExternalLink = async (url: string) => {
    try {
      const { open } = await import('@tauri-apps/plugin-shell');
      await open(url);
    } catch (error) {
      console.error('Failed to open external link:', error);
    }
  };
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">About JHOVE Desktop</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">What is this application?</h2>
        <p className="mb-4 text-lg leading-relaxed">
          This is a <strong>desktop application</strong> for <strong>JHOVE</strong> (JSTOR/Harvard Object Validation Environment), 
          an extensible software framework for format-specific identification, validation, and characterization of digital objects.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          Built with <strong>Tauri</strong>, <strong>Next.js 15</strong> and <strong>React 19</strong>, this application provides a user-friendly 
          desktop interface to validate and analyze digital files using JHOVE&apos;s powerful validation modules directly on your computer.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">What is JHOVE?</h2>
        <p className="mb-4 text-lg leading-relaxed">
          JHOVE is an open-source tool developed by the <strong>Open Preservation Foundation (OPF)</strong> in collaboration 
          with <strong>Harvard University Library</strong> and other institutions. It is widely used in digital preservation 
          to ensure that digital files conform to their format specifications and remain valid over time.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          JHOVE can validate and characterize 17 different file formats including PDF, JPEG, TIFF, PNG, WAVE, HTML, XML, 
          EPUB, and many more.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How does it work?</h2>
        <ol className="list-decimal list-inside space-y-3 text-lg">
          <li><strong>Configure JHOVE</strong> - Set the path to your JHOVE installation in Settings</li>
          <li><strong>Select a module</strong> - Choose the appropriate JHOVE module or use auto-detection</li>
          <li><strong>Upload a file</strong> - Select a file from your computer</li>
          <li><strong>Analyze</strong> - JHOVE validates the file locally on your machine</li>
          <li><strong>View results</strong> - See detailed validation information including format compliance and any issues</li>
        </ol>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Supported Formats</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2 text-purple-600">
              <FaImage />
            </div>
            <strong className="text-purple-900">Images</strong>
            <p className="text-sm text-gray-700 mt-1">JPEG, JPEG2000, PNG, GIF, TIFF</p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2 text-blue-600">
              <FaFileAlt />
            </div>
            <strong className="text-blue-900">Documents</strong>
            <p className="text-sm text-gray-700 mt-1">PDF, HTML, XML, EPUB</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2 text-green-600">
              <FaMusic />
            </div>
            <strong className="text-green-900">Audio</strong>
            <p className="text-sm text-gray-700 mt-1">WAVE, AIFF</p>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2 text-yellow-600">
              <FaFileCode />
            </div>
            <strong className="text-yellow-900">Text</strong>
            <p className="text-sm text-gray-700 mt-1">ASCII, UTF-8</p>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2 text-indigo-600">
              <FaArchive />
            </div>
            <strong className="text-indigo-900">Archives</strong>
            <p className="text-sm text-gray-700 mt-1">WARC, GZIP</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-300 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <div className="text-2xl mb-2 text-gray-600">
              <FaCog />
            </div>
            <strong className="text-gray-900">Generic</strong>
            <p className="text-sm text-gray-700 mt-1">BYTESTREAM</p>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">JHOVE Information</h2>
        <p className="mb-4 text-lg leading-relaxed">
          This desktop application uses your local JHOVE installation to validate files directly on your computer.
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm">
          <div className="mb-3">
            <span className="font-semibold text-blue-900">Official Website:</span>
            <button
              onClick={() => openExternalLink('https://jhove.openpreservation.org')}
              className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium flex items-center gap-1 cursor-pointer"
            >
              <FaBook className="text-sm" /> jhove.openpreservation.org
            </button>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-blue-900">Download JHOVE:</span>
            <button
              onClick={() => openExternalLink('https://software.openpreservation.org/releases/jhove-latest.jar')}
              className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
            >
              Download Latest Version
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">About the Open Preservation Foundation</h2>
        <p className="mb-4 text-lg leading-relaxed">
          The <strong>Open Preservation Foundation (OPF)</strong> is an international organization dedicated to ensuring 
          long-term access to digital content. OPF develops and maintains open-source tools and resources for digital 
          preservation, including JHOVE.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          Learn more at: <button
            onClick={() => openExternalLink('https://openpreservation.org')}
            className="text-blue-500 hover:underline cursor-pointer"
          >
            openpreservation.org
          </button>
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">License & Credits</h2>
        <p className="mb-2 text-lg leading-relaxed">
          <strong>JHOVE:</strong> Released under the GNU Lesser General Public License (LGPL)
        </p>
        <p className="mb-2 text-lg leading-relaxed">
          <strong>This Application:</strong> Built with Tauri, Next.js, React, and Tailwind CSS
        </p>
        <p className="mb-2 text-lg leading-relaxed">
          <strong>Version:</strong> 0.1.1
        </p>
      </section>

      {/* Debug Section */}
      {debugLog && debugLog.length > 0 && (
        <section className="mt-12 pt-8 border-t-2 border-gray-300">
          <div className="flex items-center gap-3 mb-6">
            <FaBug className="text-3xl text-red-600" />
            <h2 className="text-2xl font-semibold">Debug Log</h2>
          </div>
          
          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-auto max-h-96">
            <div className="flex items-center gap-2 mb-4 text-green-400">
              <FaTerminal />
              <span>JHOVE Execution History (Last {Math.min(debugLog.length, 200)} entries)</span>
            </div>
            
            <div className="space-y-6">
              {debugLog.slice(-200).reverse().map((entry, idx) => (
                <div key={idx} className="border-l-2 border-blue-500 pl-4 py-2">
                  <div className="text-gray-400 text-xs mb-1">{entry.timestamp}</div>
                  
                  <div className="mb-2">
                    <span className="text-yellow-400">File:</span>
                    <span className="text-white ml-2">{entry.file}</span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="text-green-400">Command:</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 text-cyan-300 overflow-x-auto">
                      {entry.command}
                    </div>
                  </div>
                  
                  {entry.error && (
                    <div className="mb-2">
                      <span className="text-red-400">Error:</span>
                      <div className="bg-red-900/30 border border-red-500 p-2 rounded mt-1 text-red-200">
                        {entry.error}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <span className="text-blue-400">Output:</span>
                    <div className="bg-gray-800 p-2 rounded mt-1 max-h-40 overflow-auto">
                      <pre className="text-gray-300 whitespace-pre-wrap break-words text-xs">
                        {entry.output.substring(0, 2000)}
                        {entry.output.length > 2000 && <span className="text-yellow-500"> ... (truncated)</span>}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mt-3">
            * Debug log shows the last 200 file validations. Each entry displays the JHOVE command executed, 
            raw output, and any errors encountered.
          </p>
        </section>
      )}
    </div>
  );
}
