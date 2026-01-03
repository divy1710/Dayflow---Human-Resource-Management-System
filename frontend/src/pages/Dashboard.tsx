import { useAuthStore } from '../stores';
import { Link, useLocation } from 'react-router-dom';
import { 
  LogOut, Users, DollarSign, Clock, Briefcase, 
  Palmtree, MapPin, Building2, FileText, UserPlus,
  Cake, Gift, Calendar, Calculator, Download,
  TrendingUp, CreditCard, UserMinus2
} from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>HR Dashboard</h2>
          <p>Manage Employees & Data</p>
        </div>
        <nav className="sidebar-nav">
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>Home</Link>
          <Link to="/employees" className={`nav-item ${location.pathname === '/employees' ? 'active' : ''}`}>Employees</Link>
          <a href="#" className="nav-item">Salaries</a>
          <a href="#" className="nav-item">Attendance</a>
          <a href="#" className="nav-item">Payroll</a>
          <a href="#" className="nav-item">Holidays</a>
          <a href="#" className="nav-item">Sites</a>
          <a href="#" className="nav-item">Departments</a>
          <a href="#" className="nav-item">Notes</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main-wrapper">
        {/* Top Bar */}
        <header className="dashboard-header">
          <div className="header-welcome">
            <div className="user-avatar">
              <span>{user?.profile?.firstName?.charAt(0) || 'A'}</span>
            </div>
            <span>Welcome, {user?.profile?.firstName || 'User'}</span>
          </div>
          <div className="header-actions">
            <span className="user-email">Email: {user?.email}</span>
            <button onClick={handleSignOut} className="logout-btn">
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="dashboard-main">
          {/* Birthdays Section */}
          <div className="birthdays-section">
            <div className="birthday-card upcoming">
              <div className="birthday-header">
                <Cake size={20} />
                <h3>Upcoming Birthdays</h3>
              </div>
              <div className="birthday-item">
                <div className="birthday-info">
                  <p className="birthday-name">John Doe</p>
                  <p className="birthday-date">Dec 10, 2025</p>
                </div>
                <span className="birthday-badge">+3 days</span>
              </div>
            </div>

            <div className="birthday-card recent">
              <div className="birthday-header">
                <Gift size={20} />
                <h3>Recent Birthdays</h3>
              </div>
              <p className="no-birthdays">No recent birthdays</p>
            </div>

            <div className="birthday-title">
              <Cake size={32} />
              <h2>Birthdays</h2>
            </div>
          </div>

          {/* Employees Management */}
          <div className="section-card">
            <div className="section-header">
              <Users size={24} />
              <h2>Employees Management</h2>
            </div>
            <div className="section-grid">
              <div className="feature-card purple">
                <div className="feature-content">
                  <h3>Add New Employee</h3>
                  <p>Creating new employee record</p>
                </div>
                <div className="feature-icon">
                  <UserPlus size={20} />
                </div>
              </div>

              <div className="mini-card green">
                <h4>Total Sites</h4>
                <p>Project locations</p>
              </div>

              <div className="mini-card pink">
                <h4>Departments</h4>
                <p>Active teams</p>
              </div>

              <div className="mini-card blue">
                <h4>All Employees</h4>
                <p>Total active employees</p>
              </div>

              <div className="mini-card yellow">
                <h4>Site Employees</h4>
                <p>Staff working onsite</p>
              </div>
            </div>
          </div>

          {/* Salary Management */}
          <div className="section-card">
            <div className="section-header">
              <DollarSign size={24} />
              <h2>Salary Management</h2>
            </div>
            <div className="section-grid">
              <div className="feature-card green-outline">
                <div className="feature-content">
                  <h3>Payroll History Records</h3>
                  <p>Viewing history, preview payslip model</p>
                </div>
                <div className="feature-icon">
                  <FileText size={20} />
                </div>
              </div>

              <div className="mini-card blue">
                <h4>Payroll Overview</h4>
                <p>Smart editable salary computation</p>
              </div>

              <div className="mini-card green">
                <h4>Bulk download Payslips</h4>
                <p>Monthly salary slips will be there in History</p>
              </div>

              <div className="mini-card light-green">
                <h4>Salary Structure</h4>
                <p>Define pay components</p>
              </div>

              <div className="mini-card purple">
                <h4>Advances & Deductions</h4>
                <p>Will be added soon</p>
              </div>
            </div>
          </div>

          {/* Attendance Management */}
          <div className="section-card">
            <div className="section-header">
              <Clock size={24} />
              <h2>Attendance Management</h2>
            </div>
            <div className="section-grid half">
              <div className="mini-card orange">
                <h4>View Attendance</h4>
                <p>All records overview</p>
              </div>

              <div className="mini-card blue">
                <h4>Holidays Management</h4>
                <p>Adding updating holidays</p>
              </div>
            </div>
          </div>

          {/* Other Features */}
          <div className="section-card">
            <div className="section-header">
              <Briefcase size={24} />
              <h2>Other features</h2>
            </div>
            <div className="section-grid half">
              <div className="mini-card orange">
                <h4>Salary Calculator</h4>
                <p>Before assigning rough calculation</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
