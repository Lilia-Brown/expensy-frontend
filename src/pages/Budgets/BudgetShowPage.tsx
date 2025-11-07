import React from 'react';
import '../../styles/pages/Budgets/BudgetShowPage.css';

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

interface BudgetShowPageProps {
  budget: Budget | null;
  loading: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const BudgetShowPage: React.FC<BudgetShowPageProps> = ({ budget, loading, onEdit, onDelete }) => {
  if (!budget) {
    return <div className="no-budgets-message">Budget details could not be loaded.</div>;
  }

  return (
    <>
      <div className="budget-detail-header">
        <span className="budget-amount">${budget.budgetAmount.toFixed(2)} {budget.currency}</span>
        <span className="budget-description">Budget for {budget.city}</span>
      </div>
      <div className="budget-detail-body">
          <div className="detail-item"><span className="detail-label">City:</span> {budget.city}</div>
          <div className="detail-item"><span className="detail-label">Period:</span> {budget.startDate ? new Date(budget.startDate).toLocaleDateString() : 'N/A'} - {budget.endDate ? new Date(budget.endDate).toLocaleDateString() : 'N/A'}</div>
      </div>
      <div className="budget-detail-actions">
        <button className="button secondary-button" onClick={onEdit} disabled={loading}>Edit</button>
        <button className="button danger-button" onClick={onDelete} disabled={loading}>Delete</button>
      </div>
      </>
  );
};

export default BudgetShowPage;
