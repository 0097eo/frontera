import React, { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingBag, Truck, Package, Check, X } from 'lucide-react';

const OrderDetails = ({ orderId, onBack }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId]);

  const fetchOrderDetails = async (id) => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch(`/api/orders/orders/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const renderOrderStatus = (status) => {
    const statusColors = {
      'PENDING': 'bg-amber-100 text-amber-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };

    
    return (
      <span 
        data-testid="order-status"
        className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const renderStatusIcon = (status) => {
    switch(status) {
      case 'PENDING':
        return <ShoppingBag className="w-6 h-6 text-amber-500" />;
      case 'PROCESSING':
        return <Package className="w-6 h-6 text-blue-500" />;
      case 'SHIPPED':
        return <Truck className="w-6 h-6 text-purple-500" />;
      case 'DELIVERED':
        return <Check className="w-6 h-6 text-green-500" />;
      case 'CANCELLED':
        return <X className="w-6 h-6 text-red-500" />;
      default:
        return <ShoppingBag className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatPrice = (price) => {
    return price ? parseFloat(price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
  };
  

  if (loading) {
    return (
      <div className="bg-white p-8 rounded border text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded border">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center text-amber-500 hover:text-amber-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </button>
        </div>
        <div className="text-center text-red-500 p-4">{error}</div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="bg-white p-8 rounded border">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center text-amber-500 hover:text-amber-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </button>
        </div>
        <div className="text-center p-4">No order details found.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded border">
      {/* Header */}
      <div className="border-b p-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={onBack} 
            className="flex items-center text-amber-500 hover:text-amber-700"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to Orders
          </button>
          <div>{renderOrderStatus(orderDetails.status)}</div>
        </div>

        <div className="flex flex-col md:flex-row justify-between">
          <div>
            <h1 className="text-xl font-semibold">Order #{orderDetails.id}</h1>
            <p className="text-gray-500">
              Placed on {new Date(orderDetails.created_at).toLocaleDateString()} at {new Date(orderDetails.created_at).toLocaleTimeString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <span className="font-semibold">Total:</span>Ksh {formatPrice(orderDetails.total_price)}
          </div>
        </div>
      </div>

      {/* Order Progress */}
      <div className="p-6 border-b">
        <h2 className="font-semibold mb-4">Order Progress</h2>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            {renderStatusIcon(orderDetails.status)}
          </div>
          <div className="ml-4">
            <h3 className="font-medium">{orderDetails.status}</h3>
            <p className="text-sm text-gray-500">
              {orderDetails.status === 'PENDING' && 'Your order has been received and is awaiting processing.'}
              {orderDetails.status === 'PROCESSING' && 'Your order is being processed and prepared for shipping.'}
              {orderDetails.status === 'SHIPPED' && 'Your order has been shipped and is on its way to you.'}
              {orderDetails.status === 'DELIVERED' && 'Your order has been delivered successfully.'}
              {orderDetails.status === 'CANCELLED' && 'This order has been cancelled.'}
            </p>
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="p-6 border-b">
        <h2 className="font-semibold mb-4">Order Items</h2>
        <div className="space-y-4">
          {orderDetails.items && orderDetails.items.map((item) => (
            <div key={item.id} className="flex flex-col sm:flex-row border rounded p-4">
              <div className="sm:w-1/4 mb-4 sm:mb-0 flex-shrink-0">
                <div className="h-32 w-32 bg-gray-200 rounded overflow-hidden">
                  {item.product_image ? (
                    <img 
                      src={item.product_image} 
                      alt={item.product_name} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-grow">
                <h3 className="font-medium">{item.product_name}</h3>
                <div className="flex justify-between mt-2">
                  <span className="text-gray-600">Qty: {item.quantity}</span>
                  <span className="font-medium">Ksh {formatPrice(item.product_price || item.price)}</span>
                </div>
                <div className="mt-2">
                  <span className="font-medium">Subtotal: Ksh {formatPrice(item.subtotal)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shipping & Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
        <div>
          <h2 className="font-semibold mb-3">Shipping Address</h2>
          <div className="border rounded p-4">
            <p className="whitespace-pre-line">{orderDetails.shipping_address || 'No shipping address information available'}</p>
          </div>
        </div>
        
        <div>
          <h2 className="font-semibold mb-3">Billing Address</h2>
          <div className="border rounded p-4">
            <p className="whitespace-pre-line">{orderDetails.billing_address || 'Same as shipping address'}</p>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="font-semibold mb-3">Payment Information</h2>
          <div className="border rounded p-4">
            <div className="flex justify-between">
              <span className="font-medium">Total:</span>
              <span>Ksh {formatPrice(orderDetails.total_price)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;