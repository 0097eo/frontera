import { createContext } from 'react';

const WishlistContext = createContext({
  wishlist: { products: [] },
  loading: false,
  error: null,
  addToWishlist: () => {},
  removeFromWishlist: () => {},
  isInWishlist: () => false,
  clearWishlist: () => {},
  refreshWishlist: () => {}
});

export default WishlistContext;