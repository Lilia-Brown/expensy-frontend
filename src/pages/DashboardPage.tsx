import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import AddExpenseForm from '../components/AddExpenseForm';
import ExpenseList from '../components/ExpenseList';
import BudgetCard from '../components/BudgetCard';
import '../styles/pages/DashboardPage.css';

interface DashboardPageProps {
  currentUserId: string | null;
  onLogout: () => void;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ currentUserId, onLogout }) => {
  const [username, setUsername] = useState<string>('');

  useEffect(() => {
    const userEmail = localStorage.getItem('userEmail'); 
    if (userEmail) {
      setUsername(userEmail.split('@')[0]); 
    } else if (currentUserId) {
        setUsername(`User ${currentUserId.substring(0, 4)}`);
    }
  }, [currentUserId]);

  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} /> 

      <main className="main-content">
        <h2>Your Financial Overview</h2>
        
        <p>Welcome back, User ID: {currentUserId || 'N/A'}!</p>
        
        <div className="content-grid">
          <BudgetCard currentUserId={currentUserId} />

          <div className="placeholder-card">
            <h3>Add New Expense</h3>
            <AddExpenseForm />
          </div>

          <div className="placeholder-full-width">
            <h3>Recent Expenses</h3>
            <ExpenseList />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
