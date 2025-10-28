import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/Header';
import '../styles/pages/ExpensePage.css';

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
}

const ExpensePage: React.FC<ExpensePageProps> = ({ currentUserId, onLogout }) => {
  const { id } = useParams<{ id: string }>();
  const [expense, setExpense] = useState<Expense | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  const [userImageUrl, setUserImageUrl] = useState<string | undefined>(undefined);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

    fetchUserDetails();
    fetchExpense();

  }, [id, currentUserId, onLogout, API_BASE_URL]);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />
        <main className="main-content">
          <div className="loading-message">Loading expense details...</div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />
        <main className="main-content">
          <div className="error-message">Error: {error}</div>
        </main>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="dashboard-layout">
        <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />
        <main className="main-content">
          <div className="no-expenses-message">Expense not found.</div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Header username={username} onLogout={onLogout} userImageUrl={userImageUrl} />

      <main className="main-content">
        <div className="expense-detail-card">
          <div className="expense-detail-header">
            <span className="expense-amount">${expense.amount.toFixed(2)}</span>
            <span className="expense-description">{expense.description || 'No Description'}</span>
          </div>
          <div className="expense-detail-body">
            <div className="detail-item"><span className="detail-label">Date:</span> {new Date(expense.date).toLocaleDateString()}</div>
            <div className="detail-item"><span className="detail-label">City:</span> {expense.city}</div>
            <div className="detail-item"><span className="detail-label">Category:</span> <span className="category-dot" style={{ backgroundColor: expense.category?.color || '#ccc' }}></span> {expense.category.name}</div>
            {expense.notes && <div className="detail-item notes-item"><span className="detail-label">Notes:</span> {expense.notes}</div>}
          </div>
          <div className="expense-detail-actions">
            <button className="button secondary-button">Edit</button>
            <button className="button danger-button">Delete</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExpensePage;
