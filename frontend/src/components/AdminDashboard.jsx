import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from './Header';
import "../css/loader.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const SidebarLink = ({ icon, text, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200 rounded-lg
      ${active 
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white' 
        : 'hover:bg-white/50 text-gray-600 hover:text-gray-900'}`}
  >
    {icon}
    <span className="font-medium">{text}</span>
  </button>
);

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

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [pendingResults, setPendingResults] = useState([]);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [newTeacher, setNewTeacher] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [publishedResults, setPublishedResults] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false); // On mobile, default to closed
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Fetch teachers and pending results
  useEffect(() => {
    fetchTeachers();
    fetchPendingResults();
    fetchPublishedResults();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/teachers`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const fetchPendingResults = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/pending-results`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPendingResults(data);
      }
    } catch (error) {
      console.error('Error fetching pending results:', error);
    }
  };

  const fetchPublishedResults = async () => {
    try {
      const response = await fetch(`${API_URL}/api/admin/published-results`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPublishedResults(data);
      }
    } catch (error) {
      console.error('Error fetching published results:', error);
    }
  };

  const handleAddTeacher = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/admin/add-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(newTeacher),
      });
      
      if (response.ok) {
        setNewTeacher({ name: '', email: '', password: '' });
        fetchTeachers();
        alert('Teacher added successfully');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher');
    }
  };

  const handleApproveBatch = async (batchId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/approve-batch/${batchId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        fetchPendingResults();
        fetchPublishedResults();
        alert('Batch approved successfully');
      }
    } catch (error) {
      console.error('Error approving batch:', error);
      alert('Failed to approve batch');
    }
  };

  const handleDisapproveBatch = async (batchId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/disapprove-batch/${batchId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        fetchPendingResults();
        fetchPublishedResults();
        alert('Batch disapproved successfully');
      }
    } catch (error) {
      console.error('Error disapproving batch:', error);
      alert('Failed to disapprove batch');
    }
  };
  

  const handleDownloadFile = async (batchId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/result-file/${batchId}`, {
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
        alert('Failed to download file');
      }
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const handleRemoveFile = async (batchId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/remove-file/${batchId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        alert('File removed successfully');
        // Optionally, refresh the data or UI to reflect the removal
        fetchPendingResults();
        fetchPublishedResults();
      } else {
        alert('Failed to remove file');
      }
    } catch (error) {
      console.error('Error removing file:', error);
      alert('Failed to remove file');
    }
  };
  

  const handlePreviewBatch = async (batchId) => {
    try {
      const response = await fetch(`${API_URL}/api/admin/preview-batch/${batchId}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPreviewData(data);
        setSelectedBatch(batchId);
      } else {
        alert('Failed to load preview');
      }
    } catch (error) {
      console.error('Error loading preview:', error);
      alert('Failed to load preview');
    }
  };

  const handleRemoveTeacher = async (teacherId) => {
    if (window.confirm('Are you sure you want to remove this teacher?')) {
      try {
        const response = await fetch(`${API_URL}/api/admin/remove-teacher/${teacherId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        
        if (response.ok) {
          fetchTeachers();
          alert('Teacher removed successfully');
        } else {
          alert('Failed to remove teacher');
        }
      } catch (error) {
        console.error('Error removing teacher:', error);
        alert('Failed to remove teacher');
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/api/admin/change-teacher-password/${selectedTeacher._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ newPassword }),
      });
      
      if (response.ok) {
        setIsPasswordModalOpen(false);
        setSelectedTeacher(null);
        setNewPassword('');
        alert('Password changed successfully');
      } else {
        alert('Failed to change password');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Failed to change password');
    }
  };

  const renderDashboard = () => (
    <>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={<svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>}
          title="Pending Results"
          value={pendingResults.length}
          color="blue"
        />
        <StatCard
          icon={<svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>}
          title="Published Results"
          value={publishedResults.length}
          color="green"
        />
        <StatCard
          icon={<svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>}
          title="Total Teachers"
          value={teachers.length}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-black">Recent Pending Results</h2>
          </div>
          <div className="p-6 space-y-4">
            {pendingResults.slice(0, 3).map((result) => (
              <div key={result._id} className="flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors duration-200">
                <div>
                  <p className="font-medium text-gray-900">{result.batchName}</p>
                  <p className="text-sm text-gray-500">{result.subject}</p>
                </div>
                <button
                  onClick={() => handlePreviewBatch(result._id)}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200"
                >
                  Preview
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-black">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-4">
            <button
              onClick={() => setActiveTab('teachers')}
              className="w-full flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors duration-200"
            >
              <span className="font-medium text-black">Add New Teacher</span>
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button
              onClick={() => setActiveTab('pending')}
              className="w-full flex items-center justify-between p-4 bg-white/50 rounded-xl hover:bg-white/70 transition-colors duration-200"
            >
              <span className="font-medium text-gray-900">Review Pending Results</span>
              <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const renderTeachers = () => (
    <div className="space-y-6">
      <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-6 py-4">
          <h2 className="text-xl font-semibold text-black">Add New Teacher</h2>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleAddTeacher} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={newTeacher.name}
                  onChange={(e) => setNewTeacher({ ...newTeacher, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={newTeacher.password}
                  onChange={(e) => setNewTeacher({ ...newTeacher, password: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200"
            >
              Add Teacher
            </button>
          </form>
        </div>
      </div>

      <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-6 py-4">
          <h2 className="text-xl font-semibold text-black">Teacher List</h2>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {teachers.map((teacher) => (
                  <tr key={teacher._id} className="hover:bg-white/70 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap">{teacher.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{teacher.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap space-x-2">
                      <button
                        onClick={() => {
                          setSelectedTeacher(teacher);
                          setIsPasswordModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => handleRemoveTeacher(teacher._id)}
                        className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPendingResults = () => (
    <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-black">Pending Results</h2>
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
                  Teacher
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
              {pendingResults.map((batch) => (
                <tr key={batch._id} className="hover:bg-white/70 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{batch.batchName}</p>
                      <p className="text-sm text-gray-500">{batch.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{batch.teacher.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-gray-900">{batch.teacher.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(batch.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 space-x-2">
                    <button
                      onClick={() => handleApproveBatch(batch._id)}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors duration-200"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDisapproveBatch(batch._id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 ml-2"
                    >
                      Disapprove
                    </button>
                    <button
                      onClick={() => handlePreviewBatch(batch._id)}
                      className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200"
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
  );

  const renderPublishedResults = () => (
    <div className="backdrop-blur-sm bg-white/70 rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-200 to-indigo-200 px-6 py-4">
        <h2 className="text-xl font-semibold text-black">Published Results</h2>
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
                  Teacher
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Publish Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/50 divide-y divide-gray-200">
              {publishedResults.map((batch) => (
                <tr key={batch._id} className="hover:bg-white/70 transition-colors duration-200">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">{batch.batchName}</p>
                      <p className="text-sm text-gray-500">{batch.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{batch.teacher.name.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-gray-900">{batch.teacher.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(batch.updatedAt).toLocaleDateString()}
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
                    <button
                      onClick={() => handleRemoveFile(batch._id)}
                      className="px-3 py-1.5 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200"
                    >
                      Remove File
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  // Preview Modal Component
  const PreviewModal = ({ previewData, selectedBatch, onClose }) => (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl w-[95%] h-[90vh] flex flex-col shadow-2xl border border-white/20">
        {/* Header - Fixed at top */}
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Result Preview</h3>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full table-auto border-collapse bg-white">
                <thead className="sticky top-0 bg-gray-50 z-10">
                  <tr>
                    <th className="px-4 py-2 border whitespace-nowrap">Roll No</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Enrolment No</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Name (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Name (Hindi)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Father's Name (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Father's Name (Hindi)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Course (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Course (Hindi)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Course Year (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Course Year (Hindi)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Subject</th>
                    <th className="px-4 py-2 border whitespace-nowrap">IA Subject Code</th>
                    <th className="px-4 py-2 border whitespace-nowrap">ME Subject Code</th>
                    <th className="px-4 py-2 border whitespace-nowrap">IA Marks</th>
                    <th className="px-4 py-2 border whitespace-nowrap">ME Marks</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Total Marks</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Max Marks</th>
                    <th className="px-4 py-2 border whitespace-nowrap">IA Max Marks</th>
                    <th className="px-4 py-2 border whitespace-nowrap">ME Max Marks</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Mode (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Mode (Hindi)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Result Remark (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Result Remark (Hindi)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Date of Result (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Date of Result (Hindi)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Date of Birth</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Duration (English)</th>
                    <th className="px-4 py-2 border whitespace-nowrap">Duration (Hindi)</th>
                  </tr>
                </thead>
                <tbody>
                  {previewData.results.map((result, index) => (
                    <tr key={index} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 border whitespace-nowrap">{result.rollNo}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.enrolmentNo}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.candidateNameEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.candidateNameHindi}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.fatherNameEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.fatherNameHindi}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.courseNameEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.courseNameHindi}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.courseYearEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.courseYearHindi}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.subject}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.iaSubCode}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.meSubCode}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.iaMarks}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.meMarks}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.marksTotal}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.maxMarks}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.iaMaxMarks}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.meMaxMarks}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.modeEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.modeHindi}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.resultRemarkEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.resultRemarkHindi}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.dateOfResultEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.dateOfResultHindi}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.dateOfBirth}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.durationEnglish}</td>
                      <td className="px-4 py-2 border whitespace-nowrap">{result.durationHindi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-50 to-cyan-100">
      {/* Decorative background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-3xl" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-to-tr from-indigo-200/30 to-blue-200/30 blur-3xl" />
      </div>

      {/* Toggle Button for Closed Sidebar */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white/80 backdrop-blur-sm border border-white/20 shadow-lg 
            hover:bg-white/90 transition-all duration-200 hover:scale-105"
        >
          <svg className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      <div className="flex">
        {/* Sidebar */}
        <div className={`fixed inset-y-0 left-0 z-50 w-56 md:w-64 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-full backdrop-blur-sm bg-white/70 border-r border-white/20 shadow-xl">
            {/* Sidebar Header */}
            <div className="p-6 border-b border-white/20">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg hover:bg-white/50 transition-colors duration-200"
                >
                  <svg className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-xl">A</span>
                </div>
                <div>
                  <h2 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Admin Panel
                  </h2>
                  <p className="text-sm text-gray-500">Result Management</p>
                </div>
              </div>
            </div>

            {/* Sidebar Links */}
            <nav className="p-4 space-y-2">
              <SidebarLink
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                }
                text="Dashboard"
                active={activeTab === 'dashboard'}
                onClick={() => setActiveTab('dashboard')}
              />
              <SidebarLink
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                }
                text="Teachers"
                active={activeTab === 'teachers'}
                onClick={() => setActiveTab('teachers')}
              />
              <SidebarLink
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                }
                text="Pending Results"
                active={activeTab === 'pending'}
                onClick={() => setActiveTab('pending')}
              />
              <SidebarLink
                icon={
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                text="Published Results"
                active={activeTab === 'published'}
                onClick={() => setActiveTab('published')}
              />
            </nav>

            {/* Sidebar Footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20">
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}>
          <div className="relative z-10 max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {activeTab === 'dashboard' && renderDashboard()}
            {activeTab === 'teachers' && renderTeachers()}
            {activeTab === 'pending' && renderPendingResults()}
            {activeTab === 'published' && renderPublishedResults()}
          </div>
        </main>
      </div>

      {/* Preview Modal */}
      {selectedBatch && previewData && (
        <PreviewModal
          previewData={previewData}
          selectedBatch={selectedBatch}
          onClose={() => {
            setSelectedBatch(null);
            setPreviewData(null);
          }}
        />
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl w-full max-w-md p-6 shadow-2xl border border-white/20">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
              <button
                onClick={() => {
                  setIsPasswordModalOpen(false);
                  setSelectedTeacher(null);
                  setNewPassword('');
                }}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password for {selectedTeacher?.name}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                  placeholder="Enter new password"
                />
              </div>
              
              <button
                type="submit"
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-colors duration-200"
              >
                Change Password
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
