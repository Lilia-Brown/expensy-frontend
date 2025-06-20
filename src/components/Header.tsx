import React from 'react';
import '../styles/components/Header.css';

interface HeaderProps {
  username?: string;
  userImageUrl?: string;
  onLogout: () => void;

}

const Header: React.FC<HeaderProps> = ({ username, onLogout, userImageUrl }) => {
  return (
    <header className="header">
      <div className="logo-container">
        <h1 className="app-name">Expensy</h1>
      </div>
      <div className="user-profile">
        <div className="greeting-text">
          <span>Welcome</span>
          <span className="personalized-text">{username}</span>
        </div>
        <div className="avatar" onClick={onLogout} title="Click to Logout">
          <img src={userImageUrl || "https://placecats.com/300/200?fit=contain"} alt="User Avatar" />
        </div>
      </div>
    </header>
  );
};

export default Header;
