import React, { useEffect, useState } from 'react';
import AddExpenseForm from '../components/AddExpenseForm';
import Header from '../components/Header';


interface AddExpensePageProps {
  currentUserId: string | null;
  onLogout: () => void;
  username: string;
  userImageUrl?: string;
}

const AddExpensePage: React.FC<AddExpensePageProps> = ({ currentUserId, onLogout, username, userImageUrl }) => {
  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        <AddExpenseForm currentUserId={currentUserId} />
      </main>
    </div>
  );
};

export default AddExpensePage;
