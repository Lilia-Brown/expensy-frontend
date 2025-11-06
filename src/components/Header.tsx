import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/Header.css';

interface HeaderProps {
  username?: string;
  userImageUrl?: string;
  onLogout: () => void;

}

const Header: React.FC<HeaderProps> = ({ username, onLogout, userImageUrl }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/dashboard" className="app-logo-link">
          <h1 className="app-name">Expensy</h1>
        </Link>
      </div>
      <div className="user-profile">
        <div className="greeting-text">
          <span>Welcome</span>
          <span className="personalized-text">{username}</span>
        </div>
        <div className="user-menu-container" ref={menuRef}>
          <div className="avatar" onClick={() => setShowUserMenu(!showUserMenu)} title="User menu">
            <img src={userImageUrl || "https://placecats.com/300/200?fit=contain"} alt="User Avatar" />
          </div>
          {showUserMenu && (
            <ul className="user-dropdown">
              <li onClick={() => setShowUserMenu(false)}>
                <Link to="/budgets" className="user-dropdown-link">All Budgets</Link>
              </li>
              <li onClick={onLogout}>Logout</li>
            </ul>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
