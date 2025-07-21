import React, { useEffect, useState, useCallback } from "react";
import { Link, useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import axios from 'axios';
import headerImage from '../assets/dresser.jpg';
import { BadgeCheck, Headset, Trophy, Truck } from 'lucide-react';

const OrderConfirmationPage = () => {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Use useCallback to memoize the fetchOrderDetails function
  const fetchOrderDetails = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        toast.error("Authentication required");
        navigate("/login", { state: { returnUrl: `/order-confirmation/${orderId}` } });
        return;
      }
      
      const response = await axios.get(`/api/orders/orders/${orderId}/`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setOrder(response.data);
    } catch (error) {
      console.error("Error fetching order:", error);
      toast.error("Failed to load order details");
      navigate("/account/orders");
    } finally {
      setLoading(false);
    }
  }, [orderId, navigate]);
  
  // Get order details from location state or fetch from API
  useEffect(() => {
    document.title = 'Order Confirmation | Ideal Furniture & Decor'
    const orderDetails = location.state?.orderDetails;
    const paymentMethod = location.state?.paymentMethod;
    
    // If we have order details from navigation state, use them
    if (orderDetails) {
      setOrder({...orderDetails, paymentMethod});
      setLoading(false);
    } else if (orderId) {
      // Otherwise fetch from API
      fetchOrderDetails();
    } else {
      // No orderId, redirect to orders page
      toast.error("Order information not found");
      navigate("/account/orders");
    }
  }, [orderId, location.state, fetchOrderDetails, navigate]);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    return price ? parseFloat(price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      
      {/* Header */}
      <div className="relative text-center">
        <div className="w-full h-24 sm:h-32 overflow-hidden">
          <img 
            src={headerImage} 
            alt="Furniture Shop Header" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2 text-white">Order Confirmation</h1>
          <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-gray-200">Order #{orderId}</span>
          </p>
        </div>
      </div>
      
      {/* Order Confirmation Content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-center mb-2">Thank You For Your Order!</h2>
          <p className="text-center text-gray-600 mb-6">
            Your order has been received and is now being processed
          </p>
          
          <div className="border-t border-b border-gray-200 py-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-gray-500 text-sm">Order Number</p>
                <p className="font-medium">#{order.id}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Date</p>
                <p className="font-medium">{formatDate(order.created_at)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Total</p>
                <p className="font-medium">Ksh {formatPrice(order.total_price)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-sm">Payment Method</p>
                <p className="font-medium">
                  {order.paymentMethod === "directBankTransfer" 
                    ? "Bank Transfer" 
                    : order.paymentMethod === "mpesa" 
                      ? "M-Pesa" 
                      : "Cash on Delivery"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Order Details</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2">Product</th>
                    <th className="text-center py-3 px-2">Quantity</th>
                    <th className="text-right py-3 px-2">Price</th>
                    <th className="text-right py-3 px-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-b border-gray-200">
                      <td className="py-3 px-2">
                        {item.product_name}
                      </td>
                      <td className="text-center py-3 px-2">
                        {item.quantity}
                      </td>
                      <td className="text-right py-3 px-2">
                        Ksh {formatPrice(item.product_price)}
                      </td>
                      <td className="text-right py-3 px-2 font-medium">
                        Ksh {formatPrice(item.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="3" className="text-right py-3 px-2 font-medium">Total</td>
                    <td className="text-right py-3 px-2 font-bold">
                      Ksh {formatPrice(order.total_price)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Shipping Address</h3>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                {order.shipping_address}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-3">Billing Address</h3>
              <div className="bg-gray-50 p-4 rounded whitespace-pre-line">
                {order.billing_address}
              </div>
            </div>
          </div>
          
          {order.status === 'PENDING' && order.paymentMethod === "directBankTransfer" && (
            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
              <h4 className="font-semibold text-amber-800 mb-2">Payment Instructions</h4>
              <p className="text-amber-700 mb-3">
                Please transfer the total amount to our bank account using your order number as the payment reference.
              </p>
              <div className="bg-white p-3 rounded text-sm">
                <p className="mb-1"><span className="font-medium">Bank:</span> National Bank of Kenya</p>
                <p className="mb-1"><span className="font-medium">Account Name:</span> Ideal Furniture & Decor</p>
                <p className="mb-1"><span className="font-medium">Account Number:</span> 1234567890</p>
                <p className="mb-1"><span className="font-medium">Branch Code:</span> 12345</p>
                <p><span className="font-medium">Reference:</span> Order #{order.id}</p>
              </div>
            </div>
          )}
          
          <div className="text-center space-y-4">
            <p className="text-gray-600">
              A confirmation email has been sent to your email address.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/account" className="inline-block px-6 py-3 bg-amber-600 text-white rounded hover:bg-amber-700 transition">
                View Your Orders
              </Link>
              <Link to="/shop" className="inline-block px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-900 transition">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer Features - Moved outside the container for full width */}
      <div className="w-full bg-amber-50 py-6 sm:py-8">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 text-center">
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">High Quality</h3>
              <p className="text-xs text-gray-600 hidden xs:block">Curated products</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">Warranty Protection</h3>
              <p className="text-xs text-gray-600 hidden xs:block">Over 2 years</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">Free Shipping</h3>
              <p className="text-xs text-gray-600 hidden xs:block">Orders over KSh 50,000</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Headset className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">24/7 Support</h3>
              <p className="text-xs text-gray-600 hidden xs:block">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;