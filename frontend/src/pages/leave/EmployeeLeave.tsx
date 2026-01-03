import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores';
import { leaveService } from '../../services';
import type { LeaveRequest, CreateLeaveRequestData } from '../../types';
import { 
  Calendar, Plus, X, Clock, Check, XCircle, FileText,
  Users, Briefcase, Settings, HelpCircle, LogOut, User, AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Leave.css';

const EmployeeLeave = () => {
  const { user } = useAuthStore();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateLeaveRequestData>({
    leaveType: 'PAID',
    startDate: '',
    endDate: '',
    reason: ''
  });

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  const fetchMyLeaves = async () => {
    try {
      setLoading(true);
      const response = await leaveService.getMyLeaves();
      setLeaves(response.data.leaves);
    } catch (error) {
      console.error('Failed to fetch leaves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await leaveService.applyLeave(formData);
      setShowModal(false);
      resetForm();
      fetchMyLeaves();
      alert('Leave request submitted successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit leave request');
    } finally {
      setSubmitting(false);
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

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { label: string; className: string; icon: any }> = {
      PENDING: { label: 'Pending', className: 'status-pending', icon: Clock },
      APPROVED: { label: 'Approved', className: 'status-approved', icon: Check },
      REJECTED: { label: 'Rejected', className: 'status-rejected', icon: XCircle },
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`status-badge ${badge.className}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const getLeaveTypeBadge = (type: string) => {
    const badges: Record<string, string> = {
      PAID: 'leave-type-paid',
      SICK: 'leave-type-sick',
      UNPAID: 'leave-type-unpaid',
      CASUAL: 'leave-type-casual',
    };
    return badges[type] || 'leave-type-paid';
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
              <h2>Employee Portal</h2>
              <p>Leave Management</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item">
            <Briefcase size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <User size={18} />
            <span>Profile</span>
          </Link>
          <Link to="/attendance" className="nav-item">
            <Calendar size={18} />
            <span>Attendance</span>
          </Link>
          <Link to="/leave" className="nav-item active">
            <Calendar size={18} />
            <span>Leave Requests</span>
          </Link>
        </nav>
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'E'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.profile?.firstName || user?.firstName || 'Employee'}</p>
              <p className="user-role">Employee</p>
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
          <div>
            <h1>My Leave Requests</h1>
            <p className="subtitle">Manage your leave applications</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} />
            Apply for Leave
          </button>
        </div>

        {/* Leave Stats */}
        <div className="leave-stats-grid">
          <div className="stat-card">
            <div className="stat-icon pending">
              <Clock size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Pending</p>
              <p className="stat-value">{leaves.filter(l => l.status === 'PENDING').length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">
              <Check size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Approved</p>
              <p className="stat-value">{leaves.filter(l => l.status === 'APPROVED').length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon rejected">
              <XCircle size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Rejected</p>
              <p className="stat-value">{leaves.filter(l => l.status === 'REJECTED').length}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon total">
              <FileText size={24} />
            </div>
            <div className="stat-details">
              <p className="stat-label">Total Requests</p>
              <p className="stat-value">{leaves.length}</p>
            </div>
          </div>
        </div>

        {/* Leave Requests Table */}
        <div className="leave-table-container">
          <div className="table-header">
            <h3>Leave History</h3>
          </div>
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : leaves.length === 0 ? (
            <div className="empty-state">
              <Calendar size={48} />
              <p>No leave requests found</p>
              <p className="hint">Click "Apply for Leave" to submit your first request</p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="leave-table">
                <thead>
                  <tr>
                    <th>Leave Type</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Days</th>
                    <th>Status</th>
                    <th>Reason</th>
                    <th>Comments</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave._id}>
                      <td>
                        <span className={`leave-type-badge ${getLeaveTypeBadge(leave.leaveType)}`}>
                          {leave.leaveType}
                        </span>
                      </td>
                      <td>{formatDate(leave.startDate)}</td>
                      <td>{formatDate(leave.endDate)}</td>
                      <td className="text-center">{calculateDays(leave.startDate, leave.endDate)}</td>
                      <td>{getStatusBadge(leave.status)}</td>
                      <td className="reason-cell">{leave.reason || '-'}</td>
                      <td className="comments-cell">
                        {leave.comments ? (
                          <div className="comment-box">
                            <AlertCircle size={14} />
                            {leave.comments}
                          </div>
                        ) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Apply Leave Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Apply for Leave</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Leave Type *</label>
                <select
                  value={formData.leaveType}
                  onChange={(e) => setFormData({ ...formData, leaveType: e.target.value as any })}
                  required
                >
                  <option value="PAID">Paid Leave</option>
                  <option value="SICK">Sick Leave</option>
                  <option value="UNPAID">Unpaid Leave</option>
                  <option value="CASUAL">Casual Leave</option>
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
                    min={formData.startDate}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Reason *</label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Please provide a reason for your leave request..."
                  rows={4}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeLeave;
