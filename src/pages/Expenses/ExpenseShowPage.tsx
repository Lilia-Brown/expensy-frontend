import React from 'react';
import '../../styles/pages/Expenses/ExpenseShowPage.css';

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

interface ExpenseShowPageProps {
  expense: Expense | null;
}

const ExpenseShowPage: React.FC<ExpenseShowPageProps> = ({ expense }) => {
  if (!expense) {
    return <div className="no-expenses-message">Expense details could not be loaded.</div>;
  }

  return (
    <>
      <div className="expense-detail-header">
        <span className="expense-amount">${expense.amount.toFixed(2)}</span>
        <span className="expense-description">{expense.description || 'No Description'}</span>
      </div><div className="expense-detail-body">
          <div className="detail-item"><span className="detail-label">Date:</span> {new Date(expense.date).toLocaleDateString()}</div>
          <div className="detail-item"><span className="detail-label">City:</span> {expense.city}</div>
          <div className="detail-item"><span className="detail-label">Category:</span> <span className="category-dot" style={{ backgroundColor: expense.category?.color || '#ccc' }}></span> {expense.category.name}</div>
          {expense.notes && <div className="detail-item notes-item"><span className="detail-label">Notes:</span> {expense.notes}</div>}
      </div>
      </>
  );
};

export default ExpenseShowPage;
