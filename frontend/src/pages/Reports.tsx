import { useState } from 'react';
import { useAuthStore } from '../stores';
import { Link } from 'react-router-dom';
import { 
  FileText, Download, Calendar, DollarSign, Clock, Users,
  TrendingUp, BarChart3, PieChart, Filter, Briefcase,
  Settings, HelpCircle, UserPlus, LogOut
} from 'lucide-react';
import './Reports.css';

const Reports = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'HR';
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const handleSignOut = async () => {
    const { signOut } = useAuthStore.getState();
    await signOut();
  };

  const reportTypes = [
    {
      id: 'attendance',
      name: 'Attendance Report',
      icon: Clock,
      description: 'Detailed attendance records with check-in/out times',
      color: '#10b981'
    },
    {
      id: 'leave',
      name: 'Leave Summary',
      icon: Calendar,
      description: 'Leave requests, approvals, and balance overview',
      color: '#f59e0b'
    },
    {
      id: 'salary',
      name: 'Salary Slips',
      icon: DollarSign,
      description: 'Monthly salary breakdowns and payment history',
      color: '#3b82f6'
    },
    {
      id: 'employee',
      name: 'Employee Directory',
      icon: Users,
      description: 'Complete employee information and demographics',
      color: '#667eea'
    }
  ];

  const handleGenerateReport = () => {
    if (!selectedReport) {
      alert('Please select a report type');
      return;
    }
    alert(`Generating ${reportTypes.find(r => r.id === selectedReport)?.name}...`);
    // In real implementation, this would call an API to generate PDF/Excel
  };

  return (
    <div className="reports-container">
      {/* Sidebar */}
      <aside className="reports-sidebar">
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
          <Link to="/attendance" className="nav-item">
            <Clock size={18} />
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
          <Link to="/profile" className="nav-item">
            <Users size={18} />
            <span>Profile</span>
          </Link>
          <Link to="/reports" className="nav-item active">
            <BarChart3 size={18} />
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
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="reports-main">
        <div className="reports-header">
          <div className="header-left">
            <h1>Reports & Analytics</h1>
            <p>Generate and download comprehensive reports</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#10b981' }}>
              <TrendingUp size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">95.5%</span>
              <span className="stat-label">Avg Attendance</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#f59e0b' }}>
              <Calendar size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">24</span>
              <span className="stat-label">Leave Requests</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#3b82f6' }}>
              <DollarSign size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">$125K</span>
              <span className="stat-label">Total Payroll</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#667eea' }}>
              <Users size={24} />
            </div>
            <div className="stat-info">
              <span className="stat-value">142</span>
              <span className="stat-label">Active Employees</span>
            </div>
          </div>
        </div>

        {/* Report Generator */}
        <div className="report-generator">
          <h2>Generate Report</h2>
          <div className="generator-form">
            <div className="form-group">
              <label>Report Type *</label>
              <select 
                value={selectedReport} 
                onChange={(e) => setSelectedReport(e.target.value)}
              >
                <option value="">Select a report type</option>
                {reportTypes.map(report => (
                  <option key={report.id} value={report.id}>
                    {report.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                />
              </div>
            </div>

            <button className="btn-generate" onClick={handleGenerateReport}>
              <Download size={20} />
              Generate & Download
            </button>
          </div>
        </div>

        {/* Available Reports */}
        <div className="available-reports">
          <h2>Available Reports</h2>
          <div className="report-cards">
            {reportTypes.map(report => (
              <div 
                key={report.id} 
                className="report-card"
                onClick={() => setSelectedReport(report.id)}
                style={{ borderLeftColor: report.color }}
              >
                <div className="report-icon" style={{ background: report.color }}>
                  <report.icon size={28} />
                </div>
                <div className="report-info">
                  <h3>{report.name}</h3>
                  <p>{report.description}</p>
                </div>
                <button className="btn-select">Select</button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reports */}
        <div className="recent-reports">
          <h2>Recent Reports</h2>
          <div className="reports-list">
            <div className="report-item">
              <FileText size={20} />
              <div className="report-details">
                <h4>Attendance Report - December 2025</h4>
                <p>Generated on Dec 31, 2025</p>
              </div>
              <button className="btn-download">
                <Download size={18} />
              </button>
            </div>
            <div className="report-item">
              <FileText size={20} />
              <div className="report-details">
                <h4>Salary Slips - December 2025</h4>
                <p>Generated on Dec 30, 2025</p>
              </div>
              <button className="btn-download">
                <Download size={18} />
              </button>
            </div>
            <div className="report-item">
              <FileText size={20} />
              <div className="report-details">
                <h4>Leave Summary - Q4 2025</h4>
                <p>Generated on Dec 28, 2025</p>
              </div>
              <button className="btn-download">
                <Download size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
