import React from 'react';

const insightsData = [
  { id: 1, image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=100&q=80', text: <>Margherita Pizza is <span style={{color: '#FF5A36', fontWeight: 'bold'}}>£1 underpriced</span> on Just Eat, consider increasing price.</> },
  { id: 2, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=100&q=80', text: <>Vegan Burger is <span style={{color: '#FF5A36', fontWeight: 'bold'}}>£1.50 overpriced</span> on Uber Eats, consider adjusting.</> },
  { id: 3, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=100&q=80', text: <>Family Combo is <span style={{color: '#FF5A36', fontWeight: 'bold'}}>not offered</span> on Deliveroo, consider adding it.</> },
  { id: 4, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=100&q=80', text: <>Al-Balk Pizza has <span style={{color: '#FF5A36', fontWeight: 'bold'}}>5 active competitor promos</span> nearby.</> },
  { id: 5, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=100&q=80', text: <>Double Cheeseburger demand is <span style={{color: '#FF5A36', fontWeight: 'bold'}}>up 20%</span> this week, promote it!</> },
  { id: 6, image: 'https://images.unsplash.com/photo-1559703248-dcaaec9fac92?auto=format&fit=crop&w=100&q=80', text: <>Ice Cream sales are <span style={{color: '#FF5A36', fontWeight: 'bold'}}>dropping</span> due to weather, consider pausing ads.</> },
  { id: 7, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=100&q=80', text: <>Grilled Chicken Sandwich is <span style={{color: '#FF5A36', fontWeight: 'bold'}}>£0.50 underpriced</span> on Deliveroo.</> },
  { id: 8, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=100&q=80', text: <>Fries combo attach rate is <span style={{color: '#FF5A36', fontWeight: 'bold'}}>down 15%</span> on Uber Eats.</> },
  { id: 9, image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=100&q=80', text: <>Spicy Pepperoni is <span style={{color: '#FF5A36', fontWeight: 'bold'}}>trending locally</span>, push a promo today.</> },
];

// Duplicate the array to create a seamless infinite scrolling loop
const insights = [...insightsData, ...insightsData.map(item => ({ ...item, id: item.id + 100 }))];

const RecommendationsSimulationWidget = ({ onClick }) => {
  return (
    <div 
      className="bg-[#FAF8F4] h-full w-full rounded-2xl p-5 shadow-sm border border-[rgba(0,0,0,0.05)] flex flex-col cursor-pointer transition-all"
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <span className="text-xs font-bold text-[#FF5A36] uppercase tracking-wider font-sans">MARKET INSIGHTS</span>
        <div className="w-2 h-2 rounded-full bg-[#FF5A36] animate-pulse shadow-[0_0_8px_rgba(255,90,54,0.8)]"></div>
      </div>

      {/* Marquee Container */}
      <div 
        className="flex-1 w-full overflow-hidden relative" 
        style={{ 
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)',
          maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' 
        }}
      >
        <div 
          className="flex flex-col w-full marquee-track"
          style={{ animation: 'scrollVerticalDown 35s linear infinite' }}
        >
          {insights.map((insight) => (
            <div 
              key={insight.id} 
              className="flex flex-row items-center shrink-0 mb-3"
              style={{ 
                borderRadius: '10px', 
                backgroundColor: 'rgba(255, 255, 255, 0.65)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                padding: '7px 18px 7px 7px',
                border: 'none',
                backdropFilter: 'blur(4px)',
                WebkitBackdropFilter: 'blur(4px)'
              }}
            >
              {/* Image */}
              <img 
                src={insight.image} 
                alt="food" 
                style={{ height: '44px', width: '44px', borderRadius: '6px', objectFit: 'cover', flexShrink: 0 }} 
              />
              
              {/* Conversational Text */}
              <div style={{ flex: 1, paddingLeft: '14px' }}>
                <p style={{ fontSize: '12.5px', color: '#111', margin: 0, lineHeight: '1.4', fontFamily: 'sans-serif' }}>
                  {insight.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes scrollVerticalDown {
          0% { transform: translateY(-50%); }
          100% { transform: translateY(0); }
        }
        .marquee-track:hover {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
};

export default RecommendationsSimulationWidget;
