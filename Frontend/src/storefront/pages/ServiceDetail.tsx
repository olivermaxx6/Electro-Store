import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Star, Clock, CheckCircle, ArrowLeft, Calendar, User, Mail, Phone, MessageSquare, Quote } from 'lucide-react';
import Breadcrumbs from '../components/common/Breadcrumbs';
import Placeholder from '../components/common/Placeholder';
import ServiceReviewForm from '../components/services/ServiceReviewForm';
import ServiceReviewList from '../components/services/ServiceReviewList';

// Mock services data - in a real app, this would come from an API
const servicesData = [
  {
    id: 1,
    title: 'Website Development',
    description: 'Professional website development using modern technologies like React, Node.js, and more.',
    price: 299,
    duration: '2-3 weeks',
    rating: 4.8,
    reviewCount: 124,
    image: '/api/placeholder/600/400',
    category: 'Development',
    features: ['Responsive Design', 'SEO Optimized', 'Fast Loading', 'Mobile Friendly'],
    detailedDescription: 'Our website development service provides you with a modern, responsive, and high-performance website that will help your business stand out online. We use the latest technologies and best practices to ensure your website is not only visually appealing but also functional and optimized for search engines.',
    whatIncluded: [
      'Custom website design and development',
      'Responsive design for all devices',
      'SEO optimization and meta tags',
      'Content management system',
      'Contact forms and integrations',
      'SSL certificate setup',
      'Website hosting setup',
      '3 months of free support'
    ],
    process: [
      {
        step: 1,
        title: 'Discovery & Planning',
        description: 'We start by understanding your business goals, target audience, and requirements.',
        duration: '1-2 days'
      },
      {
        step: 2,
        title: 'Design & Wireframing',
        description: 'Create wireframes and design mockups for your approval.',
        duration: '3-5 days'
      },
      {
        step: 3,
        title: 'Development',
        description: 'Build your website using modern technologies and best practices.',
        duration: '1-2 weeks'
      },
      {
        step: 4,
        title: 'Testing & Launch',
        description: 'Thorough testing and deployment of your website.',
        duration: '2-3 days'
      }
    ],
    testimonials: [
      {
        name: 'Sarah Johnson',
        company: 'TechStart Inc.',
        rating: 5,
        comment: 'Excellent work! Our new website has increased our online presence significantly.'
      },
      {
        name: 'Mike Chen',
        company: 'Digital Solutions',
        rating: 5,
        comment: 'Professional, fast, and delivered exactly what we needed. Highly recommended!'
      }
    ]
  },
  {
    id: 2,
    title: 'Mobile App Development',
    description: 'Native and cross-platform mobile app development for iOS and Android.',
    price: 599,
    duration: '4-6 weeks',
    rating: 4.9,
    reviewCount: 89,
    image: '/api/placeholder/600/400',
    category: 'Development',
    features: ['Cross-Platform', 'Native Performance', 'App Store Ready', 'Push Notifications'],
    detailedDescription: 'Transform your business idea into a powerful mobile application. Our mobile app development service covers both iOS and Android platforms, ensuring your app reaches the maximum audience with native performance and user experience.',
    whatIncluded: [
      'Cross-platform mobile app development',
      'iOS and Android compatibility',
      'User interface and experience design',
      'Backend API integration',
      'Push notification setup',
      'App store submission assistance',
      'Beta testing and quality assurance',
      '6 months of free maintenance'
    ],
    process: [
      {
        step: 1,
        title: 'Requirements Analysis',
        description: 'Deep dive into your app requirements and target audience.',
        duration: '3-5 days'
      },
      {
        step: 2,
        title: 'UI/UX Design',
        description: 'Create intuitive and engaging user interface designs.',
        duration: '1-2 weeks'
      },
      {
        step: 3,
        title: 'Development & Integration',
        description: 'Build the app with backend integration and testing.',
        duration: '3-4 weeks'
      },
      {
        step: 4,
        title: 'Testing & Deployment',
        description: 'Comprehensive testing and app store deployment.',
        duration: '1 week'
      }
    ],
    testimonials: [
      {
        name: 'Alex Rodriguez',
        company: 'StartupXYZ',
        rating: 5,
        comment: 'The app exceeded our expectations. Great performance and user experience!'
      }
    ]
  },
  {
    id: 3,
    title: 'E-commerce Solutions',
    description: 'Complete e-commerce platform development with payment integration and inventory management.',
    price: 799,
    duration: '6-8 weeks',
    rating: 4.7,
    reviewCount: 156,
    image: '/api/placeholder/600/400',
    category: 'E-commerce',
    features: ['Payment Gateway', 'Inventory Management', 'Order Tracking', 'Analytics Dashboard'],
    detailedDescription: 'Build a powerful e-commerce platform that drives sales and provides exceptional user experience. Our comprehensive e-commerce solutions include everything from product catalogs to secure payment processing.',
    whatIncluded: [
      'Custom e-commerce platform development',
      'Payment gateway integration',
      'Inventory management system',
      'Order tracking and management',
      'Customer account management',
      'Analytics and reporting dashboard',
      'Mobile-responsive design',
      'SEO optimization for products'
    ],
    process: [
      {
        step: 1,
        title: 'Business Analysis',
        description: 'Analyze your business model and e-commerce requirements.',
        duration: '1 week'
      },
      {
        step: 2,
        title: 'Platform Design',
        description: 'Design the user interface and user experience.',
        duration: '2 weeks'
      },
      {
        step: 3,
        title: 'Development & Integration',
        description: 'Build the platform with payment and inventory systems.',
        duration: '4-5 weeks'
      },
      {
        step: 4,
        title: 'Testing & Launch',
        description: 'Comprehensive testing and platform launch.',
        duration: '1 week'
      }
    ],
    testimonials: [
      {
        name: 'Emily Rodriguez',
        company: 'Retail Plus',
        rating: 5,
        comment: 'Our online sales increased by 300% after implementing their e-commerce solution!'
      }
    ]
  },
  {
    id: 4,
    title: 'Digital Marketing',
    description: 'Comprehensive digital marketing strategies including SEO, social media, and PPC campaigns.',
    price: 199,
    duration: 'Ongoing',
    rating: 4.6,
    reviewCount: 203,
    image: '/api/placeholder/600/400',
    category: 'Marketing',
    features: ['SEO Optimization', 'Social Media', 'PPC Campaigns', 'Analytics Reports'],
    detailedDescription: 'Boost your online presence with our comprehensive digital marketing services. We create tailored strategies that drive traffic, increase conversions, and grow your business through multiple digital channels.',
    whatIncluded: [
      'SEO audit and optimization',
      'Social media management',
      'Google Ads and PPC campaigns',
      'Content marketing strategy',
      'Email marketing campaigns',
      'Analytics and performance tracking',
      'Monthly reporting and insights',
      'Ongoing strategy optimization'
    ],
    process: [
      {
        step: 1,
        title: 'Audit & Strategy',
        description: 'Analyze current digital presence and create marketing strategy.',
        duration: '1 week'
      },
      {
        step: 2,
        title: 'Implementation',
        description: 'Set up campaigns and optimize digital channels.',
        duration: '2 weeks'
      },
      {
        step: 3,
        title: 'Monitoring & Optimization',
        description: 'Continuous monitoring and performance optimization.',
        duration: 'Ongoing'
      },
      {
        step: 4,
        title: 'Reporting & Analysis',
        description: 'Regular reporting and strategy adjustments.',
        duration: 'Monthly'
      }
    ],
    testimonials: [
      {
        name: 'David Kim',
        company: 'TechCorp',
        rating: 4,
        comment: 'Great results! Our website traffic increased by 150% in just 3 months.'
      }
    ]
  },
  {
    id: 5,
    title: 'UI/UX Design',
    description: 'Beautiful and intuitive user interface and user experience design for web and mobile.',
    price: 399,
    duration: '3-4 weeks',
    rating: 4.9,
    reviewCount: 98,
    image: '/api/placeholder/600/400',
    category: 'Design',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design System'],
    detailedDescription: 'Create exceptional user experiences with our comprehensive UI/UX design services. We focus on understanding your users and creating designs that are both beautiful and functional.',
    whatIncluded: [
      'User research and persona development',
      'Information architecture and wireframing',
      'Visual design and prototyping',
      'Design system creation',
      'Usability testing and iteration',
      'Design handoff to development team',
      'Design documentation and guidelines',
      'Post-launch design support'
    ],
    process: [
      {
        step: 1,
        title: 'Research & Discovery',
        description: 'Understand your users, business goals, and design requirements.',
        duration: '1 week'
      },
      {
        step: 2,
        title: 'Wireframing & Architecture',
        description: 'Create information architecture and low-fidelity wireframes.',
        duration: '1 week'
      },
      {
        step: 3,
        title: 'Visual Design',
        description: 'Develop high-fidelity designs and interactive prototypes.',
        duration: '1-2 weeks'
      },
      {
        step: 4,
        title: 'Testing & Refinement',
        description: 'Conduct usability testing and refine designs based on feedback.',
        duration: '3-5 days'
      }
    ],
    testimonials: [
      {
        name: 'Tom Anderson',
        company: 'Design Studio',
        rating: 5,
        comment: 'Exceptional design work! The team really understands user experience and created designs that our users love.'
      }
    ]
  },
  {
    id: 6,
    title: 'Cloud Migration',
    description: 'Seamless migration of your applications and data to cloud platforms like AWS, Azure, or GCP.',
    price: 899,
    duration: '4-8 weeks',
    rating: 4.8,
    reviewCount: 67,
    image: '/api/placeholder/600/400',
    category: 'Infrastructure',
    features: ['Zero Downtime', 'Security Assessment', 'Cost Optimization', '24/7 Support'],
    detailedDescription: 'Migrate your infrastructure to the cloud with minimal disruption. Our expert team ensures a smooth transition while optimizing costs and improving performance.',
    whatIncluded: [
      'Cloud architecture design and planning',
      'Application and data migration',
      'Security and compliance setup',
      'Performance optimization',
      'Cost monitoring and optimization',
      'Disaster recovery setup',
      'Training and documentation',
      'Ongoing support and maintenance'
    ],
    process: [
      {
        step: 1,
        title: 'Assessment & Planning',
        description: 'Analyze current infrastructure and create migration strategy.',
        duration: '1-2 weeks'
      },
      {
        step: 2,
        title: 'Architecture Design',
        description: 'Design cloud architecture and security framework.',
        duration: '1 week'
      },
      {
        step: 3,
        title: 'Migration Execution',
        description: 'Execute the migration with minimal downtime.',
        duration: '2-4 weeks'
      },
      {
        step: 4,
        title: 'Optimization & Support',
        description: 'Optimize performance and provide ongoing support.',
        duration: 'Ongoing'
      }
    ],
    testimonials: [
      {
        name: 'Robert Smith',
        company: 'TechCorp',
        rating: 5,
        comment: 'Seamless cloud migration with zero downtime. Our applications are now running faster than ever!'
      }
    ]
  },
  {
    id: 7,
    title: 'Data Analytics',
    description: 'Advanced data analytics and business intelligence solutions to drive informed decisions.',
    price: 499,
    duration: '2-4 weeks',
    rating: 4.7,
    reviewCount: 145,
    image: '/api/placeholder/600/400',
    category: 'Analytics',
    features: ['Data Visualization', 'Predictive Analytics', 'Custom Dashboards', 'Real-time Reports'],
    detailedDescription: 'Transform your data into actionable insights with our comprehensive analytics solutions. We help you understand your business better and make data-driven decisions.',
    whatIncluded: [
      'Data collection and integration setup',
      'Custom dashboard development',
      'Predictive analytics models',
      'Real-time reporting systems',
      'Data visualization and storytelling',
      'Performance metrics and KPIs',
      'Automated report generation',
      'Training and ongoing support'
    ],
    process: [
      {
        step: 1,
        title: 'Data Discovery',
        description: 'Identify data sources and business requirements.',
        duration: '3-5 days'
      },
      {
        step: 2,
        title: 'Data Integration',
        description: 'Set up data pipelines and integration systems.',
        duration: '1 week'
      },
      {
        step: 3,
        title: 'Analytics Development',
        description: 'Build dashboards and analytics models.',
        duration: '1-2 weeks'
      },
      {
        step: 4,
        title: 'Deployment & Training',
        description: 'Deploy solutions and provide user training.',
        duration: '3-5 days'
      }
    ],
    testimonials: [
      {
        name: 'Kevin Taylor',
        company: 'DataCorp',
        rating: 5,
        comment: 'Outstanding analytics solution! The insights have transformed our decision-making process.'
      }
    ]
  },
  {
    id: 8,
    title: 'Technical Consulting',
    description: 'Expert technical consultation to help you make informed technology decisions.',
    price: 149,
    duration: '1-2 days',
    rating: 4.8,
    reviewCount: 178,
    image: '/api/placeholder/600/400',
    category: 'Consulting',
    features: ['Technology Audit', 'Architecture Review', 'Best Practices', 'Implementation Plan'],
    detailedDescription: 'Get expert technical guidance to optimize your technology stack and make informed decisions. Our consultants provide strategic advice tailored to your business needs.',
    whatIncluded: [
      'Technology stack assessment',
      'Architecture review and recommendations',
      'Best practices and standards guidance',
      'Implementation roadmap creation',
      'Performance optimization advice',
      'Security and compliance review',
      'Technology selection guidance',
      'Follow-up consultation sessions'
    ],
    process: [
      {
        step: 1,
        title: 'Initial Assessment',
        description: 'Review current technology stack and business requirements.',
        duration: '4-6 hours'
      },
      {
        step: 2,
        title: 'Analysis & Recommendations',
        description: 'Analyze findings and develop recommendations.',
        duration: '4-6 hours'
      },
      {
        step: 3,
        title: 'Report & Presentation',
        description: 'Present findings and recommendations to stakeholders.',
        duration: '2-3 hours'
      },
      {
        step: 4,
        title: 'Follow-up Support',
        description: 'Provide ongoing support for implementation.',
        duration: 'As needed'
      }
    ],
    testimonials: [
      {
        name: 'Michael Johnson',
        company: 'StartupXYZ',
        rating: 5,
        comment: 'Excellent technical consulting! The team provided valuable insights that helped us make informed technology decisions.'
      }
    ]
  }
];

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
  const [reviews, setReviews] = useState<any[]>([]);
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    preferredDate: '',
    budget: ''
  });
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectType: '',
    timeline: '',
    budget: '',
    requirements: ''
  });

  const service = servicesData.find(s => s.id === parseInt(id || '0'));

  // Load service-specific reviews when component mounts or service changes
  React.useEffect(() => {
    const serviceId = parseInt(id || '0');
    const serviceReviews = serviceReviewsData[serviceId] || [];
    setReviews(serviceReviews);
  }, [id]);

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

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle booking submission
    console.log('Booking submitted:', bookingForm);
    alert('Your service request has been submitted! We will contact you within 24 hours.');
    setIsBookingModalOpen(false);
    setBookingForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      preferredDate: '',
      budget: ''
    });
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

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle quote submission
    console.log('Quote submitted:', quoteForm);
    alert('Your quote request has been submitted! We will provide a detailed quote within 24 hours.');
    setIsQuoteModalOpen(false);
    setQuoteForm({
      name: '',
      email: '',
      phone: '',
      company: '',
      projectType: '',
      timeline: '',
      budget: '',
      requirements: ''
    });
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
    const newReview = {
      id: Date.now().toString(),
      ...reviewData,
      date: new Date().toISOString().split('T')[0],
      verified: false
    };
    
    setReviews(prevReviews => [newReview, ...prevReviews]);
    
    // In a real app, you would save this to the backend
    // For now, we'll just show a success message
    alert(`Thank you for your review of ${service?.title}!`);
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return sum / reviews.length;
  };

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
                <div className="w-20 h-20 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Placeholder size="md">
                    <div className="text-gray-400 dark:text-gray-500 text-xs">Service</div>
                  </Placeholder>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                      {service.category}
                    </span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {calculateAverageRating().toFixed(1)} ({reviews.length} reviews)
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
              <div className="w-full h-64 bg-gray-200 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                <Placeholder size="lg">
                  <div className="text-gray-400 dark:text-gray-500">Service Image</div>
                </Placeholder>
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
                  <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-6">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Our Process</h2>
                    <div className="space-y-6">
                      {service.process.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-semibold">
                              {step.step}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                              {step.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 mb-2">
                              {step.description}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                              <Clock className="w-4 h-4" />
                              {step.duration}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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
                    averageRating={calculateAverageRating()}
                    totalReviews={reviews.length}
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
                  ${service.price}
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
                  <span className="text-gray-700 dark:text-gray-300">{service.rating} ({service.reviewCount} reviews)</span>
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
                  <span className="text-gray-700 dark:text-gray-300">+1 (555) 123-4567</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">support@example.com</span>
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
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={bookingForm.company}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={bookingForm.budget}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-500">Under $500</option>
                      <option value="500-1000">$500 - $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="5000-plus">$5,000+</option>
                    </select>
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
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={quoteForm.company}
                      onChange={handleQuoteInputChange}
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
                      Budget Range
                    </label>
                    <select
                      name="budget"
                      value={quoteForm.budget}
                      onChange={handleQuoteInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                    >
                      <option value="">Select budget range</option>
                      <option value="under-1000">Under $1,000</option>
                      <option value="1000-5000">$1,000 - $5,000</option>
                      <option value="5000-10000">$5,000 - $10,000</option>
                      <option value="10000-plus">$10,000+</option>
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
