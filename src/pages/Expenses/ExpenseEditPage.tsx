import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import '../../styles/components/AddExpenseForm.css';
import 'react-datepicker/dist/react-datepicker.css';

import LoadingSpinner from '../../components/LoadingSpinner';

interface Category {
  id: string;
  name: string;
}

interface Expense {
  id: string;
  amount: number;
  description?: string;
  date: string;
  city: string;
  notes?: string;
  categoryId: string;
}

interface Budget {
  id: string;
  city: string;
}

interface ExpenseEditPageProps {
  expense: Expense;
  onCancel: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

const ExpenseEditPage: React.FC<ExpenseEditPageProps> = ({ expense, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: '',
    city: '',
    notes: '',
    categoryId: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    setFormData({
      amount: expense.amount.toFixed(2),
      description: expense.description || '',
      date: new Date(expense.date).toISOString().slice(0, 10),
      city: expense.city,
      notes: expense.notes || '',
      categoryId: expense.categoryId,
    });

    const fetchOptions = async () => {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        setError('Authentication error.');
        setLoading(false);
        return;
      }

      try {
        const [categoriesRes, budgetsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/categories`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
          fetch(`${API_BASE_URL}/budgets`, { headers: { 'Authorization': `Bearer ${authToken}` } }),
        ]);

        if (!categoriesRes.ok) throw new Error('Failed to fetch categories.');
        if (!budgetsRes.ok) throw new Error('Failed to fetch cities.');

        const categoriesData: Category[] = await categoriesRes.json();
        const budgetsData: Budget[] = await budgetsRes.json();

        setCategories(categoriesData);
        const uniqueCities = Array.from(new Set(budgetsData.map(b => b.city)));
        setCities(uniqueCities);

      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
      }
    };

    fetchOptions();
  }, [expense, API_BASE_URL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      setFormData(prev => ({ ...prev, date: date.toISOString().slice(0, 10) }));
    }
  };

  const handleAmountBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setFormData(prev => ({ ...prev, amount: value.toFixed(2) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        amount: parseFloat(formData.amount),
        date: new Date(formData.date).toISOString(),
      };
      await onSave(payload);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="amount" className="label">Amount (USD)</label>
          <input type="number" id="amount" name="amount" value={formData.amount} onChange={handleChange} onBlur={handleAmountBlur} required step="0.01" className="input" />
        </div>
        <div className="form-group form-group-half">
          <label htmlFor="date" className="label">Date</label>
          <DatePicker id="date" name="date" selected={formData.date ? new Date(formData.date) : null} onChange={handleDateChange} dateFormat="MM/dd/yyyy" className="input" maxDate={new Date()} required />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="description" className="label">Description</label>
        <input type="text" id="description" name="description" value={formData.description} onChange={handleChange} required className="input" />
      </div>
      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="city" className="label">City</label>
          <select id="city" name="city" value={formData.city} onChange={handleChange} required className="select">
            {cities.map(city => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>
        <div className="form-group form-group-half">
          <label htmlFor="categoryId" className="label">Category</label>
          <select id="categoryId" name="categoryId" value={formData.categoryId} onChange={handleChange} required className="select">
            {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="notes" className="label">Notes</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows={3} className="textarea"></textarea>
      </div>
      <div className="form-buttons">
        <button type="button" onClick={onCancel} className="button secondary-button" disabled={loading}>Cancel</button>
        <button type="submit" className="button primary-button" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseEditPage;
