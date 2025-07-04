import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ShoppingBag, Truck, Package, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const Card = ({ children, className = '', title }) => (
  <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
    {title && (
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);


const OrderDetails = ({ orderId, onBack }) => {
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchOrderDetails = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        toast.error('Authentication error. Please log in again.');
        navigate('/login');
        throw new Error('No auth token');
      }
      
      const response = await fetch(`/api/orders/orders/${id}/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch order`);
      }
      
      const data = await response.json();
      setOrderDetails(data);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails(orderId);
    }
  }, [orderId, fetchOrderDetails]);

  const formatPrice = (price) => {
    return price ? parseFloat(price).toFixed(2).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0.00';
  };

  const renderOrderStatus = (status) => {
    const statusMap = {
      'PENDING':    'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED':    'bg-purple-100 text-purple-800',
      'DELIVERED':  'bg-green-100 text-green-800',
      'CANCELLED':  'bg-red-100 text-red-800',
    };
    return <span data-testid="order-status" className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusMap[status] || 'bg-gray-100'}`}>{status}</span>;
  };

  const renderProgressTracker = (status) => {
    const steps = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
    const currentStepIndex = steps.indexOf(status);

    if (status === 'CANCELLED') {
      return (
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
            <XCircle className="w-8 h-8 text-red-500" />
            <div>
                <h3 className="font-semibold text-red-800">Order Cancelled</h3>
                <p className="text-sm text-red-600">This order has been cancelled and will not be processed.</p>
            </div>
        </div>
      );
    }

    const Step = ({ icon, title, isCompleted, isActive, isFirst, isLast }) => {
      const IconComponent = icon;
      return (
        <div className="relative flex-1 flex flex-col items-center">
            {!isFirst && (
                <div className={`absolute top-1/2 left-0 w-1/2 h-1 -translate-y-4 ${isCompleted || isActive ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
            )}
            {!isLast && (
                <div className={`absolute top-1/2 right-0 w-1/2 h-1 -translate-y-4 ${isCompleted ? 'bg-amber-500' : 'bg-gray-200'}`}></div>
            )}
            
            <div className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${isCompleted || isActive ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                <IconComponent className="h-5 w-5" />
            </div>
            <p className={`mt-2 text-xs text-center font-semibold ${isActive ? 'text-amber-600' : 'text-gray-600'}`}>
                {title}
            </p>
        </div>
      );
    };
    
    return (
        <div className="flex justify-between items-start pt-4">
            <Step icon={ShoppingBag} title="Order Placed" isCompleted={currentStepIndex > 0} isActive={currentStepIndex === 0} isFirst />
            <Step icon={Package} title="Processing" isCompleted={currentStepIndex > 1} isActive={currentStepIndex === 1} />
            <Step icon={Truck} title="Shipped" isCompleted={currentStepIndex > 2} isActive={currentStepIndex === 2} />
            <Step icon={CheckCircle} title="Delivered" isCompleted={currentStepIndex > 3} isActive={currentStepIndex === 3} isLast />
        </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <div className="flex flex-col items-center justify-center h-64">
          <Loader2 className="animate-spin h-10 w-10 text-amber-600" />
          <p className="mt-4 text-gray-600">Loading Order Details...</p>
        </div>
      </Card>
    );
  }

  if (error || !orderDetails) {
    return (
      <Card>
        <button onClick={onBack} className="flex items-center gap-2 mb-4 font-medium text-amber-600 hover:text-amber-700">
          <ArrowLeft size={18} />
          Back to Orders
        </button>
        <div className="text-center py-10 text-red-500">
          <p>{error || 'No order details found.'}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header and Back Button */}
        <div>
            <button onClick={onBack} className="flex items-center gap-2 mb-4 font-medium text-amber-600 hover:text-amber-700">
                <ArrowLeft size={18} />
                Back to My Orders
            </button>
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 p-6 bg-white border rounded-lg shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Order #{orderDetails.id}</h1>
                    <p className="text-gray-500">
                        Placed on {new Date(orderDetails.created_at).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    {renderOrderStatus(orderDetails.status)}
                </div>
            </div>
        </div>
        
        {/* Progress Tracker Card */}
        <Card title="Order Progress">
            {renderProgressTracker(orderDetails.status)}
        </Card>

        {/* Items and Summary Card */}
        <Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Items Ordered ({orderDetails.items.length})</h3>
                    <div className="space-y-4">
                    {orderDetails.items && orderDetails.items.map((item) => (
                        <div key={item.id} className="flex gap-4 items-center">
                            <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                <img 
                                src={item.product_image || '/placeholder-image.svg'} 
                                alt={item.product_name} 
                                className="h-full w-full object-cover"
                                />
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800">{item.product_name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <p className="text-sm font-semibold text-gray-800">
                                KSh {formatPrice(item.subtotal)}
                            </p>
                        </div>
                    ))}
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Summary</h3>
                    <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span>KSh {formatPrice(orderDetails.total_price - (orderDetails.shipping_fee || 0))}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping Fee</span>
                            <span>KSh {formatPrice(orderDetails.shipping_fee)}</span>
                        </div>
                        <hr className="my-2" />
                        <div className="flex justify-between font-bold">
                            <span className="text-gray-800">Total</span>
                            <span className="text-amber-600">KSh {formatPrice(orderDetails.total_price)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </Card>

        {/* Address Information Card */}
        <Card title="Address Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600 p-4 border rounded-md bg-gray-50">
                        <p className="whitespace-pre-line break-words">{orderDetails.shipping_address || 'Not available'}</p>
                    </div>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800 mb-2">Billing Address</h3>
                    <div className="text-sm text-gray-600 p-4 border rounded-md bg-gray-50">
                        <p className="whitespace-pre-line break-words">{orderDetails.billing_address || 'Same as shipping address'}</p>
                    </div>
                </div>
            </div>
        </Card>
    </div>
  );
};

export default OrderDetails;