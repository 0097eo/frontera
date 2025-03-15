import React, { useState, useEffect } from 'react';
import WishlistContext from '../context/WishListContext';
import WishlistService from '../services/wishlistService';
import { useAuth } from '../hooks/useAuth';

const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();
  
  // Initialize wishlist service
  const wishlistService = new WishlistService();
  
  // Fetch wishlist on initial load and when auth state changes
  useEffect(() => {
    // Only fetch wishlist if user is authenticated
    if (isAuthenticated) {
      refreshWishlist();
    } else {
      // Reset wishlist when logged out
      setWishlist({ products: [] });
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  // Get the latest wishlist data
  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setError("You must be logged in to access your wishlist");
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await wishlistService.getWishlist();
      setWishlist(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching wishlist:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add a product to the wishlist
  const addToWishlist = async (productId) => {
    if (!isAuthenticated) {
      setError("You must be logged in to add items to your wishlist");
      return { success: false, error: "Authentication required" };
    }
    
    try {
      setLoading(true);
      const updatedWishlist = await wishlistService.addProduct(productId);
      setWishlist(updatedWishlist);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Remove a product from the wishlist
  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) {
      setError("You must be logged in to modify your wishlist");
      return { success: false, error: "Authentication required" };
    }
    
    try {
      setLoading(true);
      await wishlistService.removeProduct(productId);
      
      // Update local state
      setWishlist(prev => ({
        ...prev,
        products: prev.products.filter(product => product.id !== productId)
      }));
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Clear the entire wishlist
  const clearWishlist = async () => {
    if (!isAuthenticated) {
      setError("You must be logged in to clear your wishlist");
      return { success: false, error: "Authentication required" };
    }
    
    try {
      setLoading(true);
      await wishlistService.clearWishlist();
      
      // Reset wishlist state
      setWishlist({ products: [] });
      setError(null);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Check if a product is in the wishlist
  const isInWishlist = (productId) => {
    return wishlist.products.some(product => product.id === productId);
  };
  
  // Context value
  const contextValue = {
    wishlist,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    isInWishlist,
    refreshWishlist,
    userType: user?.user_type || null
  };
  
  return (
    <WishlistContext.Provider value={contextValue}>
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistProvider;