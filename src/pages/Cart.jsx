import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import useCart from "../hooks/useCart";
import headerImage from '../assets/dresser.jpg';
import { BadgeCheck, Truck, Headset, Trophy, Trash2, ShoppingCart } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { items, total, loading, removeItem, updateQuantity, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    document.title = 'Shopping Cart | Ideal Furniture & Decor';
  }, []);

  const handleQuantityChange = async (itemId, newQuantity) => {
    try {
      // Ensure quantity is a valid number and at least 1
      const quantity = Math.max(1, parseInt(newQuantity) || 1);
      
      // Find the item to get its name for the toast
      const item = items.find(item => item.id === itemId);
      
      await updateQuantity(itemId, quantity);
      
      toast.success(`Updated quantity of ${item?.name || 'item'} to ${quantity}`);
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity. Please try again.");
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      // Find the item to get its name for the toast
      const item = items.find(item => item.id === itemId);
      
      await removeItem(itemId);
      
      toast.success(`Removed ${item?.name || 'item'} from cart`, {
        description: "Item has been removed from your cart."
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item. Please try again.");
    }
  };

  const handleClearCart = async () => {
    try {
      toast.promise(
        async () => {
          await clearCart();
          return "Cart cleared successfully";
        },
        {
          loading: 'Clearing your cart...',
          success: () => 'Your cart has been cleared',
          error: 'Failed to clear cart'
        }
      );
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  const handleCheckout = () => {
    setIsProcessing(true);
    
    toast.promise(
      new Promise((resolve) => {
        setTimeout(() => {
          setIsProcessing(false);
          resolve();
          navigate('/checkout');
        }, 1500);
      }),
      {
        loading: 'Processing your order...',
        success: 'Order processed successfully! Redirecting to checkout...',
        error: 'There was an error processing your order. Please try again.'
      }
    );
  };

  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
  };

  if (loading) {
    return (
      <div
        role="status" 
        className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-900"></div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <div className="relative text-center">
          <div className="w-full h-24 sm:h-32 md:h-40 lg:h-56 overflow-hidden">
            <img 
              src={headerImage} 
              alt="Furniture Shop Header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">Cart</h1>
            <p className="text-xs sm:text-sm">
              <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-gray-200">Cart</span>
            </p>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center py-16">
            <ShoppingCart className="mx-auto mb-4 text-gray-400" size={64} strokeWidth={1.5} />
            <h1 className="text-2xl font-semibold mb-4">Your cart is empty</h1>
            <Link 
              to="/shop" 
              className="inline-block bg-amber-600 text-white px-6 py-2 rounded hover:bg-gray-800 transition"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="bg-gray-50 pt-16">
      {/* Cart Header */}
      <div className="relative text-center">
        <div className="w-full h-24 sm:h-32 md:h-40 lg:h-56 overflow-hidden">
          <img 
            src={headerImage} 
            alt="Furniture Shop Header" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-1 sm:mb-2 text-white">Cart</h1>
          <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-gray-200">Cart</span>
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart items section */}
          <div className="flex-grow">
            {/* Table header */}
            <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4 pb-2 border-b border-gray-200 bg-amber-50 h-10 text-sm font-medium text-gray-500">
              <div className="col-span-2 flex items-center justify-center">Product</div>
              <div className="flex items-center justify-center">Quantity</div>
              <div className="flex items-center justify-center">Subtotal</div>
            </div>
            
            {/* Cart items  */}
            {items.map((item) => (
              <div 
                key={item.id} 
                className="py-4 sm:py-6 border-b border-gray-200"
              >
                {/* Mobile layout (stacked) */}
                <div className="sm:hidden">
                  <div className="flex items-start space-x-3">
                    {/* Image */}
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-20 h-20 object-cover bg-gray-100 rounded"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/80/80";
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="w-20 h-20 bg-gray-100 flex items-center justify-center rounded">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                    
                    {/* Product details */}
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <h3 className="font-medium text-sm">{item.name}</h3>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-red-500 transition p-1"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      
                      {item.primary_material && (
                        <p className="text-xs text-gray-500">{item.primary_material}</p>
                      )}
                      
                      <div className="mt-1 text-sm font-medium">
                        Ksh {formatPrice(item.price.toFixed(2))}
                      </div>
                      
                      {/* Mobile Quantity and subtotal */}
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex border border-gray-200 rounded">
                          <button
                            onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                          >
                            -
                          </button>
                          <input
                            type="text"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-8 text-center border-x border-gray-200 py-1"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="text-sm">
                          <span className="text-gray-500 mr-1">Subtotal:</span>
                          <span className="font-medium">Ksh {formatPrice((item.price * item.quantity).toFixed(2))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Tablet and desktop layout (grid) */}
                <div className="hidden sm:grid sm:grid-cols-4 sm:gap-4 items-center">
                  <div className="col-span-2 flex items-center space-x-4">
                    {item.image ? (
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover bg-gray-100"
                        onError={(e) => {
                          e.target.src = "/api/placeholder/80/80";
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No image</span>
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      {item.primary_material && (
                        <p className="text-sm text-gray-500">{item.primary_material}</p>
                      )}
                      <div className="mt-1 text-sm">
                        Ksh {formatPrice(item.price.toFixed(2))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center items-center">
                    <div className="flex border border-gray-200 rounded">
                      <button
                        onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                        className="w-8 text-center border-x border-gray-200 py-1"
                      />
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Ksh {formatPrice((item.price * item.quantity).toFixed(2))}</span>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-gray-400 hover:text-red-500 transition p-1 group"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Action buttons below cart items */}
            <div className="flex justify-between mt-4">
              <button
                onClick={handleClearCart}
                className="text-xs sm:text-sm text-gray-500 hover:text-black transition flex items-center"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Cart
              </button>
              
              <Link
                to="/shop"
                className="text-xs sm:text-sm text-gray-500 hover:text-black transition"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
          
          {/* Cart totals */}
          <div className="mt-6 lg:mt-0 lg:w-72">
            <div className="bg-amber-50 p-4 sm:p-6 rounded">
              <h2 className="text-lg font-medium mb-4">Cart Totals</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>Ksh {formatPrice(total.toFixed(2))}</span>
                </div>
                
                <div className="flex justify-between text-sm border-b border-gray-200 pb-2">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-500 text-xs">Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between font-medium pt-2">
                  <span>Total</span>
                  <span>Ksh {formatPrice(total.toFixed(2))}</span>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={isProcessing}
                className={`w-full py-3 px-4 ${
                  isProcessing 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-amber-600 hover:bg-amber-800"
                } text-white transition text-sm`}
              >
                {isProcessing ? (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  "Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Features */}
      <div className="w-full bg-amber-50 mt-8 sm:mt-12 py-6 sm:py-8 border-t border-amber-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">High Quality</h3>
              <p className="text-xs text-gray-600">Curated products</p>
            </div>
            
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">Warranty Protection</h3>
              <p className="text-xs text-gray-600">Over 2 years</p>
            </div>
            
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">Free Shipping</h3>
              <p className="text-xs text-gray-600">Orders over KSh 50k</p>
            </div>
            
            <div className="p-3 sm:p-4 transition-all rounded">
              <div className="flex justify-center mb-2 sm:mb-3">
                <Headset className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm md:text-base font-bold mb-1">24/7 Support</h3>
              <p className="text-xs text-gray-600">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;