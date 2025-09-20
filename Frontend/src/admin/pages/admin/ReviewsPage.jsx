import { useEffect, useState } from 'react';
import { ThemeLayout, ThemeCard, ThemeButton, ThemeAlert, ThemeSelect } from '@shared/theme';
import { useAuth } from '../../store/authStore';
import { listReviews, deleteReview } from '../../lib/api';

export default function ReviewsPage() {
  const { token } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [filterProduct, setFilterProduct] = useState('');

  const loadReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Admin Reviews: Loading reviews with token:', token ? 'Present' : 'Missing');
      
      const params = { page };
      if (filterProduct) params.product = filterProduct;
      
      console.log('Admin Reviews: Fetching reviews with params:', params);
      
      const response = await listReviews(params);
      console.log('Admin Reviews: Response received:', response);
      
      const data = response.data;
      console.log('Admin Reviews: Data received:', data);
      
      setReviews(data.results || data);
      setHasNext(!!data.next);
      setHasPrev(!!data.previous);
      
    } catch (err) {
      console.error('Admin Reviews: Failed to load product reviews:', err);
      setError('Failed to load product reviews. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [page, filterProduct]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this review? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteReview(id);
      setSuccess('Review deleted successfully');
      await loadReviews();
    } catch (err) {
      console.error('Failed to delete review:', err);
      setError('Failed to delete review. Please try again.');
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
            Product Reviews Management
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
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Filter by Product
              </label>
              <input
                type="text"
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                placeholder="Enter product name or ID..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <ThemeButton
                onClick={() => {
                  setFilterProduct('');
                  setPage(1);
                }}
                variant="secondary"
              >
                Clear Filters
              </ThemeButton>
            </div>
          </div>
        </ThemeCard>

        {/* Reviews Table */}
        <ThemeCard>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left border-b border-slate-200 dark:border-slate-700">
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Product</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">User</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Rating</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Comment</th>
                  <th className="py-3 pr-4 text-slate-700 dark:text-slate-300">Date</th>
                  <th className="py-3 text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 dark:text-slate-400">
                      Loading reviews...
                    </td>
                  </tr>
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500 dark:text-slate-400">
                      No product reviews found.
                    </td>
                  </tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.id} className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-slate-900 dark:text-slate-100">
                          {review.product_name || `Product #${review.product}`}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-700 dark:text-slate-300">
                          {review.author_name || review.user_name || 'Anonymous'}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">{renderStars(review.rating)}</span>
                          <span className="text-slate-600 dark:text-slate-400">({review.rating}/5)</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="max-w-xs truncate text-slate-700 dark:text-slate-300">
                          {review.comment || 'No comment'}
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="text-slate-600 dark:text-slate-400">
                          {formatDate(review.created_at)}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center space-x-2">
                          <ThemeButton
                            onClick={() => handleDelete(review.id)}
                            variant="danger"
                            size="sm"
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
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Showing {reviews.length} review{reviews.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center space-x-2">
              <ThemeButton
                onClick={() => setPage(page - 1)}
                disabled={!hasPrev}
                variant="secondary"
                size="sm"
              >
                Previous
              </ThemeButton>
              <span className="px-3 py-1 text-sm text-slate-600 dark:text-slate-400">
                Page {page}
              </span>
              <ThemeButton
                onClick={() => setPage(page + 1)}
                disabled={!hasNext}
                variant="secondary"
                size="sm"
              >
                Next
              </ThemeButton>
            </div>
          </div>
        </ThemeCard>
      </div>
    </ThemeLayout>
  );
}
