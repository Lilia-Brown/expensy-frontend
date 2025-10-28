import React from 'react';
import { useParams } from 'react-router-dom';
import ExpenseList from '../components/ExpenseList';
import Header from '../components/Header';


interface ExpensesPageProps {
  currentUserId: string | null;
  onLogout: () => void;
  username: string;
  userImageUrl?: string;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ currentUserId, onLogout, username, userImageUrl }) => {
    const { city } = useParams<{ city: string }>();

  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        <ExpenseList
          currentUserId={currentUserId}
          selectedCity={city || ''}
          isPreview={false}
        />
      </main>
    </div>
  );
};

export default ExpensesPage;
