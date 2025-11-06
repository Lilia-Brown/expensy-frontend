import React from 'react';
import Header from '../../components/Header';
import BudgetList from '../../components/BudgetList';


interface BudgetsPageProps {
  currentUserId: string | null;
  onLogout: () => void;
  username: string;
  userImageUrl?: string;
}

const BudgetsPage: React.FC<BudgetsPageProps> = ({ currentUserId, onLogout, username, userImageUrl }) => {
  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        <BudgetList currentUserId={currentUserId} />
      </main>
    </div>
  );
};

export default BudgetsPage;
