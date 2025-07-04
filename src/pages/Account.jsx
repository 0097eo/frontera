import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { User, ShoppingBag, MessageSquare, Settings, LogOut, X, Edit, MapPin, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import OrderDetails from '../components/OrderDetails';
import PendingReviews from '../components/PendingReviews';
import useAuth from '../hooks/useAuth';


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

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 rounded-full p-1">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const NavItem = ({ icon, label, isActive, onClick }) => {
  const IconComponent = icon;
  return (
    <li>
      <button
        onClick={onClick}
        className={`flex w-full items-center gap-4 px-4 py-3 text-left font-medium transition-colors duration-200 ${
          isActive
            ? 'bg-amber-50 text-amber-600 border-r-4 border-amber-600'
            : 'text-gray-600 hover:bg-gray-100'
        }`}
      >
        <IconComponent className="w-5 h-5" />
        <span>{label}</span>
      </button>
    </li>
  );
};


const AccountPage = () => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [error, setError] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  
  const [isAddressModalOpen, setAddressModalOpen] = useState(false);
  const [isCancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [addressData, setAddressData] = useState({ shipping_address: '', billing_address: '' });
  const [useSameAddress, setUseSameAddress] = useState(true);
  const [accountData, setAccountData] = useState({
    first_name: '', last_name: '', email: '', phone_number: '', password: '', confirmPassword: ''
  });
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { logout } = useAuth();
  const navigate = useNavigate();

  const fullName = useMemo(() => user ? `${user.first_name} ${user.last_name}`.trim() : 'Guest', [user]);

  useEffect(() => {
    document.title = 'My Account | Ideal Furniture';
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUser(userData);
        setAccountData({
          first_name: userData.first_name || '',
          last_name: userData.last_name || '',
          email: userData.email || '',
          phone_number: userData.phone_number || '',
          password: '', confirmPassword: ''
        });
      } else {
        throw new Error("No user data found.");
      }
    } catch (err) {
      toast.error(err.message || 'Could not load user profile. Please log in.');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);
  
  
  const fetchAPI = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('access');
    if (!token) {
        toast.error('Authentication error. Please log in again.');
        navigate('/login');
        throw new Error('No auth token');
    }
    const response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: `HTTP error! status: ${response.status}` }));
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }
    if (response.status === 204) return null;
    return response.json();
  }, [navigate]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAPI('/api/orders/orders/');
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders. Please try again later.');
      toast.error(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, [fetchAPI]);

  useEffect(() => {
    if (activeSection === 'orders' && !orders.length) {
      fetchOrders();
    }
  }, [activeSection, orders.length, fetchOrders]);


  const updateAccountDetails = async (e) => {
    e.preventDefault();
    if (accountData.password && accountData.password !== accountData.confirmPassword) {
      return toast.error('Passwords do not match.');
    }
    if (accountData.password && accountData.password.length < 8) {
        return toast.error('Password must be at least 8 characters long.');
    }

    setIsUpdating(true);
    try {
        const dataToSend = { ...accountData };
        if (!dataToSend.password) delete dataToSend.password;
        delete dataToSend.confirmPassword;

        const updatedUser = await fetchAPI('/api/accounts/profile/', {
            method: 'PUT',
            body: JSON.stringify(dataToSend)
        });
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setAccountData(prev => ({ ...prev, password: '', confirmPassword: '' }));
        toast.success('Account details updated successfully!');
    } catch (err) {
        toast.error(err.message || 'Failed to update account details.');
    } finally {
        setIsUpdating(false);
    }
  };
  
  const updateOrderAddress = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
        const dataToSend = {
            shipping_address: addressData.shipping_address,
            billing_address: useSameAddress ? addressData.shipping_address : addressData.billing_address
        };
        await fetchAPI(`/api/orders/orders/${selectedOrder.id}/address/`, {
            method: 'PUT',
            body: JSON.stringify(dataToSend)
        });
        await fetchOrders();
        toast.success(`Address for Order #${selectedOrder.id} updated.`);
        setAddressModalOpen(false);
    } catch (err) {
        toast.error(err.message || 'Failed to update address.');
    } finally {
        setIsUpdating(false);
    }
  };

  const cancelOrder = async () => {
    setIsCancelling(true);
    try {
        await fetchAPI(`/api/orders/orders/${selectedOrder.id}/delete/`, { method: 'DELETE' });
        await fetchOrders();
        toast.success(`Order #${selectedOrder.id} has been cancelled.`);
        setCancelModalOpen(false);
        setSelectedOrderId(null);
        setActiveSection('orders');
    } catch (err) {
        toast.error(err.message || 'Failed to cancel order.');
    } finally {
        setIsCancelling(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleAccountChange = (e) => setAccountData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAddressChange = (e) => setAddressData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  
  const openAddressModal = (order) => {
    setSelectedOrder(order);
    setAddressData({
      shipping_address: order.shipping_address || '',
      billing_address: order.billing_address || '',
    });
    setUseSameAddress(!order.billing_address || order.billing_address === order.shipping_address);
    setAddressModalOpen(true);
  };
  
  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  const renderWelcomeHeader = () => (
    <div className="mb-8">
        <p className="text-2xl text-gray-500 font-bold mt-1">Manage your orders, account details, and more from your personal dashboard.</p>
    </div>
  );

  const renderOverview = () => {
    const recentOrders = orders.slice(0, 3);
    return (
      <div className="space-y-6">
        <Card title="Personal Information">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-lg text-gray-700">{fullName}</p>
              <p className="text-gray-500">{user.email}</p>
              <p className="text-gray-500">{user.phone_number}</p>
            </div>
            <button onClick={() => setActiveSection('account-management')} className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700">
              <Edit size={16} /> Edit Details
            </button>
          </div>
        </Card>
        <Card title="Recent Orders">
            {orders.length > 0 ? (
                <div className="space-y-4">
                    {recentOrders.map(order => (
                        <div key={order.id} className="flex justify-between items-center p-3 rounded-md hover:bg-gray-50">
                            <div>
                                <p className="font-semibold">Order #{order.id}</p>
                                <p className="text-sm text-gray-500">
                                    {new Date(order.created_at).toLocaleDateString()} - {renderOrderStatus(order.status)}
                                </p>
                            </div>
                            <button onClick={() => setSelectedOrderId(order.id)} className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700">
                                View Details <ChevronRight size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500">You have not placed any orders yet.</p>
            )}
            <button onClick={() => setActiveSection('orders')} className="mt-4 text-sm font-medium text-amber-600 hover:underline">
                View All Orders
            </button>
        </Card>
      </div>
    );
  };

  const renderOrders = () => {
    if (loading) return <div className="text-center p-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-amber-600"/></div>;
    if (orders.length === 0) return (
      <Card>
        <div className="text-center py-10">
          <ShoppingBag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-700">No Orders Found</h3>
          <p className="text-gray-500 mt-2">All your future orders will be displayed here.</p>
          <button onClick={() => navigate('/shop')} className="mt-6 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-6 rounded-md transition-colors">
            Start Shopping
          </button>
        </div>
      </Card>
    );

    return (
      <Card className="p-0 overflow-hidden">
        <div className="md:hidden">
          <div className="divide-y divide-gray-200">
            {orders.map(order => (
              <div key={order.id} className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                    <p className="font-bold text-gray-800">Order #{order.id}</p>
                    {renderOrderStatus(order.status)}
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                    <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
                    <p><strong>Total:</strong> KSh {order.total_price}</p>
                </div>
                <div className="flex gap-2 pt-2 border-t mt-2">
                    <button onClick={() => setSelectedOrderId(order.id)} className="flex-1 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-3 rounded-md">View</button>
                    {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                        <>
                            <button onClick={() => openAddressModal(order)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md"><MapPin size={16}/></button>
                            <button onClick={() => openCancelModal(order)} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-md"><Trash2 size={16}/></button>
                        </>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-4 font-semibold">Order</th>
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">Total</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-800">#{order.id}</td>
                  <td className="p-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="p-4">{renderOrderStatus(order.status)}</td>
                  <td className="p-4 text-gray-600">KSh {order.total_price}</td>
                  <td className="p-4">
                    <div className="flex justify-end items-center gap-3">
                      {(order.status === 'PENDING' || order.status === 'PROCESSING') && (
                        <>
                          <button onClick={() => openAddressModal(order)} className="text-gray-500 hover:text-amber-600" title="Update Address"><MapPin size={18}/></button>
                          <button onClick={() => openCancelModal(order)} className="text-gray-500 hover:text-red-600" title="Cancel Order"><Trash2 size={18}/></button>
                        </>
                      )}
                      <button onClick={() => setSelectedOrderId(order.id)} className="font-semibold text-amber-600 hover:underline">View Details</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };
  
  const renderOrderStatus = (status) => {
    const statusMap = {
      'PENDING':    'bg-yellow-100 text-yellow-800',
      'PROCESSING': 'bg-blue-100 text-blue-800',
      'SHIPPED':    'bg-purple-100 text-purple-800',
      'DELIVERED':  'bg-green-100 text-green-800',
      'CANCELLED':  'bg-red-100 text-red-800',
    };
    return <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusMap[status] || 'bg-gray-100'}`}>{status}</span>;
  };
  
  const renderAccountManagement = () => (
    <Card title="Account Management">
      <form onSubmit={updateAccountDetails} className="space-y-8">
        <fieldset>
          <legend className="text-base font-semibold text-gray-700 mb-4">Personal Information</legend>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
              <input type="text" name="first_name" value={accountData.first_name} onChange={handleAccountChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" required />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
              <input type="text" name="last_name" value={accountData.last_name} onChange={handleAccountChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" required />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
              <input type="email" name="email" value={accountData.email} onChange={handleAccountChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" required />
            </div>
            <div className="w-full">
              <label className="block text-sm font-medium text-gray-600 mb-1">Phone Number</label>
              <input type="tel" name="phone_number" value={accountData.phone_number} onChange={handleAccountChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" />
            </div>
          </div>
        </fieldset>

        <hr/>
        
        <fieldset>
            <legend className="text-base font-semibold text-gray-700 mb-2">Change Password</legend>
            <p className="text-sm text-gray-500 mb-4">Leave fields blank to keep your current password.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
                    <input type="password" name="password" value={accountData.password} onChange={handleAccountChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" placeholder="Minimum 8 characters" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Confirm New Password</label>
                    <input type="password" name="confirmPassword" value={accountData.confirmPassword} onChange={handleAccountChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500" />
                </div>
            </div>
        </fieldset>
        
        <div className="flex justify-end pt-4">
          <button type="submit" disabled={isUpdating} className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-6 rounded-md transition-colors w-40 disabled:bg-gray-400">
            {isUpdating ? <Loader2 className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </form>
    </Card>
  );

  const renderContent = () => {
    if (loading && !user) return <div className="text-center p-10"><Loader2 className="animate-spin h-8 w-8 mx-auto text-amber-600"/></div>;
    if (error && !selectedOrderId) return <Card><p className="text-red-500 text-center">{error}</p></Card>;

    if (selectedOrderId) {
      return <OrderDetails orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
    }

    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'orders': return renderOrders();
      case 'pending-reviews': return <PendingReviews />;
      case 'account-management': return renderAccountManagement();
      default: return renderOverview();
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">

          <aside className="w-full md:w-64 lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-24">
              <div className="text-center pb-4 mb-4 border-b">
                  <h2 className="font-bold text-xl text-gray-800">{fullName}</h2>
                  <p className="text-sm text-gray-500 break-words">{user?.email}</p>
              </div>
              <nav>
                <ul>
                  <NavItem icon={User} label="Account Overview" isActive={activeSection === 'overview' && !selectedOrderId} onClick={() => { setActiveSection('overview'); setSelectedOrderId(null); }} />
                  <NavItem icon={ShoppingBag} label="My Orders" isActive={activeSection === 'orders' || !!selectedOrderId} onClick={() => { setActiveSection('orders'); setSelectedOrderId(null); }} />
                  <NavItem icon={MessageSquare} label="Pending Reviews" isActive={activeSection === 'pending-reviews'} onClick={() => { setActiveSection('pending-reviews'); setSelectedOrderId(null); }} />
                  <NavItem icon={Settings} label="Account Settings" isActive={activeSection === 'account-management'} onClick={() => { setActiveSection('account-management'); setSelectedOrderId(null); }} />
                </ul>
              </nav>
              <div className="mt-6 pt-4 border-t">
                <button onClick={handleLogout} className="flex w-full items-center gap-4 px-4 py-2 text-gray-600 hover:text-red-600 font-medium transition-colors">
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {renderWelcomeHeader()}
            {renderContent()}
          </main>
        </div>
      </div>
      
      <Modal isOpen={isAddressModalOpen} onClose={() => setAddressModalOpen(false)} title="Update Shipping Address">
          <form onSubmit={updateOrderAddress}>
              <div className="space-y-4">
                  <textarea name="shipping_address" value={addressData.shipping_address} onChange={handleAddressChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-28" placeholder="Enter complete shipping address..." required />
                  <div className="flex items-center">
                    <input type="checkbox" id="same-address" checked={useSameAddress} onChange={(e) => setUseSameAddress(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"/>
                    <label htmlFor="same-address" className="ml-2 text-sm text-gray-700">Billing address is same as shipping</label>
                  </div>
                  {!useSameAddress && (
                    <textarea name="billing_address" value={addressData.billing_address} onChange={handleAddressChange} className="w-full p-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 h-28" placeholder="Enter complete billing address..." required={!useSameAddress} />
                  )}
              </div>
              <div className="mt-6 flex justify-end gap-3">
                  <button type="button" onClick={() => setAddressModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">Cancel</button>
                  <button type="submit" disabled={isUpdating} className="flex items-center justify-center bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-4 rounded-md w-32">
                    {isUpdating ? <Loader2 className="animate-spin" /> : 'Update'}
                  </button>
              </div>
          </form>
      </Modal>

      <Modal isOpen={isCancelModalOpen} onClose={() => setCancelModalOpen(false)} title="Confirm Cancellation">
          <p className="text-gray-600">Are you sure you want to cancel Order #{selectedOrder?.id}? This action cannot be undone.</p>
          <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setCancelModalOpen(false)} className="px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100">No, Keep Order</button>
              <button onClick={cancelOrder} disabled={isCancelling} className="flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md w-40">
                {isCancelling ? <Loader2 className="animate-spin" /> : 'Yes, Cancel Order'}
              </button>
          </div>
      </Modal>
    </div>
  );
};

export default AccountPage;