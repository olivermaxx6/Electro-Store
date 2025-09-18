import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Heart, ShoppingCart, Minus, Plus, Star, Truck, Shield, RotateCcw } from 'lucide-react';
import { productRepo } from '../lib/repo';
import { addToCart } from '../store/cartSlice';
import { addToWishlist, removeFromWishlist, selectIsInWishlist } from '../store/wishlistSlice';
import { selectCurrentUser } from '../store/userSlice';
import { addToast } from '../store/uiSlice';
import { formatCurrency } from '../lib/format';
import { Currency } from '../lib/types';
import { useStoreSettings } from '../hooks/useStoreSettings';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import Price from '../components/products/Price';
import Stars from '../components/products/Stars';
import Badge from '../components/common/Badge';
import ProductCard from '../components/products/ProductCard';
import ReviewForm from '../components/products/ReviewForm';
import ReviewList from '../components/products/ReviewList';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [reviews, setReviews] = useState([
    {
      id: '1',
      author: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent wireless earbuds! The noise cancellation is outstanding and the sound quality is crystal clear. Battery life is impressive too.',
      date: '2024-01-15',
      verified: true
    },
    {
      id: '2',
      author: 'Mike Chen',
      rating: 4,
      comment: 'Great product overall. The spatial audio feature is amazing, though the fit could be better for smaller ears. Still recommend!',
      date: '2024-01-10',
      verified: true
    },
    {
      id: '3',
      author: 'Emily Rodriguez',
      rating: 5,
      comment: 'Perfect for my daily commute. The active noise cancellation blocks out subway noise completely. Worth every penny!',
      date: '2024-01-08',
      verified: false
    },
    {
      id: '4',
      author: 'David Kim',
      rating: 3,
      comment: 'Good sound quality but the battery drains faster than expected. The charging case is convenient though.',
      date: '2024-01-05',
      verified: true
    }
  ]);
  
  const currentUser = useSelector(selectCurrentUser);
  const userId = currentUser?.id || 'guest';
  const isInWishlist = useSelector(selectIsInWishlist(id || '', userId));
  const { settings } = useStoreSettings();
  
  useEffect(() => {
    const loadProduct = async () => {
      if (id) {
        try {
          const productData = await productRepo.getById(id);
          setProduct(productData);
        } catch (error) {
          console.error('Failed to load product:', error);
        }
      }
    };
    
    loadProduct();
  }, [id]);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Placeholder size="lg" className="mx-auto mb-4">
            <div className="text-gray-400">Loading...</div>
          </Placeholder>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }
  
  const handleAddToCart = () => {
    dispatch(addToCart({ productId: product.id, qty: quantity, userId }));
    dispatch(addToast({
      message: 'Added to cart!',
      type: 'success',
    }));
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
    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      date: new Date().toISOString().split('T')[0],
      verified: false
    };
    
    setReviews(prevReviews => [newReview, ...prevReviews]);
    dispatch(addToast({
      message: 'Thank you for your review!',
      type: 'success',
    }));
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
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div>
            <div className="mb-4">
              <Placeholder ratio="4/3" className="w-full h-96">
                <div className="text-gray-400">Main Product Image</div>
              </Placeholder>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-md overflow-hidden ${
                    selectedImage === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <Placeholder ratio="1/1">
                    <div className="text-gray-400 text-xs">Thumb {index}</div>
                  </Placeholder>
                </button>
              ))}
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
              </div>
            </div>
            
            {/* Quantity and Actions */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-sm font-medium text-gray-700 dark:text-slate-300">Quantity:</span>
                <div className="flex items-center border border-gray-300 dark:border-slate-600 rounded-md">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 text-center border-0 focus:ring-0 bg-transparent text-gray-900 dark:text-slate-100"
                    min="1"
                  />
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 bg-primary text-white py-3 px-6 rounded-md hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>Add to Cart</span>
                </button>
                
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-md border transition-colors ${
                    isInWishlist
                      ? 'bg-primary text-white border-primary'
                      : 'border-gray-300 text-gray-600 hover:border-primary hover:text-primary'
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
                      ? 'border-primary text-primary'
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
                      <span className="text-gray-600 dark:text-slate-400">{value}</span>
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
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-slate-100 mb-8">You May Also Like</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Placeholder for related products */}
            {[1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                <Placeholder ratio="4/3" className="w-full h-48 mb-4">
                  <div className="text-gray-400 dark:text-slate-500">Related Product {index}</div>
                </Placeholder>
                <h4 className="font-medium text-gray-900 dark:text-slate-100 mb-2">Related Product {index}</h4>
                <div className="text-primary font-semibold">{formatCurrency(299.99, settings?.currency as Currency || 'USD')}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;