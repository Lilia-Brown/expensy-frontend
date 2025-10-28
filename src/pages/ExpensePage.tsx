import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/pages/ExpensePage.css';

import ExpenseShowPage from './ExpenseShowPage';
import Header from '../components/Header';
import LoadingSpinner from '../components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
  color?: string | null;
}

interface Expense {
  id: string;
  amount: number;
  currency?: string;
  description?: string;
  date: string;
  city: string;
  notes?: string;
  category: Category;
}

interface ExpensePageProps {
  currentUserId: string | null;
  onLogout: () => void;
  username: string;
  userImageUrl?: string;
}

const ExpensePage: React.FC<ExpensePageProps> = ({ currentUserId, onLogout, username, userImageUrl }) => {
  const { id } = useParams<{ id: string }>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchExpense = async () => {
      if (!id) {
        setError('Expense ID is missing from the URL.');
        setLoading(false);
        return;
      }

      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('You are not authenticated.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch expense: ${response.statusText}`);
        }

        const expenseData: Expense = await response.json();
        setExpense(expenseData);
      } catch (err: any) {
        console.error('Error fetching expense:', err.message);
        setError(err.message || 'Failed to load expense details.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();

  }, [id, currentUserId, API_BASE_URL]);

  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : !expense ? (
          <div className="no-expenses-message">Expense not found.</div>
        ) : (
          <div className="expense-detail-card">
            <ExpenseShowPage expense={expense} />
            <div className="expense-detail-actions">
              <button className="button secondary-button">Edit</button>
              <button className="button danger-button">Delete</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpensePage;
