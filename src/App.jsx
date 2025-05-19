import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
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


// Protected Route components
const ProtectedCustomerRoute = ({ children }) => {
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
      <Toaster 
        position="top-center"
        richColors
        closeButton
        toastOptions={{
          duration: 5000,
          classNames: {
            toast: 'group',
          },
        }} 
      />
      
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
      </Routes>
    </Router>
  );
}