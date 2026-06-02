import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [student, setStudent] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('studentToken');
    const storedStudentInfo = localStorage.getItem('studentInfo');
    
    if (token && storedStudentInfo) {
      setStudent(JSON.parse(storedStudentInfo));
    }
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Attempting login with:', email, password); // Debug log
      
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Login response:', data); // Debug log

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data));
        localStorage.setItem('token', data.token); // Add this line
        setUser(data);
        return { success: true, user: data };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Login error:', error); // Debug log
      return { success: false, message: 'Login failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  const loginStudent = (data) => {
    localStorage.setItem('studentToken', data.token);
    localStorage.setItem('studentInfo', JSON.stringify(data.student));
    setStudent(data.student);
  };

  const logoutStudent = () => {
    localStorage.removeItem('studentToken');
    localStorage.removeItem('studentInfo');
    setStudent(null);
  };

  const updateStudent = (studentData) => {
    setStudent(studentData);
    localStorage.setItem('studentInfo', JSON.stringify(studentData));
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, student, loginStudent, logoutStudent, updateStudent }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 