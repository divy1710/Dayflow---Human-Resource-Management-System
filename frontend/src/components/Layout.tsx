import { useAuthStore } from '../stores';
import { Link, useLocation } from 'react-router-dom';
import '../pages/DashboardNew.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
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
          <Link to="/dashboard" className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/employees" className={`nav-item ${location.pathname === '/employees' ? 'active' : ''}`}>
            Employees
          </Link>
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

        {/* Page Content */}
        <main className="dashboard-main">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
