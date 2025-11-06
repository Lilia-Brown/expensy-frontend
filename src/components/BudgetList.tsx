import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/components/BudgetList.css';
import LoadingSpinner from './LoadingSpinner';

interface Budget {
  id: string;
  city: string;
  budgetAmount: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
}

interface BudgetListProps {
  currentUserId: string | null;
}

const BudgetList: React.FC<BudgetListProps> = ({ currentUserId }) => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchBudgets = async () => {
      setLoading(true);
      setError(null);

      const authToken = localStorage.getItem('authToken');
      if (!authToken || !currentUserId) {
        setError('Authentication required.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/budgets`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch budgets.');
        }

        const data: Budget[] = await response.json();
       
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBudgets(data);

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [currentUserId, API_BASE_URL]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="error-message">Error: {error}</p>;
  }

  return (
    <div className="budget-list-container">
      <h3>All Budgets</h3>
      {budgets.length === 0 ? (
        <p className="no-budgets-message">No budgets found. Please create one.</p>
      ) : (
        <table className="budgets-table">
          <thead>
            <tr>
              <th>Period</th>
              <th>City</th>
              <th>Budget Amount</th>
            </tr>
          </thead>
          <tbody>
            {budgets.map(budget => (
              <tr key={budget.id} className="budget-table-row" onClick={() => navigate(`/city-expenses/${budget.city}`)}>
                <td>{budget.startDate && budget.endDate ? `${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}` : 'N/A'}</td>
                <td>{budget.city}</td>
                <td className="amount-cell">${budget.budgetAmount.toFixed(2)} {budget.currency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BudgetList;
