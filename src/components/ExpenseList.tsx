import React, { useEffect, useState } from 'react';
import '../styles/components/ExpenseList.css';

interface Category {
  id: string;
  name: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface Expense {
  id: string;
  amount: number;
  currency?: string;
  description?: string;
  date: string;
  city: string;
  latitude?: number;
  longitude?: number;
  notes?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  categoryId: string;
  user: User;
  category: Category;
}

const ExpenseList: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchExpenses = async () => {
      setLoading(true);
      setError(null);

      const authToken = localStorage.getItem('authToken');

      if (!authToken) {
        setError('Authentication token not found. Please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/expenses`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (response.ok) {
          const data: Expense[] = await response.json();
          setExpenses(data);
        } else {
          const errorData = await response.json();
          setError(errorData.error || `Failed to fetch expenses: ${response.statusText}`);
        }
      } catch (err: any) {
        console.error('Network or unexpected error fetching expenses:', err);
        setError('Failed to connect to the server to fetch expenses.');
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  if (loading) {
    return <p className="loading-message">Loading expenses...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <div className="expense-list-container">
      <h2>Your Expenses</h2>
      {expenses.length === 0 ? (
        <p className="no-expenses-message">No expenses found for this user. Time to add some!</p>
      ) : (
        <ul className="expenses-ul">
          {expenses.map((expense) => (
            <li key={expense.id} className="expense-item">
              <p><strong>Description:</strong> {expense.description || 'N/A'}</p>
              <p><strong>Amount:</strong> ${expense.amount.toFixed(2)} {expense.currency}</p>
              <p><strong>Date:</strong> {new Date(expense.date).toLocaleDateString()}</p>
              <p><strong>City:</strong> {expense.city}</p>
              <p><strong>Category:</strong> {expense.category?.name || 'N/A'}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExpenseList;
