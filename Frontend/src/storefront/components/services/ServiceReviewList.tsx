import React from 'react';
import { Star, Calendar, User, Clock, MessageSquare, DollarSign } from 'lucide-react';
import { useTheme } from '../../../hooks/useTheme';

interface ServiceReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
  verified?: boolean;
  serviceQuality: number;
  communication: number;
  timeliness: number;
  valueForMoney: number;
}

interface ServiceReviewListProps {
  reviews: ServiceReview[];
  averageRating?: number;
  totalReviews?: number;
}

const ServiceReviewList: React.FC<ServiceReviewListProps> = ({ 
  reviews, 
  averageRating = 0, 
  totalReviews = 0 
}) => {
  const { isDark } = useTheme();

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
                : isDark
                ? 'text-gray-600'
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

  const getCategoryAverages = () => {
    if (reviews.length === 0) return { serviceQuality: 0, communication: 0, timeliness: 0, valueForMoney: 0 };
    
    const totals = reviews.reduce((acc, review) => ({
      serviceQuality: acc.serviceQuality + review.serviceQuality,
      communication: acc.communication + review.communication,
      timeliness: acc.timeliness + review.timeliness,
      valueForMoney: acc.valueForMoney + review.valueForMoney,
    }), { serviceQuality: 0, communication: 0, timeliness: 0, valueForMoney: 0 });

    return {
      serviceQuality: totals.serviceQuality / reviews.length,
      communication: totals.communication / reviews.length,
      timeliness: totals.timeliness / reviews.length,
      valueForMoney: totals.valueForMoney / reviews.length,
    };
  };

  const distribution = getRatingDistribution();
  const categoryAverages = getCategoryAverages();

  return (
    <div className={`space-y-6 ${
      isDark ? 'text-slate-100' : 'text-gray-900'
    }`}>
      {/* Review Summary */}
      <div className={`p-6 rounded-lg border ${
        isDark 
          ? 'bg-slate-800 border-slate-700' 
          : 'bg-white border-gray-200'
      }`}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Overall Rating */}
          <div className="text-center">
            <div className={`text-4xl font-bold ${
              isDark ? 'text-slate-100' : 'text-gray-900'
            }`}>
              {averageRating.toFixed(1)}
            </div>
            <StarRating rating={Math.round(averageRating)} size="lg" />
            <div className={`text-sm mt-1 ${
              isDark ? 'text-slate-400' : 'text-gray-600'
            }`}>
              Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div>
            <h4 className={`font-medium mb-3 ${
              isDark ? 'text-slate-200' : 'text-gray-700'
            }`}>
              Rating Distribution
            </h4>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars) => (
                <div key={stars} className="flex items-center space-x-2">
                  <span className={`text-sm w-8 ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>
                    {stars}★
                  </span>
                  <div className={`flex-1 h-2 rounded-full ${
                    isDark ? 'bg-slate-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className={`h-2 rounded-full ${
                        isDark ? 'bg-blue-500' : 'bg-primary'
                      }`}
                      style={{
                        width: `${totalReviews > 0 ? (distribution[stars as keyof typeof distribution] / totalReviews) * 100 : 0}%`
                      }}
                    />
                  </div>
                  <span className={`text-sm w-8 text-right ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {distribution[stars as keyof typeof distribution]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Ratings */}
        {totalReviews > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
            <h4 className={`font-medium mb-4 ${
              isDark ? 'text-slate-200' : 'text-gray-700'
            }`}>
              Service Ratings Breakdown
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MessageSquare className={`w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>Service Quality</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarRating rating={Math.round(categoryAverages.serviceQuality)} size="sm" />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    {categoryAverages.serviceQuality.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <User className={`w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>Communication</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarRating rating={Math.round(categoryAverages.communication)} size="sm" />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    {categoryAverages.communication.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className={`w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>Timeliness</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarRating rating={Math.round(categoryAverages.timeliness)} size="sm" />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    {categoryAverages.timeliness.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DollarSign className={`w-4 h-4 ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`} />
                  <span className={`text-sm ${
                    isDark ? 'text-slate-300' : 'text-gray-600'
                  }`}>Value for Money</span>
                </div>
                <div className="flex items-center space-x-2">
                  <StarRating rating={Math.round(categoryAverages.valueForMoney)} size="sm" />
                  <span className={`text-sm font-medium ${
                    isDark ? 'text-slate-200' : 'text-gray-700'
                  }`}>
                    {categoryAverages.valueForMoney.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold ${
          isDark ? 'text-slate-200' : 'text-gray-900'
        }`}>
          Customer Reviews
        </h3>
        
        {reviews.length === 0 ? (
          <div className={`p-6 rounded-lg border text-center ${
            isDark 
              ? 'bg-slate-800 border-slate-700 text-slate-400' 
              : 'bg-white border-gray-200 text-gray-500'
          }`}>
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No reviews yet. Be the first to review this service!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              className={`p-4 rounded-lg border ${
                isDark 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-slate-700' : 'bg-gray-100'
                  }`}>
                    <User className={`w-5 h-5 ${
                      isDark ? 'text-slate-400' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${
                        isDark ? 'text-slate-200' : 'text-gray-900'
                      }`}>
                        {review.author}
                      </span>
                      {review.verified && (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          isDark 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          Verified Service
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <StarRating rating={review.rating} size="sm" />
                      <span className={`text-sm ${
                        isDark ? 'text-slate-400' : 'text-gray-500'
                      }`}>
                        {review.rating} out of 5 stars
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className={`flex items-center space-x-1 text-sm ${
                  isDark ? 'text-slate-400' : 'text-gray-500'
                }`}>
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(review.date)}</span>
                </div>
              </div>
              
              {/* Category Ratings */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <div className="text-center">
                  <div className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}>Service Quality</div>
                  <StarRating rating={review.serviceQuality} size="sm" />
                </div>
                <div className="text-center">
                  <div className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}>Communication</div>
                  <StarRating rating={review.communication} size="sm" />
                </div>
                <div className="text-center">
                  <div className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}>Timeliness</div>
                  <StarRating rating={review.timeliness} size="sm" />
                </div>
                <div className="text-center">
                  <div className={`text-xs ${
                    isDark ? 'text-slate-400' : 'text-gray-500'
                  }`}>Value for Money</div>
                  <StarRating rating={review.valueForMoney} size="sm" />
                </div>
              </div>
              
              <p className={`${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}>
                {review.comment}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ServiceReviewList;
