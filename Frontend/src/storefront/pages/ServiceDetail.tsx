import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, CheckCircle, ArrowLeft, Calendar, User, Mail, Phone, MessageSquare, Quote } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import LoadingScreen from '../components/common/LoadingScreen';
import ServiceReviewForm from '../components/services/ServiceReviewForm';
import ServiceReviewList from '../components/services/ServiceReviewList';
import { getService, getServiceReviews, createServiceReview, calculateServiceStats, submitServiceQuery, incrementServiceView, Service, ServiceReview } from '../../lib/servicesApi';
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
  image: apiService.images?.[0]?.image || null,
  category: apiService.category?.name || 'Uncategorized',
  features: apiService.key_features || [],
  detailedDescription: apiService.overview || apiService.description,
  whatIncluded: apiService.included_features || [],
  process: apiService.process_steps || [],
  testimonials: [] // We'll add testimonials from reviews if needed
});

// Service-specific mock review data
const serviceReviewsData: { [key: number]: any[] } = {
  1: [ // Website Development
    {
      id: '1',
      author: 'Sarah Johnson',
      rating: 5,
      comment: 'Excellent website development service! The team was professional, communication was clear throughout the project, and they delivered exactly what we needed. Highly recommend!',
      date: '2024-01-15',
      verified: true,
      serviceQuality: 5,
      communication: 5,
      timeliness: 4,
      valueForMoney: 5
    },
    {
      id: '2',
      author: 'Mike Chen',
      rating: 4,
      comment: 'Great website development experience. The final product exceeded our expectations and the team was very responsive to feedback.',
      date: '2024-01-10',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 3,
      valueForMoney: 4
    }
  ],
  2: [ // Mobile App Development
    {
      id: '3',
      author: 'Alex Rodriguez',
      rating: 5,
      comment: 'Outstanding mobile app development! The app works flawlessly on both iOS and Android. The UI/UX design is intuitive and the performance is excellent.',
      date: '2024-01-12',
      verified: true,
      serviceQuality: 5,
      communication: 5,
      timeliness: 5,
      valueForMoney: 5
    },
    {
      id: '4',
      author: 'Lisa Wang',
      rating: 4,
      comment: 'Great mobile app development service. The team delivered a high-quality app that our users love. Minor delays but overall very satisfied.',
      date: '2024-01-08',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 3,
      valueForMoney: 4
    }
  ],
  3: [ // E-commerce Solutions
    {
      id: '5',
      author: 'Emily Rodriguez',
      rating: 5,
      comment: 'Outstanding e-commerce solution! The platform is robust, user-friendly, and has significantly increased our online sales. The team provided excellent support throughout.',
      date: '2024-01-08',
      verified: false,
      serviceQuality: 5,
      communication: 5,
      timeliness: 5,
      valueForMoney: 5
    },
    {
      id: '6',
      author: 'James Wilson',
      rating: 4,
      comment: 'Excellent e-commerce platform development. The payment integration works seamlessly and the inventory management system is very efficient.',
      date: '2024-01-05',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 4,
      valueForMoney: 4
    }
  ],
  4: [ // Digital Marketing
    {
      id: '7',
      author: 'David Kim',
      rating: 4,
      comment: 'Good digital marketing service. Our website traffic increased by 150% in just 3 months. The team was responsive and provided detailed reports.',
      date: '2024-01-05',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 4,
      valueForMoney: 4
    },
    {
      id: '8',
      author: 'Maria Garcia',
      rating: 5,
      comment: 'Fantastic digital marketing results! Our conversion rates improved dramatically and the ROI on our ad spend increased significantly.',
      date: '2024-01-03',
      verified: true,
      serviceQuality: 5,
      communication: 5,
      timeliness: 5,
      valueForMoney: 5
    }
  ],
  5: [ // UI/UX Design
    {
      id: '9',
      author: 'Tom Anderson',
      rating: 5,
      comment: 'Exceptional UI/UX design work! The designs are modern, intuitive, and perfectly aligned with our brand. The team really understands user experience.',
      date: '2024-01-14',
      verified: true,
      serviceQuality: 5,
      communication: 5,
      timeliness: 4,
      valueForMoney: 5
    },
    {
      id: '10',
      author: 'Jennifer Lee',
      rating: 4,
      comment: 'Great design work! The wireframes and prototypes helped us visualize the final product perfectly. Very professional and creative team.',
      date: '2024-01-11',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 4,
      valueForMoney: 4
    }
  ],
  6: [ // Cloud Migration
    {
      id: '11',
      author: 'Robert Smith',
      rating: 5,
      comment: 'Seamless cloud migration! Zero downtime during the transition and our applications are now running faster than ever. Excellent technical expertise.',
      date: '2024-01-13',
      verified: true,
      serviceQuality: 5,
      communication: 5,
      timeliness: 5,
      valueForMoney: 5
    },
    {
      id: '12',
      author: 'Amanda Brown',
      rating: 4,
      comment: 'Professional cloud migration service. The team handled everything smoothly and provided excellent documentation throughout the process.',
      date: '2024-01-09',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 4,
      valueForMoney: 4
    }
  ],
  7: [ // Data Analytics
    {
      id: '13',
      author: 'Kevin Taylor',
      rating: 5,
      comment: 'Outstanding data analytics solution! The insights provided have transformed our decision-making process. The dashboards are intuitive and the reports are comprehensive.',
      date: '2024-01-16',
      verified: true,
      serviceQuality: 5,
      communication: 5,
      timeliness: 4,
      valueForMoney: 5
    },
    {
      id: '14',
      author: 'Rachel Green',
      rating: 4,
      comment: 'Great data analytics service. The team helped us understand our data better and provided actionable insights that improved our business performance.',
      date: '2024-01-12',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 4,
      valueForMoney: 4
    }
  ],
  8: [ // Technical Consulting
    {
      id: '15',
      author: 'Michael Johnson',
      rating: 5,
      comment: 'Excellent technical consulting! The team provided valuable insights and helped us make informed technology decisions. Very knowledgeable and professional.',
      date: '2024-01-17',
      verified: true,
      serviceQuality: 5,
      communication: 5,
      timeliness: 5,
      valueForMoney: 5
    },
    {
      id: '16',
      author: 'Sarah Davis',
      rating: 4,
      comment: 'Great technical consultation. The team helped us optimize our technology stack and provided clear recommendations for future improvements.',
      date: '2024-01-14',
      verified: true,
      serviceQuality: 4,
      communication: 4,
      timeliness: 4,
      valueForMoney: 4
    }
  ]
};

const ServiceDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [reviews, setReviews] = useState<ServiceReview[]>([]);
  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    projectType: '',
    timeline: '',
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
        
        const transformedService = transformServiceData(apiService);
        setService(transformedService);
        setReviews(serviceReviews);
        
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

      const response = await submitServiceQuery(queryData);
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
        project_type: quoteForm.projectType,
        timeline: quoteForm.timeline,
        requirements: quoteForm.requirements
      };

      const response = await submitServiceQuery(queryData);
      alert(response.message || 'Your quote request has been submitted! We will provide a detailed quote within 24 hours.');
      setIsQuoteModalOpen(false);
      setQuoteForm({
        name: '',
        email: '',
        phone: '',
        projectType: '',
        timeline: '',
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
      // Create the review via API
      const newReview = await createServiceReview({
        service: parseInt(id!),
        author_name: reviewData.author,
        rating: reviewData.rating,
        comment: reviewData.comment,
        service_quality: reviewData.serviceQuality,
        communication: reviewData.communication,
        timeliness: reviewData.timeliness,
        value_for_money: reviewData.valueForMoney,
      });
      
      // Add the new review to the local state
      setReviews(prev => [newReview, ...prev]);
      
    } catch (error) {
      console.error('Failed to submit review:', error);
      throw error; // Re-throw to let the form handle the error
    }
  };

  const serviceStats = calculateServiceStats(reviews);
  
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

              {/* Service Image */}
              <div className="w-full h-64 bg-gray-200 dark:bg-slate-700 rounded-lg overflow-hidden">
                {service.image ? (
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Placeholder size="lg">
                      <div className="text-gray-400 dark:text-gray-500"></div>
                    </Placeholder>
                  </div>
                )}
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
                          ? 'border-primary text-primary'
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
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">About This Service</h2>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {service.detailedDescription}
                    </p>
                  </div>

                  {/* What's Included */}
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">What's Included</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {service.whatIncluded.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Process */}
                  {service.process && service.process.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Process</h2>
                      <div className="space-y-6">
                        {service.process.map((step: any, index: number) => (
                          <div key={index} className="flex gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                                {step.step || index + 1}
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                {step.title || step.name || `Step ${index + 1}`}
                              </h3>
                              <p className="text-gray-600 dark:text-gray-300 mb-2">
                                {step.description || step.details || ''}
                              </p>
                              {(step.duration || step.timeframe) && (
                                <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="w-4 h-4" />
                                  {step.duration || step.timeframe}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Testimonials */}
                  {service.testimonials && service.testimonials.length > 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">What Our Clients Say</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {service.testimonials.map((testimonial, index) => (
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
                <div className="space-y-8">
                  <ServiceReviewForm 
                    serviceId={service.id.toString()} 
                    onSubmit={handleReviewSubmit}
                  />
                  <ServiceReviewList 
                    reviews={reviews}
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
              </div>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors mb-3"
              >
                Avail This Service
              </button>

              <button 
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 py-3 px-4 rounded-lg font-semibold transition-colors"
              >
                Get Free Quote
              </button>
            </div>

            {/* Features */}
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
              <div className="space-y-3">
                {service.features.map((feature, index) => (
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
                    {service.contact_info?.phone || '+1 (555) 123-4567'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {service.contact_info?.email || 'support@example.com'}
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
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
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
                      Project Type
                    </label>
                    <select
                      name="projectType"
                      value={quoteForm.projectType}
                      onChange={handleQuoteInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select project type</option>
                      <option value="website">Website Development</option>
                      <option value="mobile">Mobile App</option>
                      <option value="ecommerce">E-commerce</option>
                      <option value="marketing">Digital Marketing</option>
                      <option value="design">UI/UX Design</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Timeline
                    </label>
                    <select
                      name="timeline"
                      value={quoteForm.timeline}
                      onChange={handleQuoteInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select timeline</option>
                      <option value="urgent">Urgent (1-2 weeks)</option>
                      <option value="standard">Standard (1-2 months)</option>
                      <option value="flexible">Flexible (3+ months)</option>
                    </select>
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
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
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
