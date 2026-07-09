import React from 'react';

const VisibilityEngineWidget = ({ onPlatformClick }) => {
  // Hardcoded as requested
  const totalScore = 33;

  const platforms = [
    {
      name: 'Deliveroo',
      score: 65,
      badge: (
        <div style={{
          width: '52px', height: '34px', borderRadius: '17px',
          backgroundColor: '#00CCBC', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(0, 204, 188, 0.3)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M15.4 1.5l-4.6 2.4-1.8-1.5-2.2.8 1.1 5.3-7.5 2.1 1.2 7.7s4 2.8 9.3 2.8c4.3 0 7.8-1.8 7.8-1.8l2.9-10.7-6.2-7.1zM11.5 13.8c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5zm3.8-1.1c-.8 0-1.5-.7-1.5-1.5s.7-1.5 1.5-1.5 1.5.7 1.5 1.5-.7 1.5-1.5 1.5z"/>
          </svg>
        </div>
      )
    },
    {
      name: 'Uber Eats',
      score: 20,
      badge: (
        <div style={{
          width: '52px', height: '34px', borderRadius: '17px',
          backgroundColor: '#06C167', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(6, 193, 103, 0.3)'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 'bold', color: 'white', lineHeight: '1', textAlign: 'center' }}>Uber<br/>Eats</span>
        </div>
      )
    },
    {
      name: 'Just Eat',
      score: 14,
      badge: (
        <div style={{
          width: '52px', height: '34px', borderRadius: '17px',
          backgroundColor: '#FF8000', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          boxShadow: '0 4px 12px rgba(255, 128, 0, 0.3)'
        }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
             <path d="M12 2.5L2 11h3v10.5h14V11h3L12 2.5zM10.5 18h-2v-6h2v6zm5 0h-2v-6h2v6z"/>
          </svg>
        </div>
      )
    }
  ];

  const getBarColor = (score) => {
    if (score >= 70) return '#10B981'; // Green
    if (score >= 40) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  const getTrackColor = (score) => {
    if (score >= 70) return 'rgba(16, 185, 129, 0.15)'; // Green track
    if (score >= 40) return 'rgba(245, 158, 11, 0.15)'; // Amber track
    return 'rgba(239, 68, 68, 0.15)'; // Red track
  };

  return (
    <div className="w-full h-full flex flex-col relative transition-all" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.6)', boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 1)', borderRadius: '1.25rem', padding: '1.25rem' }}>
      
      {/* Header */}
      <div 
        className="flex justify-between items-baseline cursor-pointer group" 
        style={{ paddingBottom: '12px', marginBottom: '12px', borderBottom: '1px solid #E5E7EB' }}
        onClick={() => onPlatformClick && onPlatformClick('All')}
      >
        <div>
          <h2 className="font-bold text-gray-900 leading-tight group-hover:text-[#E86A58] transition-colors" style={{ fontSize: '1.1rem' }}>
            Visibility Engine
          </h2>
        </div>
        <div className="flex items-baseline shrink-0">
          <span className="font-black leading-none" style={{ fontSize: '1.5rem', color: '#EF4444' }}>{totalScore}</span>
          <span className="font-bold text-gray-400" style={{ fontSize: '0.85rem', marginLeft: '4px' }}>/100</span>
        </div>
      </div>

      {/* Platform Rows */}
      <div className="flex flex-col flex-1 gap-4 justify-center mb-4">
        {platforms.map((platform, idx) => (
          <div 
            key={idx} 
            className="flex items-center w-full cursor-pointer hover:bg-gray-50 rounded-lg p-1 -m-1 transition-colors" 
            style={{ gap: '1rem' }}
            onClick={() => onPlatformClick && onPlatformClick(platform.name)}
          >
            {/* Badge */}
            <div className="shrink-0 flex justify-center" style={{ width: '52px' }}>
              {platform.badge}
            </div>
            
            {/* Progress Bar */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-full rounded-full overflow-hidden" style={{ height: '8px', backgroundColor: getTrackColor(platform.score) }}>
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ 
                    width: `${platform.score}%`, 
                    backgroundColor: getBarColor(platform.score)
                  }}
                ></div>
              </div>
            </div>
            
            {/* Score Text */}
            <div className="shrink-0 text-right" style={{ width: '28px' }}>
              <span className="font-black font-sans" style={{ fontSize: '15px', color: getBarColor(platform.score) }}>
                {platform.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Link */}
      <div className="flex justify-end mt-auto pt-2">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onPlatformClick && onPlatformClick('All'); }}
          className="font-bold text-gray-500 hover:text-gray-800 transition-colors" 
          style={{ fontSize: '11px', textDecoration: 'none' }}
        >
          View Visibility Data &rarr;
        </a>
      </div>
    </div>
  );
};

export default VisibilityEngineWidget;
