import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../../styles/pages/Expenses/ExpensePage.css';

import ExpenseShowPage from './ExpenseShowPage';
import Header from '../../components/Header';

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
  const navigate = useNavigate();

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

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);

    const authToken = localStorage.getItem('authToken');
    if (!authToken) {
      setError('Authentication token not found. Please log in.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete expense: ${response.statusText}`);
      }

      if (expense) {
        navigate(`/city-expenses/${expense.city}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error deleting expense:', err.message);
      setError(err.message || 'Failed to delete expense.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        {loading ? (
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">Error: {error}</div>
        ) : !expense ? (
          <div className="no-expenses-message">Expense not found.</div>
        ) : (
          <div className="expense-detail-card">
            <ExpenseShowPage expense={expense} />
            <div className="expense-detail-actions">
              <button className="button secondary-button">Edit</button>
              <button className="button danger-button" onClick={handleDelete} disabled={loading}>Delete</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ExpensePage;
