import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/AddExpenseButton.css';

interface AddExpenseButtonProps {
  currentUserId: string | null;
}

const AddExpenseButton: React.FC<AddExpenseButtonProps> = () => {
  return (
    <div className="add-expense-button-container">
      <Link to="/add-expense" className="add-expense-button">+ Add New Expense</Link>
    </div>
  );
};

export default AddExpenseButton;
