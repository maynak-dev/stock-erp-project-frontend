import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import LocationsPage from './pages/LocationsPage';
import ShopsPage from './pages/ShopsPage';
import ProductsPage from './pages/ProductsPage';
import StockPage from './pages/StockPage';
import ExpiryPage from './pages/ExpiryPage';
import ReturnsPage from './pages/ReturnsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="dashboard" element={<DashboardPage />} />

            {/* Companies – only SUPER_ADMIN and COMPANY_ADMIN */}
            <Route
              path="companies"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN']}>
                  <CompaniesPage />
                </ProtectedRoute>
              }
            />

            {/* Locations – add LOCATION_MANAGER */}
            <Route
              path="locations"
              element={
                <ProtectedRoute
                  allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN', 'LOCATION_MANAGER']}
                >
                  <LocationsPage />
                </ProtectedRoute>
              }
            />

            {/* Shops – add SHOP_OWNER */}
            <Route
              path="shops"
              element={
                <ProtectedRoute
                  allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN', 'LOCATION_MANAGER', 'SHOP_OWNER']}
                >
                  <ShopsPage />
                </ProtectedRoute>
              }
            />

            {/* Products – accessible to all authenticated users */}
            <Route
              path="products"
              element={
                <ProtectedRoute allowedRoles={['*']}>
                  <ProductsPage />
                </ProtectedRoute>
              }
            />

            {/* Stock – accessible to all authenticated users */}
            <Route
              path="stock"
              element={
                <ProtectedRoute allowedRoles={['*']}>
                  <StockPage />
                </ProtectedRoute>
              }
            />

            {/* Expiry – accessible to all authenticated users */}
            <Route
              path="expiry"
              element={
                <ProtectedRoute allowedRoles={['*']}>
                  <ExpiryPage />
                </ProtectedRoute>
              }
            />

            {/* Returns – shop owners and above */}
            <Route
              path="returns"
              element={
                <ProtectedRoute
                  allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN', 'SHOP_OWNER']}
                >
                  <ReturnsPage />
                </ProtectedRoute>
              }
            />

            {/* Reports – accessible to all authenticated users (can be refined later) */}
            <Route
              path="reports"
              element={
                <ProtectedRoute allowedRoles={['*']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />

            {/* Users – admin only */}
            <Route
              path="users"
              element={
                <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'COMPANY_ADMIN', 'LOCATION_MANAGER']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;