import React, { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../store/userSlice';
import { addToast } from '../../store/uiSlice';

interface ReviewFormProps {
  productId: string;
  onSubmit: (review: { rating: number; comment: string; author: string }) => void;
  hasReviewed?: boolean;
  checkingReview?: boolean;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSubmit, hasReviewed = false, checkingReview = false }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('ReviewForm: handleSubmit called', { rating, comment, author });
    
    // Check if user is authenticated
    if (!currentUser?.isAuthenticated) {
      dispatch(addToast({
        message: 'You need to login first to add a review',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    // Check if user has already reviewed this product
    if (hasReviewed) {
      dispatch(addToast({
        message: 'You have already reviewed this product. You can only review each product once.',
        type: 'error',
        duration: 5000
      }));
      return;
    }
    
    if (rating === 0 || !comment.trim()) {
      dispatch(addToast({
        message: 'Please fill in all required fields',
        type: 'error',
        duration: 3000
      }));
      return;
    }

    console.log('ReviewForm: Validation passed, submitting review');
    setIsSubmitting(true);
    try {
      await onSubmit({ 
        rating, 
        comment: comment.trim(), 
        author: currentUser.name || currentUser.email || 'Anonymous'
      });
      console.log('ReviewForm: Review submitted successfully');
      setRating(0);
      setComment('');
      setAuthor('');
    } catch (error) {
      console.error('ReviewForm: Failed to submit review:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = () => (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setRating(star)}
          onMouseEnter={() => setHoveredRating(star)}
          onMouseLeave={() => setHoveredRating(0)}
          className={`transition-colors duration-150 ${
            star <= (hoveredRating || rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 rounded-lg border bg-white border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">
        Write a Review
      </h3>

      {/* Check if user has already reviewed */}
      {checkingReview ? (
        <div className="p-4 rounded-lg border bg-gray-50 border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              Checking if you've already reviewed this product...
            </span>
          </div>
        </div>
      ) : hasReviewed ? (
        <div className="p-4 rounded-lg border bg-yellow-50 border-yellow-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Already Reviewed
              </div>
              <div className="text-xs text-gray-600">
                You have already reviewed this product. Thank you for your feedback!
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* User Authentication Status */}
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentUser?.isAuthenticated 
                  ? 'bg-green-100' 
                  : 'bg-red-100'
              }`}>
                <span className={`text-sm font-medium ${
                  currentUser?.isAuthenticated 
                    ? 'text-green-800' 
                    : 'text-red-800'
                }`}>
                  {currentUser?.isAuthenticated ? '✓' : '!'}
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.isAuthenticated ? 'Signed in' : 'Not signed in'}
                </div>
                <div className="text-xs text-gray-600">
                  {currentUser?.isAuthenticated 
                    ? `Reviewing as: ${currentUser.name || currentUser.email}`
                    : 'You need to login to submit a review'
                  }
                </div>
              </div>
            </div>
          </div>

        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Rating
          </label>
          <div className="flex items-center space-x-2">
            <StarRating />
            <span className="text-sm text-gray-600">
              {rating > 0 && `${rating} out of 5 stars`}
            </span>
          </div>
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            required
            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none bg-white border-gray-300 text-gray-900 placeholder-gray-500"
          />
        </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rating === 0 || !comment.trim() || !currentUser?.isAuthenticated || isSubmitting || hasReviewed}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
              rating === 0 || !comment.trim() || !currentUser?.isAuthenticated || isSubmitting || hasReviewed
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-primary text-white hover:bg-primary-600'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {!currentUser?.isAuthenticated 
                ? 'Login Required' 
                : hasReviewed
                  ? 'Already Reviewed'
                  : isSubmitting 
                    ? 'Submitting...' 
                    : 'Submit Review'
              }
            </span>
          </button>
        </form>
      )}
    </div>
  );
};

export default ReviewForm;
