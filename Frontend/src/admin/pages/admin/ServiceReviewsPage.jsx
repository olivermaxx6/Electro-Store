import { useEffect, useState } from 'react';
import { ThemeLayout, ThemeCard, ThemeButton, ThemeAlert, ThemeSelect } from '@theme';
import { listServiceReviews, deleteServiceReview, markServiceReviewVerified, markServiceReviewUnverified } from '../../lib/api';

export default function ServiceReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [filterService, setFilterService] = useState('');
  const [filterVerified, setFilterVerified] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = { page };
      if (filterService) params.service = filterService;
      if (filterVerified !== '') params.verified = filterVerified;
      
      const response = await listServiceReviews(params);
      console.log('ServiceReviewsPage: Response received:', response);
      
      // Handle different response structures safely
      const data = response?.data || response || {};
      console.log('ServiceReviewsPage: Data received:', data);
      
      setReviews(data?.results || data || []);
      setHasNext(!!data?.next);
      setHasPrev(!!data?.previous);
      
    } catch (err) {
      console.error('Failed to load service reviews:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      // Set safe fallback values
      setReviews([]);
      setHasNext(false);
      setHasPrev(false);
      setError('Failed to load service reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, filterService, filterVerified]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await deleteServiceReview(id);
      setSuccess('Review deleted successfully');
      await loadReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError('Failed to delete review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVerified = async (review) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      if (review.verified) {
        await markServiceReviewUnverified(review.id);
        setSuccess('Review marked as unverified');
      } else {
        await markServiceReviewVerified(review.id);
        setSuccess('Review marked as verified');
      }
      await loadReviews();
    } catch (err) {
      console.error('Failed to update review verification:', err);
      console.error('Error details:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data
      });
      setError('Failed to update review verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <ThemeLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
            Service Reviews Management
          </h1>
        </div>

        {/* Alerts */}
        {error && (
          <ThemeAlert type="error" onClose={() => setError(null)}>
            {error}
          </ThemeAlert>
        )}
        {success && (
          <ThemeAlert type="success" onClose={() => setSuccess(null)}>
            {success}
          </ThemeAlert>
        )}

        {/* Filters */}
        <ThemeCard>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by Service
              </label>
              <input
                type="text"
                value={filterService}
                onChange={(e) => setFilterService(e.target.value)}
                placeholder="Enter service name..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by Verification Status
              </label>
              <ThemeSelect
                value={filterVerified}
                onChange={(e) => setFilterVerified(e.target.value)}
              >
                <option value="">All Reviews</option>
                <option value="true">Verified Only</option>
                <option value="false">Unverified Only</option>
              </ThemeSelect>
            </div>
            <ThemeButton onClick={loadReviews} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </ThemeButton>
          </div>
        </ThemeCard>

        {/* Reviews Table */}
        <ThemeCard>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Service</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Author</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Rating</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Comment</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Verified</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Date</th>
                  <th className="py-3 text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">
                      Loading reviews...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No service reviews found.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {review.service_name || `Service #${review.service}`}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          {review.author_name}
                        </div>
                        {review.user_name && (
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            User: {review.user_name}
                          </div>
                        )}
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500 text-lg">
                            {renderStars(review.rating)}
                          </span>
                          <span className="text-slate-600 dark:text-slate-400">
                            ({review.rating}/5)
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Quality: {review.service_quality}/5 | 
                          Communication: {review.communication}/5 | 
                          Timeliness: {review.timeliness}/5 | 
                          Value: {review.value_for_money}/5
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="max-w-xs">
                          <p className="text-slate-700 dark:text-slate-300 line-clamp-3">
                            {review.comment}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          review.verified
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                        }`}>
                          {review.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-600 dark:text-slate-400">
                          {formatDate(review.created_at)}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <ThemeButton
                            size="sm"
                            variant={review.verified ? 'secondary' : 'primary'}
                            onClick={() => handleToggleVerified(review)}
                          >
                            {review.verified ? 'Unverify' : 'Verify'}
                          </ThemeButton>
                          <ThemeButton
                            size="sm"
                            variant="danger"
                            onClick={() => handleDelete(review.id)}
                          >
                            Delete
                          </ThemeButton>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {(hasNext || hasPrev) && (
            <div className="mt-6 flex items-center justify-between">
              <div className="flex gap-2">
                <ThemeButton
                  variant="secondary"
                  disabled={!hasPrev || loading}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </ThemeButton>
                <ThemeButton
                  variant="secondary"
                  disabled={!hasNext || loading}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </ThemeButton>
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Page {page}
              </div>
            </div>
          )}
        </ThemeCard>
      </div>
    </ThemeLayout>
  );
}
