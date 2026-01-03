import { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores';
import { attendanceService } from '../../services';
import type { Attendance } from '../../types';
import { 
  Calendar, Clock, LogIn, LogOut as LogOutIcon, Users, User,
  Briefcase, Settings, HelpCircle, Coffee, AlertCircle, 
  CheckCircle, TrendingUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import './Attendance.css';

const EmployeeAttendance = () => {
  const { user } = useAuthStore();
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [onBreak, setOnBreak] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  useEffect(() => {
    fetchTodayAttendance();
    fetchMyAttendance();
    fetchStats();
  }, []);

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

  const fetchMyAttendance = async () => {
    try {
      setLoading(true);
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const response = await attendanceService.getMyAttendance({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      });
      setAttendances(response.data.attendances);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      const response = await attendanceService.getStats({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      });
      setStats(response.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      const response = await attendanceService.checkIn({});
      // Immediately update the state with the returned attendance record
      setTodayAttendance(response.data.attendance);
      await fetchMyAttendance();
      await fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check in');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      const response = await attendanceService.checkOut({});
      // Immediately update the state with the returned attendance record
      setTodayAttendance(response.data.attendance);
      await fetchMyAttendance();
      await fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to check out');
    } finally {
      setCheckingOut(false);
    }
  };

  const handleStartBreak = async () => {
    try {
      const response = await attendanceService.startBreak();
      // Immediately update the state with the returned attendance record
      setTodayAttendance(response.data.attendance);
      setOnBreak(true);
      await fetchMyAttendance();
      await fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to start break');
    }
  };

  const handleEndBreak = async () => {
    try {
      const response = await attendanceService.endBreak();
      // Immediately update the state with the returned attendance record
      setTodayAttendance(response.data.attendance);
      setOnBreak(false);
      await fetchMyAttendance();
      await fetchStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to end break');
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
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
    const badges: Record<string, { label: string; className: string }> = {
      PRESENT: { label: 'Present', className: 'status-present' },
      ABSENT: { label: 'Absent', className: 'status-absent' },
      HALF_DAY: { label: 'Half Day', className: 'status-half-day' },
      LEAVE: { label: 'On Leave', className: 'status-leave' },
      WEEKEND: { label: 'Weekend', className: 'status-weekend' },
      HOLIDAY: { label: 'Holiday', className: 'status-holiday' },
    };
    const badge = badges[status] || { label: status, className: '' };
    return <span className={`status-badge ${badge.className}`}>{badge.label}</span>;
  };

  const getCurrentMonthName = () => {
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="portal-logo">
            <div className="logo-icon">
              <Users size={24} />
            </div>
            <div>
              <h2>Employee Portal</h2>
              <p>My Dashboard</p>
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
          <Link to="/attendance" className="nav-item active">
            <Clock size={18} />
            <span>Attendance</span>
          </Link>
          <Link to="/leave" className="nav-item">
            <Calendar size={18} />
            <span>Leave Requests</span>
          </Link>
        </nav>
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profile?.firstName?.charAt(0) || 'E'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.profile?.firstName || 'Employee'}</p>
              <p className="user-role">Employee</p>
            </div>
          </div>
          <button className="logout-icon-btn" onClick={handleSignOut} title="Logout">
            <LogOutIcon size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main-wrapper">
        <main className="dashboard-main">
          <div className="overview-header">
            <div>
              <h1>My Attendance</h1>
              <p className="overview-subtitle">Track your attendance and work hours</p>
            </div>
          </div>

          {/* Today's Status & Actions */}
          <div className="attendance-actions-card">
            <div className="today-status">
              <h3>Today's Status</h3>
              {todayAttendance ? (
                <div className="status-info">
                  <div className="status-row">
                    <span className="status-label">Status:</span>
                    {getStatusBadge(todayAttendance.status)}
                  </div>
                  {todayAttendance.checkIn && (
                    <div className="status-row">
                      <span className="status-label">Check-in:</span>
                      <span className="status-value">{formatTime(todayAttendance.checkIn)}</span>
                    </div>
                  )}
                  {todayAttendance.checkOut && (
                    <div className="status-row">
                      <span className="status-label">Check-out:</span>
                      <span className="status-value">{formatTime(todayAttendance.checkOut)}</span>
                    </div>
                  )}
                  {todayAttendance.workHours && (
                    <div className="status-row">
                      <span className="status-label">Work Hours:</span>
                      <span className="status-value">{todayAttendance.workHours.toFixed(2)} hrs</span>
                    </div>
                  )}
                  {todayAttendance.lateArrival && todayAttendance.lateArrival > 0 && (
                    <div className="status-row alert">
                      <AlertCircle size={16} />
                      <span>Late by {Math.floor(todayAttendance.lateArrival / 60)}h {todayAttendance.lateArrival % 60}m</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="status-info">
                  <p className="no-status">No attendance marked for today</p>
                </div>
              )}
            </div>

            <div className="action-buttons">
              {!todayAttendance?.checkIn ? (
                <button 
                  className="btn-check-in"
                  onClick={handleCheckIn}
                  disabled={checkingIn}
                >
                  <LogIn size={20} />
                  {checkingIn ? 'Checking In...' : 'Check In'}
                </button>
              ) : !todayAttendance?.checkOut ? (
                <>
                  {!onBreak ? (
                    <button 
                      className="btn-break"
                      onClick={handleStartBreak}
                    >
                      <Coffee size={20} />
                      Start Break
                    </button>
                  ) : (
                    <button 
                      className="btn-break-end"
                      onClick={handleEndBreak}
                    >
                      <Coffee size={20} />
                      End Break
                    </button>
                  )}
                  <button 
                    className="btn-check-out"
                    onClick={handleCheckOut}
                    disabled={checkingOut}
                  >
                    <LogOutIcon size={20} />
                    {checkingOut ? 'Checking Out...' : 'Check Out'}
                  </button>
                </>
              ) : (
                <div className="completed-status">
                  <CheckCircle size={24} />
                  <p>You've completed your day!</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon green">
                  <CheckCircle size={24} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Attendance Rate</p>
                  <h3 className="stat-value">{Math.round(stats.attendanceRate)}%</h3>
                  <span className="stat-trend positive">
                    <TrendingUp size={14} />
                    This Month
                  </span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon blue">
                  <Clock size={24} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Hours Worked</p>
                  <h3 className="stat-value">{Math.round(stats.totalHoursWorked)}h</h3>
                  <span className="stat-info">This Month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon orange">
                  <AlertCircle size={24} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Late Arrivals</p>
                  <h3 className="stat-value">{stats.lateDays || 0}</h3>
                  <span className="stat-info">This Month</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon purple">
                  <Calendar size={24} />
                </div>
                <div className="stat-content">
                  <p className="stat-label">Days Present</p>
                  <h3 className="stat-value">{stats.presentDays || 0}</h3>
                  <span className="stat-info">This Month</span>
                </div>
              </div>
            </div>
          )}

          {/* Attendance History */}
          <div className="section-card full-width">
            <div className="section-header">
              <h2>Attendance History - {getCurrentMonthName()}</h2>
            </div>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
            ) : attendances.length > 0 ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DATE</th>
                    <th>CHECK-IN</th>
                    <th>CHECK-OUT</th>
                    <th>WORK HOURS</th>
                    <th>BREAKS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {attendances.map((att) => (
                    <tr key={att._id}>
                      <td>{formatDate(att.date)}</td>
                      <td>{att.checkIn ? formatTime(att.checkIn) : '-'}</td>
                      <td>{att.checkOut ? formatTime(att.checkOut) : '-'}</td>
                      <td>{att.workHours ? `${att.workHours.toFixed(2)}h` : '-'}</td>
                      <td>{att.breaks?.length || 0}</td>
                      <td>{getStatusBadge(att.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '2rem', textAlign: 'center' }}>
                No attendance records found
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeAttendance;
