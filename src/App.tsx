import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import AuthForm from './components/AuthForm';
import DashboardPage from './pages/DashboardPage.tsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsAuthenticated(true);
      setCurrentUserId(userId);
    }
  }, []);

  const handleLoginSuccess = (token: string, userId: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
    setCurrentUserId(userId);

    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    alert('Logged out!');
    navigate('/auth');
  };

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthForm onLoginSuccess={handleLoginSuccess} />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardPage currentUserId={currentUserId} onLogout={handleLogout} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </div>
  );
}

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default AppWrapper;
