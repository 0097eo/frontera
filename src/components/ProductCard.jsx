import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import useWishList from '../hooks/useWishList';

const ProductCard = ({ product }) => {
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishList();

  const handleWishlistClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation(); // Prevent event from bubbling up to the Link
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product.id);
    }
  };

  const formatPrice = (price) => {
    return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0';
  };

  return (
    <Link 
      to={`/products/${product.id}`} 
      className="block bg-white rounded-md overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 w-full h-full flex flex-col hover:scale-[1.03] hover:border hover:border-amber-400 hover:z-10"
    >
      <div className="relative w-full pt-[75%]">
        <img 
          src={product.image} 
          alt={product.name} 
          className="absolute top-0 left-0 w-full h-full object-cover transition-all duration-300 group-hover:brightness-105"
          onError={(e) => {
            e.target.src = "/api/placeholder/300/225";
            e.target.onerror = null;
          }}
        />
        
        {/* Status badges  */}
        {!product.is_available && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full">
            SOLD
          </div>
        )}
        {product.condition === 'NEW' && (
          <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold flex items-center justify-center h-6 w-6 sm:h-7 sm:w-7 rounded-full">
            NEW
          </div>
        )}
        
        {/* Sale badge */}
        {product.on_sale && (
          <div className="absolute bottom-2 left-2 bg-amber-600 text-white text-xs font-medium px-2 py-1 rounded transition-transform duration-300 hover:scale-105">
            SALE
          </div>
        )}
      </div>
      
      <div className="p-3 sm:p-4 flex-grow flex flex-col justify-between transition-colors duration-300 hover:bg-amber-50">
        <div>
          <h3 className="text-xs sm:text-sm font-medium line-clamp-2 leading-tight sm:leading-normal transition-colors duration-300 hover:text-amber-700">
            {product.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">{product.category_name}</p>
        </div>
        
        <div className="mt-2 sm:mt-3 flex justify-between items-center">
          <div>
            {product.original_price && product.original_price > product.price ? (
              <div className="flex items-baseline gap-1">
                <p className="font-bold text-amber-600 text-sm sm:text-base transition-all duration-300 hover:text-amber-500">
                  Ksh {formatPrice(product.price)}
                </p>
                <p className="text-xs text-gray-500 line-through">
                  Ksh {formatPrice(product.original_price)}
                </p>
              </div>
            ) : (
              <p className="font-bold text-amber-600 text-sm sm:text-base transition-colors duration-300 hover:text-amber-500">
                Ksh {formatPrice(product.price)}
              </p>
            )}
          </div>
          
          <button 
            className={`${
              isInWishlist(product.id) ? 'text-amber-600' : 'text-gray-500 hover:text-amber-600'
            } transition-all duration-300 p-1 -mr-1 hover:scale-125`}
            onClick={handleWishlistClick}
            aria-label={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
            title={isInWishlist(product.id) ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart 
              size={16} 
              className="sm:hidden transition-transform duration-300" 
              strokeWidth={2}
              fill={isInWishlist(product.id) ? "currentColor" : "none"}
            />
            <Heart 
              size={20} 
              className="hidden sm:block transition-transform duration-300" 
              strokeWidth={2}
              fill={isInWishlist(product.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;