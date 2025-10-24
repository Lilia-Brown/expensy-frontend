import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface AddExpenseFormProps {
  currentUserId: string | null;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ currentUserId }) => {
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
    <div className="form-card">
      <h3 className="section-title">Expense Details</h3>

      {error && <p className="error-message">{error}</p>}
      {success && <p className="success-card">✅ {success}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group form-group-half">
            <label htmlFor="amount" className="label">Amount (USD)</label>
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
          <div className="form-group form-group-half">
            <label htmlFor="date" className="label">Date</label>
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
        </div>

        <div className="form-group">
          <label htmlFor="description" className="label">Description</label>
          <input
            type="text"
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            className="input"
          />
        </div>

        <div className="form-row">
          <div className="form-group form-group-half">
            <label htmlFor="city" className="label">City</label>
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
          <div className="form-group form-group-half">
            <label htmlFor="categoryId" className="label">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              className="select"
              disabled={loading && categories.length === 0}
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
        </div>

        <div className="form-buttons">
          <Link to="/dashboard" className="button secondary-button">Cancel</Link>
          <button type="submit" disabled={loading} className="button primary-button">
            {loading ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddExpenseForm;
