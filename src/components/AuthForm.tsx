import React, { useState } from 'react';
import '../styles/components/AuthForm.css';

interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    username: string;
  };
}

interface AuthFormProps {
  onLoginSuccess: (token: string, userId: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? `${API_BASE_URL}/auth/login` : `${API_BASE_URL}/users`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          ...(isLogin ? {} : { username: email.split('@')[0] || 'NewUser' }),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          const loginData = data as LoginResponse;

          localStorage.setItem('authToken', loginData.token);
          localStorage.setItem('userId', loginData.user.id);
          onLoginSuccess(loginData.token, loginData.user.id);
        } else {
          alert('Signup successful! Please log in.');

          setIsLogin(true);
          setEmail('');
          setPassword('');
        }
      } else {
        setError(data.error || `Error: ${response.statusText}`);
      }
    } catch (err: any) {
      console.error('Network or unexpected error:', err);
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-layout">
      <main className="auth-form-content">
        <div className="auth-form-container">
          <h1 className="app-name">Expensy</h1>
          <h2>{isLogin ? 'Login' : 'Sign Up'}</h2>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password:</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : (isLogin ? 'Login' : 'Sign Up')}
            </button>
          </form>
          <p className="switch-mode-text">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button type="button" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default AuthForm;
