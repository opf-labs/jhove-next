import { FaImage, FaFileAlt, FaMusic, FaFileCode, FaArchive, FaCog, FaBook } from "react-icons/fa";

export default function AboutSection() {
  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">About JHOVE Next.js</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">What is this application?</h2>
        <p className="mb-4 text-lg leading-relaxed">
          This is a modern web interface for <strong>JHOVE</strong> (JSTOR/Harvard Object Validation Environment), 
          an extensible software framework for format-specific identification, validation, and characterization of digital objects.
        </p>
        <p className="mb-4 text-lg leading-relaxed">
          Built with <strong>Next.js 15</strong> and <strong>React 19</strong>, this application provides a user-friendly 
          way to validate and analyze digital files using JHOVE&apos;s powerful validation modules.
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
          <li><strong>Select a module</strong> - Choose the appropriate JHOVE module for your file format</li>
          <li><strong>Upload a file</strong> - Drag and drop or click to select a file from your computer</li>
          <li><strong>Analyze</strong> - The file is sent to the JHOVE API for validation</li>
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
        <h2 className="text-2xl font-semibold mb-4">API Information</h2>
        <p className="mb-4 text-lg leading-relaxed">
          This application uses the JHOVE REST API provided by the Open Preservation Foundation:
        </p>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-5 rounded-lg shadow-sm">
          <div className="mb-3">
            <span className="font-semibold text-blue-900">API Base URL:</span>
            <code className="ml-2 bg-white px-3 py-1 rounded text-sm text-blue-700 border border-blue-200">
              https://jhove-rs.openpreservation.org
            </code>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-blue-900">Documentation:</span>
            <a href="https://jhove-rs.openpreservation.org/api/swagger" 
              target="_blank" rel="noopener noreferrer" 
              className="ml-2 text-blue-600 hover:text-blue-800 underline font-medium flex items-center gap-1">
              <FaBook className="text-sm" /> Swagger API Docs
            </a>
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
          Learn more at: <a href="https://openpreservation.org" target="_blank" rel="noopener noreferrer" 
            className="text-blue-500 hover:underline">openpreservation.org</a>
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">License & Credits</h2>
        <p className="mb-2 text-lg leading-relaxed">
          <strong>JHOVE:</strong> Released under the GNU Lesser General Public License (LGPL)
        </p>
        <p className="mb-2 text-lg leading-relaxed">
          <strong>This Application:</strong> Built with Next.js, React, and Tailwind CSS
        </p>
        <p className="mb-2 text-lg leading-relaxed">
          <strong>Version:</strong> 0.1.0
        </p>
      </section>
    </div>
  );
}
