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

interface ExpenseListProps {
  currentUserId: string | null;
  selectedCity: string;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ currentUserId, selectedCity }) => {
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

      if (!currentUserId) {
        setError('User ID not found. Please log in.');
        setLoading(false);
        return;
      }

      if (!selectedCity) {
        setExpenses([]);
        setLoading(false);
        return;
      }


      try {
        const url = new URL(`${API_BASE_URL}/expenses`);
        url.searchParams.append('city', selectedCity);

        const response = await fetch(url.toString(), {
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
  }, [API_BASE_URL, currentUserId, selectedCity]);

  if (loading) {
    return <p className="loading-message">Loading expenses...</p>;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  if (!selectedCity) {
      return <p className="no-expenses-message">Please select a city from the Budget Card to view expenses.</p>;
  }


  return (
    <div className="expense-list-container">
      <div className="expense-list-header">
        <h3>Recent Expenses</h3>
        <div className="sort-filter-section">
          {/* TODO: Add sort and filtering */}
        </div>
      </div>

      {expenses.length === 0 ? (
        <p className="no-expenses-message">No expenses found for {selectedCity}. Time to add some!</p>
      ) : (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th className="amount-header">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="expense-table-row">
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>{expense.description || 'No Description'}</td>
                <td>${expense.amount.toFixed(2)} {expense.currency || ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpenseList;
