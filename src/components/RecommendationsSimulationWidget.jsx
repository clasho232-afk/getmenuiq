import React, { useState, useEffect } from 'react';

const insights = [
  {
    id: 1,
    type: 'platform',
    platformName: 'Uber Eats',
    bg: '#06C167',
    text: <><span className="text-[#E86A58]">5</span> competitors are running promos in Ilford on Uber Eats.</>
  },
  {
    id: 2,
    type: 'platform',
    platformName: 'Just Eat',
    bg: '#F36D00',
    text: <><span className="text-[#E86A58]">7</span> competitors on Just Eat are offering free delivery in Ilford.</>
  },
  {
    id: 3,
    type: 'item',
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=300&q=80',
    text: <>Your Margherita Pizza is underpriced by <span className="text-[#E86A58]">£1</span> from the market average.</>
  },
  {
    id: 4,
    type: 'platform',
    platformName: 'Uber Eats',
    bg: '#06C167',
    text: <>Uber Eats is busy right now. Consider running an aggressive promo to capture demand.</>
  }
];

const RecommendationsSimulationWidget = ({ onClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % insights.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div 
      className="bg-white h-full w-full rounded-2xl p-5 shadow-sm border border-[rgba(0,0,0,0.05)] flex flex-col cursor-pointer hover:shadow-md transition-all relative overflow-hidden group"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-2 shrink-0">
        <span className="text-xs font-bold text-[#E86A58] uppercase tracking-wider">MARKET INSIGHTS</span>
        <div className="w-2 h-2 rounded-full bg-[#E86A58] animate-pulse shadow-[0_0_8px_rgba(232,106,88,0.8)]"></div>
      </div>

      {/* Carousel Outer Container with strict overflow-hidden */}
      <div className="flex-1 w-full overflow-hidden mt-2 relative">
        {/* Slider Track */}
        <div 
          className="flex flex-row h-full transition-transform duration-700 ease-in-out"
          style={{ 
            width: `${insights.length * 100}%`, 
            transform: `translateX(-${currentSlide * (100 / insights.length)}%)` 
          }}
        >
          {insights.map((insight) => (
            <div 
              key={insight.id}
              className="flex-none h-full flex flex-col items-center justify-center"
              style={{ width: `${100 / insights.length}%` }}
            >
              {/* Visual (Upper Center) */}
              <div className="mb-5 shrink-0">
                {insight.type === 'platform' ? (
                  <div 
                    className="w-32 h-16 rounded-xl shadow-md flex items-center justify-center"
                    style={{ backgroundColor: insight.bg }}
                  >
                    <span className="text-white font-extrabold tracking-wide">{insight.platformName}</span>
                  </div>
                ) : (
                  <img 
                    src={insight.image} 
                    alt="Insight Visual" 
                    className="w-32 h-16 rounded-xl shadow-md object-cover"
                  />
                )}
              </div>

              {/* Text (Underneath) */}
              <div className="text-center px-4 w-full">
                <p className="text-sm text-gray-800 font-semibold leading-relaxed m-0">
                  {insight.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-1.5 mt-auto pt-4 shrink-0">
        {insights.map((_, index) => (
          <div 
            key={index}
            className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-5 bg-[#E86A58]' : 'w-1.5 bg-gray-300'}`}
          />
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSimulationWidget;
