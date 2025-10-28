import { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';

import AuthForm from './components/AuthForm';
import AddExpensePage from './pages/Expenses/AddExpensePage.tsx';
import DashboardPage from './pages/DashboardPage.tsx';
import ExpensePage from './pages/Expenses/ExpensePage.tsx';
import ExpensesPage from './pages/Expenses/ExpensesPage.tsx';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [userImageUrl, setUserImageUrl] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    if (token && userId) {
      setIsAuthenticated(true);
      setCurrentUserId(userId);

      fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to fetch user details');
      })
      .then(data => {
        setUsername(data.username || data.email.split('@')[0]);
        setUserImageUrl(data.userImageUrl);
      })
      .catch(err => console.error("Failed to fetch user details on app load", err))
      .finally(() => setLoading(false));
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = async (token: string, userId: string) => {
    localStorage.setItem('authToken', token);
    localStorage.setItem('userId', userId);
    setIsAuthenticated(true);
    setCurrentUserId(userId);

    try {
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user details on login');
      }
      const userData = await response.json();
      setUsername(userData.username || userData.email.split('@')[0]);
      setUserImageUrl(userData.userImageUrl);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      // Still navigate, but the header might not have the username
      navigate('/dashboard');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    setUsername('');
    setUserImageUrl(undefined);
    alert('Logged out!');
    navigate('/auth');
  };

  if (loading) {
    return null;
  }

  const ProtectedRoute = () => {
    if (!isAuthenticated) {
      return <Navigate to="/auth" replace />;
    }
    return <Outlet />;
  };

  return (
    <div className="app-container">
      <Routes>
        <Route
          path="/auth"
          element={
            !isAuthenticated ? <AuthForm onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" replace />
          }
        />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route
            path="/dashboard"
            element={
              <DashboardPage
                currentUserId={currentUserId}
                onLogout={handleLogout}
                username={username}
                userImageUrl={userImageUrl}
              />
            }
          />
          <Route
            path="/expenses/:id"
            element={
              <ExpensePage
                currentUserId={currentUserId}
                onLogout={handleLogout}
                username={username}
                userImageUrl={userImageUrl}
              />
            }
          />
          <Route
            path="/add-expense"
            element={
            <AddExpensePage
                onLogout={handleLogout}
                username={username}
                userImageUrl={userImageUrl}
              />
            }
          />
          <Route
            path="/city-expenses/:city"
            element={
              <ExpensesPage currentUserId={currentUserId} onLogout={handleLogout} username={username} userImageUrl={userImageUrl} />
            }
          />
        </Route>

        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
        <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/auth"} replace />} />
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
