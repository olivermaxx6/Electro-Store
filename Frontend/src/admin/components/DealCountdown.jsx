import { useState, useEffect } from 'react';

export default function DealCountdown({ endDate, className = '' }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    if (!endDate) return;

    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (!endDate) {
    return (
      <div className={`flex items-center justify-center gap-2 ${className}`}>
        <span className="text-sm text-slate-500 dark:text-slate-400">No end date set</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      {/* Days */}
      <div className="flex flex-col items-center bg-red-100 dark:bg-red-900/30 rounded-xl p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
          {timeLeft.days.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-red-600 dark:text-red-400 font-medium">
          Days
        </div>
      </div>

      {/* Hours */}
      <div className="flex flex-col items-center bg-orange-100 dark:bg-orange-900/30 rounded-xl p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
          {timeLeft.hours.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-orange-600 dark:text-orange-400 font-medium">
          Hours
        </div>
      </div>

      {/* Minutes */}
      <div className="flex flex-col items-center bg-yellow-100 dark:bg-yellow-900/30 rounded-xl p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
          {timeLeft.minutes.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
          Minutes
        </div>
      </div>

      {/* Seconds */}
      <div className="flex flex-col items-center bg-green-100 dark:bg-green-900/30 rounded-xl p-3 min-w-[60px]">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
          {timeLeft.seconds.toString().padStart(2, '0')}
        </div>
        <div className="text-xs text-green-600 dark:text-green-400 font-medium">
          Seconds
        </div>
      </div>
    </div>
  );
}
