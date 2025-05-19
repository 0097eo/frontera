import React, { useEffect, useState } from 'react';
import { useWishList } from '../hooks/useWishList';
import useCart from '../hooks/useCart';
import { Heart, Trash2, ShoppingCart, AlertCircle, BadgeCheck, Truck, Headset, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import headerImage from '../assets/dresser.jpg';
import { toast } from 'sonner';

const WishlistPage = () => {
  const { wishlist, loading, error, refreshWishlist, removeFromWishlist, clearWishlist } = useWishList();
  const [removingIds, setRemovingIds] = useState([]);
  const { addItem, items: cartItems } = useCart();

  useEffect(() => {
    document.title = 'Wishlist | Shop';
  }, []);
  
  const handleRemoveItem = async (productId) => {
    setRemovingIds(prev => [...prev, productId]);
    try {
      await removeFromWishlist(productId);
      const product = wishlist.products.find(p => p.id === productId);
      toast.success(`${product?.name || 'Item'} removed from wishlist`, {
        position: 'top-center',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item from wishlist', {
        position: 'top-center',
        description: 'Please try again',
      });
    } finally {
      setRemovingIds(prev => prev.filter(id => id !== productId));
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      refreshWishlist();
      toast.success('Wishlist cleared successfully', {
        position: 'top-center',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to clear wishlist', {
        position: 'top-center',
        description: 'Please try again',
      });
    }
  };

  const handleAddToCart = (product) => {
    if (isInCart(product.id)) {
      toast.info('Product already in cart', {
        position: 'top-center',
        icon: <ShoppingCart className="h-4 w-4" />,
      });
      return;
    }
    
    addItem(product);
    toast.success(`${product.name} added to cart`, {
      position: 'top-center',
      icon: <ShoppingCart className="h-4 w-4" />,
      action: {
        label: 'View Cart',
        onClick: () => window.location.href = '/cart',
      },
    });
  };

  const isInCart = (productId) => cartItems.some(item => item.id === productId);

  if (loading) {
    return (
      <div className="bg-gray-50 pt-16">
        {/* Shop Header */}
        <div className="relative text-center">
          <div className="w-full h-32 sm:h-40 md:h-48 lg:h-64 overflow-hidden">
            <img 
              src={headerImage} 
              alt="Furniture Shop Header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-black">Wishlist</h1>
            <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-gray-900">Wishlist</span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-2 sm:px-4 py-8">
          <div className="flex justify-center items-center h-40 sm:h-64">
            <div role='status' className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 pt-16">
        {/* Shop Header */}
        <div className="relative text-center">
          <div className="w-full h-32 sm:h-40 md:h-48 lg:h-64 overflow-hidden">
            <img 
              src={headerImage} 
              alt="Furniture Shop Header" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
          </div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-black" >Wishlist</h1>
            <p className="text-xs sm:text-sm">
            <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-gray-900">Wishlist</span>
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <p className="text-center text-gray-500">Please try again later or contact support.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-16">
      {/* Shop Header */}
      <div className="relative text-center">
        <div className="w-full h-32 sm:h-40 md:h-48 lg:h-64 overflow-hidden">
          <img 
            src={headerImage} 
            alt="Furniture Shop Header" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/70"></div>
        </div>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-white">Wishlist</h1>
          <p className="text-xs sm:text-sm">
          <Link to="/" className="text-white hover:underline">Home</Link> {'>'} <span className="text-white">Wishlist</span>
          </p>
        </div>
      </div>
      
      {/* Filter Bar  */}
      <div className="bg-amber-50 shadow-sm p-2 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between gap-2 sm:gap-0">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2 text-gray-700 text-sm">
              <Heart size={16} className="text-amber-600" />
              <span>Wishlist Items</span>
            </div>

            <div className="text-xs sm:text-sm text-gray-500 hidden sm:block">
              Showing <span className="font-medium">{wishlist.products.length || 0}</span> saved items
            </div>
          </div>
          
          <div className="flex items-center">
            {wishlist.products.length > 0 && (
              <button 
                onClick={handleClearWishlist}
                className="text-xs sm:text-sm bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        <div className="text-xs text-gray-500 mt-2 sm:hidden">
          Showing <span className="font-medium">{wishlist.products.length || 0}</span> saved items
        </div>
      </div>
      
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        {/* Wishlist Items */}
        <div className="mb-6 sm:mb-8">
          {wishlist.products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-amber-500" />
              <h1 className="text-lg sm:text-xl font-bold mb-2">Your Wishlist is Empty</h1>
              <p className="text-gray-500 mb-6">Save items you love for later by clicking the heart icon on products.</p>
              <Link to="/shop">
                <button className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors text-sm">
                  Browse Products
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
              {wishlist.products.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-amber-400 hover:z-10"
                >
                  <div className="relative h-48 bg-gray-100">
                    <img
                      src={product.image || headerImage}
                      alt={product.name}
                      className="w-full h-full object-cover transition-all duration-300 hover:brightness-105"
                    />
                  </div>
                  
                  <div className="flex-grow p-3 sm:p-4 transition-colors duration-300 hover:bg-amber-50">
                    <h3 className="font-medium text-base sm:text-lg mb-1 line-clamp-2 transition-colors duration-300 hover:text-amber-700">{product.name}</h3>
                    <div className="mb-2">
                      <span className="font-bold text-amber-600 transition-colors duration-300 hover:text-amber-500">Ksh {Number(product.price).toLocaleString()}</span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2">{product.description}</p>
                    {product.stock > 0 ? (
                      <span className="text-xs text-green-600 font-medium transition-colors duration-300 hover:text-green-500">In Stock</span>
                    ) : (
                      <span className="text-xs text-red-600 font-medium transition-colors duration-300 hover:text-red-500">Out of Stock</span>
                    )}
                  </div>
                  
                  <div className="p-3 sm:p-4 pt-0 flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className={`flex-1 text-white py-1.5 px-3 rounded-md text-xs sm:text-sm font-medium flex items-center justify-center transition-all duration-300 ${isInCart(product.id) ? 'bg-gray-400' : 'bg-amber-600 hover:bg-amber-700 hover:scale-[1.02]'}`}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {isInCart(product.id) ? 'Already in Cart' : 'Add to Cart'}
                    </button>
                    <button 
                      className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:border-red-300 hover:scale-110"
                      onClick={() => handleRemoveItem(product.id)}
                      disabled={removingIds.includes(product.id)}
                    >
                      {removingIds.includes(product.id) ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-amber-500"></div>
                      ) : (
                        <Trash2 data-testid='remove-button' className="h-4 w-4 text-red-500" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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
              <p className="text-xs text-gray-600 xs:block">Curated products</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <BadgeCheck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">Warranty Protection</h3>
              <p className="text-xs text-gray-600">Over 2 years</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">Free Shipping</h3>
              <p className="text-xs text-gray-600 xs:block">Orders over KSh 50k</p>
            </div>
            
            <div className="bg-amber-50 p-2 sm:p-4">
              <div className="flex justify-center mb-1 sm:mb-2">
                <Headset className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-xs sm:text-sm font-bold mb-0.5 sm:mb-1">24/7 Support</h3>
              <p className="text-xs text-gray-600 xs:block">Dedicated support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;