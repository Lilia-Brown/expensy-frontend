import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AddExpenseButton from '../components/AddExpenseButton';
import ExpenseList from '../components/ExpenseList';
import BudgetCard from '../components/BudgetCard';
import '../styles/pages/DashboardPage.css';

interface DashboardPageProps {
  currentUserId: string | null;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUserId, onLogout }) => {
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [userImageUrl, setUserImageUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!currentUserId) {
        setUsername('');
        setUserImageUrl(undefined);
        return;
      }

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.error('Authentication token missing. Please log in.');
        setUsername('Guest');
        setUserImageUrl(undefined);
        return;
      }

      try {
        const response = await fetch(`http://localhost:3000/users/${currentUserId}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            console.error('Authentication error or forbidden access. Logging out...');
            onLogout();
            return;
          }
          throw new Error(`Failed to fetch user details: ${response.statusText}`);
        }

        const userData = await response.json();

        if (userData.username) {
          setUsername(userData.username);
        } else if (userData.email) {
          setUsername(userData.email.split('@')[0]);
        } else {
          setUsername(`User ${currentUserId.substring(0, 4)}`);
        }

        setUserImageUrl(userData.userImageUrl || undefined);

      } catch (error: any) {
        console.error('Error fetching user details:', error.message);
        setUsername('Error User');
        setUserImageUrl(undefined);
      }
    };

    fetchUserDetails();

  }, [currentUserId, onLogout]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
  };

  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        <div className="content-grid">
          <BudgetCard
            currentUserId={currentUserId}
            onCityChange={handleCityChange}
          />
          <AddExpenseButton
            currentUserId={currentUserId}
          />
          <ExpenseList
            currentUserId={currentUserId}
            selectedCity={selectedCity}
          />

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
