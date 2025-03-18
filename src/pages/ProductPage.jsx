import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Toaster, toast } from 'sonner';
import { 
  Heart, 
  ShoppingCart, 
  Check, 
  Star, 
  Truck, 
  BadgeCheck, 
  Headset, 
  Clock 
} from 'lucide-react';
import ProductCard from '../components/ProductCard';
import ShareComponent from '../components/Share';
import Error500 from './error/500';
import useCart from "../hooks/useCart";
import useWishList from '../hooks/useWishList';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [serverError, setServerError] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addItem, items } = useCart(); 
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishList();
  const [addingToWishlist, setAddingToWishlist] = useState(false);

  // Fetch product details
  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      setServerError(false);
      
      try {
        const { data } = await axios.get(`/api/products/products/${id}/`);
        setProduct(data);
        
        // Fetch related products
        const { data: relatedData } = await axios.get(`/api/products/products/?category=${data.category}&exclude=${id}&limit=4`);
        setRelatedProducts(relatedData.results);
        
        setLoading(false);
      } catch (err) {
        setLoading(false);
        if (err?.response?.status === 500) {
          setServerError(true);
        } else if (err?.response?.status === 404) {
          navigate('/products/not-found', { replace: true });
        } else {
          setError(err.message || 'Failed to load product details');
        }
      }
    };
    
    fetchProductDetails();
  }, [id, navigate]);

  // Check if product is already in cart
  const isInCart = () => {
    return items.some(item => item.id === Number(id));
  };

  // Get current quantity in cart
  const getCartQuantity = () => {
    const cartItem = items.find(item => item.id === Number(id));
    return cartItem ? cartItem.quantity : 0;
  };

  // Handle retry for server error
  const handleRetry = () => {
    setServerError(false);
    window.location.reload();
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= (product?.stock || 10)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.stock || 10)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setAddingToCart(true);
    try {
      // Create a cart item with the required properties
      const cartItem = {
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        image: product.image,
        quantity: quantity,
        description: product.description,
        primary_material: product.primary_material,
        condition: product.condition,
        category: product.category,
      };
      
      // Add the item to cart using the context
      const success = await addItem(cartItem);
      
      if (success) {
        // Show success toast notification instead of alert
        toast.success(`Added ${quantity} ${product.name} to your cart`, {
          description: 'You can view your cart to checkout',
          duration: 3000,
        });
      } else {
        // Handle error with toast
        toast.error('Failed to add item to cart', {
          description: 'Please try again',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('An error occurred', {
        description: 'Unable to add item to cart',
        duration: 3000,
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    setAddingToWishlist(true);
    try {
      // Check if the product is already in the wishlist
      const productInWishlist = isInWishlist(product.id);
      
      if (productInWishlist) {
        // Remove from wishlist - just pass the ID
        const success = await removeFromWishlist(product.id);
        
        if (success) {
          toast.success(`Removed from wishlist`, {
            description: `${product.name} has been removed from your wishlist`,
            duration: 3000,
          });
        } else {
          toast.error('Failed to remove from wishlist', {
            description: 'Please try again',
            duration: 3000,
          });
        }
      } else {
        // Add to wishlist - ONLY pass the ID if that's what the API expects
        const success = await addToWishlist(product.id);
        
        if (success) {
          toast.success(`Added to wishlist`, {
            description: `${product.name} has been added to your wishlist`,
            duration: 3000, 
            icon: <Heart size={18} color="#EF4444" fill="#EF4444" />,
          });
        } else {
          toast.error('Failed to add to wishlist', {
            description: 'Please try again',
            duration: 3000,
          });
        }
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast.error('An error occurred', {
        description: 'Unable to update wishlist',
        duration: 3000,
      });
    } finally {
      setAddingToWishlist(false);
    }
  };

  // Shopping Bag SVG Component for placeholder
  const ShoppingBagSVG = () => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className="w-full h-full text-gray-300"
    >
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path>
      <line x1="3" y1="6" x2="21" y2="6"></line>
      <path d="M16 10a4 4 0 01-8 0"></path>
    </svg>
  );

  // Get product images (main image + additional if available)
  const getProductImages = () => {
    if (!product) return [];
    
    // Start with main image
    const allImages = [product.image];
    
    // Add additional images if available
    if (product.additional_images) {
      // If additional_images is a string of comma-separated URLs
      if (typeof product.additional_images === 'string') {
        const additionalImages = product.additional_images.split(',').map(url => url.trim());
        allImages.push(...additionalImages);
      }
      // If additional_images is already an array
      else if (Array.isArray(product.additional_images)) {
        allImages.push(...product.additional_images);
      }
    }
    
    return allImages;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  if (serverError) {
    return <Error500 onRetry={handleRetry} />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Error Loading Product</h2>
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => navigate('/products')} 
          className="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 transition-colors"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  if (!product) return null;

  const productImages = getProductImages();
  const displayRating = product.average_rating || 0;
  const reviewCount = product.review_count || 0;
  const cartQuantity = getCartQuantity();
  const productInCart = isInCart();
  const productInWishlist = isInWishlist(product.id);

  return (
    <div className="bg-gray-50 min-h-screen pt-18">
      <Toaster 
          position='top-center'
          richColors
          closeButton={true}
          duration={4000}
        />
      {/* Breadcrumb Navigation */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center text-sm">
          <Link to="/" className="text-gray-500 hover:text-amber-600">Home</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to="/shop" className="text-gray-500 hover:text-amber-600">Shop</Link>
          <span className="mx-2 text-gray-400">/</span>
          <Link to={`/products?category=${product.category}`} className="text-gray-500 hover:text-amber-600">{product.category_name}</Link>
          <span className="mx-2 text-gray-400">/</span>
          <span className="text-gray-800 font-medium">{product.name}</span>
        </div>
      </div>
      
      {/* Product Details Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Product Images Gallery */}
            <div className="w-full md:w-1/2 p-4">
              <div className="mb-4">
                {selectedImage < productImages.length ? (
                  <img 
                    src={productImages[selectedImage]} 
                    alt={`${product.name} - View ${selectedImage + 1}`} 
                    className="w-full h-64 sm:h-80 md:h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-64 sm:h-80 md:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="w-24 h-24">
                      <ShoppingBagSVG />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-4 gap-2">
                {/* Show actual product images first */}
                {productImages.map((image, index) => (
                  <div 
                    key={`image-${index}`} 
                    className={`cursor-pointer border-2 rounded-md overflow-hidden ${selectedImage === index ? 'border-amber-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(index)}
                  >
                    <img 
                      src={image} 
                      alt={`${product.name} - Thumbnail ${index + 1}`} 
                      className="w-full h-16 sm:h-20 object-cover"
                    />
                  </div>
                ))}
                
                {/* If we don't have 4 images total, show shopping bag placeholders */}
                {productImages.length < 4 && Array.from({ length: 4 - productImages.length }).map((_, index) => (
                  <div 
                    key={`placeholder-${index}`} 
                    className={`cursor-pointer border-2 rounded-md overflow-hidden bg-gray-100 ${selectedImage === productImages.length + index ? 'border-amber-500' : 'border-transparent'}`}
                    onClick={() => setSelectedImage(productImages.length + index)}
                  >
                    <div className="w-full h-16 sm:h-20 flex items-center justify-center">
                      <ShoppingBagSVG />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Product Information */}
            <div className="w-full md:w-1/2 p-4 md:p-6">
              <div className="flex items-center mb-2">
                <div className="flex items-center text-amber-500 mr-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      size={16} 
                      fill={star <= displayRating ? "#F59E0B" : "#E5E7EB"}
                      className={star <= displayRating ? "" : "text-gray-300"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">({reviewCount} reviews)</span>
              </div>
              
              <h1 className="text-2xl font-bold mb-2">{product.name}</h1>
              
              <div className="text-amber-600 text-2xl font-bold mb-4">
                Ksh {product.price?.toLocaleString()}
              </div>
              
              <div className="mb-4">
                <p className="text-gray-700 mb-4">{product.description}</p>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm mb-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Category:</span>
                    <span className="font-medium">{product.category_name}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Condition:</span>
                    <span className="font-medium">{product.condition}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Material:</span>
                    <span className="font-medium">{product.primary_material}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-600 mr-2">Status:</span>
                    <span className={`font-medium ${product.is_available ? 'text-green-600' : 'text-red-600'}`}>
                      {product.is_available ? 'In Stock' : 'Sold Out'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Product Features */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Key Features</h3>
                <ul className="space-y-1">
                  <li className="flex items-center text-sm">
                    <Check size={16} className="text-amber-500 mr-2" />
                    <span>Durable {product.primary_material.toLowerCase()} construction</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check size={16} className="text-amber-500 mr-2" />
                    <span>Premium quality craftsmanship</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check size={16} className="text-amber-500 mr-2" />
                    <span>Easy assembly and maintenance</span>
                  </li>
                  <li className="flex items-center text-sm">
                    <Check size={16} className="text-amber-500 mr-2" />
                    <span>Complements various interior styles</span>
                  </li>
                </ul>
              </div>
              
              {/* Quantity and Add to Cart */}
              {product.is_available && (
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <span className="text-gray-700 mr-4">Quantity:</span>
                    <div className={`flex items-center border border-gray-300 rounded-md ${!productInCart ? 'opacity-50 pointer-events-none' : ''}`}>
                      <button 
                        onClick={decrementQuantity}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        disabled={!productInCart}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="w-12 text-center border-0 focus:ring-0"
                        disabled={!productInCart}
                      />
                      <button 
                        onClick={incrementQuantity}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        disabled={!productInCart}
                      >
                        +
                      </button>
                    </div>
                    <span className="ml-4 text-sm text-gray-500">{product.stock || 10} available</span>
                  </div>
                  
                  {/* Show current cart info if product is in cart */}
                  {cartQuantity > 0 && (
                    <div className="mb-4 p-2 bg-amber-50 border border-amber-100 rounded-md text-amber-800 text-sm">
                      You have {cartQuantity} of this item in your cart.
                    </div>
                  )}
                  
                  {/* Display message when quantity area is disabled */}
                  {!productInCart && (
                    <div className="mb-4 p-2 bg-gray-50 border border-gray-200 rounded-md text-gray-700 text-sm">
                      Add this item to your cart first to adjust quantity.
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-2">
                    <button 
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className={`${
                        addingToCart ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'
                      } text-white px-6 py-2 rounded-md transition-colors flex items-center`}
                    >
                      <ShoppingCart size={18} className="mr-2" />
                      {addingToCart ? 'Adding...' : cartQuantity > 0 ? 'Add More to Cart' : 'Add to Cart'}
                    </button>
                    <button 
                      onClick={handleToggleWishlist}
                      disabled={addingToWishlist}
                      className={`${
                        productInWishlist 
                          ? 'border border-red-300 text-red-700 hover:bg-red-50' 
                          : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                      } px-4 py-2 rounded-md transition-colors flex items-center`}
                    >
                      <Heart 
                        size={18} 
                        className="mr-2" 
                        fill={productInWishlist ? "#EF4444" : "none"}
                        color={productInWishlist ? "#EF4444" : "currentColor"}
                      />
                      {addingToWishlist ? 'Updating...' : productInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    </button>
                    <ShareComponent product={product}/>
                  </div>
                  
                  {/* Wishlist status indicator */}
                  {productInWishlist && (
                    <div className="mt-2 text-sm text-red-600 flex items-center">
                      <Heart size={14} className="mr-1" fill="#EF4444" />
                      This item is in your wishlist
                    </div>
                  )}
                </div>
              )}
              
              {/* Product unavailable message */}
              {!product.is_available && (
                <div className="mb-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-md">
                  <p className="font-medium">This product is currently sold out.</p>
                  <p className="text-sm mt-1">Please check back later or browse our other products.</p>
                </div>
              )}
              
              {/* Shipping & Returns */}
              <div className="border-t border-gray-200 pt-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center">
                    <Truck size={16} className="text-amber-500 mr-2" />
                    <span>Free delivery on orders over Ksh 5,000</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="text-amber-500 mr-2" />
                    <span>30-day return policy</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Description Tabs */}
      <div className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <a href="#description" className="border-b-2 border-amber-500 text-amber-600 py-4 px-6 text-sm font-medium">
                Description
              </a>
              <a href="#reviews" className="text-gray-500 hover:text-gray-700 py-4 px-6 text-sm font-medium">
                Reviews ({reviewCount})
              </a>
              <a href="#shipping" className="text-gray-500 hover:text-gray-700 py-4 px-6 text-sm font-medium">
                Shipping & Returns
              </a>
            </nav>
          </div>
          
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Product Description</h2>
            <div className="text-gray-700 space-y-4">
              <p>{product.description}</p>
              <p>This premium {product.primary_material.toLowerCase()} {product.category_name.toLowerCase()} is designed to bring both style and functionality to your space. Crafted with attention to detail, it features a sturdy construction that ensures longevity and durability.</p>
              <p>The {product.name} is perfect for modern interiors and can easily complement various decor styles. Its ergonomic design provides optimal comfort, making it an excellent addition to your home or office.</p>
              
              <h3 className="text-md font-medium mt-6">Specifications</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Material: {product.primary_material}</li>
                <li>Dimensions: Please refer to product measurements</li>
                <li>Weight: Varies by specific model</li>
                <li>Condition: {product.condition}</li>
                <li>Assembly: Some assembly may be required</li>
              </ul>
              
              <h3 className="text-md font-medium mt-6">Care Instructions</h3>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Clean with a soft, dry cloth</li>
                <li>Avoid direct sunlight for prolonged periods</li>
                <li>Keep away from heat sources</li>
                <li>For wooden furniture, use appropriate wood polish</li>
                <li>For upholstered items, vacuum regularly and spot clean as needed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reviews Section */}
      <div id="reviews" className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium mb-4">Customer Reviews</h2>
            
            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map(review => (
                  <div key={review.id} className="border-b border-gray-100 pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex items-center text-amber-500 mr-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star}
                            size={14} 
                            fill={star <= review.rating ? "#F59E0B" : "#E5E7EB"}
                            className={star <= review.rating ? "" : "text-gray-300"}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">{review.user}</span>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(review.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-6">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
      
      {/* Features Section */}
      <div className="w-full bg-amber-50 py-8 mt-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="bg-amber-50 p-4">
              <div className="flex justify-center mb-2">
                <BadgeCheck className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold mb-1">Quality Guarantee</h3>
              <p className="text-xs text-gray-600">Carefully selected products</p>
            </div>
            
            <div className="bg-amber-50 p-4">
              <div className="flex justify-center mb-2">
                <Truck className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold mb-1">Free Shipping</h3>
              <p className="text-xs text-gray-600">On orders over Ksh 5,000</p>
            </div>
            
            <div className="bg-amber-50 p-4">
              <div className="flex justify-center mb-2">
                <Clock className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold mb-1">30-Day Returns</h3>
              <p className="text-xs text-gray-600">Hassle-free returns</p>
            </div>
            
            <div className="bg-amber-50 p-4">
              <div className="flex justify-center mb-2">
                <Headset className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-sm font-bold mb-1">24/7 Support</h3>
              <p className="text-xs text-gray-600">Customer service available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;