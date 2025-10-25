import React, { useState, useEffect, useRef } from 'react';
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
  onCityChange: (city: string) => void;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ currentUserId, onCityChange }) => {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [showMenu, setShowMenu] = useState<boolean>(false);
  const [userBudgets, setUserBudgets] = useState<Budget[]>([]);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        const budgetResponse = await fetch(`http://localhost:3000/budgets`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!budgetResponse.ok) {
          throw new Error(`Failed to fetch budgets: ${budgetResponse.statusText}`);
        }
        const fetchedUserBudgets: Budget[] = await budgetResponse.json();
        setUserBudgets(fetchedUserBudgets);

        let cityToDisplay = selectedCity;
        if (!cityToDisplay && fetchedUserBudgets.length > 0) {
            const sanFranciscoBudget = fetchedUserBudgets.find(b => b.city === "San Francisco");
            cityToDisplay = sanFranciscoBudget ? "San Francisco" : fetchedUserBudgets[0].city;
        }

        if (!cityToDisplay && fetchedUserBudgets.length === 0) {
            setBudget(null);
            setExpenses([]);
            setIsLoading(false);
            onCityChange('');
            return;
        }

        setSelectedCity(cityToDisplay);
        onCityChange(cityToDisplay);

        const relevantBudget = fetchedUserBudgets.find(b => b.city === cityToDisplay);

        if (!relevantBudget) {
          setBudget(null);
          setExpenses([]);
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
  }, [currentUserId, selectedCity]);

  const calculateSpending = () => {
    if (!budget) return { spent: 0, remaining: 0, percentage: 0 };

    const totalBudget = budget.budgetAmount;
    const spentAmount = expenses.reduce((sum, expense) => {
      if (typeof expense.amount !== 'number') {
        console.warn('BudgetCard: Non-numeric expense amount found:', expense);
        return sum;
      }
      return sum + expense.amount;
    }, 0);
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

  const uniqueCities = Array.from(new Set(userBudgets.map(b => b.city)));

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowMenu(false);
  };

  if (isLoading) {
    return <div className="budget-card loading-text">Loading budget data...</div>;
  }

  if (error) {
    return <div className="budget-card error-text">Error: {error}</div>;
  }

  if (!budget && userBudgets.length > 0) {
    return (
        <div className="budget-card">
            <h3>{selectedCity} Budget</h3>
            <div className="budget-card-header">
                <p>No budget found for {selectedCity}. Please select another city or create one.</p>
                <div className="options-menu-container" ref={menuRef}>
                    <span className="options-icon" onClick={() => setShowMenu(!showMenu)}>...</span>
                    {showMenu && (
                        <div className="options-dropdown">
                            <h4>Change City</h4>
                            {uniqueCities.length === 0 ? (
                                <p>No other cities available.</p>
                            ) : (
                                <ul>
                                    {uniqueCities.map(city => (
                                        <li key={city} onClick={() => handleCityChange(city)}>
                                            {city} {city === selectedCity && '(Current)'}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
  }

  if (!budget && userBudgets.length === 0) {
    return <div className="budget-card">No budgets found for this user. Please create one.</div>;
  }

  const budgetPeriod = `${new Date(budget!.startDate).toLocaleDateString()} - ${new Date(budget!.endDate).toLocaleDateString()}`;

  return (
    <div className="budget-card">
      <div className="budget-card-header">
        <h3>{selectedCity} Budget</h3>
        <div className="options-menu-container" ref={menuRef}>
            <span className="options-icon" onClick={() => setShowMenu(!showMenu)}>...</span>
            {showMenu && (
                <div className="options-dropdown">
                    <h4>Change City</h4>
                    {uniqueCities.length === 0 ? (
                        <p>No other cities available.</p>
                    ) : (
                        <ul>
                            {uniqueCities.map(city => (
                                <li key={city} onClick={() => handleCityChange(city)}>
                                    {city} {city === selectedCity && '(Current)'}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
      </div>

      <div className="budget-details">
        <div className="budget-detail-item budget-period-item">
          <span className="budget-label">Dates</span>
          <span className="budget-value">{budgetPeriod}</span>
        </div>
        <div className="budget-detail-item">
          <span className="budget-label">Total Budget</span>
          <span className="total-budget-value">${budget!.budgetAmount.toFixed(2)} {budget!.currency}</span>
        </div>
        <div className="budget-detail-item">
          <span className="budget-label">Spent</span>
          <span className="spent-amount">${spent.toFixed(2)} {budget!.currency}</span>
        </div>
        <div className="budget-detail-item">
          <span className="budget-label">Remaining</span>
          <span className={`remaining-amount ${progressBarClass}`} >${remaining.toFixed(2)} {budget!.currency}</span>
        </div>
      </div>

      <div className="progress-bar-container">
        <div 
          className={`progress-bar-fill ${progressBarClass}`} 
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
        </div>
      </div>
      <div className="progress-percentage">
        {percentage.toFixed(1)}%
      </div>

      <div className="budget-alerts">
        <div className="alert-pill green">
          Budget Alerts
        </div>
      </div>
    </div>
  );
};

export default BudgetCard;
