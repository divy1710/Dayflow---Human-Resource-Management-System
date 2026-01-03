import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores';
import { salaryService, userService } from '../../services';
import type { Salary, CreateSalaryData, UpdateSalaryData } from '../../types';
import { 
  DollarSign, Plus, X, Search, Edit, Trash2, ChevronLeft, ChevronRight,
  User, FileText, TrendingUp, Users, Briefcase, Calendar,
  Settings, HelpCircle, UserPlus, LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Salary.css';

const SalaryManagement = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';
  
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  const [formData, setFormData] = useState<CreateSalaryData | UpdateSalaryData>({
    userId: '',
    basicSalary: 0,
    allowances: 0,
    deductions: 0,
    currency: 'USD',
    paymentFrequency: 'MONTHLY'
  });

  useEffect(() => {
    fetchSalaries();
  }, [currentPage, searchTerm]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      const response = await salaryService.getAllSalaries({
        page: currentPage,
        limit: itemsPerPage
      });
      setSalaries(response.data.salaries);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('Failed to fetch salaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSalary) {
        await salaryService.updateSalary(editingSalary._id, formData as UpdateSalaryData);
      } else {
        await salaryService.createSalary(formData as CreateSalaryData);
      }
      setShowModal(false);
      resetForm();
      fetchSalaries();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save salary');
    }
  };

  const handleEdit = (salary: Salary) => {
    setEditingSalary(salary);
    setFormData({
      basicSalary: salary.basicSalary,
      allowances: salary.allowances,
      deductions: salary.deductions,
      currency: salary.currency,
      paymentFrequency: salary.paymentFrequency
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this salary record?')) {
      try {
        await salaryService.deleteSalary(id);
        fetchSalaries();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete salary');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      basicSalary: 0,
      allowances: 0,
      deductions: 0,
      currency: 'USD',
      paymentFrequency: 'MONTHLY'
    });
    setEditingSalary(null);
  };

  const calculateNetSalary = () => {
    const basic = Number(formData.basicSalary) || 0;
    const allowances = Number(formData.allowances) || 0;
    const deductions = Number(formData.deductions) || 0;
    return basic + allowances - deductions;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const calculateStats = () => {
    const total = salaries.reduce((sum, s) => sum + s.netSalary, 0);
    const average = salaries.length > 0 ? total / salaries.length : 0;
    const highest = Math.max(...salaries.map(s => s.netSalary), 0);
    const lowest = salaries.length > 0 ? Math.min(...salaries.map(s => s.netSalary)) : 0;
    return { total, average, highest, lowest };
  };

  const stats = calculateStats();

  const filteredSalaries = salaries.filter(salary => {
    const searchLower = searchTerm.toLowerCase();
    return (
      salary.userId?.email?.toLowerCase().includes(searchLower) ||
      salary.userId?.profile?.firstName?.toLowerCase().includes(searchLower) ||
      salary.userId?.profile?.lastName?.toLowerCase().includes(searchLower)
    );
  });

  if (!isAdmin) {
    return (
      <div className="salary-container">
        <div className="access-denied">
          <DollarSign size={64} />
          <h2>Access Denied</h2>
          <p>Only administrators can access salary management</p>
          <Link to="/dashboard" className="btn-primary">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="salary-container">
      {/* Sidebar */}
      <aside className="salary-sidebar">
        <div className="sidebar-header">
          <div className="portal-logo">
            <div className="logo-icon">
              <Users size={24} />
            </div>
            <div>
              <h2>HR Portal</h2>
              <p>Admin Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <Briefcase size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/employees" className="nav-item">
            <Users size={18} />
            <span>Employees</span>
          </Link>
          <Link to="/attendance" className="nav-item">
            <Calendar size={18} />
            <span>Attendance</span>
          </Link>
          <a href="#" className="nav-item">
            <UserPlus size={18} />
            <span>Recruitment</span>
          </a>
          <Link to="/salary" className="nav-item active">
            <DollarSign size={18} />
            <span>Payroll</span>
          </Link>
          <Link to="/leave" className="nav-item">
            <FileText size={18} />
            <span>Leave</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <User size={18} />
            <span>Profile</span>
          </Link>
          <Link to="/reports" className="nav-item">
            <FileText size={18} />
            <span>Reports</span>
          </Link>
        </nav>
        <div className="sidebar-divider">
          <span>SYSTEM</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item">
            <Settings size={18} />
            <span>Settings</span>
          </a>
          <a href="#" className="nav-item">
            <HelpCircle size={18} />
            <span>Support</span>
          </a>
        </nav>
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.profile?.firstName || user?.firstName || 'Admin'}</p>
              <p className="user-role">{user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'HR' ? 'HR Manager' : 'Employee'}</p>
            </div>
          </div>
          <button className="logout-icon-btn" onClick={handleSignOut} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="salary-main">
        <div className="salary-header">
          <div className="header-left">
            <h1>Payroll Management</h1>
            <p>Manage employee salaries and compensation</p>
          </div>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={20} />
            Add Salary
          </button>
        </div>

        {/* Stats Cards */}
        <div className="stats-summary">
          <div className="stat-card stat-total">
            <DollarSign size={24} />
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats.total)}</span>
              <span className="stat-label">Total Payroll</span>
            </div>
          </div>
          <div className="stat-card stat-average">
            <TrendingUp size={24} />
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats.average)}</span>
              <span className="stat-label">Average Salary</span>
            </div>
          </div>
          <div className="stat-card stat-highest">
            <TrendingUp size={24} />
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats.highest)}</span>
              <span className="stat-label">Highest Salary</span>
            </div>
          </div>
          <div className="stat-card stat-lowest">
            <Users size={24} />
            <div className="stat-content">
              <span className="stat-value">{formatCurrency(stats.lowest)}</span>
              <span className="stat-label">Lowest Salary</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="salary-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by employee name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Salary Table */}
        <div className="salary-table-container">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : filteredSalaries.length === 0 ? (
            <div className="empty-state">
              <DollarSign size={48} />
              <h3>No salary records found</h3>
              <p>Add salary information for employees</p>
            </div>
          ) : (
            <table className="salary-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Basic Salary</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Net Salary</th>
                  <th>Frequency</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSalaries.map((salary) => (
                  <tr key={salary._id}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {salary.userId?.profile?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="employee-name">
                            {salary.userId?.profile?.firstName} {salary.userId?.profile?.lastName}
                          </div>
                          <div className="employee-email">{salary.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="amount-cell">{formatCurrency(salary.basicSalary, salary.currency)}</td>
                    <td className="amount-cell positive">{formatCurrency(salary.allowances, salary.currency)}</td>
                    <td className="amount-cell negative">{formatCurrency(salary.deductions, salary.currency)}</td>
                    <td className="amount-cell net">{formatCurrency(salary.netSalary, salary.currency)}</td>
                    <td>
                      <span className="frequency-badge">{salary.paymentFrequency}</span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(salary)}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(salary._id)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={20} />
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-btn"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingSalary ? 'Edit Salary' : 'Add Salary'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {!editingSalary && (
                <div className="form-group">
                  <label>Employee ID *</label>
                  <input
                    type="text"
                    value={(formData as CreateSalaryData).userId || ''}
                    onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                    placeholder="Enter User ID"
                    required
                  />
                  <small>Enter the MongoDB User ID of the employee</small>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Basic Salary *</label>
                  <input
                    type="number"
                    value={formData.basicSalary}
                    onChange={(e) => setFormData({ ...formData, basicSalary: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="INR">INR</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Allowances</label>
                  <input
                    type="number"
                    value={formData.allowances}
                    onChange={(e) => setFormData({ ...formData, allowances: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="form-group">
                  <label>Deductions</label>
                  <input
                    type="number"
                    value={formData.deductions}
                    onChange={(e) => setFormData({ ...formData, deductions: Number(e.target.value) })}
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Payment Frequency *</label>
                <select
                  value={formData.paymentFrequency}
                  onChange={(e) => setFormData({ ...formData, paymentFrequency: e.target.value })}
                  required
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="BI_WEEKLY">Bi-Weekly</option>
                </select>
              </div>

              <div className="net-salary-display">
                <label>Net Salary:</label>
                <span className="net-amount">{formatCurrency(calculateNetSalary(), formData.currency)}</span>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSalary ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryManagement;
