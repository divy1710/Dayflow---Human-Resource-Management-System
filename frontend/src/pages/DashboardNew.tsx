import { useAuthStore } from '../stores';
import { 
  Users, UserPlus, Search, Bell, TrendingUp, AlertCircle,
  Briefcase, CheckCircle, Calendar, FileText, DollarSign,
  Settings, HelpCircle, MoreHorizontal, Play, Cake, Award, LogOut
} from 'lucide-react';
import './DashboardNew.css';

const Dashboard = () => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
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
              <h2>HR Portal</h2>
              <p>Admin Dashboard</p>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <Briefcase size={18} />
            <span>Dashboard</span>
          </a>
          <a href="#" className="nav-item">
            <Users size={18} />
            <span>Employees</span>
          </a>
          <a href="#" className="nav-item">
            <UserPlus size={18} />
            <span>Recruitment</span>
          </a>
          <a href="#" className="nav-item">
            <DollarSign size={18} />
            <span>Payroll</span>
          </a>
          <a href="#" className="nav-item">
            <Calendar size={18} />
            <span>Leave</span>
          </a>
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
              <p className="user-role">Administrator</p>
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
          <div className="search-bar">
            <Search size={20} />
            <input type="text" placeholder="Search employees, departments..." />
          </div>
          <div className="header-actions">
            <button className="add-employee-btn">
              <UserPlus size={20} />
              Add Employee
            </button>
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
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
                <h3 className="stat-value">142</h3>
                <span className="stat-trend positive">
                  <TrendingUp size={14} />
                  +12%
                </span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon orange">
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Pending Requests</p>
                <h3 className="stat-value">8</h3>
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
                <p className="stat-label">Open Positions</p>
                <h3 className="stat-value">5</h3>
                <span className="stat-info">Across 3 departments</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon green">
                <CheckCircle size={24} />
              </div>
              <div className="stat-content">
                <p className="stat-label">Attendance Rate</p>
                <h3 className="stat-value">98%</h3>
                <span className="stat-info today">Today</span>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            {/* Recruitment Pipeline */}
            <div className="section-card wide">
              <div className="section-header">
                <h2>Recruitment Pipeline</h2>
                <a href="#" className="view-all">View All</a>
              </div>
              <div className="pipeline-stages">
                <div className="pipeline-stage">
                  <div className="stage-header">
                    <span className="stage-label">INTERVIEW</span>
                    <span className="stage-count">3</span>
                  </div>
                  <div className="candidate-card">
                    <div className="candidate-avatar">SJ</div>
                    <div className="candidate-info">
                      <p className="candidate-name">Sarah Jenkins</p>
                      <p className="candidate-role">UX Designer</p>
                      <p className="candidate-time">2:00 PM Today</p>
                    </div>
                  </div>
                </div>

                <div className="pipeline-stage">
                  <div className="stage-header">
                    <span className="stage-label">OFFER SENT</span>
                    <span className="stage-count">1</span>
                  </div>
                  <div className="candidate-card">
                    <div className="candidate-avatar blue">MC</div>
                    <div className="candidate-info">
                      <p className="candidate-name">Michael Chen</p>
                      <p className="candidate-role">Backend Dev</p>
                      <p className="candidate-status awaiting">Awaiting Response</p>
                    </div>
                  </div>
                </div>

                <div className="pipeline-stage">
                  <div className="stage-header">
                    <span className="stage-label">ONBOARDING</span>
                    <span className="stage-count">2</span>
                  </div>
                  <div className="candidate-card">
                    <div className="candidate-avatar green">EW</div>
                    <div className="candidate-info">
                      <p className="candidate-name">Emma Wilson</p>
                      <p className="candidate-role">Product Manager</p>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '80%'}}></div>
                      </div>
                      <p className="candidate-progress">80% Complete</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="section-card narrow">
              <div className="section-header">
                <h2>Quick Actions</h2>
              </div>
              <div className="quick-actions">
                <button className="action-btn">
                  <div className="action-icon blue">
                    <UserPlus size={20} />
                  </div>
                  <span>Add Staff</span>
                </button>
                <button className="action-btn">
                  <div className="action-icon green">
                    <CheckCircle size={20} />
                  </div>
                  <span>Approve Leave</span>
                </button>
                <button className="action-btn">
                  <div className="action-icon purple">
                    <Play size={20} />
                  </div>
                  <span>Run Payroll</span>
                </button>
                <button className="action-btn">
                  <div className="action-icon orange">
                    <FileText size={20} />
                  </div>
                  <span>Reports</span>
                </button>
              </div>
            </div>
          </div>

          <div className="dashboard-row">
            {/* New Hires */}
            <div className="section-card wide">
              <div className="section-header">
                <h2>New Hires</h2>
                <button className="more-btn">
                  <MoreHorizontal size={20} />
                </button>
              </div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>ROLE</th>
                    <th>DEPARTMENT</th>
                    <th>JOINED DATE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar">LB</div>
                        <span>Liam Brown</span>
                      </div>
                    </td>
                    <td>Marketing Lead</td>
                    <td>Marketing</td>
                    <td>Oct 20, 2023</td>
                    <td><span className="status-badge active">Active</span></td>
                  </tr>
                  <tr>
                    <td>
                      <div className="employee-cell">
                        <div className="employee-avatar purple">OS</div>
                        <span>Olivia Smith</span>
                      </div>
                    </td>
                    <td>Data Analyst</td>
                    <td>Engineering</td>
                    <td>Oct 18, 2023</td>
                    <td><span className="status-badge probation">Probation</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Celebrations */}
            <div className="section-card narrow">
              <div className="section-header">
                <h2>Celebrations</h2>
                <a href="#" className="view-all">View Calendar</a>
              </div>
              <div className="celebrations">
                <div className="celebration-item">
                  <div className="celebration-avatar">
                    <Cake size={16} />
                  </div>
                  <div className="celebration-info">
                    <p className="celebration-name">Sophia Miller</p>
                    <p className="celebration-event">Turning 28</p>
                  </div>
                  <span className="celebration-date">Today</span>
                </div>
                <div className="celebration-item">
                  <div className="celebration-avatar blue">
                    <Award size={16} />
                  </div>
                  <div className="celebration-info">
                    <p className="celebration-name">James Wilson</p>
                    <p className="celebration-event">5 Year Anniversary</p>
                  </div>
                  <span className="celebration-date">Oct 28</span>
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
