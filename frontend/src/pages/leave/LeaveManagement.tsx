import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores';
import { leaveService } from '../../services';
import type { LeaveRequest, CreateLeaveRequestData } from '../../types';
import { 
  Calendar, Plus, X, Search, Filter, ChevronLeft, ChevronRight,
  Check, XCircle, Clock, FileText, User, Trash2, Eye,
  Users, Briefcase, DollarSign, Settings, HelpCircle, UserPlus, LogOut
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Leave.css';

const LeaveManagement = () => {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  const [formData, setFormData] = useState<CreateLeaveRequestData>({
    leaveType: 'PAID',
    startDate: '',
    endDate: '',
    reason: ''
  });

  useEffect(() => {
    fetchLeaves();
  }, [currentPage, filterStatus, filterType, searchTerm]);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getAllLeaves({
        page: currentPage,
        limit: itemsPerPage,
        status: filterStatus !== 'ALL' ? filterStatus : undefined,
        leaveType: filterType !== 'ALL' ? filterType : undefined
      });
      console.log('Fetched leaves:', response.data);
      setLeaves(response.data.leaves);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch leaves:', error);
      console.error('Error response:', error.response?.data);
      alert('Failed to load leave requests. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await leaveService.applyLeave(formData);
      setShowModal(false);
      resetForm();
      fetchLeaves();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save leave request');
    }
  };

  const handleApprove = async (id: string) => {
    const comments = prompt('Add approval comments (optional):');
    try {
      await leaveService.approveLeave(id, comments || '');
      fetchLeaves();
      alert('Leave request approved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to approve leave');
    }
  };

  const handleReject = async (id: string) => {
    const comments = prompt('Reason for rejection (required):');
    if (comments && comments.trim()) {
      try {
        await leaveService.rejectLeave(id, comments);
        fetchLeaves();
        alert('Leave request rejected');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to reject leave');
      }
    } else if (comments !== null) {
      alert('Please provide a reason for rejection');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this leave request?')) {
      try {
        await leaveService.deleteLeave(id);
        fetchLeaves();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Failed to delete leave');
      }
    }
  };



  const resetForm = () => {
    setFormData({
      leaveType: 'PAID',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'status-badge status-approved';
      case 'REJECTED': return 'status-badge status-rejected';
      case 'PENDING': return 'status-badge status-pending';
      default: return 'status-badge';
    }
  };

  const getTypeBadgeClass = (type: string) => {
    switch (type) {
      case 'PAID': return 'type-badge type-paid';
      case 'SICK': return 'type-badge type-sick';
      case 'CASUAL': return 'type-badge type-casual';
      case 'UNPAID': return 'type-badge type-unpaid';
      default: return 'type-badge';
    }
  };

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  return (
    <div className="leave-container">
      {/* Sidebar */}
      <aside className="leave-sidebar">
        <div className="sidebar-header">
          <div className="portal-logo">
            <div className="logo-icon">
              <Users size={24} />
            </div>
            <div>
              <h2>Admin/HR Portal</h2>
              <p>Leave Management</p>
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
          <Link to="/salary" className="nav-item">
            <DollarSign size={18} />
            <span>Payroll</span>
          </Link>
          <Link to="/leave" className="nav-item active">
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
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.profile?.firstName || user?.firstName || 'Admin'}</p>
              <p className="user-role">Admin/HR</p>
            </div>
          </div>
          <button className="logout-icon-btn" onClick={handleSignOut} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="leave-main">
        <div className="leave-header">
          <div className="header-left">
            <h1>Leave Management</h1>
            <p>Manage and track all leave requests</p>
          </div>
          <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={20} />
            Apply Leave
          </button>
        </div>

        {/* Filters */}
        <div className="leave-filters">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Search by employee name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <Filter size={18} />
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="ALL">All Types</option>
              <option value="PAID">Paid Leave</option>
              <option value="SICK">Sick Leave</option>
              <option value="CASUAL">Casual Leave</option>
              <option value="UNPAID">Unpaid Leave</option>
            </select>
          </div>
        </div>

        {/* Leave Table */}
        <div className="leave-table-container">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <h3>No leave requests found</h3>
              <p>Start by applying for a leave</p>
            </div>
          ) : (
            <table className="leave-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Leave Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Days</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id}>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">
                          {leave.userId?.profile?.firstName?.[0] || 'U'}
                        </div>
                        <div>
                          <div className="employee-name">
                            {leave.userId?.profile?.firstName} {leave.userId?.profile?.lastName}
                          </div>
                          <div className="employee-email">{leave.userId?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={getTypeBadgeClass(leave.leaveType)}>
                        {leave.leaveType}
                      </span>
                    </td>
                    <td>{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td>{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="days-cell">
                      {calculateDays(leave.startDate.toString(), leave.endDate.toString())} days
                    </td>
                    <td className="reason-cell">{leave.reason || '-'}</td>
                    <td>
                      <span className={getStatusBadgeClass(leave.status)}>
                        {leave.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        {leave.status === 'PENDING' && (
                          <>
                            <button
                              className="action-btn approve-btn"
                              onClick={() => handleApprove(leave._id)}
                              title="Approve"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              className="action-btn reject-btn"
                              onClick={() => handleReject(leave._id)}
                              title="Reject"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          className="action-btn delete-btn"
                          onClick={() => handleDelete(leave._id)}
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
              <h2>Apply for Leave</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                  required
                >
                  <option value="PAID">Paid Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="CASUAL">Casual Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Enter reason for leave..."
                  rows={4}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveManagement;
