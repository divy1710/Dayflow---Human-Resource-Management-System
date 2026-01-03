import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores';
import { attendanceService } from '../../services';
import type { Attendance } from '../../types';
import { 
  Calendar, Clock, LogIn, LogOut as LogOutIcon, Search, Filter,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, User, FileText,
  Users, Briefcase, DollarSign, Settings, HelpCircle, UserPlus,
  Coffee, Edit, AlertCircle, TrendingUp, BarChart2, Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Attendance.css';

const AttendanceManagement = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN';
  
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState<any>(null);
  const [onBreak, setOnBreak] = useState(false);
  const [showRegularizationModal, setShowRegularizationModal] = useState(false);
  const [regularizationData, setRegularizationData] = useState({ date: '', reason: '', checkIn: '', checkOut: '' });
  const [regularizationRequests, setRegularizationRequests] = useState<Attendance[]>([]);
  const [showRegularizationList, setShowRegularizationList] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const itemsPerPage = 10;

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  useEffect(() => {
    fetchAttendance();
    fetchTodayAttendance();
    fetchStats();
    if (isAdmin) {
      fetchRegularizationRequests();
    }
  }, [currentPage, selectedDate, viewMode, filterStatus]);

  const fetchTodayAttendance = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    try {
      const response = await attendanceService.getMyAttendance({
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      });
      const todayRec = response.data.attendances.find(a => 
        new Date(a.date).toDateString() === today.toDateString()
      );
      setTodayAttendance(todayRec || null);
      
      // Check if on break
      if (todayRec?.breaks) {
        const activeBreak = todayRec.breaks.find(br => !br.endTime);
        setOnBreak(!!activeBreak);
      }
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
    }
  };

  const fetchStats = async () => {
    try {
      let startDate: string;
      let endDate: string;

      if (viewMode === 'daily') {
        // For daily view, use the selected date
        startDate = selectedDate;
        endDate = selectedDate;
      } else if (viewMode === 'weekly') {
        // For weekly view, use the week containing the selected date
        startDate = getWeekStart(selectedDate);
        endDate = getWeekEnd(selectedDate);
      } else {
        // For monthly view, use the month containing the selected date
        startDate = getMonthStart(selectedDate);
        endDate = getMonthEnd(selectedDate);
      }
      
      const response = await attendanceService.getStats({
        startDate,
        endDate,
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchRegularizationRequests = async () => {
    try {
      const response = await attendanceService.getRegularizationRequests({
        status: filterStatus || undefined,
      });
      setRegularizationRequests(response.data.requests);
    } catch (error) {
      console.error('Failed to fetch regularization requests:', error);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      if (isAdmin) {
        const response = await attendanceService.getAllAttendance({
          page: currentPage,
          limit: itemsPerPage,
          date: viewMode === 'daily' ? selectedDate : undefined,
          startDate: viewMode === 'weekly' ? getWeekStart(selectedDate) : viewMode === 'monthly' ? getMonthStart(selectedDate) : undefined,
          endDate: viewMode === 'weekly' ? getWeekEnd(selectedDate) : viewMode === 'monthly' ? getMonthEnd(selectedDate) : undefined,
          status: filterStatus || undefined,
        });
        setAttendances(response.data.attendances);
        setTotalPages(response.data.pagination.pages);
      } else {
        const response = await attendanceService.getMyAttendance({
          page: currentPage,
          limit: itemsPerPage,
          startDate: viewMode === 'weekly' ? getWeekStart(selectedDate) : viewMode === 'monthly' ? getMonthStart(selectedDate) : selectedDate,
          endDate: viewMode === 'weekly' ? getWeekEnd(selectedDate) : viewMode === 'monthly' ? getMonthEnd(selectedDate) : selectedDate,
        });
        setAttendances(response.data.attendances);
        setTotalPages(response.data.pagination.pages);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekStart = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff)).toISOString().split('T')[0];
  };

  const getWeekEnd = (dateStr: string) => {
    const start = new Date(getWeekStart(dateStr));
    return new Date(start.setDate(start.getDate() + 6)).toISOString().split('T')[0];
  };

  const getMonthStart = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
  };

  const getMonthEnd = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];
  };

  const handleCheckIn = async () => {
    try {
      const response = await attendanceService.checkIn();
      alert(response.data.message || 'Checked in successfully');
      fetchTodayAttendance();
      fetchAttendance();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      const response = await attendanceService.checkOut();
      alert(response.data.message || 'Checked out successfully');
      fetchTodayAttendance();
      fetchAttendance();
      fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check out');
    }
  };

  const handleStartBreak = async () => {
    try {
      await attendanceService.startBreak();
      setOnBreak(true);
      fetchTodayAttendance();
      alert('Break started');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      await attendanceService.endBreak();
      setOnBreak(false);
      fetchTodayAttendance();
      alert('Break ended');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to end break');
    }
  };

  const handleRegularizationRequest = async () => {
    try {
      await attendanceService.requestRegularization(regularizationData);
      alert('Regularization request submitted successfully');
      setShowRegularizationModal(false);
      setRegularizationData({ date: '', reason: '', checkIn: '', checkOut: '' });
      fetchAttendance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to submit regularization');
    }
  };

  const handleProcessRegularization = async (id: string, action: 'APPROVED' | 'REJECTED') => {
    try {
      await attendanceService.processRegularization(id, action);
      alert(`Regularization ${action.toLowerCase()} successfully`);
      fetchRegularizationRequests();
      fetchAttendance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to process regularization');
    }
  };

  const handleMarkAbsentees = async () => {
    if (!confirm('Mark all employees who did not check in as absent for today?')) return;
    
    try {
      const response = await attendanceService.markAbsentees();
      alert(response.data.message || 'Absentees marked successfully');
      fetchAttendance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark absentees');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'status-badge status-present';
      case 'ABSENT': return 'status-badge status-absent';
      case 'HALF_DAY': return 'status-badge status-halfday';
      case 'LEAVE': return 'status-badge status-leave';
      case 'PENDING': return 'status-badge status-pending';
      case 'HOLIDAY': return 'status-badge status-holiday';
      case 'WEEKEND': return 'status-badge status-weekend';
      default: return 'status-badge';
    }
  };

  const formatTime = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMinutes = (minutes?: number) => {
    if (!minutes) return '-';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  return (
    <div className="attendance-container">
      {/* Sidebar */}
      <aside className="attendance-sidebar">
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
          <Link to="/attendance" className="nav-item active">
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
              <p className="user-role">{user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'HR' ? 'HR Manager' : 'Employee'}</p>
            </div>
          </div>
          <button className="logout-icon-btn" onClick={handleSignOut} title="Logout">
            <LogOutIcon size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="attendance-main">
        <div className="attendance-header">
          <div className="header-left">
            <h1>Attendance Management</h1>
            <p>{isAdmin ? 'Monitor employee attendance' : 'Track your attendance'}</p>
          </div>
          {!isAdmin && (
            <div className="check-in-out-btns">
              {!todayAttendance ? (
                <button className="btn-check-in" onClick={handleCheckIn}>
                  <LogIn size={20} />
                  Check In
                </button>
              ) : !todayAttendance.checkOut ? (
                <button className="btn-check-out" onClick={handleCheckOut}>
                  <LogOutIcon size={20} />
                  Check Out
                </button>
              ) : (
                <div className="checked-out-msg">
                  <CheckCircle size={20} />
                  Checked out for today
                </div>
              )}
            </div>
          )}
        </div>

        {/* Today's Status */}
        {todayAttendance && (
          <div className="today-status-card">
            <div className="status-item">
              <div className="status-icon check-in-icon">
                <LogIn size={20} />
              </div>
              <div className="status-info">
                <span className="status-label">Check In</span>
                <span className="status-time">{formatTime(todayAttendance.checkIn)}</span>
              </div>
            </div>
            <div className="status-divider"></div>
            <div className="status-item">
              <div className="status-icon check-out-icon">
                <LogOutIcon size={20} />
              </div>
              <div className="status-info">
                <span className="status-label">Check Out</span>
                <span className="status-time">{formatTime(todayAttendance.checkOut)}</span>
              </div>
            </div>
            <div className="status-divider"></div>
            <div className="status-item">
              <div className="status-icon hours-icon">
                <Clock size={20} />
              </div>
              <div className="status-info">
                <span className="status-label">Work Hours</span>
                <span className="status-time">
                  {todayAttendance.workHours ? `${todayAttendance.workHours} hrs` : '-'}
                </span>
              </div>
            </div>
            <div className="status-divider"></div>
            <div className="status-item">
              <span className={getStatusBadgeClass(todayAttendance.status)}>
                {todayAttendance.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        )}

        {/* Stats Summary */}
        {stats && (
          <div className="stats-summary">
            <div className="stat-card stat-present">
              <div className="stat-icon-wrapper">
                <CheckCircle size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Present Days</span>
                <span className="stat-value">{stats.present || 0}</span>
                <span className="stat-trend">This Month</span>
              </div>
            </div>
            <div className="stat-card stat-absent">
              <div className="stat-icon-wrapper">
                <XCircle size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Absent Days</span>
                <span className="stat-value">{stats.absent || 0}</span>
                <span className="stat-trend">This Month</span>
              </div>
            </div>
            <div className="stat-card stat-halfday">
              <div className="stat-icon-wrapper">
                <Clock size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Half Days</span>
                <span className="stat-value">{stats.halfDay || 0}</span>
                <span className="stat-trend">This Month</span>
              </div>
            </div>
            <div className="stat-card stat-leave">
              <div className="stat-icon-wrapper">
                <FileText size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">On Leave</span>
                <span className="stat-value">{stats.leave || 0}</span>
                <span className="stat-trend">This Month</span>
              </div>
            </div>
            <div className="stat-card stat-rate">
              <div className="stat-icon-wrapper">
                <TrendingUp size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Attendance Rate</span>
                <span className="stat-value">{stats.attendanceRate || 0}%</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${stats.attendanceRate || 0}%` }}></div>
                </div>
              </div>
            </div>
            <div className="stat-card stat-hours">
              <div className="stat-icon-wrapper">
                <Clock size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Avg Work Hours</span>
                <span className="stat-value">{stats.averageWorkHours || 0} hrs</span>
                <span className="stat-trend">Per Day</span>
              </div>
            </div>
            <div className="stat-card stat-overtime">
              <div className="stat-icon-wrapper">
                <TrendingUp size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Total Overtime</span>
                <span className="stat-value">{stats.totalOvertimeHours || 0} hrs</span>
                <span className="stat-trend">This Month</span>
              </div>
            </div>
            <div className="stat-card stat-late">
              <div className="stat-icon-wrapper">
                <AlertCircle size={28} />
              </div>
              <div className="stat-content">
                <span className="stat-label">Late Arrivals</span>
                <span className="stat-value">{stats.lateArrivals || 0}</span>
                <span className="stat-trend">This Month</span>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="attendance-filters">
          <div className="view-mode-tabs">
            <button
              className={viewMode === 'daily' ? 'tab active' : 'tab'}
              onClick={() => setViewMode('daily')}
            >
              Daily View
            </button>
            <button
              className={viewMode === 'weekly' ? 'tab active' : 'tab'}
              onClick={() => setViewMode('weekly')}
            >
              Weekly View
            </button>
            <button
              className={viewMode === 'monthly' ? 'tab active' : 'tab'}
              onClick={() => setViewMode('monthly')}
            >
              Monthly View
            </button>
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="date-picker"
          />
        </div>

        {/* Attendance Table */}
        <div className="attendance-table-container">
          {loading ? (
            <div className="loading-state">Loading...</div>
          ) : attendances.length === 0 ? (
            <div className="empty-state">
              <Clock size={48} />
              <h3>No attendance records found</h3>
              <p>Check in to start tracking attendance</p>
            </div>
          ) : (
            <table className="attendance-table">
              <thead>
                <tr>
                  {isAdmin && <th>Employee</th>}
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Work Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {attendances.map((attendance) => (
                  <tr key={attendance._id}>
                    {isAdmin && (
                      <td>
                        <div className="employee-cell">
                          <div className="employee-avatar">
                            {attendance.userId?.profile?.firstName?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="employee-name">
                              {attendance.userId?.profile?.firstName} {attendance.userId?.profile?.lastName}
                            </div>
                            <div className="employee-email">{attendance.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                    )}
                    <td className="date-cell">{formatDate(attendance.date)}</td>
                    <td className="time-cell">{formatTime(attendance.checkIn)}</td>
                    <td className="time-cell">{formatTime(attendance.checkOut)}</td>
                    <td className="hours-cell">
                      {attendance.workHours ? `${attendance.workHours} hrs` : '-'}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(attendance.status)}>
                        {attendance.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="notes-cell">{attendance.notes || '-'}</td>
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
    </div>
  );
};

export default AttendanceManagement;
