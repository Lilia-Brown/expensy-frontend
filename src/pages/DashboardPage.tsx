import React, { useState } from 'react';
import Header from '../components/Header';
import AddExpenseButton from '../components/AddExpenseButton';
import ExpenseList from '../components/ExpenseList';
import BudgetCard from '../components/BudgetCard';
import '../styles/pages/DashboardPage.css';

interface DashboardPageProps {
  currentUserId: string | null;
  onLogout: () => void;
  username: string;
  userImageUrl?: string;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUserId, onLogout, username, userImageUrl }) => {
  const [selectedCity, setSelectedCity] = useState<string>('');

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
          <AddExpenseButton />
          <ExpenseList
            currentUserId={currentUserId}
            selectedCity={selectedCity}
            isPreview={true}
          />

        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
