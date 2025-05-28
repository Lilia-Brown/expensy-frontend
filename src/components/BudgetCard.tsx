import React, { useState, useEffect } from 'react';
import '../styles/components/BudgetCard.css';

interface Budget {
  _id: string;
  userId: string;
  city: string;
  category: string;
  budgetAmount: number;
  currency: string;
  startDate: string;
  endDate: string;
}

interface Expense {
  _id: string;
  userId: string;
  amount: number;
  currency: string;
  description: string;
  date: string;
  city: string;
  categoryId: string;
  notes?: string;
  source?: string;
}

interface BudgetCardProps {
  currentUserId: string | null;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ currentUserId }) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentCity = "San Francisco"; // TODO: This is hardcoded temporarily

  useEffect(() => {
    const fetchBudgetData = async () => {
      setIsLoading(true);
      setError(null);
      const authToken = localStorage.getItem('authToken');

      if (!authToken || !currentUserId) {
        setError('Authentication token or User ID missing. Please log in.');
        setIsLoading(false);
        return;
      }

      try {
        console.log('authToken:', authToken)
        const budgetResponse = await fetch(`http://localhost:3000/budgets`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!budgetResponse.ok) {
          throw new Error(`Failed to fetch budgets: ${budgetResponse.statusText}`);
        }
        const userBudgets: Budget[] = await budgetResponse.json();

        const relevantBudget = userBudgets.find(b => b.city === currentCity) || userBudgets[0];

        if (!relevantBudget) {
          setError('No budget found for the current user or city.');
          setIsLoading(false);
          return;
        }
        setBudget(relevantBudget);

        const startDate = relevantBudget.startDate ? new Date(relevantBudget.startDate).toISOString() : '';
        const endDate = relevantBudget.endDate ? new Date(relevantBudget.endDate).toISOString() : '';
        
        const expenseUrl = new URL('http://localhost:3000/expenses');
        expenseUrl.searchParams.append('city', relevantBudget.city);
        if (startDate) expenseUrl.searchParams.append('startDate', startDate);
        if (endDate) expenseUrl.searchParams.append('endDate', endDate);

        const expenseResponse = await fetch(expenseUrl.toString(), {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!expenseResponse.ok) {
          throw new Error(`Failed to fetch expenses: ${expenseResponse.statusText}`);
        }
        const fetchedExpenses: Expense[] = await expenseResponse.json();
        setExpenses(fetchedExpenses);

      } catch (err: any) {
        console.error('Error fetching budget or expenses:', err);
        setError(err.message || 'Failed to load budget data.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBudgetData();
  }, [currentUserId, currentCity]);

  const calculateSpending = () => {
    if (!budget) return { spent: 0, remaining: 0, percentage: 0 };

    const totalBudget = budget.budgetAmount;
    const spentAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const remainingAmount = totalBudget - spentAmount;
    const percentageSpent = totalBudget > 0 ? (spentAmount / totalBudget) * 100 : 0;

    return { spent: spentAmount, remaining: remainingAmount, percentage: percentageSpent };
  };

  const { spent, remaining, percentage } = calculateSpending();

  let progressBarClass = 'green';
  if (percentage > 75) {
    progressBarClass = 'red';
  } else if (percentage > 50) {
    progressBarClass = 'orange';
  }

  if (isLoading) {
    return <div className="budget-card loading-text">Loading budget data...</div>;
  }

  if (error) {
    return <div className="budget-card error-text">Error: {error}</div>;
  }

  if (!budget) {
    return <div className="budget-card">No budget found for {currentCity}. Please create one.</div>;
  }

  const budgetPeriod = `${new Date(budget.startDate).toLocaleDateString()} - ${new Date(budget.endDate).toLocaleDateString()}`;

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <h3>Current City Budget: {budget.city}</h3>
      </div>
      
      <div className="budget-details">
        <div className="budget-detail-item">
          <span className="budget-label">Budget Period:</span>
          <span className="budget-value">{budgetPeriod}</span>
        </div>
        <div className="budget-detail-item">
          <span className="budget-label">Total Budget:</span>
          <span className="budget-value">{budget.budgetAmount.toFixed(2)} {budget.currency}</span>
        </div>
        <div className="budget-detail-item">
          <span className="budget-label">Spent:</span>
          <span className="spent-amount">{spent.toFixed(2)} {budget.currency}</span>
        </div>
        <div className="budget-detail-item">
          <span className="budget-label">Remaining:</span>
          <span className="remaining-amount">{remaining.toFixed(2)} {budget.currency}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div 
          className={`progress-bar-fill ${progressBarClass}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {percentage.toFixed(1)}%
        </div>
      </div>

      <div className="budget-alerts">
        Budget Alerts: Your Budget Alerts (Coming Soon!)
      </div>

      <button className="change-city-button" onClick={() => alert('Change City Feature Coming Soon!')}>
        Change City
      </button>
    </div>
  );
};

export default BudgetCard;
