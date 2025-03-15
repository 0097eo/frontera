class WishlistService {
  constructor(baseUrl = '/api') {
    this.baseUrl = baseUrl;
    this.wishlistEndpoint = `${baseUrl}/products/wishlist/`;
  }

  // Get auth headers for authenticated requests
  getAuthHeaders() {
    const accessToken = localStorage.getItem('access');
    return {
      'Content-Type': 'application/json',
      'Authorization': accessToken ? `Bearer ${accessToken}` : ''
    };
  }

  // Fetch the user's wishlist
  async getWishlist() {
    try {
      const response = await fetch(this.wishlistEndpoint, {
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch wishlist');
      }
      
      return await response.json();
    } catch (error) {
      console.error('WishlistService error:', error);
      throw error;
    }
  }

  // Add a product to the wishlist
  async addProduct(productId) {
    try {
      const response = await fetch(this.wishlistEndpoint, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ product_id: productId })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add item to wishlist');
      }
      
      return await response.json();
    } catch (error) {
      console.error('WishlistService error:', error);
      throw error;
    }
  }

  // Remove a product from the wishlist
  async removeProduct(productId) {
    try {
      const response = await fetch(`${this.wishlistEndpoint}${productId}/`, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to remove item from wishlist');
      }
      
      return true;
    } catch (error) {
      console.error('WishlistService error:', error);
      throw error;
    }
  }

  async clearWishlist() {
    try {
      const response = await fetch(this.wishlistEndpoint, {
        method: 'DELETE',
        headers: this.getAuthHeaders()
      });
      
      if (!response.ok) {
        throw new Error('Failed to clear wishlist');
      }
      
      return true;
    } catch (error) {
      console.error('WishlistService error:', error);
      throw error;
    }
  }

}

export default WishlistService;