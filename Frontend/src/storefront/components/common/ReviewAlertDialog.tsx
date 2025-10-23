import React from 'react';
import { X, Star, Calendar, User } from 'lucide-react';

interface ReviewAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  existingReview: {
    id: number;
    author_name: string;
    rating: number;
    comment: string;
    created_at: string;
  } | null;
  onEditReview?: () => void;
  onViewReview?: () => void;
}

const ReviewAlertDialog: React.FC<ReviewAlertDialogProps> = ({
  isOpen,
  onClose,
  existingReview,
  onEditReview,
  onViewReview
}) => {
  if (!isOpen || !existingReview) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
              <Star className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
              Review Already Exists
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <p className="text-gray-600 dark:text-slate-300 mb-4">
              You have already reviewed this product. Here's your existing review:
            </p>
          </div>

          {/* Existing Review Display */}
          <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-500 dark:text-slate-400" />
                <span className="font-medium text-gray-900 dark:text-slate-100">
                  {existingReview.author_name}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                {renderStars(existingReview.rating)}
              </div>
            </div>
            
            <p className="text-gray-700 dark:text-slate-300 mb-3">
              {existingReview.comment}
            </p>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(existingReview.created_at)}</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReviewAlertDialog;
