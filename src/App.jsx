import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/Auth/ProtectedRoute';
import Layout from './components/Layout/Layout';
import LoginPage      from './pages/LoginPage';
import DashboardPage  from './pages/DashboardPage';
import CompaniesPage  from './pages/CompaniesPage';
import LocationsPage  from './pages/LocationsPage';
import ShopsPage      from './pages/ShopsPage';
import ProductsPage   from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import StockPage      from './pages/StockPage';
import ExpiryPage     from './pages/ExpiryPage';
import ReturnsPage    from './pages/ReturnsPage';
import ReportsPage    from './pages/ReportsPage';
import UsersPage      from './pages/UsersPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right"/>
        <Routes>
          <Route path="/login" element={<LoginPage/>}/>
          <Route path="/" element={<ProtectedRoute><Layout/></ProtectedRoute>}>
            <Route index element={<DashboardPage/>}/>
            <Route path="dashboard" element={<DashboardPage/>}/>
            <Route path="companies"  element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','COMPANY_ADMIN']}><CompaniesPage/></ProtectedRoute>}/>
            <Route path="locations"  element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER']}><LocationsPage/></ProtectedRoute>}/>
            <Route path="shops"      element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER','SHOP_OWNER']}><ShopsPage/></ProtectedRoute>}/>
            <Route path="products"   element={<ProtectedRoute allowedRoles={['*']}><ProductsPage/></ProtectedRoute>}/>
            <Route path="categories" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','COMPANY_ADMIN']}><CategoriesPage/></ProtectedRoute>}/>
            <Route path="stock"      element={<ProtectedRoute allowedRoles={['*']}><StockPage/></ProtectedRoute>}/>
            <Route path="expiry"     element={<ProtectedRoute allowedRoles={['*']}><ExpiryPage/></ProtectedRoute>}/>
            <Route path="returns"    element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','COMPANY_ADMIN','SHOP_OWNER']}><ReturnsPage/></ProtectedRoute>}/>
            <Route path="reports"    element={<ProtectedRoute allowedRoles={['*']}><ReportsPage/></ProtectedRoute>}/>
            <Route path="users"      element={<ProtectedRoute allowedRoles={['SUPER_ADMIN','COMPANY_ADMIN','LOCATION_MANAGER']}><UsersPage/></ProtectedRoute>}/>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
