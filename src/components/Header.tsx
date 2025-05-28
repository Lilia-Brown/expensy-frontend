import React from 'react';
import '../styles/components/Header.css';

interface HeaderProps {
  username?: string;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ username, onLogout }) => {
  return (
    <header className="header">
      <div className="logo-container">
        <h1 className="app-name">Expensy</h1>
      </div>
      <div className="user-info">
        {username && <span className="welcome-text">Welcome, {username}!</span>}
        <button onClick={onLogout} className="logout-button">Logout</button>
      </div>
    </header>
  );
};

export default Header;
