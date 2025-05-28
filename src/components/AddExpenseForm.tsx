import React, { useState, useEffect } from 'react';
import '../styles/components/AddExpenseForm.css';

interface Category {
  id: string;
  name: string;
}

interface ExpenseFormData {
  amount: string;
  currency: string;
  description: string;
  date: string;
  city: string;
  notes: string;
  source: string;
  categoryId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddExpenseForm: React.FC = () => {
  const [formData, setFormData] = useState<ExpenseFormData>({
    amount: '',
    currency: 'USD',
    description: '',
    date: new Date().toISOString().slice(0, 16),
    city: '',
    notes: '',
    source: 'manual',
    categoryId: '',
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError(null);
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          setError('Authentication token not found. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE_URL}/categories`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Failed to fetch categories: ${response.statusText}`);
        }

        const data: Category[] = await response.json();
        setCategories(data);
        if (data.length > 0 && !formData.categoryId) {
          setFormData(prev => ({ ...prev, categoryId: data[0].id }));
        }
      } catch (err: any) {
        console.error('Error fetching categories:', err);
        setError(err.message || 'An unknown error occurred while fetching categories.');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const authToken = localStorage.getItem('authToken');
      const userId = localStorage.getItem('userId');

      if (!authToken || !userId) {
        setError('Authentication token or User ID not found. Please log in.');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
        userId: userId
      };

      const response = await fetch(`${API_BASE_URL}/expenses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to add expense: ${response.statusText}`);
      }

      const newExpense = await response.json();
      console.log('Expense added successfully:', newExpense);
      setSuccess('Expense added successfully!');

      setFormData({
        amount: '',
        currency: 'USD',
        description: '',
        date: new Date().toISOString().slice(0, 16),
        city: '',
        notes: '',
        source: 'manual',
        categoryId: categories.length > 0 ? categories[0].id : '',
      });

    } catch (err: any) {
      console.error('Error adding expense:', err);
      setError(err.message || 'An unknown error occurred while adding the expense.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && categories.length === 0) {
    return <div className="loading-message">Loading categories...</div>;
  }

  if (error && categories.length === 0) {
    return <div className="error-message">Error: {error}</div>;
  }

  return (
    <div className="expense-form-container">
      <h2>Add New Expense</h2>
      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-message">{success}</p>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount" className="label">Amount:</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            step="0.01"
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="currency" className="label">Currency:</label>
          <input
            type="text"
            id="currency"
            name="currency"
            value={formData.currency}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description" className="label">Description:</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="date" className="label">Date:</label>
          <input
            type="datetime-local"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="city" className="label">City:</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        <div className="form-group">
          <label htmlFor="categoryId" className="label">Category:</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            required
            className="select"
            disabled={loading}
          >
            {loading && categories.length === 0 ? (
              <option value="">Loading categories...</option>
            ) : categories.length === 0 ? (
              <option value="">No categories found</option>
            ) : (
              categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="notes" className="label">Notes:</label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="textarea"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="source" className="label">Source:</label>
          <input
            type="text"
            id="source"
            name="source"
            value={formData.source}
            onChange={handleChange}
            className="input"
          />
        </div>

        <button type="submit" disabled={loading} className="button">
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default AddExpenseForm;
