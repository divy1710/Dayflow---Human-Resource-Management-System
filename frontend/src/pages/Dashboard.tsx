import { useAuthStore } from '../stores';
import { LogOut, User, Calendar, FileText } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  const { user, signOut } = useAuthStore();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-logo">
          <span>DayFlow</span>
        </div>
        <div className="header-user">
          <span>Welcome, {user?.profile?.firstName || 'User'}</span>
          <button onClick={handleSignOut} className="logout-btn">
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome to DayFlow HRMS</p>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon">
              <User size={32} />
            </div>
            <h3>Profile</h3>
            <p>View and manage your profile</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <Calendar size={32} />
            </div>
            <h3>Attendance</h3>
            <p>Track your daily attendance</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">
              <FileText size={32} />
            </div>
            <h3>Leave Requests</h3>
            <p>Apply for leave and time-off</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
