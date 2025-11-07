import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import '../../styles/components/AddExpenseForm.css';
import 'react-datepicker/dist/react-datepicker.css';
import LoadingSpinner from '../../components/LoadingSpinner';

interface Budget {
  id: string;
  city: string;
  budgetAmount: number;
  currency: string | null;
  startDate: string | null;
  endDate: string | null;
}

interface BudgetEditPageProps {
  budget: Budget;
  onCancel: () => void;
  onSave: (updatedData: any) => Promise<void>;
}

const BudgetEditPage: React.FC<BudgetEditPageProps> = ({ budget, onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    city: '',
    budgetAmount: '',
    currency: 'USD',
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      city: budget.city,
      budgetAmount: budget.budgetAmount.toFixed(2),
      currency: budget.currency || 'USD',
      startDate: budget.startDate ? new Date(budget.startDate) : null,
      endDate: budget.endDate ? new Date(budget.endDate) : null,
    });
  }, [budget]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (field: 'startDate' | 'endDate') => (date: Date | null) => {
    setFormData(prev => ({ ...prev, [field]: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        budgetAmount: parseFloat(formData.budgetAmount),
        startDate: formData.startDate ? formData.startDate.toISOString() : null,
        endDate: formData.endDate ? formData.endDate.toISOString() : null,
      };
      await onSave(payload);
    } catch (err: any) {
      setError(err.message || 'Failed to save budget.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error-message">{error}</p>}
      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="city" className="label">City</label>
          <input type="text" id="city" name="city" value={formData.city} onChange={handleChange} required className="input" />
        </div>
        <div className="form-group form-group-half">
          <label htmlFor="budgetAmount" className="label">Budget Amount ({formData.currency})</label>
          <input type="number" id="budgetAmount" name="budgetAmount" value={formData.budgetAmount} onChange={handleChange} required step="0.01" className="input" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group form-group-half">
          <label htmlFor="startDate" className="label">Start Date</label>
          <DatePicker id="startDate" name="startDate" selected={formData.startDate} onChange={handleDateChange('startDate')} dateFormat="MM/dd/yyyy" className="input" required />
        </div>
        <div className="form-group form-group-half">
          <label htmlFor="endDate" className="label">End Date</label>
          <DatePicker id="endDate" name="endDate" selected={formData.endDate} onChange={handleDateChange('endDate')} dateFormat="MM/dd/yyyy" className="input" minDate={formData.startDate} required />
        </div>
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

export default BudgetEditPage;
