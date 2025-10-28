import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/components/ExpenseList.css';

import AddExpenseButton from './AddExpenseButton';
import LoadingSpinner from './LoadingSpinner';

interface Category {
  id: string;
  name: string;
  color?: string | null;
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
  isPreview: boolean;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ currentUserId, selectedCity, isPreview }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

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

        if (isPreview) {
          url.searchParams.append('limit', '3');
        }

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
    return <LoadingSpinner />;
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
        <h3>{isPreview ? 'Recent' : selectedCity} Expenses</h3>
        <div className="add-expense-button-container">
          {!isPreview && (
            <AddExpenseButton city={selectedCity} />
          )}
        </div>
      </div>
      <div className="sort-filter-section">
        {/* TODO: Add sort and filtering */}
      </div>

      {expenses.length === 0 ? (
        <p className="no-expenses-message">No expenses found for {selectedCity}. Time to add some!</p>
      ) : (
        <table className="expenses-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map(expense => (
              <tr
                key={expense.id}
                className="expense-table-row"
                onClick={() => navigate(`/expenses/${expense.id}`)}
                style={{ cursor: 'pointer' }}
                tabIndex={0}
                aria-label={`View expense: ${expense.description || 'No Description'}`}
              >
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>
                  <div className="description-cell">
                    <div className="category-dot-container">
                      <span className="category-dot" style={{ backgroundColor: expense.category?.color || '#ccc' }}></span>
                      <span className="category-tooltip">{expense.category?.name || 'Uncategorized'}</span>
                    </div>
                    {expense.description || 'No Description'}
                  </div>
                </td>
                <td className="amount-cell">${expense.amount.toFixed(2)} {expense.currency || ''}</td>
              </tr>
            ))}
          </tbody>
          {!isPreview && expenses.length > 0 && (
            <tfoot>
              <tr className="expense-total-row">
                <td colSpan={2}>Total Spent</td>
                <td className="amount-cell">
                  ${expenses.reduce((acc, expense) => acc + expense.amount, 0).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      )}
      {isPreview && expenses.length > 0 && (
        <div className="view-all-container">
          <Link to={`/city-expenses/${selectedCity}`} className="view-all-link" title={`View all expenses for ${selectedCity}`}>...</Link>
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
