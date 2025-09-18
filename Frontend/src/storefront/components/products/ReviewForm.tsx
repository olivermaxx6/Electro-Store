import React, { useState } from 'react';
import { Star, Send } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

interface ReviewFormProps {
  productId: string;
  onSubmit: (review: { rating: number; comment: string; author: string }) => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ productId, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [author, setAuthor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim() || !author.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ rating, comment: comment.trim(), author: author.trim() });
      setRating(0);
      setComment('');
      setAuthor('');
    } catch (error) {
      console.error('Failed to submit review:', error);
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
              : isDark
              ? 'text-gray-600'
              : 'text-gray-300'
          }`}
        >
          <Star className="w-6 h-6 fill-current" />
        </button>
      ))}
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
        Write a Review
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Author Name */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-slate-200' : 'text-gray-700'
          }`}>
            Your Name
          </label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Enter your name"
            required
            className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent ${
              isDark
                ? 'bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400'
                : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
            }`}
          />
        </div>

        {/* Star Rating */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-slate-200' : 'text-gray-700'
          }`}>
            Rating
          </label>
          <div className="flex items-center space-x-2">
            <StarRating />
            <span className={`text-sm ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              {rating > 0 && `${rating} out of 5 stars`}
            </span>
          </div>
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
            placeholder="Share your experience with this product..."
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
          disabled={rating === 0 || !comment.trim() || !author.trim() || isSubmitting}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            rating === 0 || !comment.trim() || !author.trim() || isSubmitting
              ? isDark
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary text-white hover:bg-primary-600'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Submitting...' : 'Submit Review'}</span>
        </button>
      </form>
    </div>
  );
};

export default ReviewForm;
