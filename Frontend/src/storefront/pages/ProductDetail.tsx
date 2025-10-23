import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../store/wishlistSlice';
import { selectCurrentUser } from '../store/userSlice';
import { addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/format';
import { Currency } from '../lib/types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { normalizeImageUrl } from '../utils/imageUtils';
import { getProduct, getProductReviews, createProductReview, checkUserProductReview, incrementProductView } from '../../lib/productsApi';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import Price from '../components/products/Price';
import Stars from '../components/products/Stars';
import Badge from '../components/common/Badge';
import ReviewForm from '../components/products/ReviewForm';
import ReviewList from '../components/products/ReviewList';
import TitleUpdater from '../components/common/TitleUpdater';
import Placeholder from '../components/common/Placeholder';
import ReviewAlertDialog from '../components/common/ReviewAlertDialog';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [checkingReview, setCheckingReview] = useState(true);
  const [showReviewAlert, setShowReviewAlert] = useState(false);
  const [existingReview, setExistingReview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const isInWishlist = useSelector(selectIsInWishlist(id || '', userId));
  const { settings } = useStoreSettings();
  
  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        setLoading(true);
        try {
          // Load product data from API
          const productData = await getProduct(id);
          console.log('ProductDetail: Product data received', productData);
          
          // Transform the API data to match the expected format
          const transformedProduct = {
            id: productData.id.toString(),
            slug: productData.name.toLowerCase().replace(/\s+/g, '-'),
            title: productData.name,
            category: productData.category?.name || 'Uncategorized',
            brand: productData.brand_data?.name || 'Unknown',
            price: productData.price,
            oldPrice: productData.discount_rate && productData.discount_rate > 0 
              ? productData.price / (1 - productData.discount_rate / 100)
              : undefined,
            rating: productData.average_rating,
            ratingCount: productData.review_count,
            isNew: productData.isNew || false,
            discountPct: productData.discount_rate || 0,
            discount_rate: productData.discount_rate || 0,
            is_top_selling: productData.is_top_selling || false,
            description: productData.description,
            images: productData.images.map((img: any) => normalizeImageUrl(img.image)),
            stock: productData.stock || 0,
            inStock: (productData.stock || 0) > 0,
            sku: `SKU-${productData.id}`,
            specs: productData.technical_specs || {},
            viewCount: productData.view_count,
            image: (() => {
              const mainImage = productData.images.find((img: any) => img.is_main) || productData.images[0];
              return mainImage ? normalizeImageUrl(mainImage.image) : undefined;
            })(),
          };
          
          setProduct(transformedProduct);
          
          // Track view
          try {
            await incrementProductView(id);
          } catch (error) {
            console.error('Failed to increment product view:', error);
          }
          
          // Load related products (for now, set empty array)
          setRelatedProducts([]);
          
          // Load reviews
          console.log('ProductDetail: Loading reviews for product', id);
          const reviewsData = await getProductReviews(id);
          console.log('ProductDetail: Reviews data received', reviewsData);
          
          const formattedReviews = reviewsData.map((review: any) => ({
            id: review.id.toString(),
            author: review.author_name || review.user_name || review.user?.username || 'Anonymous',
            rating: review.rating,
            comment: review.comment || '',
            date: review.created_at.split('T')[0],
            verified: false // Can be enhanced later
          }));
          
          console.log('ProductDetail: Formatted reviews', formattedReviews);
          setReviews(formattedReviews);
        } catch (error) {
          console.error('Failed to load product:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    
    loadProduct();
  }, [id]);

  // Update selected image when product loads to show main image first
  useEffect(() => {
    if (product?.images) {
      const mainImageIndex = product.images.findIndex((img: any) => img.is_main);
      if (mainImageIndex >= 0) {
        setSelectedImage(mainImageIndex);
      }
    }
  }, [product]);

  // Check if user has already reviewed this product
  useEffect(() => {
    const checkReview = async () => {
      if (!id) {
        setCheckingReview(false);
        return;
      }

      try {
        // For authenticated users, check by user ID
        if (currentUser?.isAuthenticated) {
          const response = await checkUserProductReview(id);
          setHasReviewed(response.has_reviewed);
        } else {
          // For unauthenticated users, check by author name
          // We'll check this when they try to submit a review
          setHasReviewed(false);
        }
      } catch (error) {
        console.error('Failed to check user review:', error);
        setHasReviewed(false);
      } finally {
        setCheckingReview(false);
      }
    };

    checkReview();
  }, [id, currentUser?.isAuthenticated]);
  
  if (loading || !product) {
    return <LoadingScreen message="Loading product details..." />;
  }
  
  const handleAddToCart = () => {
    try {
      dispatch(addToCart({ productId: product.id, qty: quantity, userId }));
      
      dispatch(addToast({
        message: 'Added to cart!',
        type: 'success',
      }));
    } catch (error) {
      console.error('Error in handleAddToCart:', error);
    }
  };
  
  const handleWishlistToggle = () => {
    if (isInWishlist) {
      dispatch(removeFromWishlist({ productId: product.id, userId }));
      dispatch(addToast({
        message: 'Removed from wishlist',
        type: 'info',
      }));
    } else {
      dispatch(addToWishlist({ productId: product.id, userId }));
      dispatch(addToast({
        message: 'Added to wishlist!',
        type: 'success',
      }));
    }
  };

  const handleReviewSubmit = async (reviewData: { rating: number; comment: string; author: string }) => {
    console.log('ProductDetail: handleReviewSubmit called', { reviewData, productId: id });
    console.log('ProductDetail: currentUser:', currentUser);
    console.log('ProductDetail: isAuthenticated:', currentUser?.isAuthenticated);
    
    // Check if user is authenticated
    if (!currentUser?.isAuthenticated) {
      console.log('ProductDetail: User not authenticated, showing error');
      dispatch(addToast({
        message: 'You need to login first to add a review',
        type: 'error',
        duration: 5000
      }));
      return;
    }

    // Check if user has already reviewed this product
    if (hasReviewed) {
      // Find the existing review to show in the alert
      const userReview = reviews.find(review => 
        review.author === (currentUser.name || currentUser.email || 'Anonymous')
      );
      
      if (userReview) {
        setExistingReview({
          id: userReview.id,
          author_name: userReview.author,
          rating: userReview.rating,
          comment: userReview.comment,
          created_at: userReview.date
        });
        setShowReviewAlert(true);
        return;
      }
    }
    
    try {
      // For authenticated users, send user ID instead of author_name
      // The backend will use the user's name from the User model
      const newReview = await createProductReview({
        product: parseInt(id!),
        rating: reviewData.rating,
        comment: reviewData.comment,
        user: currentUser.id, // Send user ID for authenticated users
      });
      
      console.log('ProductDetail: New review received', newReview);
      
      const formattedReview = {
        id: newReview.id.toString(),
        author: newReview.author_name || currentUser.name || currentUser.email || 'Anonymous',
        rating: newReview.rating,
        comment: newReview.comment,
        date: newReview.created_at.split('T')[0],
        verified: false
      };
      
      console.log('ProductDetail: Adding review to state', formattedReview);
      setReviews(prevReviews => [formattedReview, ...prevReviews]);
      setHasReviewed(true);
      
      dispatch(addToast({
        message: 'Thank you for your review! It has been submitted successfully.',
        type: 'success',
        duration: 4000
      }));
    } catch (error: any) {
      console.error('ProductDetail: Failed to submit review:', error);
      
      // Extract error details
      const errorMessage = error.message || '';
      const errorData = error.response?.data || error.data || {};
      const errorString = JSON.stringify(errorData);
      
      console.log('ProductDetail: Error details:', {
        message: errorMessage,
        errorData,
        errorString,
        status: error.status
      });
      
      // Check if it's a duplicate review error
      const isDuplicateError = errorMessage.includes('already reviewed') ||
                               errorMessage.includes('already exists') ||
                               errorMessage.includes('duplicate') ||
                               errorString.includes('already exists') ||
                               errorString.includes('already reviewed') ||
                               errorString.includes('You have already reviewed this product') ||
                               error.status === 400; // 400 errors are often validation errors including duplicates
      
      if (isDuplicateError) {
        console.log('ProductDetail: Duplicate error detected, showing alert dialog');
        
        // Find the existing review to show in the alert
        const existingReviewData = reviews.find(review => 
          review.author === (currentUser.name || currentUser.email || 'Anonymous')
        );
        
        if (existingReviewData) {
          setExistingReview({
            id: existingReviewData.id,
            author_name: existingReviewData.author,
            rating: existingReviewData.rating,
            comment: existingReviewData.comment,
            created_at: existingReviewData.date
          });
        } else {
          // Fallback: Create a mock review for the alert dialog
          setExistingReview({
            id: 'unknown',
            author_name: currentUser.name || currentUser.email || 'Anonymous',
            rating: 5, // Default rating
            comment: 'You have already reviewed this product. Please check the reviews section below to see your existing review.',
            created_at: new Date().toISOString().split('T')[0]
          });
        }
        
        setShowReviewAlert(true);
        return;
      }
      
      // For other validation errors, show a more specific error message
      let errorMsg = 'Failed to submit review. Please try again.';
      
      if (errorData && typeof errorData === 'object') {
        // Extract specific field errors
        const fieldErrors = Object.values(errorData).flat();
        if (fieldErrors.length > 0) {
          errorMsg = Array.isArray(fieldErrors[0]) ? fieldErrors[0][0] : fieldErrors[0];
        }
      } else if (errorMessage) {
        errorMsg = errorMessage;
      }
      
      dispatch(addToast({
        message: errorMsg,
        type: 'error',
        duration: 5000
      }));
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

  // Alert dialog handlers
  const handleCloseReviewAlert = () => {
    setShowReviewAlert(false);
    setExistingReview(null);
  };

  const handleEditReview = () => {
    // Scroll to review form and focus on it
    const reviewForm = document.getElementById('review-form');
    if (reviewForm) {
      reviewForm.scrollIntoView({ behavior: 'smooth' });
      // You could add logic here to pre-fill the form with existing review data
    }
    handleCloseReviewAlert();
  };

  const handleViewAllReviews = () => {
    // Scroll to reviews section
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
    handleCloseReviewAlert();
  };
  
  const tabs = [
    { id: 'description', label: 'Description' },
    { id: 'specs', label: 'Specifications' },
    { id: 'shipping', label: 'Shipping & Returns' },
    { id: 'reviews', label: `Reviews (${reviews.length})` },
  ];
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <TitleUpdater pageTitle={product?.name || 'Product'} />
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Product Image */}
            <div>
              {product && product.main_image ? (
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <img 
                    src={product.main_image.startsWith('http') ? product.main_image : `http://127.0.0.1:8001${product.main_image}`}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              ) : product && product.images && product.images.length > 0 ? (
                <div className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px] bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
                  <img 
                    src={product.images[selectedImage]?.startsWith('http') ? product.images[selectedImage] : `http://127.0.0.1:8001${product.images[selectedImage]}`}
                    alt={product.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-product.jpg';
                    }}
                  />
                </div>
              ) : (
                <Placeholder ratio="4/3" className="w-full h-64 sm:h-80 md:h-96 lg:h-[500px]">
                  <div className="text-gray-400 dark:text-slate-500">No Product Image</div>
                </Placeholder>
              )}
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product && product.images && product.images.length > 0 ? (
                product.images.slice(0, 4).map((image: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden border-2 ${
                      selectedImage === index ? 'ring-2 ring-red-500 dark:ring-blue-500 border-red-500 dark:border-blue-500' : 'border-gray-200 dark:border-slate-600'
                    }`}
                  >
                    <img 
                      src={image?.startsWith('http') ? image : `http://127.0.0.1:8001${image}`}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-product.jpg';
                      }}
                    />
                  </button>
                ))
              ) : (
                [1, 2, 3, 4].map((index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-md overflow-hidden ${
                      selectedImage === index ? 'ring-2 ring-red-500 dark:ring-blue-500' : ''
                    }`}
                  >
                    <Placeholder ratio="1/1">
                      <div className="text-gray-400 dark:text-slate-500 text-xs">Thumb {index}</div>
                    </Placeholder>
                  </button>
                ))
              )}
            </div>
          </div>
          
          {/* Product Info */}
          <div className="space-y-4 sm:space-y-6">
            <div className="mb-4">
              <Stars rating={calculateAverageRating()} count={reviews.length} />
            </div>
            
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-slate-100 mb-4">{product.title}</h1>
            
            <div className="mb-4">
              <Price price={product.price} oldPrice={product.oldPrice} size="lg" />
            </div>
            
            <div className="mb-6">
              <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-slate-300 mb-4">{product.description}</p>
              
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 dark:text-slate-400">
                <span>SKU: {product.sku || 'N/A'}</span>
                <span>Brand: {product.brand || 'N/A'}</span>
                <span className={`${product.inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {product.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                {product.viewCount !== undefined && (
                  <span>👁️ {product.viewCount} views</span>
                )}
              </div>
            </div>
            
            {/* Quantity and Actions */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Quantity:</span>
                <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      const maxQuantity = product.stock || 0;
                      setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
                    }}
                    className="w-16 text-center border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-slate-100"
                    min="1"
                    max={product.stock || 0}
                  />
                  <button
                    onClick={() => {
                      const maxQuantity = product.stock || 0;
                      setQuantity(Math.min(quantity + 1, maxQuantity));
                    }}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={quantity >= (product.stock || 0)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock !== undefined && (
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    ({product.stock} available)
                  </span>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock <= 0}
                  className={`flex-1 py-3 sm:py-4 px-6 rounded-md transition-colors flex items-center justify-center space-x-2 text-sm sm:text-base md:text-lg min-h-[44px] ${
                    !product.stock || product.stock <= 0
                      ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 dark:bg-blue-600 text-white hover:bg-red-700 dark:hover:bg-blue-700'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 sm:p-4 rounded-md border transition-colors min-h-[44px] min-w-[44px] ${
                    isInWishlist
                      ? 'bg-red-600 dark:bg-blue-600 text-white border-red-600 dark:border-blue-600'
                      : 'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-red-500 dark:hover:border-blue-500 hover:text-red-600 dark:hover:text-blue-400'
                  }`}
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isInWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                <Truck className="w-5 h-5" />
                <span>Free Shipping</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                <Shield className="w-5 h-5" />
                <span>2 Year Warranty</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-slate-400">
                <RotateCcw className="w-5 h-5" />
                <span>30 Day Returns</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Product Tabs */}
        <div className="mt-16">
          <div className="border-b border-gray-200 dark:border-slate-700 mb-8">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-red-500 dark:border-blue-500 text-red-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
          
          <div className="prose max-w-none">
            {activeTab === 'description' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Product Description</h3>
                <p className="text-gray-600 dark:text-slate-300">{product.description}</p>
              </div>
            )}
            
            {activeTab === 'specs' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Specifications</h3>
                {product.specs && Object.keys(product.specs).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(product.specs).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-3 px-4 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                        <span className="font-medium text-gray-700 dark:text-slate-300">{key}:</span>
                        <span className="text-gray-600 dark:text-slate-400 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">⚙️</span>
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-slate-100 mb-2">No Specifications Available</h4>
                    <p className="text-gray-600 dark:text-slate-400">
                      Technical specifications for this product have not been provided yet.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'shipping' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-slate-100">Shipping & Returns</h3>
                <div className="space-y-4 text-gray-600 dark:text-slate-300">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Shipping Information</h4>
                    <p>We offer free shipping on all orders over {formatCurrency(50, settings?.currency as Currency || 'USD')}. Standard shipping takes 3-5 business days.</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Returns Policy</h4>
                    <p>You can return any item within 30 days of purchase for a full refund. Items must be in original condition.</p>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'reviews' && (
              <div className="space-y-8">
                <div id="review-form">
                  <ReviewForm 
                    productId={product.id} 
                    onSubmit={handleReviewSubmit}
                    hasReviewed={hasReviewed}
                    checkingReview={checkingReview}
                  />
                </div>
                <div id="reviews-section">
                  <ReviewList 
                    reviews={reviews}
                    averageRating={calculateAverageRating()}
                    totalReviews={reviews.length}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 mb-6 sm:mb-8">You May Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-w-4 aspect-h-3 mb-3 sm:mb-4">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.title}
                        className="w-full h-32 sm:h-40 md:h-48 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2 line-clamp-2 text-sm sm:text-base">
                      {relatedProduct.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-primary font-semibold text-sm sm:text-base">
                        {formatCurrency(relatedProduct.price, settings?.currency as Currency || 'USD')}
                      </span>
                      {relatedProduct.oldPrice && (
                        <span className="text-gray-500 line-through text-xs sm:text-sm">
                          {formatCurrency(relatedProduct.oldPrice, settings?.currency as Currency || 'USD')}
                        </span>
                      )}
                    </div>
                    {relatedProduct.discountPct > 0 && (
                      <div className="mt-2">
                        <Badge variant="success" size="sm">
                          -{relatedProduct.discountPct}%
                        </Badge>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Review Alert Dialog */}
      <ReviewAlertDialog
        isOpen={showReviewAlert}
        onClose={handleCloseReviewAlert}
        existingReview={existingReview}
        onEditReview={handleEditReview}
        onViewReview={handleViewAllReviews}
      />
    </div>
  );
};

export default ProductDetail;