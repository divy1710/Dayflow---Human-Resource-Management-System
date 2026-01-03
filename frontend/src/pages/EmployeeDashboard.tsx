import { useAuthStore } from '../stores';
import { Link } from 'react-router-dom';
import { 
  User, Calendar, Clock, FileText, LogOut, 
  CheckCircle, AlertCircle, TrendingUp
} from 'lucide-react';
import './EmployeeDashboard.css';

const EmployeeDashboard = () => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="employee-dashboard">
      {/* Header */}
      <header className="employee-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Welcome back, {user?.profile?.firstName || 'Employee'}!</h1>
            <p>Have a productive day at work</p>
          </div>
          <button className="logout-btn" onClick={handleSignOut}>
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="employee-main">
        <div className="quick-access-grid">
          {/* Profile Card */}
          <Link to="/profile" className="quick-card profile-card">
            <div className="card-icon profile-icon">
              <User size={32} />
            </div>
            <div className="card-content">
              <h3>My Profile</h3>
              <p>View and edit your personal information</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>

          {/* Attendance Card */}
          <Link to="/attendance" className="quick-card attendance-card">
            <div className="card-icon attendance-icon">
              <Clock size={32} />
            </div>
            <div className="card-content">
              <h3>Attendance</h3>
              <p>Check-in, check-out, and view records</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>

          {/* Leave Card */}
          <Link to="/leave" className="quick-card leave-card">
            <div className="card-icon leave-icon">
              <Calendar size={32} />
            </div>
            <div className="card-content">
              <h3>Leave Requests</h3>
              <p>Apply for leave and track status</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>

          {/* Salary Card */}
          <Link to="/profile" className="quick-card salary-card">
            <div className="card-icon salary-icon">
              <FileText size={32} />
            </div>
            <div className="card-content">
              <h3>Salary Details</h3>
              <p>View your salary structure</p>
            </div>
            <div className="card-arrow">→</div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="activity-section">
          <h2>Recent Activity</h2>
          <div className="activity-cards">
            <div className="activity-card">
              <div className="activity-icon success">
                <CheckCircle size={24} />
              </div>
              <div className="activity-info">
                <h4>Attendance Marked</h4>
                <p>You checked in today at 9:00 AM</p>
                <span className="activity-time">Today</span>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon pending">
                <AlertCircle size={24} />
              </div>
              <div className="activity-info">
                <h4>Leave Request Pending</h4>
                <p>Your leave request is awaiting approval</p>
                <span className="activity-time">2 days ago</span>
              </div>
            </div>
            <div className="activity-card">
              <div className="activity-icon info">
                <TrendingUp size={24} />
              </div>
              <div className="activity-info">
                <h4>Profile Updated</h4>
                <p>Contact information successfully updated</p>
                <span className="activity-time">5 days ago</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="stats-section">
          <h2>Quick Stats</h2>
          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-value">98%</div>
              <div className="stat-label">Attendance Rate</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">12</div>
              <div className="stat-label">Leave Days Available</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">160</div>
              <div className="stat-label">Hours This Month</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">0</div>
              <div className="stat-label">Pending Requests</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboard;
