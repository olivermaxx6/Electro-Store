import React, { useState, useEffect } from 'react';
import { Star, Send, Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '../../../store/userSlice';
import { addToast } from '../../../store/uiSlice';
import { checkUserServiceReview } from '../../../lib/servicesApi';

interface ServiceReviewFormProps {
  serviceId: string;
  onSubmit: (review: { 
    rating: number; 
    comment: string; 
    author: string;
    serviceQuality: number;
    communication: number;
    timeliness: number;
    valueForMoney: number;
  }) => void;
}

const ServiceReviewForm: React.FC<ServiceReviewFormProps> = ({ serviceId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [serviceQuality, setServiceQuality] = useState(0);
  const [communication, setCommunication] = useState(0);
  const [timeliness, setTimeliness] = useState(0);
  const [valueForMoney, setValueForMoney] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true);
  const { isDark } = useTheme();
  const currentUser = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  // Check if user has already reviewed this service
  useEffect(() => {
    const checkReview = async () => {
      if (!currentUser?.isAuthenticated) {
        setCheckingReview(false);
        return;
      }

      try {
        const response = await checkUserServiceReview(serviceId);
        setHasReviewed(response.has_reviewed);
      } catch (error) {
        console.error('Failed to check user review:', error);
      } finally {
        setCheckingReview(false);
      }
    };

    checkReview();
  }, [serviceId, currentUser?.isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!currentUser?.isAuthenticated) {
      dispatch(addToast({
        message: 'You need to login first to add a review',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    // Check if user has already reviewed this service
    if (hasReviewed) {
      dispatch(addToast({
        message: 'You have already reviewed this service. You can only review each service once.',
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

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        rating, 
        comment: comment.trim(), 
        author: currentUser.name || currentUser.email || 'Anonymous',
        serviceQuality,
        communication,
        timeliness,
        valueForMoney
      });
      
      // Success toast
      dispatch(addToast({
        message: 'Thank you for your review! It has been submitted successfully.',
        type: 'success',
        duration: 4000
      }));
      
      setRating(0);
      setComment('');
      setAuthor('');
      setServiceQuality(0);
      setCommunication(0);
      setTimeliness(0);
      setValueForMoney(0);
    } catch (error) {
      console.error('Failed to submit review:', error);
      dispatch(addToast({
        message: 'Failed to submit review. Please try again.',
        type: 'error',
        duration: 5000
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating: React.FC<{ 
    rating: number; 
    setRating: (rating: number) => void;
    hoveredRating: number;
    setHoveredRating: (rating: number) => void;
    label: string;
  }> = ({ rating, setRating, hoveredRating, setHoveredRating, label }) => (
    <div className="space-y-2">
      <label className={`block text-sm font-medium ${
        isDark ? 'text-slate-200' : 'text-gray-700'
      }`}>
        {label}
      </label>
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
                : isDark
                ? 'text-gray-600'
                : 'text-gray-300'
            }`}
          >
            <Star className="w-5 h-5 fill-current" />
          </button>
        ))}
        <span className={`text-sm ml-2 ${
          isDark ? 'text-slate-400' : 'text-gray-600'
        }`}>
          {rating > 0 && `${rating} out of 5`}
        </span>
      </div>
    </div>
  );

  return (
    <div className={`p-6 rounded-lg border ${
      isDark 
        ? 'bg-slate-800 border-slate-700' 
        : 'bg-white border-gray-200'
    }`}>
      <h3 className={`text-lg font-semibold mb-4 ${
        isDark ? 'text-slate-100' : 'text-gray-900'
      }`}>
        Share Your Experience
      </h3>

      {/* Check if user has already reviewed */}
      {checkingReview ? (
        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className={`text-sm ${
              isDark ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Checking if you've already reviewed this service...
            </span>
          </div>
        </div>
      ) : hasReviewed ? (
        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <CheckCircle className={`w-5 h-5 ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
            <div>
              <div className={`text-sm font-medium ${
                isDark ? 'text-slate-200' : 'text-gray-900'
              }`}>
                Already Reviewed
              </div>
              <div className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                You have already reviewed this service. Thank you for your feedback!
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
        {/* User Authentication Status */}
        <div className={`p-4 rounded-lg border ${
          isDark 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentUser?.isAuthenticated 
                ? 'bg-green-100 dark:bg-green-900' 
                : 'bg-red-100 dark:bg-red-900'
            }`}>
              <span className={`text-sm font-medium ${
                currentUser?.isAuthenticated 
                  ? 'text-green-800 dark:text-green-200' 
                  : 'text-red-800 dark:text-red-200'
              }`}>
                {currentUser?.isAuthenticated ? '✓' : '!'}
              </span>
            </div>
            <div>
              <div className={`text-sm font-medium ${
                isDark ? 'text-slate-200' : 'text-gray-900'
              }`}>
                {currentUser?.isAuthenticated ? 'Signed in' : 'Not signed in'}
              </div>
              <div className={`text-xs ${
                isDark ? 'text-slate-400' : 'text-gray-600'
              }`}>
                {currentUser?.isAuthenticated 
                  ? `Reviewing as: ${currentUser.name || currentUser.email}`
                  : 'You need to login to submit a review'
                }
              </div>
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <StarRating
          rating={rating}
          setRating={setRating}
          hoveredRating={hoveredRating}
          setHoveredRating={setHoveredRating}
          label="Overall Rating"
        />

        {/* Detailed Ratings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <StarRating
            rating={serviceQuality}
            setRating={setServiceQuality}
            hoveredRating={0}
            setHoveredRating={() => {}}
            label="Service Quality"
          />
          
          <StarRating
            rating={communication}
            setRating={setCommunication}
            hoveredRating={0}
            setHoveredRating={() => {}}
            label="Communication"
          />
          
          <StarRating
            rating={timeliness}
            setRating={setTimeliness}
            hoveredRating={0}
            setHoveredRating={() => {}}
            label="Timeliness"
          />
          
          <StarRating
            rating={valueForMoney}
            setRating={setValueForMoney}
            hoveredRating={0}
            setHoveredRating={() => {}}
            label="Value for Money"
          />
        </div>

        {/* Comment */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-slate-200' : 'text-gray-700'
          }`}>
            Your Review
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this service..."
            rows={4}
            required
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={rating === 0 || !comment.trim() || !currentUser?.isAuthenticated || isSubmitting || hasReviewed}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            rating === 0 || !comment.trim() || !currentUser?.isAuthenticated || isSubmitting || hasReviewed
              ? isDark
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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

export default ServiceReviewForm;
