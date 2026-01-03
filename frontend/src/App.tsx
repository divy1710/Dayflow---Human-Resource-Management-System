import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Dashboard from './pages/DashboardNew';
import EmployeeManagement from './pages/employee/EmployeeManagement';
import LeaveManagement from './pages/leave/LeaveManagement';
import AttendanceManagement from './pages/attendance/AttendanceManagement';
import ProfilePage from './pages/profile/ProfilePage';
import SalaryManagement from './pages/salary/SalaryManagement';
import './App.css';

function App() {
  const { isAuthenticated } = useAuthStore();

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
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/employees" 
          element={isAuthenticated ? <EmployeeManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/leave" 
          element={isAuthenticated ? <LeaveManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/attendance" 
          element={isAuthenticated ? <AttendanceManagement /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/profile" 
          element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/salary" 
          element={isAuthenticated ? <SalaryManagement /> : <Navigate to="/login" />} 
        />
        <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
