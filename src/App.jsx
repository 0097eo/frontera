import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import LoginPage from "./pages/Login";
import Signup from "./pages/Signup";
import EmailVerificationPage from "./pages/VerifyEmail";
import ProductList from "./pages/Shop";
import ProductDetails from "./pages/ProductPage";
import AboutPage from "./pages/About";
import CartPage from "./pages/Cart";
import CheckoutPage from "./pages/Checkout";
import OrderConfirmationPage from "./pages/OrderConfirmation";
import ContactPage from "./pages/Contact";
import WishlistPage from "./pages/WishList";
import AccountPage from "./pages/Account";
import DashBoardLayout from "./pages/Admin/DashBoardLayout";
import Products from "./pages/Admin/Products";
import Dashboard from "./pages/Admin/DashBoard";
import useAuth from './hooks/useAuth';

// Protected Route components
const ProtectedCustomerRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (user.user_type === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }
  
  return children;
};

const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();
  
  
  if (user.user_type !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
    </>
  );
};

export default function App() {
  

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<ProductList />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/cart" element={<CartPage />} />
        <Route path="/products/:id" element={<ProductDetails/>} />
        </Route>
        
        {/* Public auth routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify" element={<EmailVerificationPage />} />
        

        {/* Customer protected routes */}
        <Route element={<MainLayout />}>
          
          <Route 
            path="/checkout" 
            element={
              <ProtectedCustomerRoute>
                <CheckoutPage />
              </ProtectedCustomerRoute>
            } 
          />
          <Route 
            path="/order-confirmation/:orderId" 
            element={
              <ProtectedCustomerRoute>
                <OrderConfirmationPage />
              </ProtectedCustomerRoute>
            } 
          />
          <Route 
            path="/wishList" 
            element={
              <ProtectedCustomerRoute>
                <WishlistPage />
              </ProtectedCustomerRoute>
            } 
          />
          <Route 
            path="/account" 
            element={
              <ProtectedCustomerRoute>
                <AccountPage />
              </ProtectedCustomerRoute>
            } 
          />
        </Route>
        
        {/* Admin protected route */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedAdminRoute>
              <DashBoardLayout />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedAdminRoute>
              <Dashboard />
            </ProtectedAdminRoute>
          } 
        />
        <Route 
          path="/products-admin" 
          element={
            <ProtectedAdminRoute>
              <Products />
            </ProtectedAdminRoute>
          } 
        />
      </Routes>
    </Router>
  );
}