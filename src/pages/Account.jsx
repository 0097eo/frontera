import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, MessageSquare, Store, LogOut, X,Edit, MapPin, Trash2, Eye, Settings} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import OrderDetails from '../components/OrderDetails';
import PendingReviews from '../components/PendingReviews';
import useAuth from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom';

const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [selectedOrderForAddress, setSelectedOrderForAddress] = useState(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrderForCancel, setSelectedOrderForCancel] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [addressData, setAddressData] = useState({
    shipping_address: '',
    billing_address: ''
  });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [accountData, setAccountData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    password: '',
    confirmPassword: ''
  });
  const { logout } = useAuth()
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/')
  }

  useEffect(() => {
    document.title = 'Account | Shop'
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setAccountData({
          first_name: parsedUser.first_name || '',
          last_name: parsedUser.last_name || '',
          email: parsedUser.email || '',
          phone_number: parsedUser.phone_number || '',
          password: '',
        confirmPassword: ''
        });
      }
    } catch (error) {
      console.error('Error fetching user data from localStorage:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateAccountDetails = async (e) => {
    e.preventDefault();
    setUpdateLoading(true);
  
    // Check if passwords match when they're provided
    if (accountData.password || accountData.confirmPassword) {
      if (accountData.password !== accountData.confirmPassword) {
        toast.error('Passwords do not match');
        setUpdateLoading(false);
        return;
      }
      if (accountData.password.length < 8) {
        toast.error('Password must be at least 8 characters long');
        setUpdateLoading(false);
        return;
      }
    }
  
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        setUpdateLoading(false);
        return;
      }
  
      // Only send password if it's been changed
      const dataToSend = { ...accountData };
      if (!dataToSend.password) {
        delete dataToSend.password;
        delete dataToSend.confirmPassword;
      } else {
        delete dataToSend.confirmPassword; 
      }
  
      const response = await fetch('/api/accounts/profile/', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
  
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
  
      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      // Reset password fields after successful update
      setAccountData(prev => ({
        ...prev,
        password: '',
        confirmPassword: ''
      }));
      toast.success('Account details updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      toast.error('Failed to update account details. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleAccountChange = (e) => {
    const { name, value } = e.target;
    setAccountData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    // Fetch orders data when activeSection is 'orders'
    if (activeSection === 'orders') {
      fetchOrders();
    }
  }, [activeSection]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/orders/orders/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders. Please try again later.');
      toast.error('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to update order address
  const updateOrderAddress = async (orderId) => {
    setUpdateLoading(true);
    
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        toast.error('Authentication token not found. Please log in again.');
        setUpdateLoading(false);
        return;
      }
      
      // If using same address for both, copy shipping address to billing address
      const dataToSend = {
        ...addressData,
        billing_address: useSameAddress ? addressData.shipping_address : addressData.billing_address
      };
      
      const response = await fetch(`/api/orders/orders/${orderId}/address/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Refresh orders list
      await fetchOrders();
      toast.success(`Shipping address for Order #${orderId} has been updated successfully`);
      setAddressModalOpen(false);
      setSelectedOrderForAddress(null);
      
    } catch (error) {
      console.error(`Error updating order address:`, error);
      toast.error(`Failed to update shipping address. Please try again later.`);
    } finally {
      setUpdateLoading(false);
    }
  };

  // Function to cancel order
  const cancelOrder = async (orderId) => {
    setCancelLoading(true);
    
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        toast.error('Authentication token not found. Please log in again.');
        setCancelLoading(false);
        return;
      }
      
      const response = await fetch(`/api/orders/orders/${orderId}/delete/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      // Refresh orders list
      await fetchOrders();
      toast.success(`Order #${orderId} has been cancelled successfully`);
      setCancelModalOpen(false);
      setSelectedOrderForCancel(null);
      
      // Navigate back to orders list after cancellation
      setSelectedOrderId(null);
      setActiveSection('orders');
      
    } catch (error) {
      console.error(`Error cancelling order:`, error);
      toast.error(`Failed to cancel order. Please try again later.`);
    } finally {
      setCancelLoading(false);
    }
  };

  // Format the user's full name
  const fullName = user ? `${user.first_name} ${user.last_name}` : '';

  const renderOrderStatus = (status) => {
    const statusColors = {
      'PENDING': 'bg-amber-100 text-amber-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED': 'bg-purple-100 text-purple-800',
      'DELIVERED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100'}`}>
        {status}
      </span>
    );
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddressData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openAddressModal = (order) => {
    // Pre-fill with current address data if available
    setAddressData({
      shipping_address: order.shipping_address || '',
      billing_address: order.billing_address || ''
    });
    
    // If billing address is same as shipping or empty, set checkbox to true
    setUseSameAddress(!order.billing_address || order.billing_address === order.shipping_address);
    
    setSelectedOrderForAddress(order.id);
    setAddressModalOpen(true);
  };

  const openCancelModal = (order) => {
    setSelectedOrderForCancel(order.id);
    setCancelModalOpen(true);
  };

  const renderContent = () => {
    if (loading) {
      return <div className="text-center p-4">Loading data...</div>;
    }
  
    if (error) {
      return <div className="text-center p-4 text-red-500">{error}</div>;
    }
  
    if (selectedOrderId) {
      const selectedOrder = orders.find(order => order.id === selectedOrderId);
      return (
        <div>
          {selectedOrder && (selectedOrder.status === "PENDING" || selectedOrder.status === "PROCESSING") && (
            <div className="mb-4 p-4 bg-white rounded shadow">
              <h3 className="font-medium text-gray-700 mb-3">Order Actions</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => openAddressModal(selectedOrder)}
                  className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  Update Address
                </button>
                <button
                  onClick={() => openCancelModal(selectedOrder)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Cancel Order
                </button>
              </div>
            </div>
          )}
          <OrderDetails orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />
        </div>
      );
    }
  
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'orders':
        return renderOrders();
      case 'pending-reviews':
        return <PendingReviews />;
      case 'account-management':
        return renderAccountManagement();
      default:
        return renderOverview();
    }
  };

  const renderAccountManagement = () => {
    if (!user) {
      return <div className="text-center p-4">No user data found. Please log in again.</div>;
    }
  
    return (
      <div className="bg-white border rounded p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-6">Account Management</h2>
        <form onSubmit={updateAccountDetails} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input
                type="text"
                name="first_name"
                value={accountData.first_name}
                onChange={handleAccountChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input
                type="text"
                name="last_name"
                value={accountData.last_name}
                onChange={handleAccountChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              name="email"
              value={accountData.email}
              onChange={handleAccountChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
            <input
              type="tel"
              name="phone_number"
              value={accountData.phone_number}
              onChange={handleAccountChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                name="password"
                value={accountData.password}
                onChange={handleAccountChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Enter new password (min 8 characters)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={accountData.confirmPassword}
                onChange={handleAccountChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Confirm new password"
              />
            </div>
          </div>
  
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={updateLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 "
            >
              {updateLoading ? 'Updating...' : 'Update Account'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  const renderOverview = () => {
    if (!user) {
      return <div className="text-center p-4">No user data found. Please log in again.</div>;
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Account Details */}
        <div className="border rounded bg-white">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-700">ACCOUNT DETAILS</h2>
          </div>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-800">{fullName}</h3>
            <p className="text-gray-500 mt-1">{user.email}</p>
          </div>
        </div>
        
        {/* Address Book */}
        <div className="border rounded bg-white">
          <div className="border-b p-4 flex justify-between items-center">
            <h2 className="font-bold text-gray-700">CONTACT DETAILS</h2>
            <button className="text-amber-500">
              <Edit className="w-5 h-5" />
            </button>
          </div>
          <div className="p-6">
            <h3 className="font-semibold mb-2">Your contact details:</h3>
            <div className="text-gray-600">
              <p>{fullName}</p>
              <p className="text-gray-500 mt-1">{user.email}</p>
              <p>{user.phone_number}</p>
            </div>
          </div>
        </div>
        
        {/*  Store Credit */}
        <div className="border rounded bg-white">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-700">STORE CREDIT</h2>
          </div>
          <div className="p-6 flex items-center gap-3">
            <div className="bg-amber-600 text-white p-2 rounded">
              <Store className="w-5 h-5" />
            </div>
            <span className="text-gray-700">Ideal Furniture & Decor store credit balance: KSh 0</span>
          </div>
        </div>
        
        {/* Newsletter Preferences */}
        <div className="border rounded bg-white">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-700">NEWSLETTER PREFERENCES</h2>
          </div>
          <div className="p-6">
            <p className="text-gray-700 mb-6">
              Manage your email communications to stay updated with the latest news and offers.
            </p>
            <a href="#" className="text-amber-500">
              Edit Newsletter preferences
            </a>
          </div>
        </div>
      </div>
    );
  };

  const renderOrders = () => {
    if (orders.length === 0) {
      return (
        <div className="bg-white p-6 text-center border rounded">
          <ShoppingBag className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium">You have no orders yet</h3>
          <p className="text-gray-500 mt-2">When you place your first order, it will appear here</p>
          <button className="mt-4 bg-amber-500 hover:bg-amber-600 text-white py-2 px-4">
            Start Shopping
          </button>
        </div>
      );
    }

    return (
      <div>
        <div className="bg-white border rounded">
          <div className="border-b p-4">
            <h2 className="font-bold text-gray-700">MY ORDERS</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Ksh {parseFloat(order.total_price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {renderOrderStatus(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end items-center gap-2">
                      {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                        <>
                          <button 
                            onClick={() => openAddressModal(order)}
                            disabled={updateLoading}
                            className="text-amber-600 hover:text-amber-700 flex items-center gap-1"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => openCancelModal(order)}
                            disabled={cancelLoading}
                            className="text-red-500 hover:text-red-700 flex items-center gap-1"
                          >
                            <Trash2  className='w-4 h-4'/>
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => viewOrderDetails(order.id)}
                        className="text-amber-500 hover:text-amber-700"
                      >
                        <Eye className="w-4 h-4"/>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const viewOrderDetails = (orderId) => {
    setSelectedOrderId(orderId);
  };

  // Address Update Modal
  const AddressUpdateModal = () => {
    if (!addressModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Update Address</h3>
            <button 
              onClick={() => {
                setAddressModalOpen(false);
                setSelectedOrderForAddress(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={(e) => {
            e.preventDefault();
            updateOrderAddress(selectedOrderForAddress);
          }}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Shipping Address</label>
                <textarea
                  name="shipping_address"
                  value={addressData.shipping_address}
                  onChange={handleAddressChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows="4"
                  placeholder="Enter your complete shipping address (street, city, state, postal code, country)"
                  required
                ></textarea>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="same-address"
                  checked={useSameAddress}
                  onChange={(e) => setUseSameAddress(e.target.checked)}
                  className="rounded border-gray-300 text-amber-600 shadow-sm focus:border-amber-300 focus:ring focus:ring-amber-200 focus:ring-opacity-50"
                />
                <label htmlFor="same-address" className="ml-2 block text-sm text-gray-700">
                  Billing address same as shipping address
                </label>
              </div>
              
              {!useSameAddress && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Billing Address</label>
                  <textarea
                    name="billing_address"
                    value={addressData.billing_address}
                    onChange={handleAddressChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    rows="4"
                    placeholder="Enter your complete billing address (street, city, state, postal code, country)"
                    required={!useSameAddress}
                  ></textarea>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setAddressModalOpen(false);
                  setSelectedOrderForAddress(null);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateLoading}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {updateLoading ? 'Updating...' : 'Update Address'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Cancel Order Confirmation Modal
  const CancelOrderModal = () => {
    if (!cancelModalOpen) return null;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Cancel Order</h3>
            <button 
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedOrderForCancel(null);
              }}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="py-4">
            <p className="text-gray-700">Are you sure you want to cancel this order? This action cannot be undone.</p>
          </div>
          
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setCancelModalOpen(false);
                setSelectedOrderForCancel(null);
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              No, Keep Order
            </button>
            <button
              onClick={() => cancelOrder(selectedOrderForCancel)}
              disabled={cancelLoading}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white"
            >
              {cancelLoading ? 'Cancelling...' : 'Yes, Cancel Order'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col md:flex-row w-full min-h-screen bg-gray-100 pt-16">
      {/* Sonner Toast Container */}
      <Toaster 
        position='top-center'
        richColors
        closeButton={true}
        duration={4000}
      />
      
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white shadow-md">
        <div className="p-4 bg-gray-200 flex items-center gap-3">
          <User className="w-5 h-5" />
          <span className="font-medium">My Account</span>
        </div>
        
        <nav className="py-2">
          <ul>
            <li>
              <button 
                onClick={() => {
                  setActiveSection('overview');
                  setSelectedOrderId(null);
                }} 
                className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100 ${activeSection === 'overview' && !selectedOrderId ? 'bg-gray-100 text-amber-500' : 'text-gray-800'}`}
              >
                <User className="w-5 h-5" />
                <span>Account Overview</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setActiveSection('orders');
                  setSelectedOrderId(null);
                }} 
                className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100 ${(activeSection === 'orders' || selectedOrderId) ? 'bg-gray-100 text-amber-500' : 'text-gray-800'}`}
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Orders</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setActiveSection('pending-reviews');
                  setSelectedOrderId(null);
                }} 
                className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100 ${activeSection === 'pending-reviews' ? 'bg-gray-100 text-amber-500' : 'text-gray-800'}`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>Reviews</span>
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setActiveSection('account-management');
                  setSelectedOrderId(null);
                }} 
                className={`flex w-full items-center gap-3 px-4 py-3 hover:bg-gray-100 ${activeSection === 'account-management' ? 'bg-gray-100 text-amber-500' : 'text-gray-800'}`}
              >
                <Settings className="w-5 h-5" />
                <span>Account Management</span>
              </button>
            </li>
            
          </ul>
          
          
          
          <div className="mt-6 px-4 py-3 text-center">
            <button
             onClick={()=>{handleLogout()}} 
             className="text-amber-500 flex justify-center items-center gap-2">
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-4">
        {renderContent()}
      </div>
      
      {/* Address Update Modal */}
      <AddressUpdateModal />
      
      {/* Cancel Order Modal */}
      <CancelOrderModal />
    </div>
  );
};

export default AccountPage;