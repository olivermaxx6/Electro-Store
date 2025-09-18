import React, { useState } from 'react';
import { Star, Send, Calendar, Clock } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

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
  const { isDark } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || !comment.trim() || !author.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ 
        rating, 
        comment: comment.trim(), 
        author: author.trim(),
        serviceQuality,
        communication,
        timeliness,
        valueForMoney
      });
      setRating(0);
      setComment('');
      setAuthor('');
      setServiceQuality(0);
      setCommunication(0);
      setTimeliness(0);
      setValueForMoney(0);
    } catch (error) {
      console.error('Failed to submit review:', error);
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
      
      <form onSubmit={handleSubmit} className="space-y-6">
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

export default ServiceReviewForm;
