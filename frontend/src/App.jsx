import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import LoginPage from './pages/Login/LoginPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import ClientsPage from './pages/Clients/ClientsPage';
import LensesPage from './pages/Lenses/LensesPage';
import FramesPage from './pages/Frames/FramesPage';
import ServiceOrdersPage from './pages/ServiceOrders/ServiceOrdersPage';
import ServiceOrderForm from './pages/ServiceOrders/ServiceOrderForm';
import ServiceOrderPrint from './pages/ServiceOrders/ServiceOrderPrint';
import FinancialPage from './pages/Financial/FinancialPage';
import ReportsPage from './pages/Reports/ReportsPage';

function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/service-orders/:id/print" element={<ServiceOrderPrint />} />
          <Route
            path="/"
            element={
              <AuthGuard>
                <AppLayout />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="lenses" element={<LensesPage />} />
            <Route path="frames" element={<FramesPage />} />
            <Route path="service-orders" element={<ServiceOrdersPage />} />
            <Route path="service-orders/new" element={<ServiceOrderForm />} />
            <Route path="service-orders/:id/edit" element={<ServiceOrderForm />} />
            <Route path="financial" element={<FinancialPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
