import { useAuthStore } from '../stores';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { employeeService, leaveService, attendanceService } from '../services';
import { 
  Users, UserPlus, Search, Bell, TrendingUp, AlertCircle,
  Briefcase, CheckCircle, Calendar, FileText, DollarSign,
  Settings, HelpCircle, MoreHorizontal, Play, Cake, Award, LogOut
} from 'lucide-react';
import './DashboardNew.css';

const Dashboard = () => {
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({
    totalEmployees: 0,
    pendingRequests: 0,
    activeProjects: 23,
    attendanceRate: 0
  });
  const [recentEmployees, setRecentEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch employees for total count and recent list
      const empResponse = await employeeService.getAllEmployees({ page: 1, limit: 5 });
      setRecentEmployees(empResponse.employees || []);
      
      // Fetch leave requests for pending count
      const leaveResponse = await leaveService.getAllLeaves({ status: 'PENDING', page: 1, limit: 1 });
      
      // Fetch attendance for rate calculation
      const today = new Date().toISOString().split('T')[0];
      const attResponse = await attendanceService.getAllAttendance({ date: today, page: 1, limit: 100 });
      
      const totalAtts = attResponse.data?.attendances?.length || 0;
      const presentCount = attResponse.data?.attendances?.filter((a: any) => 
        a.status === 'PRESENT' || a.status === 'HALF_DAY'
      ).length || 0;
      const rate = totalAtts > 0 ? Math.round((presentCount / totalAtts) * 100) : 96;
      
      setStats({
        totalEmployees: empResponse.total || 0,
        pendingRequests: leaveResponse.data?.pagination?.total || 0,
        activeProjects: 23,
        attendanceRate: rate
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const handleAddEmployee = () => {
    navigate('/employees');
    setTimeout(() => {
      const addButton = document.querySelector('.btn-primary') as HTMLButtonElement;
      if (addButton) {
        addButton.click();
      }
    }, 100);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/employees?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  const currentDate = new Date().toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  });

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
              <h2>Admin/HR Portal</h2>
              <p>Admin Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item active">
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
          <Link to="/salary" className="nav-item">
            <DollarSign size={18} />
            <span>Payroll</span>
          </Link>
          <Link to="/leave" className="nav-item">
            <Calendar size={18} />
            <span>Leave</span>
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
              {user?.profile?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">{user?.profile?.firstName || 'Admin'}</p>
              <p className="user-role">Admin/HR</p>
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
              placeholder="Search employees, departments..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
          <div className="header-actions">
            <button className="add-employee-btn" onClick={handleAddEmployee}>
              <UserPlus size={20} />
              Add Employee
            </button>
            <button className="notification-btn" onClick={() => navigate('/leave')}>
              <Bell size={20} />
              <span className="notification-badge">{stats.pendingRequests}</span>
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
                <Users size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Total Employees</p>
                <h3 className="stat-value">{loading ? '...' : stats.totalEmployees}</h3>
                <span className="stat-trend positive">
                  <TrendingUp size={14} />
                  Active
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Pending Requests</p>
                <h3 className="stat-value">{loading ? '...' : stats.pendingRequests}</h3>
                <span className="stat-alert">
                  <AlertCircle size={14} />
                  Requires Attention
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon purple">
                <Briefcase size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Active Projects</p>
                <h3 className="stat-value">{stats.activeProjects}</h3>
                <span className="stat-info">Ongoing</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Attendance Rate</p>
                <h3 className="stat-value">{loading ? '...' : stats.attendanceRate}%</h3>
                <span className="stat-info today">Today</span>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            {/* Recent Employees */}
            <div className="section-card wide">
              <div className="section-header">
                <h2>Recent Employees</h2>
                <button onClick={() => navigate('/employees')} className="view-all">View All</button>
              </div>
              {loading ? (
                <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
              ) : recentEmployees.length > 0 ? (
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>EMPLOYEE</th>
                      <th>ROLE</th>
                      <th>DEPARTMENT</th>
                      <th>CONTACT</th>
                      <th>STATUS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentEmployees.map((emp: any) => (
                      <tr key={emp.id}>
                        <td>
                          <div className="employee-cell">
                            <div className="employee-avatar">
                              {(emp.profile?.firstName?.[0] || 'U').toUpperCase()}
                            </div>
                            <span>{emp.profile?.firstName} {emp.profile?.lastName}</span>
                          </div>
                        </td>
                        <td>{emp.profile?.jobTitle || 'N/A'}</td>
                        <td>{emp.profile?.department || 'N/A'}</td>
                        <td>{emp.email}</td>
                        <td><span className="status-badge active">Active</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '2rem', textAlign: 'center' }}>No employees found</div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="section-card narrow">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <button className="action-btn" onClick={handleAddEmployee}>
                  <div className="action-icon blue">
                    <UserPlus size={20} />
                  </div>
                  <span>Add Staff</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/leave')}>
                  <div className="action-icon green">
                    <CheckCircle size={20} />
                  </div>
                  <span>Approve Leave</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/salary')}>
                  <div className="action-icon purple">
                    <DollarSign size={20} />
                  </div>
                  <span>Run Payroll</span>
                </button>
                <button className="action-btn" onClick={() => navigate('/reports')}>
                  <div className="action-icon orange">
                    <FileText size={20} />
                  </div>
                  <span>Reports</span>
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            {/* Celebrations */}
            <div className="section-card full-width">
              <div className="section-header">
                <h2>Team Celebrations</h2>
              </div>
              <div className="celebrations">
                <div className="celebration-item">
                  <div className="celebration-avatar">
                    <Cake size={16} />
                  </div>
                  <div className="celebration-info">
                    <p className="celebration-name">Upcoming Birthdays</p>
                    <p className="celebration-event">Check team calendar</p>
                  </div>
                </div>
                <div className="celebration-item">
                  <div className="celebration-avatar blue">
                    <Award size={16} />
                  </div>
                  <div className="celebration-info">
                    <p className="celebration-name">Work Anniversaries</p>
                    <p className="celebration-event">View milestones</p>
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

export default Dashboard;
