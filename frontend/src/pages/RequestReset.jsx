import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const RequestReset = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ Initialize navigation

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await axios.post(`${API_URL}/api/admin/send-reset-password-link`, { email });
      setMessage(response.data.message);

      // ✅ Navigate to /reset-password after successful API call
      setTimeout(() => {
        navigate("/reset-password");
      }, 2000); // Optional delay for better UX
    } catch (error) {
      setMessage(error.response?.data?.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
      <h2>Request Password Reset</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", width: "100%", marginBottom: "10px" }}
          disabled={loading}
        />
        <button
          type="submit"
          style={{
            padding: "10px",
            width: "100%",
            backgroundColor: loading ? "#ccc" : "#007bff",
            cursor: loading ? "not-allowed" : "pointer",
            color: "#fff",
            border: "none",
          }}
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
      {message && <p style={{ marginTop: "10px", color: "green" }}>{message}</p>}
    </div>
  );
};

export default RequestReset;
