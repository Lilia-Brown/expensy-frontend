import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../../styles/pages/Expenses/ExpensePage.css';

import ExpenseEditPage from './ExpenseEditPage';
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
  categoryId: string;
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
  const [isEditing, setIsEditing] = useState(false);
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
        const expenseData = await response.json();
        setExpense({
          ...expenseData,
          categoryId: expenseData.category?.id || expenseData.categoryId,
        });
      } catch (err: any) {
        console.error('Error fetching expense:', err.message);
        setError(err.message || 'Failed to load expense details.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();

  }, [id, currentUserId, API_BASE_URL]);

  const toggleEdit = () => {
    if (expense) {
      setIsEditing(!isEditing);
    }
  };

  const handleSave = async (updatedData: any) => {
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
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update expense.');
      }

      const expenseData: Expense = await response.json();
      setExpense(expenseData);
      setIsEditing(false);
    } catch (err: any) {
      console.error('Error updating expense:', err.message);
      setError(err.message || 'Failed to update expense.');
    } finally {
      setLoading(false);
    }
  };

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
          <>
            <div className="back-link-container">
              <Link to={`/city-expenses/${expense.city}`} className="back-link">
                ← Back to Expenses
              </Link>
            </div>
            <div className="expense-detail-card">
              {isEditing ? (
                <ExpenseEditPage expense={expense} onCancel={toggleEdit} onSave={handleSave} />
              ) : (
                <ExpenseShowPage expense={expense} loading={loading} onEdit={toggleEdit} onDelete={handleDelete}/>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default ExpensePage;
