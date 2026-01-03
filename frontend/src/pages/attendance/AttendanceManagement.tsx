import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores';
import { attendanceService } from '../../services';
import type { Attendance } from '../../types';
import { 
  Calendar, Clock, LogIn, LogOut as LogOutIcon, Search, Filter,
  ChevronLeft, ChevronRight, CheckCircle, XCircle, User, FileText,
  Users, Briefcase, DollarSign, Settings, HelpCircle, UserPlus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Attendance.css';

const AttendanceManagement = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';
  
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const itemsPerPage = 10;

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  useEffect(() => {
    fetchAttendance();
    fetchTodayAttendance();
  }, [currentPage, selectedDate, viewMode]);

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
    } catch (error) {
      console.error('Failed to fetch today attendance:', error);
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
          startDate: viewMode === 'weekly' ? getWeekStart(selectedDate) : undefined,
          endDate: viewMode === 'weekly' ? getWeekEnd(selectedDate) : undefined
        });
        setAttendances(response.data.attendances);
        setTotalPages(response.data.pagination.pages);
      } else {
        const response = await attendanceService.getMyAttendance({
          page: currentPage,
          limit: itemsPerPage,
          startDate: viewMode === 'weekly' ? getWeekStart(selectedDate) : selectedDate,
          endDate: viewMode === 'weekly' ? getWeekEnd(selectedDate) : selectedDate
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

  const handleCheckIn = async () => {
    try {
      await attendanceService.checkIn();
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      await attendanceService.checkOut();
      fetchTodayAttendance();
      fetchAttendance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check out');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'status-badge status-present';
      case 'ABSENT': return 'status-badge status-absent';
      case 'HALF_DAY': return 'status-badge status-halfday';
      case 'LEAVE': return 'status-badge status-leave';
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

  const calculateStats = () => {
    const present = attendances.filter(a => a.status === 'PRESENT').length;
    const absent = attendances.filter(a => a.status === 'ABSENT').length;
    const halfDay = attendances.filter(a => a.status === 'HALF_DAY').length;
    const leave = attendances.filter(a => a.status === 'LEAVE').length;
    const total = attendances.length;
    const rate = total > 0 ? ((present + halfDay * 0.5) / total * 100).toFixed(1) : '0';
    
    return { present, absent, halfDay, leave, total, rate };
  };

  const stats = calculateStats();

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
          <a href="#" className="nav-item">
            <UserPlus size={18} />
            <span>Recruitment</span>
          </a>
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
        <div className="stats-summary">
          <div className="stat-card stat-present">
            <CheckCircle size={24} />
            <div className="stat-content">
              <span className="stat-value">{stats.present}</span>
              <span className="stat-label">Present</span>
            </div>
          </div>
          <div className="stat-card stat-absent">
            <XCircle size={24} />
            <div className="stat-content">
              <span className="stat-value">{stats.absent}</span>
              <span className="stat-label">Absent</span>
            </div>
          </div>
          <div className="stat-card stat-halfday">
            <Clock size={24} />
            <div className="stat-content">
              <span className="stat-value">{stats.halfDay}</span>
              <span className="stat-label">Half Day</span>
            </div>
          </div>
          <div className="stat-card stat-rate">
            <Calendar size={24} />
            <div className="stat-content">
              <span className="stat-value">{stats.rate}%</span>
              <span className="stat-label">Attendance Rate</span>
            </div>
          </div>
        </div>

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
