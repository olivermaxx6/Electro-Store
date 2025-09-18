import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import { useWebsiteContent } from '../../hooks/useWebsiteContent';
import { Link } from 'react-router-dom';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface DealCountdownProps {
  endDate: string;
}

const DealCountdown: React.FC<DealCountdownProps> = ({ endDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      // Handle both timezone-aware and naive datetime strings
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  const TimeCircle: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg border-4" 
           style={{
             backgroundColor: 'var(--color-primary)',
             borderColor: 'var(--color-primary-600)',
           }}>
        <span className="text-2xl font-bold text-white">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-sm font-semibold mt-2 uppercase tracking-wide"
            style={{ color: 'var(--color-ink-secondary)' }}>
        {label}
      </span>
    </div>
  );

  if (!endDate) return null;

  return (
    <div className="flex justify-center space-x-6 mb-8">
      <TimeCircle value={timeLeft.days} label="Days" />
      <TimeCircle value={timeLeft.hours} label="Hours" />
      <TimeCircle value={timeLeft.minutes} label="Mins" />
      <TimeCircle value={timeLeft.seconds} label="Secs" />
    </div>
  );
};

const HotDealBanner: React.FC = () => {
  const { content, loading, error } = useWebsiteContent();

  if (loading) {
    return (
      <div className="py-16" style={{ backgroundColor: 'var(--color-surface)' }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading deals:', error);
    return null;
  }

  if (!content) return null;

  // Check if we have deal data
  const hasDeal = content.deal1_title || content.deal1_discount || content.deal1_description;

  if (!hasDeal) return null;

  // Use deal1 data for the main display
  const mainDeal = {
    title: content.deal1_title || 'Product 1',
    subtitle: content.deal1_subtitle || 'Hot Deal This Week',
    discount: content.deal1_discount || 'Up to 50% Off',
    description: content.deal1_description || 'Don\'t miss out on these amazing deals!',
    image: content.deal1_image,
    endDate: content.deal1_end_date
  };

  return (
    <div className="py-20 relative overflow-hidden" style={{ backgroundColor: 'var(--color-surface)' }}>
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          
          {/* Left Product Image */}
          <div className="lg:col-span-1 flex justify-center lg:justify-end">
            <div className="relative">
              {mainDeal.image ? (
                <img 
                  src={mainDeal.image} 
                  alt={mainDeal.title} 
                  className="w-80 h-80 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-80 h-80 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-gray-600 dark:bg-gray-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                      <span className="text-2xl">💻</span>
                    </div>
                    <p className="text-lg font-semibold">{mainDeal.title}</p>
                  </div>
                </div>
              )}
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-8 h-8 bg-green-500 rounded-full opacity-80"></div>
            </div>
          </div>
          
          {/* Center Content */}
          <div className="lg:col-span-1 text-center">
            {/* Countdown Timer with Single Clock Icon */}
            <div className="mb-8">
              <DealCountdown endDate={mainDeal.endDate} />
            </div>

            {/* Header with Single Clock */}
            <div className="flex items-center justify-center mb-6">
              <Clock className="w-8 h-8 mr-3" style={{ color: 'var(--color-primary)' }} />
              <span className="text-xl font-bold uppercase tracking-wide" style={{ color: 'var(--color-ink)' }}>
                {mainDeal.subtitle}
              </span>
            </div>

            {/* Main Title */}
            <h2 className="text-4xl lg:text-5xl font-bold mb-4" style={{ color: 'var(--color-ink)' }}>
              {mainDeal.discount}
            </h2>

            {/* Description */}
            {mainDeal.description && (
              <p className="text-lg mb-8 max-w-md mx-auto" style={{ color: 'var(--color-ink-secondary)' }}>
                {mainDeal.description}
              </p>
            )}

            {/* Shop Now Button */}
            <Link 
              to="/shop"
              className="inline-flex items-center space-x-3 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-600) 50%, var(--color-primary-700) 100%)',
                boxShadow: '0 4px 14px 0 rgba(220, 38, 38, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-primary) 50%, var(--color-primary-600) 100%)';
                e.currentTarget.style.boxShadow = '0 8px 25px 0 rgba(220, 38, 38, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-600) 50%, var(--color-primary-700) 100%)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(220, 38, 38, 0.3)';
              }}
            >
              <span>Shop Now</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Right Product Image */}
          <div className="lg:col-span-1 flex justify-center lg:justify-start">
            <div className="relative">
              {mainDeal.image ? (
                <img 
                  src={mainDeal.image} 
                  alt={mainDeal.title} 
                  className="w-80 h-80 object-cover rounded-2xl shadow-2xl transform hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-80 h-80 bg-gradient-to-br from-gray-800 to-gray-900 dark:from-gray-700 dark:to-gray-800 rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-gray-600 dark:bg-gray-500 rounded-lg mb-4 mx-auto flex items-center justify-center">
                      <span className="text-2xl">🎧</span>
                    </div>
                    <p className="text-lg font-semibold">{mainDeal.title}</p>
                  </div>
                </div>
              )}
              {/* Decorative accent */}
              <div className="absolute -top-4 -left-4 w-8 h-8 bg-red-500 rounded-full opacity-80"></div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full opacity-30" 
             style={{ backgroundColor: 'var(--color-primary-100)' }}></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 rounded-full opacity-30"
             style={{ backgroundColor: 'var(--color-primary-200)' }}></div>
      </div>
    </div>
  );
};

export default HotDealBanner;