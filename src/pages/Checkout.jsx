import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import useCart from "../hooks/useCart";
import headerImage from '../assets/dresser.jpg';
import { toast } from 'sonner';
import axios from 'axios';
import { BadgeCheck, Truck, Headset, Trophy, Smartphone } from 'lucide-react';

const CheckoutPage = () => {
  const { items, total, loading, clearCart } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [mpesaProcessing, setMpesaProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    country: "",
    streetAddress: "",
    city: "",
    province: "",
    zipCode: "",
    phone: "",
    email: "",
    additionalInfo: "",
    paymentMethod: "directBankTransfer",
    mpesaPhone: "" 
  });

  
  const SHIPPING_FEE = 1500; 
  const FREE_SHIPPING_THRESHOLD = 50000; 
  const isShippingFree = total >= FREE_SHIPPING_THRESHOLD;
  const shippingFeeAmount = isShippingFree ? 0 : SHIPPING_FEE;
  const finalTotal = total + shippingFeeAmount;

  useEffect(() => {
    document.title = 'Checkout | Ideal Furniture & Decor'
    if (!loading && items.length === 0) {
      toast.error("Your cart is empty", {
        description: "Please add items to your cart before checkout"
      });
      navigate("/cart");
    }
  }, [items, loading, navigate]);

  useEffect(() => {
    // Pre-fill M-PESA phone number with contact phone if available
    if (formData.phone && !formData.mpesaPhone) {
      setFormData(prevData => ({
        ...prevData,
        mpesaPhone: prevData.phone
      }));
    }
  }, [formData.phone, formData.mpesaPhone]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handlePaymentMethodChange = (method) => {
    setFormData(prevData => ({
      ...prevData,
      paymentMethod: method
    }));
  };

  const validateRequiredFields = () => {
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'province', 'zipCode', 'phone', 'email'];
    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      toast.error("Please fill in all required fields", {
        description: "Some required information is missing"
      });
      return false;
    }
    
    if (formData.paymentMethod === "mpesa" && !formData.mpesaPhone) {
      toast.error("M-PESA phone number is required", {
        description: "Please enter the phone number to use for M-PESA payment"
      });
      return false;
    }

    return true;
  };


  // Create order and return order ID
  const createOrder = async (paymentStatus = "pending") => {
    // Format shipping and billing address
    const formattedAddress = `${formData.firstName} ${formData.lastName}
${formData.streetAddress}
${formData.city}, ${formData.province} ${formData.zipCode}
${formData.country}
Phone: ${formData.phone}
Email: ${formData.email}
${formData.companyName ? `Company: ${formData.companyName}` : ''}
${formData.additionalInfo ? `Notes: ${formData.additionalInfo}` : ''}`;

    
    const orderData = {
      shipping_address: formattedAddress,
      billing_address: formattedAddress,
      shipping_fee: parseInt(shippingFeeAmount),
      total_amount: parseInt(finalTotal),
      payment_method: formData.paymentMethod,
      payment_status: paymentStatus
    };

    const token = localStorage.getItem('access');
    if (!token) {
      toast.error("Authentication error", {
        description: "Please log in to complete your order"
      });
      navigate("/login", { state: { returnUrl: "/checkout" } });
      return null;
    }

    try {
      const response = await axios.post(
        '/api/orders/orders/create/',
        orderData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status === 201) {
        return response.data;
      }
    } catch (error) {
      console.error('Order creation error:', error);
      
      if (error.response?.data?.error) {
        toast.error("Order creation failed", {
          description: error.response.data.error
        });
      } else if (error.response?.status === 401) {
        toast.error("Session expired", {
          description: "Please log in again to complete your order"
        });
        navigate("/login", { state: { returnUrl: "/checkout" } });
      } else {
        toast.error("There was a problem creating your order", {
          description: "Please try again or contact customer support"
        });
      }
      return null;
    }
  };

  // Update order with payment data
  const updateOrderWithPayment = async (orderId, paymentData) => {
    const token = localStorage.getItem('access');
    if (!token) return false;

    try {
      const response = await axios.patch(
        `/api/orders/orders/${orderId}/update_payment/`,
        paymentData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      return response.status === 200;
    } catch (error) {
      console.error('Payment update error:', error);
      return false;
    }
  };

  const handleMpesaPayment = async () => {
    setMpesaProcessing(true);
    
    const token = localStorage.getItem('access');
    if (!token) {
      toast.error("Authentication error", {
        description: "Please log in to complete your payment"
      });
      setMpesaProcessing(false);
      navigate("/login", { state: { returnUrl: "/checkout" } });
      return;
    }
  
    try {
      // First create the order with pending payment status
      const orderData = await createOrder("pending");
      
      if (!orderData || !orderData.id) {
        setMpesaProcessing(false);
        return;
      }
      
      // Prepare the M-PESA payment payload
      const mpesaPayload = {
        phone: formData.mpesaPhone,
        order_id: orderData.id,
        amount: parseInt(finalTotal) // Ensure integer amount
      };
      
      // Now initiate M-PESA payment with the order ID
      const response = await axios.post(
        '/api/payments/mpesa/',
        mpesaPayload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
  
  
      if (response.status === 200 || response.status === 201) {
        toast.success('M-PESA payment initiated', {
          description: 'Please check your phone for the STK push and enter your PIN'
        });
        
        const paymentData = {
          transaction_id: response.data.checkout_request_id || response.data.transaction_id,
          phone_number: formData.mpesaPhone,
          payment_status: "processing",
          amount: parseInt(finalTotal) // Ensure integer amount
        };
        
        // Update the order with payment information
        await updateOrderWithPayment(orderData.id, paymentData);
        
        // Navigate to confirmation page
        clearCart();
        navigate(`/order-confirmation/${orderData.id}`, { 
          state: { 
            orderDetails: {
              ...orderData,
              payment_data: paymentData
            },
            paymentMethod: formData.paymentMethod,
            shippingFee: shippingFeeAmount,
            subtotal: total,
            total: finalTotal
          } 
        });
      } else {
        toast.error('M-PESA payment failed', {
          description: response.data.message || 'Please try again or use a different payment method'
        });
      }
    } catch (error) {
      console.error('M-PESA payment error:', error);
      
      // Log more detailed error information if available
      if (error.response) {
        console.error('Error response:', {
          status: error.response.status,
          data: error.response.data
        });
      }
      
      let errorMessage = 'An error occurred while processing your payment';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      
      toast.error('M-PESA payment failed', {
        description: errorMessage
      });
    } finally {
      setMpesaProcessing(false);
    }
  };

  const handleRegularOrder = async () => {
    setIsProcessing(true);
    
    try {
      const orderData = await createOrder(
        formData.paymentMethod === "directBankTransfer" ? "pending" : "not_paid"
      );
      
      if (orderData && orderData.id) {
        clearCart();
        navigate(`/order-confirmation/${orderData.id}`, { 
          state: { 
            orderDetails: orderData,
            paymentMethod: formData.paymentMethod,
            shippingFee: shippingFeeAmount,
            subtotal: total,
            total: finalTotal
          } 
        });
        
        toast.success('Order placed successfully!');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateRequiredFields()) {
      return;
    }

    if (formData.paymentMethod === "mpesa") {
      handleMpesaPayment();
    } else {
      handleRegularOrder();
    }
  };

  // For display purposes only - formats numbers with comma separators
  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
  };
  
  if (loading) {
    return (
      <div
        data-testid="loading-spinner" 
        className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-16">
      {/* Checkout Header */}
      <div className="relative text-center">
        <div className="w-full h-24 sm:h-32 lg:h-56 overflow-hidden">
          <img 
            src={headerImage} 
            alt="Furniture Shop Header" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">Checkout</h1>
          <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <Link to="/cart" className="text-white hover:underline">Cart</Link> {'>'} <span className="text-gray-200">Checkout</span>
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Billing Details */}
            <div className="lg:w-7/12">
              <h2 className="text-lg font-medium mb-6">Billing details</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm mb-1">First Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
                
                <div>
                  <label htmlFor="lastName" className="block text-sm mb-1">Last Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="companyName" className="block text-sm mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="country" className="block text-sm mb-1">Country / Region <span className="text-red-500">*</span></label>
                <select
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select a country</option>
                  <option value="kenya">Kenya</option>
                  <option value="uganda">Uganda</option>
                  <option value="tanzania">Tanzania</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="streetAddress" className="block text-sm mb-1">Street address <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="House number and street name"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="city" className="block text-sm mb-1">Town / City <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="province" className="block text-sm mb-1">Province <span className="text-red-500">*</span></label>
                <select
                  id="province"
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                >
                  <option value="">Select Province</option>
                  <option value="nairobi">Nairobi Province</option>
                  <option value="central">Central Province</option>
                  <option value="eastern">Eastern Province</option>
                  <option value="coast">Coast Province</option>
                  <option value="rift-valley">Rift Valley Province</option>
                  <option value="western">Western Province</option>
                  <option value="nyanza">Nyanza Province</option>
                  <option value="north-eastern">North Eastern Province</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="zipCode" className="block text-sm mb-1">ZIP code <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="block text-sm mb-1">Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="e.g. 254712345678"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm mb-1">Email address <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="additionalInfo" className="block text-sm mb-1">Additional information</label>
                <textarea
                  id="additionalInfo"
                  name="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded h-24"
                  placeholder="Notes about your order, e.g. special delivery instructions"
                ></textarea>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:w-5/12">
              <div className="bg-white p-6 border border-gray-100 rounded shadow-sm">
                <h2 className="text-lg font-medium mb-6">Order Summary</h2>
                
                <div className="border-b border-gray-200 pb-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 text-sm">
                      <div>
                        {item.name} <span className="text-gray-500">× {item.quantity}</span>
                      </div>
                      <div>Ksh {formatPrice((item.price * item.quantity).toFixed(2))}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <div className="font-medium">Subtotal</div>
                  <div>Ksh {formatPrice(total.toFixed(2))}</div>
                </div>
                
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <div className="font-medium">Shipping</div>
                  <div>
                    {isShippingFree ? (
                      <span className="text-green-600">Free</span>
                    ) : (
                      <span>Ksh {formatPrice(shippingFeeAmount.toFixed(2))}</span>
                    )}
                    {!isShippingFree && (
                      <div className="text-xs text-gray-500 mt-1">
                        (Free shipping on orders over Ksh {formatPrice(FREE_SHIPPING_THRESHOLD)})
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <div className="font-medium">Total</div>
                  <div className="text-xl font-bold text-amber-600">Ksh {formatPrice(finalTotal.toFixed(2))}</div>
                </div>
                
                {/* Payment Methods */}
                <div className="mt-6 space-y-4">
                  {/* M-PESA Payment Option */}
                  <div className={`${formData.paymentMethod === "mpesa" ? "bg-green-50 border-green-200" : "bg-gray-50"} p-4 rounded border`}>
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="mpesa"
                        name="paymentMethod"
                        checked={formData.paymentMethod === "mpesa"}
                        onChange={() => handlePaymentMethodChange("mpesa")}
                        className="mr-2"
                      />
                      <label htmlFor="mpesa" className="font-medium flex items-center">
                        <Smartphone className="w-5 h-5 mr-2 text-green-600" />
                        M-PESA
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 pl-5 mb-3">
                      Pay securely using M-PESA. You will receive an STK push to complete the payment.
                    </p>
                    
                    {formData.paymentMethod === "mpesa" && (
                      <div className="pl-5 pt-2">
                        <label htmlFor="mpesaPhone" className="block text-sm mb-1">M-PESA Phone Number <span className="text-red-500">*</span></label>
                        <input
                          type="tel"
                          id="mpesaPhone"
                          name="mpesaPhone"
                          value={formData.mpesaPhone}
                          onChange={handleInputChange}
                          placeholder="e.g. 254712345678"
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the M-PESA registered phone number (format: 254XXXXXXXXX)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div className={`${formData.paymentMethod === "directBankTransfer" ? "bg-gray-50 border-gray-200" : ""} p-4 rounded border`}>
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="directBankTransfer"
                        name="paymentMethod"
                        checked={formData.paymentMethod === "directBankTransfer"}
                        onChange={() => handlePaymentMethodChange("directBankTransfer")}
                        className="mr-2"
                      />
                      <label htmlFor="directBankTransfer" className="font-medium">Direct Bank Transfer</label>
                    </div>
                    <p className="text-sm text-gray-600 pl-5">
                      Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.
                    </p>
                  </div>
                  
                  <div className={`${formData.paymentMethod === "cashOnDelivery" ? "bg-gray-50 border-gray-200" : ""} p-4 rounded border`}>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        id="cashOnDelivery"
                        name="paymentMethod"
                        checked={formData.paymentMethod === "cashOnDelivery"}
                        onChange={() => handlePaymentMethodChange("cashOnDelivery")}
                        className="mr-2"
                      />
                      <label htmlFor="cashOnDelivery" className="font-medium">Cash on Delivery</label>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 text-sm text-gray-600">
                  <p>
                    Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <a href="/privacy-policy" className="text-amber-600 hover:underline">privacy policy</a>.
                  </p>
                </div>
                
                <button
                    type="submit"
                    disabled={isProcessing || mpesaProcessing}
                    className={`w-full py-3 px-4 mt-6 ${
                      isProcessing || mpesaProcessing
                        ? "bg-gray-400 cursor-not-allowed"
                        : formData.paymentMethod === "mpesa"
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-amber-600 hover:bg-amber-800"
                    } text-white transition`}
                  >
                    {isProcessing || mpesaProcessing ? (
                      <div className="flex justify-center items-center">
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        {formData.paymentMethod === "mpesa" ? "Processing M-PESA..." : "Processing..."}
                      </div>
                    ) : (
                      formData.paymentMethod === "mpesa" ? (
                        <div className="flex items-center justify-center gap-2">
                          <Smartphone className="w-5 h-5" />
                          Pay with M-PESA
                        </div>
                      ) : (
                        "Place Order"
                      )
                    )}
                  </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Footer Features */}
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

export default CheckoutPage;