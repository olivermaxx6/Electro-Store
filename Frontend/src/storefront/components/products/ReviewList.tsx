import React from 'react';
import { Star, Calendar, User } from 'lucide-react';

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
}

interface ReviewListProps {
  reviews: Review[];
  averageRating?: number;
  totalReviews?: number;
}

const ReviewList: React.FC<ReviewListProps> = ({ 
  reviews, 
  averageRating = 0, 
  totalReviews = 0 
}) => {

  const StarRating: React.FC<{ rating: number; size?: 'sm' | 'md' | 'lg' }> = ({ 
    rating, 
    size = 'md' 
  }) => {
    const starSize = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';
    
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating as keyof typeof distribution]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <div className="space-y-6 text-gray-900">
      {/* Review Summary */}
      <div className="p-6 rounded-lg border bg-white border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex items-center space-x-4 mb-4 md:mb-0">
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </div>
              <StarRating rating={Math.round(averageRating)} size="lg" />
              <div className="text-sm mt-1 text-gray-600">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="flex-1 md:ml-8">
            <h4 className="font-medium mb-3 text-gray-700">
              Rating Distribution
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-2">
                  <span className="text-sm w-8 text-gray-600">
                    {stars}★
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-gray-200">
                    <div
                      className="h-2 rounded-full bg-primary"
                      style={{
                        width: `${totalReviews > 0 ? (distribution[stars as keyof typeof distribution] / totalReviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className="text-sm w-8 text-right text-gray-500">
                    {distribution[stars as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Customer Reviews
        </h3>
        
        {reviews.length === 0 ? (
          <div className="p-6 rounded-lg border text-center bg-white border-gray-200 text-gray-500">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 rounded-lg border bg-white border-gray-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-100">
                    <User className="w-5 h-5 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {review.author}
                      </span>
                      {review.verified && (
                        <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className="text-sm text-gray-500">
                        {review.rating} out of 5 stars
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(review.date)}</span>
                </div>
              </div>
              
              <p className="text-gray-700">
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewList;
