import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/components/AddExpenseButton.css';

const AddExpenseButton: React.FC = () => {
  return (
    <div className="add-expense-button-container">
      <Link to="/add-expense" className="add-expense-button">+ Add New Expense</Link>
    </div>
  );
};

export default AddExpenseButton;
