import React, { useState, useEffect } from 'react';
import { Clock, ArrowRight } from 'lucide-react';
import Placeholder from '../common/Placeholder';

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const HotDealBanner: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  
  useEffect(() => {
    // Set countdown to 48 hours from now
    const targetTime = new Date().getTime() + (48 * 60 * 60 * 1000);
    
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const difference = targetTime - now;
      
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
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const TimeCircle: React.FC<{ value: number; label: string }> = ({ value, label }) => (
    <div className="flex flex-col items-center">
      <div className="w-16 h-16 bg-red-100 dark:bg-blue-900 rounded-full flex items-center justify-center shadow-lg border-2 border-red-200 dark:border-blue-700">
        <span className="text-lg font-bold text-red-600 dark:text-blue-400">{value.toString().padStart(2, '0')}</span>
      </div>
      <span className="text-xs text-gray-600 dark:text-gray-300 mt-2 uppercase tracking-wide">{label}</span>
    </div>
  );
  
  return (
    <div className="bg-white dark:bg-slate-900 py-16 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          {/* Left Image */}
          <div className="lg:col-span-1">
            <Placeholder ratio="4/3" className="w-full h-48">
              <div className="bg-red-600 dark:bg-blue-600 text-white text-sm flex items-center justify-center h-full rounded-lg">
                Deal Product 1
              </div>
            </Placeholder>
          </div>
          
          {/* Center Content */}
          <div className="lg:col-span-1 text-center text-gray-900 dark:text-white">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 mr-2 text-red-600 dark:text-blue-400" />
              <span className="text-sm font-medium uppercase tracking-wide text-red-600 dark:text-blue-400">Hot Deal This Week</span>
            </div>
            
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">Up to 50% Off</h2>
            <p className="text-lg mb-6 text-gray-600 dark:text-gray-300">Don't miss out on these amazing deals!</p>
            
            {/* Countdown Timer */}
            <div className="flex justify-center space-x-4 mb-6">
              <TimeCircle value={timeLeft.days} label="Days" />
              <TimeCircle value={timeLeft.hours} label="Hours" />
              <TimeCircle value={timeLeft.minutes} label="Minutes" />
              <TimeCircle value={timeLeft.seconds} label="Seconds" />
            </div>
            
            <button className="bg-red-600 dark:bg-blue-600 text-white px-8 py-3 rounded-md font-semibold hover:bg-red-700 dark:hover:bg-blue-700 transition-colors inline-flex items-center space-x-2">
              <span>Shop Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          {/* Right Image */}
          <div className="lg:col-span-1">
            <Placeholder ratio="4/3" className="w-full h-48">
              <div className="bg-red-600 dark:bg-blue-600 text-white text-sm flex items-center justify-center h-full rounded-lg">
                Deal Product 2
              </div>
            </Placeholder>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotDealBanner;