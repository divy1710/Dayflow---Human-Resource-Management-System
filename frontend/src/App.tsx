import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/DashboardNew';
import EmployeeDashboard from './pages/EmployeeDashboard';
import EmployeeManagement from './pages/employee/EmployeeManagement';
import LeaveManagement from './pages/leave/LeaveManagement';
import EmployeeLeave from './pages/leave/EmployeeLeave';
import AttendanceManagement from './pages/attendance/AttendanceManagement';
import EmployeeAttendance from './pages/attendance/EmployeeAttendance';
import ProfilePage from './pages/profile/ProfilePage';
import SalaryManagement from './pages/salary/SalaryManagement';
import Reports from './pages/Reports';
import './App.css';

function App() {
  const { isAuthenticated, user } = useAuthStore();

  const getDashboard = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    const isAdmin = user?.role === 'ADMIN';
    return isAdmin ? <Dashboard /> : <EmployeeDashboard />;
  };

  const getAttendancePage = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    const isAdmin = user?.role === 'ADMIN';
    return isAdmin ? <AttendanceManagement /> : <EmployeeAttendance />;
  };

  const getLeavePage = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    const isAdmin = user?.role === 'ADMIN';
    return isAdmin ? <LeaveManagement /> : <EmployeeLeave />;
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <SignIn /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <SignUp /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={getDashboard()} 
        />
        <Route 
          path="/employees" 
          element={isAuthenticated ? <EmployeeManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/leave" 
          element={getLeavePage()} 
        />
        <Route 
          path="/attendance" 
          element={getAttendancePage()} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/salary" 
          element={isAuthenticated ? <SalaryManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/reports" 
          element={isAuthenticated ? <Reports /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
