import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Users, Briefcase, Calendar, DollarSign,
  Settings, HelpCircle, LogOut, UserPlus, FileText
} from 'lucide-react';
import { useAuthStore } from '../stores';
import './Layout.css';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, signOut } = useAuthStore();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
  };

  const isActive = (path: string) => location.pathname === path;

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
          <Link to="/dashboard" className={`nav-item ${isActive('/dashboard') ? 'active' : ''}`}>
            <Briefcase size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/employees" className={`nav-item ${isActive('/employees') ? 'active' : ''}`}>
            <Users size={18} />
            <span>Employees</span>
          </Link>
          <Link to="/attendance" className={`nav-item ${isActive('/attendance') ? 'active' : ''}`}>
            <Calendar size={18} />
            <span>Attendance</span>
          </Link>
          <a href="#" className="nav-item">
            <UserPlus size={18} />
            <span>Recruitment</span>
          </a>
          <Link to="/salary" className={`nav-item ${isActive('/salary') ? 'active' : ''}`}>
            <DollarSign size={18} />
            <span>Payroll</span>
          </Link>
          <Link to="/leave" className={`nav-item ${isActive('/leave') ? 'active' : ''}`}>
            <FileText size={18} />
            <span>Leave</span>
          </Link>
          <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <Users size={18} />
            <span>Profile</span>
          </Link>
          <Link to="/reports" className={`nav-item ${isActive('/reports') ? 'active' : ''}`}>
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

        {/* User Profile at Bottom */}
        <div className="sidebar-user">
          <div className="user-info">
            <div className="user-avatar-small">
              {user?.profile?.firstName?.charAt(0) || user?.firstName?.charAt(0) || 'A'}
            </div>
            <div className="user-details">
              <p className="user-name">
                {user?.profile?.firstName || user?.firstName || 'Admin'}
              </p>
              <p className="user-role">
                {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'HR' ? 'HR Manager' : 'Employee'}
              </p>
            </div>
          </div>
          <button className="logout-icon-btn" onClick={handleSignOut} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="dashboard-main-wrapper">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
