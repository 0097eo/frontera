import React, { useState, useEffect, useMemo } from 'react';
import { Star, Edit, Trash2, MessageSquare, Package, Bookmark, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center p-12 text-gray-500">
    <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
    <p className="mt-4 text-lg">Loading your orders & reviews...</p>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">
    <p className="font-semibold">Oops! Something went wrong.</p>
    <p>{message}</p>
  </div>
);

const EmptyState = ({ icon, title, message }) => {
  const IconComponent = icon;
  return (
    <div className="text-center py-16 px-6 bg-gray-50 rounded-lg">
      <IconComponent className="w-16 h-16 mx-auto text-gray-400 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 mt-2">{message}</p>
    </div>
  );
};

const StarRating = ({ rating, onRatingChange, editable = false }) => (
  <div className={`flex items-center gap-1 ${editable ? 'group' : ''}`}>
    {[1, 2, 3, 4, 5].map((star) => (
      <button
        key={star}
        type="button"
        disabled={!editable}
        onClick={editable ? () => onRatingChange(star) : undefined}
        className="focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded-full transition-transform duration-150 ease-in-out"
        aria-label={`Rate ${star} stars`}
      >
        <Star
          className={`w-6 h-6 transition-colors duration-200 ${
            star <= rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-gray-300 group-hover:text-amber-300'
          } ${editable ? 'cursor-pointer hover:scale-110' : ''}`}
        />
      </button>
    ))}
  </div>
);


const ProductToReviewItem = ({ item, onReviewClick }) => {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-200">
      <div className="flex items-center gap-4">
        <img 
          src={item.product_image} 
          alt={item.product_name} 
          className="w-16 h-16 object-cover rounded-md flex-shrink-0 bg-gray-200"
          onError={(e) => { e.target.onerror = null; e.target.src = '/api/placeholder/100/100'; }}
        />
        <div>
          <h5 className="text-base font-medium text-gray-800">{item.product_name}</h5>
          <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
        </div>
      </div>
      <button
        onClick={onReviewClick}
        className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-md text-sm hover:bg-amber-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 transition-all duration-200"
      >
        Write a Review
      </button>
    </div>
  );
};

const OrderCard = ({ order, onReviewClick }) => (
  <div className="border border-gray-200 bg-white rounded-lg shadow-sm overflow-hidden">
    <div className="p-4 bg-gray-50 border-b border-gray-200">
      <div className="flex justify-between items-center">
        <h4 className="font-semibold text-gray-700">Order #{order.id}</h4>
        <span className="text-xs font-medium text-green-700 bg-green-100 px-2.5 py-1 rounded-full uppercase tracking-wider">
          {order.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mt-1">
        Delivered on: {new Date(order.created_at).toLocaleDateString()}
      </p>
    </div>
    <div className="p-4 space-y-3">
      {order.items && order.items.map((item) => {
          if (!item.product) return null;
          return (
            <ProductToReviewItem 
                key={item.id} 
                item={item}
                onReviewClick={() => onReviewClick({
                    id: item.product, 
                    name: item.product_name,
                    image: item.product_image
                })}
            />
        )
      })}
    </div>
  </div>
);

const ReviewCard = ({ review, onEdit, onDelete }) => {
  if (!review.product) return null;

  return (
    <div className="border border-gray-200 bg-white rounded-lg shadow-sm p-5 relative">
      <div className="flex items-start gap-4">
        <img 
          src={review.product.image} 
          alt={review.product.name} 
          className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-gray-200"
          onError={(e) => { e.target.onerror = null; e.target.src = '/api/placeholder/100/100'; }}
        />
        <div className="flex-grow">
          <h4 className="font-semibold text-lg text-gray-800">{review.product.name}</h4>
          <p className="text-sm text-gray-500 mb-2">
            Reviewed on: {new Date(review.created_at).toLocaleDateString()}
          </p>
          <div className="mb-3">
            <StarRating rating={review.rating} />
          </div>
          <p className="text-gray-700 text-base leading-relaxed">{review.comment}</p>
        </div>
        <div className="absolute top-4 right-4 flex space-x-1">
          <button
            onClick={onEdit}
            className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-100 rounded-full transition-colors duration-200"
            aria-label="Edit review"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors duration-200"
            aria-label="Delete review"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, product, formData, onFormChange, onSubmit, isEditMode, submitting }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    aria-label="Close"
                >
                    <X className="w-6 h-6" />
                </button>
                
                <div className="p-8">
                    <h3 className="font-bold text-2xl text-gray-800 mb-2">
                        {isEditMode ? 'Edit Your Review' : 'Write a Review'}
                    </h3>
                    <p className="text-gray-600 mb-6">for {product.name}</p>

                    <form onSubmit={onSubmit}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating
                            </label>
                            <StarRating 
                                rating={formData.rating} 
                                onRatingChange={(rating) => onFormChange('rating', rating)}
                                editable={true}
                            />
                        </div>
                        
                        <div className="mb-8">
                            <label htmlFor="review-comment" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review
                            </label>
                            <textarea
                                id="review-comment"
                                value={formData.comment}
                                onChange={(e) => onFormChange('comment', e.target.value)}
                                required
                                className="w-full border-gray-300 rounded-md p-3 min-h-[120px] focus:ring-amber-500 focus:border-amber-500 transition duration-200"
                                placeholder="What did you like or dislike? How did you use this product?"
                            ></textarea>
                        </div>
                        
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 font-semibold rounded-md transition-colors duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-5 py-2.5 bg-amber-600 text-white font-semibold rounded-md hover:bg-amber-700 disabled:bg-amber-400 disabled:cursor-not-allowed flex items-center gap-2 transition-colors duration-200"
                            >
                                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                                {submitting ? 'Submitting...' : isEditMode ? 'Update Review' : 'Submit Review'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ label, icon, isActive, onClick, count }) => {
  const IconComponent = icon;
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-3 font-semibold text-base border-b-2 transition-colors duration-200 focus:outline-none ${
        isActive
          ? 'text-amber-600 border-amber-600'
          : 'text-gray-500 border-transparent hover:text-gray-800 hover:border-gray-300'
      }`}
    >
      <IconComponent className="w-5 h-5" />
      <span>{label}</span>
      {count > 0 && (
          <span className={`ml-1 text-xs font-bold px-2 py-0.5 rounded-full ${isActive ? 'bg-amber-100 text-amber-700' : 'bg-gray-200 text-gray-600'}`}>
              {count}
          </span>
      )}
    </button>
  );
};

const PendingReviews = () => {
  const [deliveredOrders, setDeliveredOrders] = useState([]);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reviewFormData, setReviewFormData] = useState({ rating: 5, comment: '' });
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('orders');


  const fetchDeliveredOrders = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('access');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      const response = await fetch('/api/orders/orders/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const deliveredOrdersData = data.filter(order => order.status === 'DELIVERED');
      setDeliveredOrders(deliveredOrdersData);
    } catch (error) {
      console.error('Error fetching delivered orders:', error);
      setError('Failed to load delivered orders. Please try again later.');
      toast.error('Failed to load delivered orders. Please try again later.');
    }
  };

  const fetchUserReviews = async () => {
    try {
      const token = localStorage.getItem('access');
      if (!token) return;
      const response = await fetch('/api/products/products/user-reviews/', {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setUserReviews(data);
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      toast.error('Failed to load your reviews. Please try again later.');
    }
  };
  
  useEffect(() => {
    const fetchAllData = async () => {
        setLoading(true);
        await Promise.all([fetchDeliveredOrders(), fetchUserReviews()]);
        setLoading(false);
    }
    fetchAllData();
  }, []);

  const pendingReviewOrders = useMemo(() => {
    const reviewedProductIds = new Set(userReviews.map(review => review.product.id));
    
    return deliveredOrders
      .map(order => ({
        ...order,
        items: order.items?.filter(item => item.product && !reviewedProductIds.has(item.product)) || [],
      }))
      .filter(order => order.items.length > 0);
  }, [deliveredOrders, userReviews]);


  const handleFormValueChange = (field, value) => {
    setReviewFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetFormAndCloseModal = () => {
    setReviewFormData({ rating: 5, comment: '' });
    setSelectedProduct(null);
    setIsEditMode(false);
    setCurrentReviewId(null);
  };

  const createReview = async (productId) => {
    if (!productId) {
      toast.error('Product ID is missing. Please try again.');
      return false;
    }
    try {
      const token = localStorage.getItem('access');
      if (!token) { toast.error('Authentication token not found.'); return false; }
      const response = await fetch(`/api/products/products/${productId}/reviews/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewFormData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      const newReview = await response.json();
      setUserReviews(prev => [...prev, { ...newReview, product: selectedProduct }]);
      toast.success('Review submitted successfully');
      return true;
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review.');
      return false;
    }
  };

  const updateReview = async () => {
    if (!selectedProduct || !selectedProduct.id || !currentReviewId) {
      toast.error('Product or review information is missing.');
      return false;
    }
    try {
      const token = localStorage.getItem('access');
      if (!token) { toast.error('Authentication token not found.'); return false; }
      const response = await fetch(`/api/products/products/${selectedProduct.id}/reviews/${currentReviewId}/`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewFormData)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      const updatedReview = await response.json();
      setUserReviews(prev => prev.map(review => 
          review.id === currentReviewId ? { ...updatedReview, product: selectedProduct } : review
      ));
      toast.success('Review updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      toast.error(error.message || 'Failed to update review.');
      return false;
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    let success = false;
    if (isEditMode) {
      success = await updateReview();
    } else {
      success = await createReview(selectedProduct.id);
    }
    if (success) {
      resetFormAndCloseModal();
    }
    setSubmitting(false);
  };
  
  const handleDeleteReview = async (productId, reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review? This action cannot be undone.')) return;
    
    try {
      const token = localStorage.getItem('access');
      if (!token) { toast.error('Authentication token not found.'); return; }
      const response = await fetch(`/api/products/products/${productId}/reviews/${reviewId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status !== 204) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Error ${response.status}: ${response.statusText}`);
      }
      setUserReviews(prev => prev.filter(review => review.id !== reviewId));
      toast.success('Review deleted successfully');
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error(error.message || 'Failed to delete review.');
    }
  };
  
  const handleOpenReviewModal = (product) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setReviewFormData({ rating: 5, comment: '' });
  };
  
  const handleEditReview = (review) => {
    if (!review || !review.product) { toast.error('Review information is incomplete.'); return; }
    setSelectedProduct({
      id: review.product.id,
      name: review.product.name,
      image: review.product.image
    });
    setReviewFormData({
      rating: review.rating,
      comment: review.comment || ''
    });
    setIsEditMode(true);
    setCurrentReviewId(review.id);
  };


  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto p-4 sm:p-6 lg:p-2">

        <ReviewModal
            isOpen={!!selectedProduct}
            onClose={resetFormAndCloseModal}
            product={selectedProduct}
            formData={reviewFormData}
            onFormChange={handleFormValueChange}
            onSubmit={handleSubmitReview}
            isEditMode={isEditMode}
            submitting={submitting}
        />
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 px-2">
            <TabButton 
                label="To Review" 
                icon={Package} 
                isActive={activeTab === 'orders'}
                onClick={() => setActiveTab('orders')}
                count={pendingReviewOrders.length}
            />
            <TabButton 
                label="My Reviews" 
                icon={Bookmark} 
                isActive={activeTab === 'reviews'}
                onClick={() => setActiveTab('reviews')}
                count={userReviews.length}
            />
          </div>
          
          <div className="p-4 md:p-6">
            {activeTab === 'orders' && (
              <div>
                {pendingReviewOrders.length === 0 ? (
                  <EmptyState 
                    icon={MessageSquare}
                    title="All Caught Up!"
                    message="You've reviewed all your delivered products. Great job!"
                  />
                ) : (
                  <div className="space-y-6">
                    {pendingReviewOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onReviewClick={handleOpenReviewModal} />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div>
                {userReviews.length === 0 ? (
                  <EmptyState 
                    icon={MessageSquare}
                    title="No Reviews Yet"
                    message="Your written reviews will appear here once you've submitted them."
                  />
                ) : (
                  <div className="space-y-6">
                    {userReviews.map((review) => (
                      <ReviewCard 
                        key={review.id} 
                        review={review} 
                        onEdit={() => handleEditReview(review)}
                        onDelete={() => handleDeleteReview(review.product.id, review.id)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PendingReviews;