import React from 'react';

const VisibilityEngineWidget = ({ onPlatformClick }) => {
  // Hardcoded as requested
  const totalScore = 33;

  const platforms = [
    {
      name: 'Deliveroo',
      score: 65,
      barColor: '#00CCBC',
      textColor: '#0f172a',
      badge: (
        <div style={{
          width: '52px', height: '30px', borderRadius: '15px',
          backgroundColor: '#00CCBC', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <img 
            src="https://cdn.simpleicons.org/deliveroo/white" 
            alt="Deliveroo Logo" 
            style={{ width: '16px', height: '16px', objectFit: 'contain' }}
          />
        </div>
      )
    },
    {
      name: 'Uber Eats',
      score: 20,
      barColor: '#EF4444',
      textColor: '#EF4444',
      badge: (
        <div style={{
          width: '52px', height: '30px', borderRadius: '15px',
          backgroundColor: '#06C167', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <img 
            src="https://cdn.simpleicons.org/ubereats/white" 
            alt="Uber Eats Logo" 
            style={{ width: '16px', height: '16px', objectFit: 'contain' }}
          />
        </div>
      )
    },
    {
      name: 'Just Eat',
      score: 14,
      barColor: '#EF4444',
      textColor: '#EF4444',
      badge: (
        <div style={{
          width: '52px', height: '30px', borderRadius: '15px',
          backgroundColor: '#F36D00', display: 'flex',
          alignItems: 'center', justifyContent: 'center', flexShrink: 0
        }}>
          <img 
            src="https://cdn.simpleicons.org/justeat/white" 
            alt="Just Eat Logo" 
            style={{ width: '16px', height: '16px', objectFit: 'contain' }}
          />
        </div>
      )
    }
  ];

  return (
    <div className="harmonized-card-bg w-full h-full flex flex-col relative transition-all duration-300 hover:-translate-y-1" style={{ borderRadius: '1.25rem', padding: '1.5rem 1.5rem 1.25rem' }}>
      
      {/* Header */}
      <div 
        className="flex justify-between items-start cursor-pointer group" 
        style={{ marginBottom: '2rem' }}
        onClick={() => onPlatformClick && onPlatformClick('All')}
      >
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight mb-0 group-hover:text-slate-700 transition-colors">
            Visibility Engine
          </h2>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="font-bold text-slate-400" style={{ fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', color: '#94a3b8' }}>Health Score</span>
          <div className="flex items-baseline">
            <span className="font-black leading-none" style={{ fontSize: '1.75rem', color: '#EF4444', letterSpacing: '-0.02em' }}>{totalScore}</span>
            <span className="font-bold" style={{ fontSize: '0.9rem', marginLeft: '2px', color: '#64748b', display: 'inline-block', transform: 'translateY(40%)' }}>/100</span>
          </div>
        </div>
      </div>

      {/* Platform Rows */}
      <div className="flex flex-col flex-1 gap-6 justify-center mb-6" style={{ transform: 'translateY(-10%)' }}>
        {platforms.map((platform, idx) => (
          <div 
            key={idx} 
            className="flex items-center w-full cursor-pointer hover:bg-slate-50 transition-colors" 
            style={{ gap: '1rem' }}
            onClick={() => onPlatformClick && onPlatformClick(platform.name)}
          >
            {/* Minimal Badge */}
            <div className="shrink-0 flex justify-center" style={{ width: '52px' }}>
              {platform.badge}
            </div>
            
            {/* Clean Line-based Progress Bar */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="w-full rounded-full overflow-hidden" style={{ height: '6px', backgroundColor: '#f1f5f9' }}>
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ 
                    width: `${platform.score}%`, 
                    backgroundColor: platform.barColor
                  }}
                ></div>
              </div>
            </div>
            
            {/* Tabular Score Text */}
            <div className="shrink-0 text-right" style={{ width: '32px' }}>
              <span className="font-black" style={{ fontSize: '1rem', color: platform.textColor, fontVariantNumeric: 'tabular-nums' }}>
                {platform.score}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info / Link */}
      <div className="flex justify-between items-center mt-auto pt-4" style={{ borderTop: '1px solid rgba(241, 245, 249, 0.4)' }}>
        <span className="font-bold" style={{ fontSize: '0.67rem', textDecoration: 'none', color: '#64748b' }}>
          Updated 2h ago
        </span>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); onPlatformClick && onPlatformClick('All'); }}
          className="font-bold transition-colors" 
          style={{ fontSize: '0.67rem', textDecoration: 'none', color: '#64748b' }}
        >
          View Visibility Data &rarr;
        </a>
      </div>
    </div>
  );
};

export default VisibilityEngineWidget;
