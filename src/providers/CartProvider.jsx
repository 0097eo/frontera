import { useState, useEffect } from "react";
import PropTypes from 'prop-types'; 
import useAuth from "../hooks/useAuth";
import CartContext from '../context/CartContext';
import {
  loadUserCart,
  loadGuestCart,
  saveUserCart,
  saveGuestCart,
  transferGuestCart as transferCart
} from '../services/cartService';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [currentItems, setCurrentItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();
  
  // Load cart on initial render and when auth state changes
  useEffect(() => {
    const loadCart = async () => {
      setLoading(true);
      if (isAuthenticated && user?.access) {
        const { success, data, total } = await loadUserCart(user.access);
        if (success) {
          setItems(data);
          setCurrentItems(data);
          setTotal(total);
        } else {
          setItems([]);
          setCurrentItems([]);
          setTotal(0);
        }
      } else {
        const { items: guestItems, total: guestTotal } = loadGuestCart();
        setItems(guestItems);
        setCurrentItems(guestItems);
        setTotal(guestTotal);
      }
      setLoading(false);
    };
    
    loadCart();
  }, [isAuthenticated, user]);
  
  // Save cart changes
  const saveCart = async (newItems) => {
    if (!Array.isArray(newItems)) {
      console.error('Invalid cart items format');
      return false;
    }
    
    let result = { success: false, total: 0 };
    
    if (isAuthenticated && user?.access) {
      result = await saveUserCart(newItems, currentItems, user.access);
    } else {
      result = saveGuestCart(newItems);
    }
    
    if (result.success) {
      // For authenticated users, we should reload the cart to get the updated data from the server
      if (isAuthenticated && user?.access) {
        const { success, data, total } = await loadUserCart(user.access);
        if (success) {
          setItems(data);
          setCurrentItems(data);
          setTotal(total);
          return true;
        }
        return false;
      } else {
        // For guest users, we can use the local calculation
        setItems(newItems);
        setCurrentItems(newItems);
        setTotal(result.total);
        return true;
      }
    }
    
    return false;
  };
  
  // Add item to cart
  const addItem = async (item) => {
    if (!item || !item.id) {
      console.error('Invalid item format, missing ID');
      return false;
    }

    // For authenticated users, directly use the API
    if (isAuthenticated && user?.access) {
      try {
        await fetch('/api/cart/cart/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.access}`
          },
          body: JSON.stringify({
            product_id: item.id,
            quantity: item.quantity || 1
          })
        });
        
        // Reload cart to get updated data
        const { success, data, total } = await loadUserCart(user.access);
        if (success) {
          setItems(data);
          setCurrentItems(data);
          setTotal(total);
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error adding item to cart:', error);
        return false;
      }
    } else {
      // For guest users, use the existing logic
      const existingItem = items.find(i => i.id === item.id);
      let newItems;
      
      if (existingItem) {
        // Update existing item quantity
        newItems = items.map(i =>
          i.id === item.id
            ? { ...i, quantity: i.quantity + (item.quantity || 1) }
            : i
        );
      } else {
        // Create a new item with essential properties
        const newItem = {
          id: item.id,
          name: item.name || 'Unknown',
          price: parseFloat(item.price || 0),
          image: item.image || '',
          quantity: item.quantity || 1
        };
        
        newItems = [...items, newItem];
      }
      
      return await saveCart(newItems);
    }
  };
  
  // Remove item from cart
  const removeItem = async (itemId) => {
    if (isAuthenticated && user?.access) {
      // Find the cart item ID for the product
      const cartItem = items.find(item => item.id === itemId);
      if (cartItem && cartItem.cartItemId) {
        try {
          await fetch(`/api/cart/cart/item/${cartItem.cartItemId}/`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${user.access}`
            }
          });
          
          // Reload cart to get updated data
          const { success, data, total } = await loadUserCart(user.access);
          if (success) {
            setItems(data);
            setCurrentItems(data);
            setTotal(total);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error removing item from cart:', error);
          return false;
        }
      }
      return false;
    } else {
      // For guest users, use the existing logic
      const newItems = items.filter(item => item.id !== itemId);
      return await saveCart(newItems);
    }
  };
  
  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity < 1) {
      return removeItem(itemId);
    }
    
    if (isAuthenticated && user?.access) {
      // Find the cart item ID for the product
      const cartItem = items.find(item => item.id === itemId);
      if (cartItem && cartItem.cartItemId) {
        try {
          const response = await fetch(`/api/cart/cart/item/${cartItem.cartItemId}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.access}`
            },
            body: JSON.stringify({
              quantity: quantity
            })
          });
          
          if (response.ok) {
            const cartData = await response.json();
            // Extract items and total from the response
            const updatedItems = cartData.items.map(transformProductToCartItem);
            const updatedTotal = parseFloat(cartData.total_price || 0);
            
            setItems(updatedItems);
            setCurrentItems(updatedItems);
            setTotal(updatedTotal);
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error updating item quantity:', error);
          return false;
        }
      }
      return false;
    } else {
      // For guest users, use the existing logic
      const newItems = items.map(item =>
        item.id === itemId
          ? { ...item, quantity }
          : item
      );
      
      return await saveCart(newItems);
    }
  };
  
  // Function to transform API response items to cart items (copied from cartService.js)
  const transformProductToCartItem = (item) => {
    return {
      cartItemId: item.id,
      id: item.product,  // This is the product_id needed for API calls
      name: item.product_name,
      price: parseFloat(item.product_price),
      quantity: item.quantity,
      image: item.product_image,
      subtotal: parseFloat(item.sub_total)
    };
  };
  
  const clearCart = async () => {
    if (isAuthenticated && user?.access) {
      try {
        const response = await fetch('/api/cart/cart/', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${user.access}`
          }
        });
        
        if (response.ok) {
          const cartData = await response.json();
          setItems([]);
          setCurrentItems([]);
          setTotal(parseFloat(cartData.total_price || 0));
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error clearing cart:', error);
        return false;
      }
    } else {
      // For guest users, just clear localStorage
      localStorage.removeItem('furnitureCart');
      setItems([]);
      setCurrentItems([]);
      setTotal(0);
      return true;
    }
  };
  
  // Transfer guest cart to user cart after login
  useEffect(() => {
    const handleTransferCart = async () => {
      if (isAuthenticated && user?.access) {
        const transferred = await transferCart(user.access);
        if (transferred) {
          const { success, data, total } = await loadUserCart(user.access);
          if (success) {
            setItems(data);
            setCurrentItems(data);
            setTotal(total);
          }
        }
      }
    };
    
    if (isAuthenticated && !loading) {
      handleTransferCart();
    }
  }, [isAuthenticated, user, loading]);
  
  const value = {
    items: items || [],
    total,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart
  };
  
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

CartProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export default CartProvider;