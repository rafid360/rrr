import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load all pages for better performance
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const AdminLayout = lazy(() => import('./components/AdminLayout'));
const AdminUsers = lazy(() => import('./pages/AdminUsers'));
const AdminPackages = lazy(() => import('./pages/AdminPackages'));
const AdminPayments = lazy(() => import('./pages/AdminPayments'));
const AdminTransactions = lazy(() => import('./pages/AdminTransactions'));
const UserLayout = lazy(() => import('./components/UserLayout'));
const UserHome = lazy(() => import('./pages/UserHome'));
const UserPackage = lazy(() => import('./pages/UserPackage'));
const UserAccount = lazy(() => import('./pages/UserAccount'));
const UserSettings = lazy(() => import('./pages/UserSettings'));
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'));

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen text-neutral-300">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-300"></div>
      <p className="mt-2">Loading...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <Suspense fallback={<PageLoader />}>
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
    </Suspense>
  );
}
