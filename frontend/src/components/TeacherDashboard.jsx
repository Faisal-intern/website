import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const StatCard = ({ icon, title, value, color }) => (
  <div className="backdrop-blur-sm bg-white/70 p-6 rounded-2xl border border-white/20 shadow-lg transform hover:scale-105 transition-transform duration-300">
    <div className="flex items-center justify-between">
      <div className={`h-12 w-12 rounded-full bg-${color}-100 flex items-center justify-center`}>
        {icon}
      </div>
    </div>
    <p className="mt-4 text-sm text-gray-500">{title}</p>
    <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
  </div>
);

const Logo = () => (
  <div className="flex items-center gap-3">
    <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        className="h-6 w-6 text-white" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path d="M12 14l9-5-9-5-9 5 9 5z" />
        <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 20v-6" />
      </svg>
    </div>
    <div>
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
        VM Institute
      </h1>
      <p className="text-sm text-gray-500">Teacher Portal</p>
    </div>
  </div>
);

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState('');
  const [uploadedResults, setUploadedResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [previewData, setPreviewData] = useState(null);

  useEffect(() => {
    fetchUploadedResults();
  }, []);

  const fetchUploadedResults = async () => {
    try {
      const response = await fetch(`${API_URL}/api/teacher/results`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUploadedResults(data);
      }
    } catch (error) {
      console.error('Error fetching results:', error);
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!file || !subject) {
      setError('Please select both a file and subject');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/teacher/upload-results`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        body: formData,
      });

      const data = await response.json();
      
      if (response.ok) {
        alert(`Results uploaded successfully! ${data.count} results processed.`);
        setFile(null);
        setSubject('');
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';
        fetchUploadedResults();
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading results:', error);
      setError('Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadFile = async (batchId) => {
    try {
      const response = await fetch(`${API_URL}/api/teacher/result-file/${batchId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(
          new Blob([blob], { 
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })
        );
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `results-${batchId}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      setError('Failed to download file');
    }
  };

  const handlePreviewBatch = async (batchId) => {
    try {
      const response = await fetch(`${API_URL}/api/teacher/preview-batch/${batchId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
        setSelectedBatch(batchId);
      } else {
        setError('Failed to load preview');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      setError('Failed to load preview');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // The AuthContext will handle the redirect
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleDownloadSample = () => {
    const sampleFileUrl = '/sample-result-template.xlsx'; // Place the file in public folder
    const link = document.createElement('a');
    link.href = sampleFileUrl;
    link.download = 'result-template.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-cyan-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 blur-3xl" />
      </div>

      {/* Header/Navbar */}
      <nav className="relative z-10 bg-white border-b">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 py-2 sm:px-6 sm:py-3">
            {/* Left side - Logo */}
            <div className="flex justify-between items-center">
              <Header />
              
              {/* Mobile Logout Button */}
              <button
                onClick={handleLogout}
                className="sm:hidden flex items-center space-x-1 bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1.5 rounded-lg transition-colors duration-150"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                <span className="text-xs font-medium">Logout</span>
              </button>
            </div>

            {/* Desktop Right side - User info & Logout */}
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-3 bg-gray-50 py-2 px-4 rounded-lg">
                <span className="text-gray-600 text-sm font-medium">
                  Welcome, {user?.name || 'Teacher'}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg transition-colors duration-150"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
                  />
                </svg>
                <span className="text-sm font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile user info */}
          <div className="sm:hidden border-t px-4 py-2 bg-gray-50">
            <div className="flex items-center justify-center">
              <span className="text-gray-600 text-sm font-medium">
                Welcome, {user?.name ? `Prof. ${user.name}` : 'Teacher'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Upload Form */}
        <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-xl font-semibold text-black">Upload Results</h2>
              <button
                onClick={handleDownloadSample}
                className="inline-flex items-center px-4 py-2 mt-2 sm:mt-0 bg-white/80 hover:bg-white text-gray-700 rounded-lg transition-colors duration-200 text-sm"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className="h-4 w-4 mr-2" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
                  />
                </svg>
                Download Sample Template
              </button>
            </div>
          </div>
          <div className="p-6">
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-xl">
                {error}
              </div>
            )}
            <form onSubmit={handleFileUpload} className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                required
                placeholder="Enter Course name"
              />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File
                </label>
                <label className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-blue-500 transition-colors duration-200 cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={(e) => setFile(e.target.files[0])}
                    className="hidden"
                    required
                  />
                  <div className="space-y-1 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span className="relative font-medium text-blue-600 hover:text-blue-500">
                        Upload a file
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      CSV, XLSX or XLS up to 10MB
                    </p>
                  </div>
                </label>
                {file && (
                  <p className="mt-2 text-sm text-gray-600">
                    Selected file: {file.name}
                  </p>
                )}
            </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl
                  hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200
                  ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="https://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </div>
                ) : 'Upload Results'}
              </button>
            </form>
          </div>
        </div>

        {/* Results Table */}
        <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-black">Uploaded Results</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Batch Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Upload Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white/50 divide-y divide-gray-200">
                  {uploadedResults.map((batch) => (
                    <tr key={batch._id} className="hover:bg-white/70 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{batch.batchName}</p>
                          <p className="text-sm text-gray-500">{batch.subject}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                          ${batch.status === 'approved' 
                            ? 'bg-green-100 text-green-800'
                            : batch.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'}`}
                        >
                          {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(batch.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button
                          onClick={() => handleDownloadFile(batch._id)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handlePreviewBatch(batch._id)}
                          className="px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors duration-200"
                        >
                          Preview
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Preview Modal */}
        {selectedBatch && previewData && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl max-w-[95%] w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/20">
              <div className="flex-none bg-white px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Result Preview</h3>
                  <button
                    onClick={() => {
                      setSelectedBatch(null);
                      setPreviewData(null);
                    }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                  >
                    <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-auto">
                <div className="p-6">
                  <table className="min-w-full table-auto border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-2 border">Roll No</th>
                        <th className="px-4 py-2 border">Enrolment No</th>
                        <th className="px-4 py-2 border">Name (English)</th>
                        <th className="px-4 py-2 border">Name (Hindi)</th>
                        <th className="px-4 py-2 border">Father's Name (English)</th>
                        <th className="px-4 py-2 border">Father's Name (Hindi)</th>
                        <th className="px-4 py-2 border">Course (English)</th>
                        <th className="px-4 py-2 border">Course (Hindi)</th>
                        <th className="px-4 py-2 border">Course Year (English)</th>
                        <th className="px-4 py-2 border">Course Year (Hindi)</th>
                        <th className="px-4 py-2 border">Subject</th>
                        <th className="px-4 py-2 border">IA Subject Code</th>
                        <th className="px-4 py-2 border">ME Subject Code</th>
                        <th className="px-4 py-2 border">IA Marks</th>
                        <th className="px-4 py-2 border">ME Marks</th>
                        <th className="px-4 py-2 border">Total Marks</th>
                        <th className="px-4 py-2 border">Max Marks</th>
                        <th className="px-4 py-2 border">IA Max Marks</th>
                        <th className="px-4 py-2 border">ME Max Marks</th>
                        <th className="px-4 py-2 border">Mode (English)</th>
                        <th className="px-4 py-2 border">Mode (Hindi)</th>
                        <th className="px-4 py-2 border">Result Remark (English)</th>
                        <th className="px-4 py-2 border">Result Remark (Hindi)</th>
                        <th className="px-4 py-2 border">Date of Result (English)</th>
                        <th className="px-4 py-2 border">Date of Result (Hindi)</th>
                        <th className="px-4 py-2 border">Date of Birth</th>
                        <th className="px-4 py-2 border">Duration (English)</th>
                        <th className="px-4 py-2 border">Duration (Hindi)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.results.map((result, index) => (
                        <tr key={index} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-2 border">{result.rollNo}</td>
                          <td className="px-4 py-2 border">{result.enrolmentNo}</td>
                          <td className="px-4 py-2 border">{result.candidateNameEnglish}</td>
                          <td className="px-4 py-2 border">{result.candidateNameHindi}</td>
                          <td className="px-4 py-2 border">{result.fatherNameEnglish}</td>
                          <td className="px-4 py-2 border">{result.fatherNameHindi}</td>
                          <td className="px-4 py-2 border">{result.courseNameEnglish}</td>
                          <td className="px-4 py-2 border">{result.courseNameHindi}</td>
                          <td className="px-4 py-2 border">{result.courseYearEnglish}</td>
                          <td className="px-4 py-2 border">{result.courseYearHindi}</td>
                          <td className="px-4 py-2 border">{result.subject}</td>
                          <td className="px-4 py-2 border">{result.iaSubCode}</td>
                          <td className="px-4 py-2 border">{result.meSubCode}</td>
                          <td className="px-4 py-2 border">{result.iaMarks}</td>
                          <td className="px-4 py-2 border">{result.meMarks}</td>
                          <td className="px-4 py-2 border">{result.marksTotal}</td>
                          <td className="px-4 py-2 border">{result.maxMarks}</td>
                          <td className="px-4 py-2 border">{result.iaMaxMarks}</td>
                          <td className="px-4 py-2 border">{result.meMaxMarks}</td>
                          <td className="px-4 py-2 border">{result.modeEnglish}</td>
                          <td className="px-4 py-2 border">{result.modeHindi}</td>
                          <td className="px-4 py-2 border">{result.resultRemarkEnglish}</td>
                          <td className="px-4 py-2 border">{result.resultRemarkHindi}</td>
                          <td className="px-4 py-2 border">{result.dateOfResultEnglish}</td>
                          <td className="px-4 py-2 border">{result.dateOfResultHindi}</td>
                          <td className="px-4 py-2 border">{result.dateOfBirth}</td>
                          <td className="px-4 py-2 border">{result.durationEnglish}</td>
                          <td className="px-4 py-2 border">{result.durationHindi}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TeacherDashboard; 