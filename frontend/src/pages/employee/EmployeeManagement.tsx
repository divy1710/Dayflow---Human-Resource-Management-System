import { useState, useEffect } from 'react';
import { employeeService } from '../../services/employee.service';
import type { Employee, CreateEmployeeData } from '../../services/employee.service';
import { UserPlus, Search, Grid, List, MoreVertical, Mail, Phone, X, LogOut, Users, Briefcase, Calendar, DollarSign, Settings, HelpCircle, FileText } from 'lucide-react';
import { useAuthStore } from '../../stores';
import { Link } from 'react-router-dom';
import './Employee.css';

const EmployeeManagement = () => {
  const { user, signOut } = useAuthStore();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    department: '',
    status: '',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  const [formData, setFormData] = useState<CreateEmployeeData>({
    tradeId: '',
    employeeName: '',
    site: '',
    department: '',
    designation: '',
    dateOfJoining: '',
    email: '',
    gender: 'Male',
    dateOfBirth: '',
    mobile: '',
    pan: '',
    aadhaar: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchEmployees();
  }, [pagination.page, filters, searchTerm]);

  const handleSignOut = async () => {
    await signOut();
  };

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await employeeService.getAllEmployees({
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        department: filters.department,
        status: filters.status,
      });

      setEmployees(response.employees || []);
      setPagination(prev => ({
        ...prev,
        total: response.total || 0,
        pages: response.pages || 0,
      }));
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingEmployee) {
        await employeeService.updateEmployee(editingEmployee._id, formData);
      } else {
        await employeeService.createEmployee(formData);
      }

      setShowForm(false);
      setEditingEmployee(null);
      resetForm();
      fetchEmployees();
    } catch (error: any) {
      console.error('Error saving employee:', error);
      alert(error.response?.data?.message || 'Error saving employee');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      tradeId: employee.tradeId,
      employeeName: employee.employeeName,
      site: employee.site,
      department: employee.department,
      designation: employee.designation,
      dateOfJoining: employee.dateOfJoining.split('T')[0],
      email: employee.email,
      gender: employee.gender,
      dateOfBirth: employee.dateOfBirth.split('T')[0],
      mobile: employee.mobile,
      pan: employee.pan,
      aadhaar: employee.aadhaar,
      status: employee.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) {
      return;
    }

    try {
      await employeeService.deleteEmployee(id);
      fetchEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      alert('Error deleting employee');
    }
  };

  const resetForm = () => {
    setFormData({
      tradeId: '',
      employeeName: '',
      site: '',
      department: '',
      designation: '',
      dateOfJoining: '',
      email: '',
      gender: 'Male',
      dateOfBirth: '',
      mobile: '',
      pan: '',
      aadhaar: '',
      status: 'Active',
    });
  };

  const getDepartmentColor = (dept: string) => {
    const colors: { [key: string]: string } = {
      'Product Design': 'blue',
      'Engineering': 'purple',
      'HR': 'pink',
      'Marketing': 'orange',
      'Finance': 'teal',
      'Sales': 'green',
    };
    return colors[dept] || 'gray';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'Active': 'green',
      'On Leave': 'orange',
      'Remote': 'blue',
      'Inactive': 'gray',
    };
    return colors[status] || 'gray';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="employee-page">
      {/* Sidebar */}
      <aside className="employee-sidebar">
        <div className="sidebar-header">
          <div className="portal-logo">
            <div className="logo-icon">
              <UserPlus size={24} />
            </div>
            <div>
              <h2>HR Portal</h2>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <Briefcase size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/employees" className="nav-item active">
            <Users size={18} />
            <span>Employees</span>
          </Link>
          <Link to="/attendance" className="nav-item">
            <Calendar size={18} />
            <span>Attendance</span>
          </Link>
          <Link to="/salary" className="nav-item">
            <DollarSign size={18} />
            <span>Payroll</span>
          </Link>
          <Link to="/leave" className="nav-item">
            <FileText size={18} />
            <span>Leave</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <Users size={18} />
            <span>Profile</span>
          </Link>
          <Link to="/reports" className="nav-item">
            <FileText size={18} />
            <span>Reports</span>
          </Link>
        </nav>

        {/* User Profile at Bottom */}
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profile?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.profile?.firstName || 'Admin'}</p>
              <p className="user-role">{user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'HR' ? 'HR Manager' : 'Employee'}</p>
            </div>
          </div>
          <button className="logout-icon-btn" onClick={handleSignOut} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="employee-main">
        {/* Header */}
        <header className="employee-header">
          <div className="search-bar">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search anything..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="header-actions">
            <button className="icon-btn">
              <Mail size={20} />
            </button>
            <button className="logout-btn" onClick={signOut}>
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </header>

        {/* Breadcrumb */}
        <div className="breadcrumb">
          <a href="/dashboard">Home</a>
          <span>/</span>
          <span>Employees</span>
        </div>

        {/* Page Header */}
        <div className="page-header">
          <div>
            <h1>All Employees</h1>
            <p>Manage your team members and their account details.</p>
          </div>
          <button className="add-employee-btn" onClick={() => setShowForm(true)}>
            <UserPlus size={20} />
            Add New Employee
          </button>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-filter">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, role, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-controls">
            <select
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
            >
              <option value="">All Departments</option>
              <option value="Product Design">Product Design</option>
              <option value="Engineering">Engineering</option>
              <option value="HR">HR</option>
              <option value="Marketing">Marketing</option>
              <option value="Finance">Finance</option>
              <option value="Sales">Sales</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Any Status</option>
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Remote">Remote</option>
              <option value="Inactive">Inactive</option>
            </select>
            <div className="view-toggle">
              <button
                className={viewMode === 'grid' ? 'active' : ''}
                onClick={() => setViewMode('grid')}
              >
                <Grid size={18} />
              </button>
              <button
                className={viewMode === 'list' ? 'active' : ''}
                onClick={() => setViewMode('list')}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Employee Grid */}
        {loading ? (
          <div className="loading">Loading employees...</div>
        ) : (
          <>
            <div className={`employee-grid ${viewMode}`}>
              {employees.map((employee) => (
                <div key={employee._id} className="employee-card">
                  <div className="card-header">
                    <div className="employee-avatar">
                      {getInitials(employee.employeeName)}
                    </div>
                    <div className="dropdown-wrapper">
                      <button 
                        className="more-btn"
                        onClick={() => setOpenDropdown(openDropdown === employee._id ? null : employee._id)}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openDropdown === employee._id && (
                        <div className="dropdown-menu">
                          <button onClick={() => { handleEdit(employee); setOpenDropdown(null); }}>
                            Edit Profile
                          </button>
                          <button onClick={() => { handleDelete(employee._id); setOpenDropdown(null); }}>
                            Delete Employee
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="card-body">
                    <h3>{employee.employeeName}</h3>
                    <p className="designation">{employee.designation}</p>
                    <div className="tags">
                      <span className={`tag ${getDepartmentColor(employee.department)}`}>
                        {employee.department}
                      </span>
                      <span className={`tag ${getStatusColor(employee.status)}`}>
                        {employee.status}
                      </span>
                    </div>
                    <div className="contact-info">
                      <div className="info-item">
                        <Mail size={14} />
                        <span>{employee.email}</span>
                      </div>
                      <div className="info-item">
                        <Phone size={14} />
                        <span>{employee.mobile || 'Not available'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="card-footer">
                    <button className="view-profile-btn" onClick={() => handleEdit(employee)}>
                      View Profile
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="pagination">
              <div className="pagination-info">
                Showing {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} employees
              </div>
              <div className="pagination-controls">
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Previous
                </button>
                {[...Array(Math.min(pagination.pages, 5))].map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      className={pagination.page === pageNum ? 'active' : ''}
                      onClick={() => setPagination({ ...pagination, page: pageNum })}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                {pagination.pages > 5 && <span>...</span>}
                {pagination.pages > 5 && (
                  <button
                    className={pagination.page === pagination.pages ? 'active' : ''}
                    onClick={() => setPagination({ ...pagination, page: pagination.pages })}
                  >
                    {pagination.pages}
                  </button>
                )}
                <button
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page === pagination.pages}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="close-btn" onClick={() => setShowForm(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="employee-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Trade ID *</label>
                  <input
                    type="text"
                    value={formData.tradeId}
                    onChange={(e) => setFormData({ ...formData, tradeId: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Employee Name *</label>
                  <input
                    type="text"
                    value={formData.employeeName}
                    onChange={(e) => setFormData({ ...formData, employeeName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Site *</label>
                  <input
                    type="text"
                    value={formData.site}
                    onChange={(e) => setFormData({ ...formData, site: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    required
                  >
                    <option value="">Select</option>
                    <option value="Product Design">Product Design</option>
                    <option value="Engineering">Engineering</option>
                    <option value="HR">HR</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Finance">Finance</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Designation *</label>
                  <input
                    type="text"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Date of Joining *</label>
                  <input
                    type="date"
                    value={formData.dateOfJoining}
                    onChange={(e) => setFormData({ ...formData, dateOfJoining: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Gender *</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Mobile *</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>PAN</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Aadhaar</label>
                  <input
                    type="text"
                    value={formData.aadhaar}
                    onChange={(e) => setFormData({ ...formData, aadhaar: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Saving...' : editingEmployee ? 'Update Employee' : 'Add Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagement;
