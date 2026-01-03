import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Calendar, Clock, FileText, LogOut, 
  CheckCircle, AlertCircle, TrendingUp, Bell, DollarSign,
  Search, Settings, HelpCircle, Briefcase, Users
} from 'lucide-react';
import { attendanceService, leaveService } from '../services';
import type { Attendance, LeaveRequest } from '../types';
import './DashboardNew.css';

const EmployeeDashboard = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [recentLeaves, setRecentLeaves] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Fetch today's attendance
      const attResponse = await attendanceService.getMyAttendance({
        startDate: today.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      });
      const todayRec = attResponse.data.attendances.find(a => 
        new Date(a.date).toDateString() === today.toDateString()
      );
      setTodayAttendance(todayRec || null);

      // Fetch attendance stats
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      const statsResponse = await attendanceService.getStats({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0],
      });
      setStats(statsResponse.data.stats);

      // Fetch recent leaves
      const leaveResponse = await leaveService.getMyLeaveRequests();
      setRecentLeaves(leaveResponse.data.leaves.slice(0, 3));
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Employee search can navigate to attendance or leave
    if (searchTerm.trim()) {
      navigate(`/attendance?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return `${Math.floor(diffInDays / 30)} months ago`;
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
          <Link to="/dashboard" className="nav-item active">
            <Briefcase size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/profile" className="nav-item">
            <User size={18} />
            <span>My Profile</span>
          </Link>
          <Link to="/attendance" className="nav-item">
            <Clock size={18} />
            <span>Attendance</span>
          </Link>
          <Link to="/leave" className="nav-item">
            <Calendar size={18} />
            <span>Leave Requests</span>
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

        {/* User Profile at Bottom */}
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
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main-wrapper">
        {/* Top Bar */}
        <header className="dashboard-header">
          <form className="search-bar" onSubmit={handleSearch}>
            <Search size={20} />
            <input 
              type="text" 
              placeholder="Search attendance, leave requests..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <div className="header-actions">
            <button className="notification-btn" onClick={() => navigate('/leave')}>
              <Bell size={20} />
              {stats?.pendingLeaves > 0 && (
                <span className="notification-badge">{stats.pendingLeaves}</span>
              )}
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Overview Header */}
          <div className="overview-header">
            <div>
              <h1>Overview</h1>
              <p className="overview-subtitle">Welcome back, here's what's happening today.</p>
            </div>
            <div className="overview-date">
              <Calendar size={16} />
              <span>{currentDate}</span>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon blue">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Attendance Rate</p>
                <h3 className="stat-value">
                  {loading ? '...' : stats?.attendanceRate ? `${Math.round(stats.attendanceRate)}%` : 'N/A'}
                </h3>
                <span className="stat-trend positive">
                  <TrendingUp size={14} />
                  This Month
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Leave Days Used</p>
                <h3 className="stat-value">
                  {loading ? '...' : stats?.totalLeaveDays || 0}
                </h3>
                <span className="stat-info">This Month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Clock size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Hours Worked</p>
                <h3 className="stat-value">
                  {loading ? '...' : stats?.totalHoursWorked ? `${Math.round(stats.totalHoursWorked)}h` : '0h'}
                </h3>
                <span className="stat-info">This Month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Pending Requests</p>
                <h3 className="stat-value">
                  {loading ? '...' : stats?.pendingLeaves || 0}
                </h3>
                <span className="stat-alert">
                  <AlertCircle size={14} />
                  Awaiting Approval
                </span>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            {/* Recent Activity */}
            <div className="section-card wide">
              <div className="section-header">
                <h2>Recent Activity</h2>
                <Link to="/attendance" className="view-all">View All</Link>
              </div>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
              ) : (
                <div className="activity-list">
                  {todayAttendance && todayAttendance.checkIn && (
                    <div className="activity-item">
                      <div className="activity-icon-small success">
                        <CheckCircle size={16} />
                      </div>
                      <div className="activity-details">
                        <p className="activity-title">Attendance Marked</p>
                        <p className="activity-desc">
                          Checked in at {new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          {todayAttendance.lateArrival && todayAttendance.lateArrival > 0 && (
                            <span className="late-badge"> • Late by {Math.floor(todayAttendance.lateArrival / 60)}h {todayAttendance.lateArrival % 60}m</span>
                          )}
                        </p>
                      </div>
                      <span className="activity-timestamp">Today</span>
                    </div>
                  )}
                  {!todayAttendance?.checkIn && (
                    <div className="activity-item">
                      <div className="activity-icon-small alert">
                        <AlertCircle size={16} />
                      </div>
                      <div className="activity-details">
                        <p className="activity-title">Not Checked In</p>
                        <p className="activity-desc">Don't forget to mark your attendance for today</p>
                      </div>
                      <Link to="/attendance" className="activity-action">Check In</Link>
                    </div>
                  )}
                  {recentLeaves.length > 0 ? (
                    recentLeaves.map((leave) => (
                      <div className="activity-item" key={leave._id}>
                        <div className={`activity-icon-small ${
                          leave.status === 'APPROVED' ? 'success' : 
                          leave.status === 'REJECTED' ? 'error' : 'pending'
                        }`}>
                          <Calendar size={16} />
                        </div>
                        <div className="activity-details">
                          <p className="activity-title">Leave Request {leave.status}</p>
                          <p className="activity-desc">
                            {leave.leaveType} - {new Date(leave.startDate).toLocaleDateString()} to {new Date(leave.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="activity-timestamp">{getTimeAgo(leave.createdAt)}</span>
                      </div>
                    ))
                  ) : (
                    !todayAttendance?.checkIn && (
                      <div className="activity-item">
                        <div className="activity-icon-small info">
                          <TrendingUp size={16} />
                        </div>
                        <div className="activity-details">
                          <p className="activity-title">No Recent Activity</p>
                          <p className="activity-desc">Your recent activities will appear here</p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="section-card narrow">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => navigate('/profile')}>
                  <div className="action-icon blue">
                    <User size={20} />
                  </div>
                  <span>My Profile</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/attendance')}>
                  <div className="action-icon green">
                    <CheckCircle size={20} />
                  </div>
                  <span>Mark Attendance</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/leave')}>
                  <div className="action-icon purple">
                    <Calendar size={20} />
                  </div>
                  <span>Apply Leave</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/profile')}>
                  <div className="action-icon orange">
                    <DollarSign size={20} />
                  </div>
                  <span>View Salary</span>
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            {/* Today's Status */}
            <div className="section-card full-width">
              <div className="section-header">
                <h2>Today's Status</h2>
              </div>
              <div className="celebrations">
                <div className="celebration-item">
                  <div className={`celebration-avatar ${todayAttendance?.checkIn ? 'green' : 'orange'}`}>
                    <Clock size={16} />
                  </div>
                  <div className="celebration-info">
                    <p className="celebration-name">
                      {todayAttendance?.checkIn ? 'Checked In' : 'Not Checked In'}
                    </p>
                    <p className="celebration-event">
                      {todayAttendance?.checkIn 
                        ? `At ${new Date(todayAttendance.checkIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`
                        : 'Mark your attendance now'
                      }
                    </p>
                  </div>
                </div>
                <div className="celebration-item">
                  <div className="celebration-avatar blue">
                    <CheckCircle size={16} />
                  </div>
                  <div className="celebration-info">
                    <p className="celebration-name">Work Status</p>
                    <p className="celebration-event">
                      {todayAttendance?.status || 'No status yet'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
