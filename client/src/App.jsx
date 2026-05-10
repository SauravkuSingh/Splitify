import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import CreateGroupPage from './pages/CreateGroupPage';
import GroupDetailPage from './pages/GroupDetailPage';
import CreateExpensePage from './pages/CreateExpensePage';
import MyGroupsPage from './pages/MyGroupsPage';
import RecentActivityPage from './pages/RecentActivityPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ScanReceiptPage from './pages/ScanReceiptPage';
import JoinGroupPage from './pages/JoinGroupPage';
import LoadingSpinner from './components/LoadingSpinner';

// Protected route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return user ? children : <Navigate to="/login" replace />;
};

// Public route
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
    <Route path="/join/:inviteToken" element={<JoinGroupPage />} />

    {/* Protected */}
    <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
    <Route path="/groups" element={<ProtectedRoute><MyGroupsPage /></ProtectedRoute>} />
    <Route path="/groups/new" element={<ProtectedRoute><CreateGroupPage /></ProtectedRoute>} />
    <Route path="/groups/:id" element={<ProtectedRoute><GroupDetailPage /></ProtectedRoute>} />
    <Route path="/groups/:id/expenses/new" element={<ProtectedRoute><CreateExpensePage /></ProtectedRoute>} />
    <Route path="/activity" element={<ProtectedRoute><RecentActivityPage /></ProtectedRoute>} />
    <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
    <Route path="/scan" element={<ProtectedRoute><ScanReceiptPage /></ProtectedRoute>} />

    {/* Fallback */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;