import React, { useState, useEffect } from 'react';
import { Star, Edit, Trash2, MessageSquare, ArrowLeft, Package, Bookmark } from 'lucide-react';
import { Toaster, toast } from 'sonner';

const PendingReviews = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    comment: ''
  });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');
  

  useEffect(() => {
    fetchDeliveredOrders();
    fetchUserReviews();
  }, []);

  // Update delivered orders when reviews change
  useEffect(() => {
    // Filter out products that have been reviewed from delivered orders
    if (deliveredOrders.length > 0 && userReviews.length > 0) {
      filterReviewedProducts();
    }
  }, [userReviews]);

  const fetchDeliveredOrders = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/orders/orders/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Filter for delivered orders only
      const deliveredOrdersData = data.filter(order => order.status === 'DELIVERED');
      
      setDeliveredOrders(deliveredOrdersData);
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
      setError('Failed to load delivered orders. Please try again later.');
      toast.error('Failed to load delivered orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        return;
      }
      
      const response = await fetch('/api/products/products/user-reviews/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setUserReviews(data);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      toast.error('Failed to load your reviews. Please try again later.');
    }
  };

  // Filter out products that have been reviewed from delivered orders
  const filterReviewedProducts = () => {
    const reviewedProductIds = new Set(userReviews.map(review => review.product.id));
    
    const filteredOrders = deliveredOrders.map(order => {
      // If order has items, filter out reviewed products
      if (order.items && order.items.length > 0) {
        const filteredItems = order.items.filter(item => 
          item.product && !reviewedProductIds.has(item.product.id)
        );
        
        // Return a new order object with filtered items
        return {
          ...order,
          items: filteredItems,
          // Add a flag to indicate if all items have been reviewed
          allReviewed: filteredItems.length === 0
        };
      }
      
      return order;
    });
    
    // Filter out orders where all items have been reviewed
    const pendingReviewOrders = filteredOrders.filter(order => 
      order.items && order.items.length > 0
    );
    
    setDeliveredOrders(pendingReviewOrders);
  };

  const handleRatingChange = (rating) => {
    setReviewFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleCommentChange = (e) => {
    setReviewFormData(prev => ({
      ...prev,
      comment: e.target.value
    }));
  };

  // Create a new review (POST)
  const createReview = async (productId) => {
    if (!productId) {
      toast.error('Product ID is missing. Please try again.');
      return false;
    }

    try {
      const token = localStorage.getItem('access');
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return false;
      }

      const url = `/api/products/products/${productId}/reviews/`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewFormData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const responseData = await response.json();
      // Add the new review with complete product information
      const productDetails = selectedProduct;
      setUserReviews(prev => [...prev, {
        ...responseData,
        product: {
          id: productId,
          name: productDetails.name,
          image: productDetails.image
        },
        created_at: new Date().toISOString()
      }]);

      toast.success('Review submitted successfully');
      fetchDeliveredOrders();
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review. Please try again.');
      return false;
    }
  };

  // Update an existing review (PUT)
  const updateReview = async () => {
    if (!selectedProduct || !selectedProduct.id || !currentReviewId) {
      toast.error('Product or review information is missing. Please try again.');
      return;
    }
    
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const productId = selectedProduct.id;
      const url = `/api/products/products/${productId}/reviews/${currentReviewId}/`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reviewFormData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      // Update the existing review in the array
      setUserReviews(prev => 
        prev.map(review => 
          review.id === currentReviewId 
            ? { ...responseData, product: selectedProduct } 
            : review
        )
      );
      
      toast.success('Review updated successfully');
      
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(error.message || 'Failed to update review. Please try again later.');
      return false;
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    let success = false;
    if (isEditMode) {
      success = await updateReview(selectedProduct.id, currentReviewId);
    } else {
      success = await createReview(selectedProduct.id);
    }

    if (success) {
      resetForm();
    }

    setSubmitting(false);
  };

  const handleDeleteReview = async (productId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('access');
      
      if (!token) {
        toast.error('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`/api/products/products/${productId}/reviews/${reviewId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }
      
      // Remove the deleted review from the list
      setUserReviews(prev => prev.filter(review => review.id !== reviewId));
      
      // If we're editing this review, reset the form
      if (currentReviewId === reviewId) {
        resetForm();
      }
      
      toast.success('Review deleted successfully');
      
      // After deleting a review, refresh the orders to show the product again
      fetchDeliveredOrders();
      
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review. Please try again later.');
    }
  };

  const handleEditReview = (review) => {
    if (!review || !review.product) {
      toast.error('Review information is incomplete. Please try again.');
      return;
    }
    
    // Set form data with the review values
    setReviewFormData({
      rating: review.rating,
      comment: review.comment || ''
    });
    
    // Set the product with available product details
    setSelectedProduct({
      id: review.product.id,
      name: review.product.name,
      image: review.product.image
    });
    
    // Set edit mode and review ID
    setIsEditMode(true);
    setCurrentReviewId(review.id);
    
    // Switch to the form section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setReviewFormData({
      rating: 5,
      comment: ''
    });
    setSelectedProduct(null);
    setIsEditMode(false);
    setCurrentReviewId(null);
  };

  // Render star rating component
  const StarRating = ({ rating, onRatingChange, editable = false }) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={editable ? "button" : undefined}
            onClick={editable ? () => onRatingChange(star) : undefined}
            className={`${editable ? 'cursor-pointer' : ''} focus:outline-none`}
          >
            <Star
              className={`w-5 h-5 ${
                star <= rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Render the review form
  const renderReviewForm = () => {
    if (!selectedProduct) return null;
    
    return (
      <div className="bg-white p-6 rounded border mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-lg">
            {isEditMode ? 'Edit Review' : 'Write a Review'} for {selectedProduct.name}
          </h3>
          <button
            onClick={resetForm}
            className="text-gray-500 hover:text-gray-700"
            type="button"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmitReview}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rating
            </label>
            <StarRating 
              rating={reviewFormData.rating} 
              onRatingChange={handleRatingChange}
              editable={true}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Review
            </label>
            <textarea
              value={reviewFormData.comment}
              onChange={handleCommentChange}
              required
              className="w-full border rounded p-2 min-h-24"
              placeholder="Share your experience with this product..."
            ></textarea>
          </div>
          
          <div className="flex justify-end">
            {isEditMode && (
              <button
                type="button"
                onClick={resetForm}
                className="mr-3 px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-amber-600 text-white  hover:bg-amber-700 disabled:bg-amber-300"
            >
              {submitting ? 'Submitting...' : isEditMode ? 'Update Review' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    );
  };

  if (loading) {
    return <div className="text-center p-4">Loading your orders and reviews...</div>;
  }

  if (error) {
    return <div className="text-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div>
      <div className="bg-white border rounded mb-6">
        <div className="border-b p-4">
          <h2 className="font-bold text-gray-700">ORDERS & REVIEWS</h2>
        </div>
      
        
        {/* Review Form */}
        {renderReviewForm()}
        
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center px-4 py-3 ${
              activeTab === 'orders'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Package className="w-5 h-5 mr-2" />
            <span>Completed Orders</span>
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex items-center px-4 py-3 ${
              activeTab === 'reviews'
                ? 'text-amber-500 border-b-2 border-amber-500'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <Bookmark className="w-5 h-5 mr-2" />
            <span>My Reviews</span>
          </button>
        </div>
        
        {/* Delivered Orders Tab */}
        {activeTab === 'orders' && (
          <div className="p-4">
            {deliveredOrders.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No pending reviews</h3>
                <p className="text-gray-500 mt-2">You've reviewed all your delivered products</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deliveredOrders.map((order) => (
                  <div key={order.id} className="border rounded p-4">
                    <div className="mb-3 pb-2 border-b">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">Order #{order.id}</h4>
                        <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        Ordered on: {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {order.items && order.items.map((item) => {
                        // Skip items with missing product data
                        if (!item.product) return null;
                        
                        return (
                          <div key={item.id} className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-12 h-12 mr-3 flex-shrink-0">
                                <img 
                                  src={item.product_image || (item.product && item.product.image)} 
                                  alt={item.product_name || (item.product && item.product.name)} 
                                  className="w-full h-full object-cover" 
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/api/placeholder/100/100';
                                  }}
                                />
                              </div>
                              <div>
                                <h5 className="text-sm font-medium">
                                  {item.product_name || (item.product && item.product.name)}
                                </h5>
                                <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                              </div>
                            </div>
                            
                            <button
                            onClick={() => {
                              setSelectedProduct({
                                id: item.product, // Using the product ID directly
                                name: item.product_name,
                                image: item.product_image
                              });
                              setIsEditMode(false);
                            }}
                            className="px-3 py-1 bg-amber-600 text-white rounded text-sm hover:bg-amber-700"
                          >
                            Review
                          </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="p-4">
            {userReviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <h3 className="text-lg font-medium">No reviews yet</h3>
                <p className="text-gray-500 mt-2">You haven't reviewed any products yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userReviews.map((review) => {
                  // Skip reviews with missing product data
                  if (!review.product) return null;
                  
                  return (
                    <div key={review.id} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 mr-3 flex-shrink-0">
                            <img 
                              src={review.product.image} 
                              alt={review.product.name} 
                              className="w-full h-full object-cover" 
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/api/placeholder/100/100';
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-medium">{review.product.name}</h4>
                            <p className="text-xs text-gray-500">
                              Reviewed on: {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditReview(review)}
                            className="p-1 text-amber-600 hover:text-amber-700"
                            aria-label="Edit review"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReview(review.product.id, review.id)}
                            className="p-1 text-red-500 hover:text-red-700"
                            aria-label="Delete review"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mb-2">
                        <StarRating rating={review.rating} />
                      </div>
                      
                      <p className="text-gray-700 text-sm">{review.comment}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <Toaster 
                position='top-center'
                richColors
                closeButton={true}
                duration={4000}
      />
    </div>
  );
};

export default PendingReviews;