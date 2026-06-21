import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Layout from './components/Layout';
import OrderEntry from './components/OrderEntry';
import OrderDisplay from './components/OrderDisplay';

function ProtectedRoute({ children, ownerOnly = false }: { children: React.ReactNode; ownerOnly?: boolean }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (ownerOnly && profile?.role !== 'owner') {
    return <Navigate to="/display" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/auth" element={user ? <Navigate to="/display" replace /> : <Auth />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/display" replace />} />
        <Route
          path="entry"
          element={
            <ProtectedRoute ownerOnly>
              <OrderEntry />
            </ProtectedRoute>
          }
        />
        <Route
          path="display"
          element={
            <ProtectedRoute>
              <OrderDisplay />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
