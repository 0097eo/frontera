// Transform function needs to preserve the product_id for API calls
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

// Load cart from API for authenticated users
export const loadUserCart = async (accessToken) => {
  try {
    const response = await fetch('/api/cart/cart/', {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!response.ok) {
      return { success: false, data: [], total: 0 };
    }
    
    const data = await response.json();
    
    if (data && data.items && Array.isArray(data.items)) {
      const cartItems = data.items.map(transformProductToCartItem);
      // Extract total_price from response
      const total = parseFloat(data.total_price || 0);
      return { success: true, data: cartItems, total };
    }
    
    return { success: true, data: [], total: 0 };
  } catch (error) {
    console.error('Error loading user cart:', error);
    return { success: false, data: [], total: 0, error };
  }
};

// Load cart from localStorage for guest users
export const loadGuestCart = () => {
  try {
    const savedCart = localStorage.getItem('furnitureCart');
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      const items = Array.isArray(cartData.items) ? cartData.items : [];
      const total = parseFloat(cartData.total || 0);
      return { items, total };
    }
    return { items: [], total: 0 };
  } catch (error) {
    console.error('Error parsing cart from localStorage:', error);
    return { items: [], total: 0 };
  }
};

// Save cart to API for authenticated users
export const saveUserCart = async (items, currentItems, accessToken) => {
  if (!Array.isArray(items)) {
    console.error('Invalid cart items format');
    return { success: false, total: 0 };
  }

  try {
    const newItemsSet = new Set(items.map(item => item.id));
    
    // Update existing items
    const updatePromises = items
        .filter(item => item.cartItemId)
        .map(async (item) => {
          return fetch(`/api/cart/cart/item/${item.cartItemId}/`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              quantity: item.quantity
            })
          });
        });

    // Add new items - ensure we're sending product_id as expected by the API
    const addPromises = items
      .filter(item => !item.cartItemId)
      .map(async (item) => {
        const response = await fetch('/api/cart/cart/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            product_id: item.id, 
            quantity: item.quantity
          })
        });
        
        return response;
      });

    // Delete removed items
    const deletePromises = currentItems
      .filter(item => !newItemsSet.has(item.id) && item.cartItemId)
      .map(item => 
        fetch(`/api/cart/cart/item/${item.cartItemId}/`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        })
      );

    await Promise.all([...updatePromises, ...addPromises, ...deletePromises]);
    
    // Get updated cart with new total
    const { success, total } = await loadUserCart(accessToken);
    return { success, total };
  } catch (error) {
    console.error('Error saving user cart:', error);
    return { success: false, total: 0 };
  }
};

// Save cart to localStorage for guest users
export const saveGuestCart = (items) => {
  try {
    // Calculate total for guest cart since we don't have a backend to do it
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    localStorage.setItem('furnitureCart', JSON.stringify({ items, total }));
    return { success: true, total };
  } catch (error) {
    console.error('Error saving guest cart to localStorage:', error);
    return { success: false, total: 0 };
  }
};

// Transfer guest cart to user cart after login
export const transferGuestCart = async (accessToken) => {
  try {
    const guestCartData = localStorage.getItem('furnitureCart');
    if (guestCartData) {
      const parsedData = JSON.parse(guestCartData);
      const guestItems = parsedData.items || [];
      
      if (Array.isArray(guestItems) && guestItems.length > 0) {
        // Add all items from guest cart to user cart
        const addPromises = guestItems.map(item => 
          fetch('/api/cart/cart/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              product_id: item.id,  // Ensure this is the product ID
              quantity: item.quantity
            })
          })
        );
        
        await Promise.all(addPromises);
        localStorage.removeItem('furnitureCart');
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Error transferring guest cart:', error);
    return false;
  }
};