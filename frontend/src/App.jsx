import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { RestaurantList } from './pages/RestaurantList';
import { RestaurantMenu } from './pages/RestaurantMenu';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CustomerDashboard } from './pages/CustomerDashboard';
import { AiInsights } from './pages/AiInsights';
import { OwnerDashboard } from './pages/OwnerDashboard';
import { OwnerOrders } from './pages/OwnerOrders';
import { ManagerProfile } from './pages/ManagerProfile';
import { MenuManagement } from './pages/MenuManagement';
import { DeliveryDashboard } from './pages/DeliveryDashboard';
import { NotFound } from './pages/NotFound';

export const App = () => {
  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public / Customer Browsing */}
          <Route path="/" element={<RestaurantList />} />
          <Route path="/restaurant/:id" element={<RestaurantMenu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Customer Routes */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Checkout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/dashboard"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer/insights"
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <AiInsights />
              </ProtectedRoute>
            }
          />

          {/* Protected Restaurant Owner Routes */}
          <Route
            path="/owner/dashboard"
            element={
              <ProtectedRoute allowedRoles={['restaurant_owner']}>
                <OwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/orders"
            element={
              <ProtectedRoute allowedRoles={['restaurant_owner']}>
                <OwnerOrders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/menu"
            element={
              <ProtectedRoute allowedRoles={['restaurant_owner']}>
                <MenuManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/owner/profile"
            element={
              <ProtectedRoute allowedRoles={['restaurant_owner']}>
                <ManagerProfile />
              </ProtectedRoute>
            }
          />

          {/* Protected Delivery Partner Routes */}
          <Route
            path="/delivery/dashboard"
            element={
              <ProtectedRoute allowedRoles={['delivery_partner']}>
                <DeliveryDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
};

export default App;
