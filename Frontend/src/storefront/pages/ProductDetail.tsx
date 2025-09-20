import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import { productRepo } from '../lib/repo';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../store/wishlistSlice';
import { selectCurrentUser } from '../store/userSlice';
import { addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/format';
import { Currency } from '../lib/types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { getProductReviews, createProductReview, checkUserProductReview, incrementProductView } from '../../lib/productsApi';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import Price from '../components/products/Price';
import Stars from '../components/products/Stars';
import Badge from '../components/common/Badge';
import ReviewForm from '../components/products/ReviewForm';
import ReviewList from '../components/products/ReviewList';
import TitleUpdater from '../components/common/TitleUpdater';

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
          // Load product data
          const productData = await productRepo.getById(id);
          setProduct(productData);
          
          // Track view
          try {
            await incrementProductView(id);
          } catch (error) {
            console.error('Failed to increment product view:', error);
          }
          
          // Load related products
          const related = await productRepo.getRelatedProducts(id, 4);
          setRelatedProducts(related);
          
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

  // Check if user has already reviewed this product
  useEffect(() => {
    const checkReview = async () => {
      if (!currentUser?.isAuthenticated || !id) {
        setCheckingReview(false);
        return;
      }

      try {
        const response = await checkUserProductReview(id);
        setHasReviewed(response.has_reviewed);
      } catch (error) {
        console.error('Failed to check user review:', error);
      } finally {
        setCheckingReview(false);
      }
    };

    checkReview();
  }, [id, currentUser?.isAuthenticated]);
  
  if (loading || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Placeholder size="lg" className="mx-auto mb-4">
            <div className="text-gray-400 dark:text-slate-500">Loading...</div>
          </Placeholder>
          <p className="text-gray-600 dark:text-slate-400">Loading product details...</p>
        </div>
      </div>
    );
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
    
    try {
      const newReview = await createProductReview({
        product: parseInt(id!),
        rating: reviewData.rating,
        comment: reviewData.comment,
        author_name: currentUser.name || currentUser.email || 'Anonymous',
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
    } catch (error) {
      console.error('ProductDetail: Failed to submit review:', error);
      dispatch(addToast({
        message: 'Failed to submit review. Please try again.',
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
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            {/* Main Product Image */}
            <div className="mb-4">
              {product && product.images && product.images.length > 0 ? (
                <div className="w-full h-96 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden">
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
                <Placeholder ratio="4/3" className="w-full h-96">
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
          <div>
            <div className="mb-4">
              <Stars rating={calculateAverageRating()} count={reviews.length} />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-4">{product.title}</h1>
            
            <div className="mb-4">
              <Price price={product.price} oldPrice={product.oldPrice} size="lg" />
            </div>
            
            <div className="mb-6">
              <p className="text-gray-600 dark:text-slate-300 mb-4">{product.description}</p>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-slate-400">
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
                    className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
                    disabled={quantity <= 1}
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      const maxQuantity = product.stock || 1;
                      setQuantity(Math.max(1, Math.min(newQuantity, maxQuantity)));
                    }}
                    className="w-16 text-center border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-slate-100"
                    min="1"
                    max={product.stock || 1}
                  />
                  <button
                    onClick={() => {
                      const maxQuantity = product.stock || 1;
                      setQuantity(Math.min(quantity + 1, maxQuantity));
                    }}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-300"
                    disabled={quantity >= (product.stock || 1)}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {product.stock && (
                  <span className="text-sm text-gray-500 dark:text-slate-400">
                    ({product.stock} available)
                  </span>
                )}
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  disabled={!product.stock || product.stock <= 0}
                  className={`flex-1 py-3 px-6 rounded-md transition-colors flex items-center justify-center space-x-2 ${
                    !product.stock || product.stock <= 0
                      ? 'bg-gray-300 dark:bg-slate-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 dark:bg-blue-600 text-white hover:bg-red-700 dark:hover:bg-blue-700'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{!product.stock || product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-md border transition-colors ${
                    isInWishlist
                      ? 'bg-red-600 dark:bg-blue-600 text-white border-red-600 dark:border-blue-600'
                      : 'border-gray-300 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:border-red-500 dark:hover:border-blue-500 hover:text-red-600 dark:hover:text-blue-400'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isInWishlist ? 'fill-current' : ''}`} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {product.specs && Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-200 dark:border-slate-700">
                      <span className="font-medium text-gray-700 dark:text-slate-300">{key}:</span>
                      <span className="text-gray-600 dark:text-slate-400">{String(value)}</span>
                    </div>
                  ))}
                </div>
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
                <ReviewForm 
                  productId={product.id} 
                  onSubmit={handleReviewSubmit}
                  hasReviewed={hasReviewed}
                  checkingReview={checkingReview}
                />
                <ReviewList 
                  reviews={reviews}
                  averageRating={calculateAverageRating()}
                  totalReviews={reviews.length}
                />
              </div>
            )}
          </div>
        </div>
        
        {/* You May Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-8">You May Also Like</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link key={relatedProduct.id} to={`/product/${relatedProduct.id}`}>
                  <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="aspect-w-4 aspect-h-3 mb-4">
                      <img
                        src={relatedProduct.image}
                        alt={relatedProduct.title}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder-product.jpg';
                        }}
                      />
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2 line-clamp-2">
                      {relatedProduct.title}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-primary font-semibold">
                        {formatCurrency(relatedProduct.price, settings?.currency as Currency || 'USD')}
                      </span>
                      {relatedProduct.oldPrice && (
                        <span className="text-gray-500 line-through text-sm">
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
    </div>
  );
};

export default ProductDetail;