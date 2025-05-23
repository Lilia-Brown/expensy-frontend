import { useState, useEffect } from 'react';
import './App.css';
import AuthForm from './components/AuthForm';
import ExpenseList from './components/ExpenseList';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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

    alert('Login successful!'); // TODO: For testing
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    setIsAuthenticated(false);
    setCurrentUserId(null);
    alert('Logged out!');
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Expense Tracker</h1>

      {isAuthenticated ? (
        <div>
          <p>Welcome back, User ID: {currentUserId || 'N/A'}!</p>
          <button onClick={handleLogout} style={{ padding: '10px 20px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Logout
          </button>

          <ExpenseList />

        </div>
      ) : (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
