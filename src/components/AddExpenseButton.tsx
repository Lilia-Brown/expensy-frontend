import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/AddExpenseButton.css';

interface AddExpenseButtonProps {
  city?: string;
}

const AddExpenseButton: React.FC<AddExpenseButtonProps> = ({ city }) => {
  return (
    <div className="add-expense-button-container">
      <Link to="/add-expense" state={{ city }} className="add-expense-button">+ Add New Expense</Link>
    </div>
  );
};

export default AddExpenseButton;
