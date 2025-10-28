import React from 'react';
import AddExpenseForm from '../components/AddExpenseForm';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';


interface AddExpensePageProps {
  currentUserId: string | null;
  onLogout: () => void;
  username: string;
  userImageUrl?: string;
}

const AddExpensePage: React.FC<AddExpensePageProps> = ({ currentUserId, onLogout, username, userImageUrl }) => {
  const location = useLocation();
  const prefilledCity = location.state?.city;

  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        <AddExpenseForm currentUserId={currentUserId} prefilledCity={prefilledCity} />
      </main>
    </div>
  );
};

export default AddExpensePage;
