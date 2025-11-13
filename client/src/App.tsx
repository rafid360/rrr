import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminLayout from './components/AdminLayout';
import AdminUsers from './pages/AdminUsers';
import AdminPackages from './pages/AdminPackages';
import AdminPayments from './pages/AdminPayments';
import AdminTransactions from './pages/AdminTransactions';
import UserLayout from './components/UserLayout';
import UserHome from './pages/UserHome';
import UserPackage from './pages/UserPackage';
import UserAccount from './pages/UserAccount';
import UserSettings from './pages/UserSettings';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute role="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="users" replace />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="packages" element={<AdminPackages />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="transactions" element={<AdminTransactions />} />
      </Route>
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute role="user">
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="home" replace />} />
        <Route path="home" element={<UserHome />} />
        <Route path="package" element={<UserPackage />} />
        <Route path="account" element={<UserAccount />} />
        <Route path="settings" element={<UserSettings />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
