import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../../styles/pages/Budgets/BudgetPage.css';

// import BudgetEditPage from './BudgetEditPage';
import BudgetShowPage from './BudgetShowPage';
import Header from '../../components/Header';
 
interface Budget {
  id: string;
  city: string;
  budgetAmount: number;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BudgetPageProps {
  currentUserId: string | null;
  onLogout: () => void;
  username: string;
  userImageUrl?: string;
}

const BudgetPage: React.FC<BudgetPageProps> = ({ currentUserId, onLogout, username, userImageUrl }) => {
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchBudget = async () => {
      if (!id) {
        setError('Budget ID is missing from the URL.');
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
        const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch budget: ${response.statusText}`);
        }
        const budgetData = await response.json();
        setBudget(budgetData);
      } catch (err: any) {
        console.error('Error fetching budget:', err.message);
        setError(err.message || 'Failed to load budget details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBudget();

  }, [id, currentUserId, API_BASE_URL]);

  const toggleEdit = () => {
    if (budget) {
      setIsEditing(!isEditing);
    }
  };

  // const handleSave = async (updatedData: any) => {
  //   setLoading(true);
  //   setError(null);

  //   const authToken = localStorage.getItem('authToken');
  //   if (!authToken) {
  //     setError('Authentication token not found. Please log in.');
  //     setLoading(false);
  //     return;
  //   }

  //   try {
  //     const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //         'Authorization': `Bearer ${authToken}`,
  //       },
  //       body: JSON.stringify(updatedData),
  //     });

  //     if (!response.ok) {
  //       const errorData = await response.json();
  //       throw new Error(errorData.error || 'Failed to update budget.');
  //     }

  //     const budgetData: Budget = await response.json();
  //     setBudget(budgetData);
  //     setIsEditing(false);
  //   } catch (err: any) {
  //     console.error('Error updating budget:', err.message);
  //     setError(err.message || 'Failed to update budget.');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this budget? This action cannot be undone.')) {
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
      const response = await fetch(`${API_BASE_URL}/budgets/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to delete budget: ${response.statusText}`);
      }

      if (budget) {
        navigate(`/city-budgets/${budget.city}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Error deleting budget:', err.message);
      setError(err.message || 'Failed to delete budget.');
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
        ) : !budget ? (
          <div className="no-budgets-message">Budget not found.</div>
        ) : (
          <>
            <div className="back-link-container">
              <Link to='/budgets' className="back-link">
                ← Back to Budgets
              </Link>
            </div>
            <div className="budget-detail-card">
              {isEditing ? (
                // <BudgetEditPage budget={budget} onCancel={toggleEdit} onSave={handleSave} />
                <h1>Editing Budget</h1>
              ) : (
                <>
                  <BudgetShowPage budget={budget} loading={loading} onEdit={toggleEdit} onDelete={handleDelete}/>
                </>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default BudgetPage;
