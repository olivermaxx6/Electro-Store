import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, CheckCircle, ArrowLeft, Calendar, User, Mail, Phone, MessageSquare } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import ServiceReviewForm from '../components/services/ServiceReviewForm';
import ServiceReviewList from '../components/services/ServiceReviewList';
import { getService, getServiceReviews, createServiceReview, submitServiceQuery, incrementServiceView, Service, ServiceReview } from '../lib/servicesApi';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { formatPrice } from '../lib/format';

// Transform API service data to match the component's expected format
const transformServiceData = (apiService: Service) => ({
  id: apiService.id,
  title: apiService.name,
  description: apiService.description,
  price: parseFloat(apiService.price.toString()),
  duration: apiService.availability || 'Contact for details',
  rating: parseFloat(apiService.rating.toString()),
  reviewCount: apiService.review_count,
  viewCount: apiService.view_count || 0,
  image: (apiService.images as any[])?.find(img => img.is_main)?.image || apiService.images?.[0]?.image || null,
  category: apiService.category?.name || 'Uncategorized',
  features: apiService.key_features || [],
  detailedDescription: apiService.overview || apiService.description,
  whatIncluded: apiService.included_features || [],
  process: apiService.process_steps || [],
  contactInfo: apiService.contact_info || {},
  availability: apiService.availability || '',
  testimonials: [] // We'll add testimonials from reviews if needed
});

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Local helper to compute review stats from fetched reviews
  const computeReviewStats = (sourceReviews: ServiceReview[]) => {
    if (!Array.isArray(sourceReviews) || sourceReviews.length === 0) {
      return { averageRating: 0, reviewCount: 0 };
    }
    const total = sourceReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0);
    const average = total / sourceReviews.length;
    return { averageRating: Math.round(average * 10) / 10, reviewCount: sourceReviews.length };
  };
  
  // Get store settings for currency
  const { settings } = useStoreSettings();
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    preferredDate: ''
  });
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    requirements: ''
  });

  // Fetch service data from API
  useEffect(() => {
    const fetchService = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch service and reviews in parallel
        const [apiService, serviceReviews] = await Promise.all([
          getService(id),
          getServiceReviews(id)
        ]);
        
        console.log('ServiceDetail: Raw serviceReviews response:', serviceReviews);
        
        const transformedService = transformServiceData(apiService);
        setService(transformedService);
        
        // Handle paginated response structure
        let reviewsArray = [];
        if (serviceReviews && typeof serviceReviews === 'object') {
          if (Array.isArray(serviceReviews)) {
            reviewsArray = serviceReviews;
          } else if (serviceReviews.results && Array.isArray(serviceReviews.results)) {
            reviewsArray = serviceReviews.results;
          }
        }
        
        console.log('ServiceDetail: Processed reviews array:', reviewsArray);
        setReviews(reviewsArray);
        
        // Track view
        try {
          await incrementServiceView(id);
        } catch (error) {
          console.error('Failed to increment service view:', error);
        }
        
      } catch (err) {
        console.error('Failed to fetch service:', err);
        setError('Failed to load service. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchService();
  }, [id]);

  // Add CSS for responsive service images
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .aspect-video {
        aspect-ratio: 16 / 9;
      }
      
      @supports not (aspect-ratio: 16 / 9) {
        .aspect-video {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 aspect ratio */
        }
        
        .aspect-video > * {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
      }
      
      /* Responsive service image sizing */
      @media (max-width: 640px) {
        .service-image-container {
          max-width: 100%;
          margin: 0 auto;
        }
      }
      
      @media (min-width: 641px) and (max-width: 1024px) {
        .service-image-container {
          max-width: 500px;
          margin: 0 auto;
        }
      }
      
      @media (min-width: 1025px) {
        .service-image-container {
          max-width: 600px;
          margin: 0 auto;
        }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Loading state
  if (loading) {
    return <LoadingScreen message="Loading service..." />;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Service</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  // Service not found
  if (!service) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Service Not Found</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">The service you're looking for doesn't exist.</p>
          <Link 
            to="/services" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !id) {
      alert('Service information is not available. Please try again.');
      return;
    }

    try {
      const queryData = {
        query_type: 'avail_service' as const,
        service: parseInt(id),
        name: bookingForm.name,
        email: bookingForm.email,
        phone: bookingForm.phone,
        message: bookingForm.message,
        preferred_date: bookingForm.preferredDate
      };

      const response = await submitServiceQuery(parseInt(id), queryData);
      alert(response.message || 'Your service request has been submitted! We will contact you within 24 hours.');
      setIsBookingModalOpen(false);
      setBookingForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        preferredDate: ''
      });
    } catch (error) {
      console.error('Failed to submit service request:', error);
      alert('Failed to submit your service request. Please try again or contact us directly.');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuoteInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!service || !id) {
      alert('Service information is not available. Please try again.');
      return;
    }

    try {
      const queryData = {
        query_type: 'free_quote' as const,
        service: parseInt(id),
        name: quoteForm.name,
        email: quoteForm.email,
        phone: quoteForm.phone,
        requirements: quoteForm.requirements
      };

      const response = await submitServiceQuery(parseInt(id), queryData);
      alert(response.message || 'Your quote request has been submitted! We will provide a detailed quote within 24 hours.');
      setIsQuoteModalOpen(false);
      setQuoteForm({
        name: '',
        email: '',
        phone: '',
        requirements: ''
      });
    } catch (error) {
      console.error('Failed to submit quote request:', error);
      alert('Failed to submit your quote request. Please try again or contact us directly.');
    }
  };

  const handleReviewSubmit = async (reviewData: { 
    rating: number; 
    comment: string; 
    author: string;
    serviceQuality: number;
    communication: number;
    timeliness: number;
    valueForMoney: number;
  }) => {
    try {
      console.log('Submitting review with data:', reviewData);
      console.log('Service ID:', id);
      
      // Create the review via API
      const newReview = await createServiceReview(parseInt(id!), {
        service: parseInt(id!),
        author_name: reviewData.author,
        rating: reviewData.rating,
        comment: reviewData.comment,
        service_quality: reviewData.serviceQuality,
        communication: reviewData.communication,
        timeliness: reviewData.timeliness,
        value_for_money: reviewData.valueForMoney,
      } as any);
      
      console.log('Review created successfully:', newReview);
      
      // Add the new review to the local state
      if (newReview && typeof newReview === 'object') {
        setReviews(prev => [newReview, ...prev]);
      }
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const serviceStats = computeReviewStats(reviews as any);
  
  // Use service's own rating and review count as fallback when no reviews are available
  const displayRating = serviceStats.reviewCount > 0 ? serviceStats.averageRating : service.rating;
  const displayReviewCount = serviceStats.reviewCount > 0 ? serviceStats.reviewCount : service.reviewCount;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-6" />

        {/* Back Button */}
        <Link 
          to="/services" 
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Service Header */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {displayRating.toFixed(1)} ({displayReviewCount} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        👁️ {service.viewCount} views
                      </span>
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {service.title}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {service.description}
                  </p>
                </div>
              </div>

               {/* Service Card */}
               <div className="w-full bg-gradient-to-br from-red-50 to-red-100 dark:from-blue-50 dark:to-blue-100 border-2 border-red-200 dark:border-blue-200 rounded-lg overflow-hidden">
                 <div className="aspect-video w-full max-w-md mx-auto">
                   {service.image ? (
                     <div className="w-full h-full flex items-center justify-center p-4 sm:p-6 lg:p-8">
                       <img 
                         src={service.image} 
                         alt={service.title}
                         className="w-full h-full object-contain"
                         onError={(e) => {
                           // If image fails to load, show the design card
                           const target = e.target as HTMLImageElement;
                           target.style.display = 'none';
                           const parent = target.parentElement;
                           if (parent) {
                             parent.innerHTML = `
                               <div class="w-full h-full flex items-center justify-center">
                                 <div class="text-center">
                                   <div class="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-2 sm:mb-4 bg-red-500 dark:bg-blue-500 rounded-full flex items-center justify-center">
                                     <svg class="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                       <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                     </svg>
                                   </div>
                                   <span class="text-sm sm:text-base lg:text-lg text-red-700 dark:text-blue-700 font-medium">${service.title}</span>
                                 </div>
                               </div>
                             `;
                           }
                         }}
                       />
                     </div>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center">
                       <div className="text-center">
                         <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 mx-auto mb-2 sm:mb-4 bg-red-500 dark:bg-blue-500 rounded-full flex items-center justify-center">
                           <svg className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                         </div>
                         <span className="text-sm sm:text-base lg:text-lg text-red-700 dark:text-blue-700 font-medium">{service.title}</span>
                       </div>
                     </div>
                   )}
                 </div>
               </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
              <div className="border-b border-gray-200 dark:border-slate-700">
                <nav className="flex space-x-8 px-6">
                  {[
                    { id: 'overview', label: 'Overview' },
                    { id: 'reviews', label: `Reviews (${reviews.length})` }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'border-red-500 text-red-500 dark:border-blue-500 dark:text-blue-500'
                          : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300 hover:border-gray-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <>
                  {/* Detailed Description */}
                  {service.detailedDescription && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">About This Service</h2>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {service.detailedDescription}
                      </p>
                    </div>
                  )}

                  {/* What's Included */}
                  {service.whatIncluded && service.whatIncluded.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What's Included</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.whatIncluded.map((item: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Process */}
                  {service.process && service.process.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-6">
                      <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6">Our Process</h2>
                      <div className="space-y-6 sm:space-y-8">
                        {service.process.map((step: any, index: number) => (
                          <div key={index} className="flex items-start gap-4 sm:gap-6">
                            <div className="flex-shrink-0 w-39 sm:w-41 flex justify-start">
                              <div className="bg-blue-500 text-white rounded-lg px-6 py-3 flex items-center justify-center font-bold text-sm sm:text-base w-39 sm:w-41 shadow-sm">
                                {step.step || index + 1}
                              </div>
                            </div>
                            <div className="flex-1 pt-1">
                              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2 break-words">
                                {step.title || step.name || `Step ${index + 1}`}
                              </h3>
                              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-3 break-words">
                                {step.description || step.details || ''}
                              </p>
                              {(step.duration || step.timeframe) && (
                                <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  <span className="break-words font-medium">{step.duration || step.timeframe}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Features */}
                  {service.features && service.features.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Key Features</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  {(service.contactInfo?.phone || service.contactInfo?.email) && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {service.contactInfo?.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{service.contactInfo.phone}</span>
                          </div>
                        )}
                        {service.contactInfo?.email && (
                          <div className="flex items-center gap-3">
                            <Mail className="w-5 h-5 text-gray-400" />
                            <span className="text-gray-700 dark:text-gray-300">{service.contactInfo.email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {service.availability && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Availability</h2>
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300">{service.availability}</span>
                      </div>
                    </div>
                  )}

                  {/* Testimonials */}
                  {service.testimonials && service.testimonials.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">What Our Clients Say</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {service.testimonials.map((testimonial: any, index: number) => (
                          <div key={index} className="border border-gray-200 dark:border-slate-600 rounded-lg p-4">
                            <div className="flex items-center gap-1 mb-3">
                              {[...Array(testimonial.rating)].map((_, i) => (
                                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              ))}
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 mb-3 italic">
                              "{testimonial.comment}"
                            </p>
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</span>
                              <span className="text-gray-500 dark:text-gray-400">- {testimonial.company}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-8 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                  <ServiceReviewForm 
                    serviceId={service.id.toString()} 
                    onSubmit={handleReviewSubmit}
                  />
                  <ServiceReviewList 
                    reviews={reviews as any}
                    averageRating={displayRating}
                    totalReviews={displayReviewCount}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Pricing Card */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6 sticky top-6">
              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  {formatPrice(service.price, (settings?.currency as any) || 'USD')}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  Starting from
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Duration: {service.duration}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-gray-700 dark:text-gray-300">{displayRating.toFixed(1)} ({displayReviewCount} reviews)</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-gray-700 dark:text-gray-300">Free consultation included</span>
                </div>
                {service.contactInfo?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{service.contactInfo.phone}</span>
                  </div>
                )}
                {service.contactInfo?.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">{service.contactInfo.email}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors mb-3"
              >
                Avail This Service
              </button>

              <button 
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full border border-red-300 dark:border-blue-500 text-red-700 dark:text-blue-300 hover:bg-red-50 dark:hover:bg-blue-900/20 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Get Free Quote
              </button>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
              <div className="space-y-3">
                {service.features.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Need Help?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {service.contactInfo?.phone}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {service.contactInfo?.email}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Live Chat Available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Booking Modal */}
        {isBookingModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Avail {service.title}
                  </h2>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={bookingForm.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={bookingForm.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={bookingForm.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Preferred Start Date
                    </label>
                    <input
                      type="date"
                      name="preferredDate"
                      value={bookingForm.preferredDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Details
                    </label>
                    <textarea
                      name="message"
                      value={bookingForm.message}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us more about your project requirements..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsBookingModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-red-300 dark:border-blue-500 text-red-700 dark:text-blue-300 rounded-md hover:bg-red-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Quote Modal */}
        {isQuoteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    Get Free Quote
                  </h2>
                  <button
                    onClick={() => setIsQuoteModalOpen(false)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={quoteForm.name}
                      onChange={handleQuoteInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={quoteForm.email}
                      onChange={handleQuoteInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={quoteForm.phone}
                      onChange={handleQuoteInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>





                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Project Requirements
                    </label>
                    <textarea
                      name="requirements"
                      value={quoteForm.requirements}
                      onChange={handleQuoteInputChange}
                      rows={4}
                      placeholder="Describe your project requirements in detail..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setIsQuoteModalOpen(false)}
                      className="flex-1 px-4 py-2 border border-red-300 dark:border-blue-500 text-red-700 dark:text-blue-300 rounded-md hover:bg-red-50 dark:hover:bg-blue-900/20 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-md transition-colors"
                    >
                      Get Quote
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;
