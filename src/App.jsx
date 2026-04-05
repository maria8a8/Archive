import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import DashboardLayout from './layouts/DashboardLayout';
import LoginPage from './pages/LoginPage';

import Dashboard from './pages/Dashboard';
import CourrierManagement from './pages/CourrierManagement';
import LigneManagement from './pages/LigneManagement';
import PosteManagement from './pages/PosteManagement';
import GlobalSearch from './pages/GlobalSearch';
import UserManagement from './pages/UserManagement';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Dashboard et Users réservés aux admins */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
              </Route>

              {/* Routes accessibles à tous les utilisateurs authentifiés */}
              <Route path="/courriers" element={<CourrierManagement />} />
              <Route path="/lignes" element={<LigneManagement />} />
              <Route path="/postes" element={<PosteManagement />} />
              <Route path="/search" element={<GlobalSearch />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
