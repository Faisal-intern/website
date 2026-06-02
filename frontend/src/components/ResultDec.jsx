import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ResultSearch = () => {
  const [academicYear, setAcademicYear] = useState("2024-25");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    handleSearch();
  }, []);

  const handleSearch = async (e) => {
    if (e) {
      e.preventDefault();
    }

    if (!academicYear) {
      setError("Academic Year is required");
      return;
    }

    setError("");
    setResults([]);
    setLoading(true);

    try {
      const response = await axios({
        method: 'post',
        url: `${API_URL}/api/search/result/search`,
        data: { 
          academicYear: academicYear.replace(/-/g, ' - ') // Format: "2023 - 24"
        },
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log("API Response:", response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setResults(response.data);
        if (response.data.length === 0) {
          setError("No results found for the selected academic year");
        }
      } else {
        setError("Invalid response format from server");
        console.error("Invalid response format:", response.data);
      }
    } catch (err) {
      console.error("Error details:", err);
      if (err.code === 'ERR_NETWORK') {
        setError("Unable to connect to server. Please check if the server is running.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to fetch results. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Search Results by Academic Year</h2>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-lg mb-6">
        <select
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
          className="border border-gray-300 rounded-lg p-2 w-full sm:w-auto focus:outline-none focus:ring focus:ring-blue-300"
          disabled={loading}
        >
          <option value="2021-22">2021 - 2022</option>
          <option value="2022-23">2022 - 2023</option>
          <option value="2023-24">2023 - 2024</option>
          <option value="2024-25">2024 - 2025</option>
          <option value="2025-26">2025 - 2026</option>
          <option value="2026-27">2026 - 2027</option>
          <option value="2027-28">2027 - 2028</option>
          <option value="2028-29">2028 - 2029</option>
          <option value="2029-30">2029 - 2030</option>
          <option value="2030-31">2030 - 2031</option>
          <option value="2031-32">2031 - 2032</option>
          <option value="2032-33">2032 - 2033</option>
        </select>
        <button
          type="submit"
          className={`bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-300 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="text-red-500 mb-4 p-3 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <table className="table-auto border-collapse border border-gray-300 w-full max-w-4xl text-center">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Exam Flag</th>
              <th className="border border-gray-300 px-4 py-2">Subject Code</th>
              <th className="border border-gray-300 px-4 py-2">Academic Year</th>
              <th className="border border-gray-300 px-4 py-2">Course Name</th>
              <th className="border border-gray-300 px-4 py-2">Part</th>
              <th className="border border-gray-300 px-4 py-2">Semester</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className={`${index % 2 === 0 ? "bg-white" : "bg-gray-100"}`}>
                <td className="border border-gray-300 px-4 py-2">{result.examFlag}</td>
                <td className="border border-gray-300 px-4 py-2">{result.subjectCode}</td>
                <td className="border border-gray-300 px-4 py-2">{result.academicYear}</td>
                <td className="border border-gray-300 px-4 py-2">{result.courseName}</td>
                <td className="border border-gray-300 px-4 py-2">{result.part}</td>
                <td className="border border-gray-300 px-4 py-2">{result.semester}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!error && results.length === 0 && (
        <div className="text-gray-500 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-center">
          No results found for the selected academic year
        </div>
      )}
    </div>
  );
};

export default ResultSearch;
