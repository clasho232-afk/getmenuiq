import React from 'react';
import { createPortal } from 'react-dom';
import { BadgePercent, Image as ImageIcon, FileText, Clock, Star, X, Activity, CheckCircle2, AlertTriangle, MapPin , Info , XCircle, AlertCircle, Eye } from 'lucide-react';


const calculateVisibilityMetric = (visibilityScore) => {
  let status = 'optimal';
  let score = 5;
  
  if (visibilityScore < 50) {
    status = 'critical';
    score = 1;
  } else if (visibilityScore <= 70) {
    status = 'needs_action';
    score = 3;
  } else {
    status = 'optimal';
    score = 5;
  }
  
  return {
    id: 'visibility',
    type: 'visibility',
    title: 'Visibility',
    value: `${visibilityScore} / 100`,
    status: status,
    score: score
  };
};

const calculatePricingMetric = (ratingStr, priceDeltaPercent) => {
  const rating = parseFloat(ratingStr.split(' /')[0]);
  let status = 'optimal';
  let score = 10;
  
  if (priceDeltaPercent <= 0) {
    status = 'optimal';
    score = 10;
  } else if (priceDeltaPercent <= 20) {
    if (rating >= 4.0) {
      status = 'optimal';
      score = 8; // Premium brand pricing accepted
    } else {
      status = 'needs_action';
      score = 5; // Overpriced for a mid-tier rated restaurant
    }
  } else {
    if (rating >= 4.0) {
      status = 'needs_action';
      score = 4; // Heavily overpriced, even for a premium brand
    } else {
      status = 'critical';
      score = 2; // Severely overpriced for a low-tier restaurant
    }
  }

  const valueStr = priceDeltaPercent === 0 ? 'Parity with Avg' : 
                  priceDeltaPercent > 0 ? `+${priceDeltaPercent}% vs Avg` : 
                  `${priceDeltaPercent}% vs Avg`;

  return { id: 'pricing', type: 'pricing', title: 'Price Gap', value: valueStr, status, score };
};

const multiPlatformData = [
  {
    id: 'deliveroo',
    name: 'Deliveroo',
    logo: 'https://cdn.simpleicons.org/deliveroo/00CCBC',
    color: '#00CCBC',
    metrics: [
      { id: 'promos', type: 'promos', title: 'Promos', value: 'Optimal', status: 'optimal', score: 9 },
      calculatePricingMetric('4.6 / 5.0', 15),
      calculateVisibilityMetric(85),
      { id: 'rating', type: 'rating', title: 'Rating', value: '4.6 / 5.0', status: 'optimal', score: 4 },
      { id: 'photos', type: 'photos', title: 'Menu Photos', value: '82% Optimized', status: 'optimal', score: 3 },
      { id: 'descriptions', type: 'descriptions', title: 'Item Descriptions', value: '75% Optimized', status: 'optimal', score: 3 },
    ]
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    logo: 'https://cdn.simpleicons.org/ubereats/06C167',
    color: '#06C167',
    metrics: [
      { id: 'promos', type: 'promos', title: 'Promos', value: 'Warning', status: 'needs_action', score: 5 },
      calculatePricingMetric('4.8 / 5.0', 0),
      calculateVisibilityMetric(95),
      { id: 'rating', type: 'rating', title: 'Rating', value: '4.8 / 5.0', status: 'optimal', score: 5 },
      { id: 'photos', type: 'photos', title: 'Menu Photos', value: '95% Optimized', status: 'optimal', score: 4 },
      { id: 'descriptions', type: 'descriptions', title: 'Item Descriptions', value: '90% Optimized', status: 'optimal', score: 4 },
    ]
  },
  {
    id: 'justeat',
    name: 'Just Eat',
    logo: 'https://cdn.simpleicons.org/justeat/FF8000',
    color: '#FF8000',
    metrics: [
      { id: 'promos', type: 'promos', title: 'Promos', value: 'Critical', status: 'critical', score: 3 },
      calculatePricingMetric('3.8 / 5.0', 22),
      calculateVisibilityMetric(33),
      { id: 'rating', type: 'rating', title: 'Rating', value: '3.8 / 5.0', status: 'critical', score: 2 },
      { id: 'photos', type: 'photos', title: 'Menu Photos', value: '45% Optimized', status: 'critical', score: 1 },
      { id: 'descriptions', type: 'descriptions', title: 'Item Descriptions', value: '30% Optimized', status: 'critical', score: 1 },
    ]
  }
];

const getScoreColor = (score) => {
  if (score >= 90) return '#10B981'; // Green
  if (score >= 70) return '#e05046'; // MenuIQ Logo Color
  if (score >= 50) return '#F59E0B'; // Orange
  return '#DC2626'; // Red
};

const renderCustomBadge = (type) => {
  const boundingBox = {
    width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
  };

  let graphic;
  
  if (type === 'promos') {
    graphic = <BadgePercent size={24} fill="#dc2626" color="white" strokeWidth={1.5} />;
  } else {
    const isCustomYellow = type === 'photos' || type === 'descriptions' || type === 'pricing' || type === 'visibility';
    const yellowWrapperStyle = isCustomYellow ? {
      width: '24px', height: '24px', borderRadius: '50%', 
      background: 'radial-gradient(circle at 30% 30%, #ffe600, #ffb300)', 
      boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.7), 0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex', alignItems: 'center', justifyContent: 'center' 
    } : {
      width: '24px', height: '24px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#f59e0b',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    };

    let iconContent;
    if (type === 'rating') iconContent = <Star size={12} fill="currentColor" />;
    else if (type === 'photos') iconContent = <img src="/menu_photos_icon.png" alt="Menu Photos" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />;
    else if (type === 'descriptions') iconContent = <img src="/item_descriptions_icon.png" alt="Item Descriptions" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />;
    else if (type === 'visibility') iconContent = <Eye size={13} color="#000" strokeWidth={2.5} />;
    else if (type === 'pricing') iconContent = <span style={{ fontSize: '13px', fontWeight: 900, color: '#000', lineHeight: 1 }}>£</span>;
    else iconContent = <Activity size={12} color="#000" />;

    graphic = (
      <div style={yellowWrapperStyle}>
        {iconContent}
      </div>
    );
  }

  return (
    <div style={boundingBox}>
      {graphic}
    </div>
  );
};

const getStatusStyle = (status) => {
  if (status === 'optimal') return { color: '#10B981', icon: <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} /> };
  if (status === 'needs_action') return { color: '#F59E0B', icon: <CheckCircle2 size={18} color="#F59E0B" strokeWidth={2.5} /> };
  return { color: '#EF4444', icon: <CheckCircle2 size={18} color="#EF4444" strokeWidth={2.5} /> };
};

const RestaurantHealthModal = ({ isOpen, onClose, restaurant, onMetricClick }) => {

  if (!isOpen) return null;

  const getPlatformScore = (platform) => platform.metrics.reduce((acc, metric) => acc + metric.score, 0);
  const masterScore = Math.round(multiPlatformData.reduce((acc, platform) => acc + getPlatformScore(platform), 0));

  return createPortal(
    <>
      <style>{`
        .platform-card {
          transition: all 0.2s ease;
        }
        .platform-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 11px rgba(0,0,0,0.04);
          border-color: #CBD5E1 !important;
        }
      `}</style>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(7px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.44rem', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }} onClick={onClose}>
      
      <div 
        className="glass-panel"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(18px)',
          width: '100%', 
          maxWidth: '780px', 
          maxHeight: '90vh',
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '22px', 
          boxShadow: '0 20px 40px -10px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.05)', 
          overflow: 'hidden',
          animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Area (Split Layout) */}
        <div style={{ 
          display: 'flex',
          background: '#FFFFFF',
          position: 'relative',
          minHeight: '244px',
          flexShrink: 0,
          borderBottom: '1px solid #E2E8F0'
        }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '11px', right: '11px', background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#64748B', width: '23px', height: '23px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}>
            <X size={11} strokeWidth={2.5} />
          </button>

          {/* Left Side - Image */}
          <div style={{ width: '40%', flexShrink: 0, flexGrow: 0, position: 'relative' }}>
             {restaurant?.hero_image_url ? (
                <img src={restaurant.hero_image_url} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} alt="Restaurant Hero" />
             ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', background: '#F1F5F9' }}>No Image Available</div>
             )}
          </div>

          {/* Right Side - Details */}
          <div style={{ 
            width: '60%', 
            flexShrink: 0,
            flexGrow: 0,
            padding: '0.65rem 3rem 0.65rem 1.25rem', 
            background: '#FFFFFF',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingRight: '3rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              
              {/* Left Group: Branding and Title */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', paddingRight: '1.08rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.36rem', marginBottom: '0.54rem' }}>
                  <span style={{ fontFamily: "'Lufga', sans-serif", fontSize: '18px', fontWeight: 900, color: '#e05046', letterSpacing: '-0.02em' }}>MenuIQ</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.15rem' }}>Intelligence</span>
                </div>
                <h2 style={{ 
                  fontSize: '1.44rem', 
                  fontWeight: 800, 
                  color: '#0F172A', 
                  margin: 0, 
                  letterSpacing: '-0.02em', 
                  lineHeight: 1.2,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {restaurant?.name || '100% Halal pizza'}
                </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.3rem', width: '100%' }}>
                    <MapPin size={14} color="#64748B" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {(() => {
                        const appendLondon = (area) => area.toLowerCase().includes('london') ? area : `${area}, London`;
                        if (restaurant?.areas && restaurant.areas.length > 0) return appendLondon(restaurant.areas[0]);
                        if (restaurant?.address) {
                          const addr = restaurant.address.toLowerCase();
                          if (addr.includes('katherine road')) return 'Forest Gate, London';
                          if (addr.includes('ilford')) return 'Ilford, London';
                          if (addr.includes('barking')) return 'Barking, London';
                          if (addr.includes('whitechapel')) return 'Whitechapel, London';
                          const parts = restaurant.address.split(',');
                          return appendLondon(parts.length > 1 ? parts[1].trim() : restaurant.address);
                        }
                        return 'Forest Gate, London';
                      })()}
                    </span>
                  </div>
              </div>

              {/* Right Group: Typography-Driven Score */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '0.18rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.11rem' }}>
                  <span style={{ fontSize: '2.4rem', fontWeight: 700, color: getScoreColor(masterScore), letterSpacing: '-0.04em', lineHeight: 0.9, fontFamily: 'system-ui' }}>{masterScore}</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#94A3B8', lineHeight: 1, fontFamily: 'system-ui' }}>/100</span>
                </div>
              </div>

            </div>

            {/* Platform Availability (Red Box Area) */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem', marginTop: '1.5rem', width: '100%' }}>
              <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Coverage</span>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '0.8rem' }}>
              
              {/* Deliveroo */}
              <div style={{ background: '#00CCBC', padding: '0.35rem 0.85rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.29rem' }}>
                <img src="https://cdn.simpleicons.org/deliveroo/white" alt="Deliveroo" style={{ height: '14px', width: '14px' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF' }}>Deliveroo</span>
              </div>

              {/* UberEats */}
              <div style={{ background: '#06C167', padding: '0.35rem 0.85rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.29rem' }}>
                <img src="https://cdn.simpleicons.org/ubereats/white" alt="UberEats" style={{ height: '14px', width: '14px' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF' }}>UberEats</span>
              </div>

              {/* Just Eat */}
              <div style={{ background: '#FF8000', padding: '0.35rem 0.85rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.29rem' }}>
                <img src="https://cdn.simpleicons.org/justeat/white" alt="Just Eat" style={{ height: '14px', width: '14px' }} />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#FFFFFF' }}>Just Eat</span>
              </div>
              
              </div>
            </div>
          </div>
        </div>

        {/* Lower Section - Multi-Platform Grid */}
        <div style={{ padding: '0', overflowY: 'auto', flex: 1, background: '#FFFFFF' }}>
            
            <div style={{ padding: '1.5rem 1.75rem' }}>
              
              {/* Table Header / Platform Headers */}
              <div style={{ display: 'grid', gridTemplateColumns: '145px 1fr 1fr 1fr', gap: '0.72rem', marginBottom: '0.72rem', alignItems: 'center', padding: '0 1rem' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', borderRight: '1px solid #E2E8F0', paddingRight: '1.5rem', height: '100%', paddingLeft: '0.5rem' }}>
                   <h3 style={{ fontSize: '0.73125rem', fontWeight: 900, color: '#E86A58', margin: 0, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Platform Health</h3>
                 </div>
                 {multiPlatformData.map((platform, index) => {
                   const platformScoreRaw = getPlatformScore(platform);
                   const platformScore = Math.round((platformScoreRaw / 33) * 100);
                   return (
                     <div key={platform.id} style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.2rem 0', borderRight: index !== 2 ? '1px solid #E2E8F0' : 'none' }}>
                        <div style={{ background: platform.color, width: '24px', height: '24px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src={`https://cdn.simpleicons.org/${platform.id}/white`} alt={platform.name} style={{ height: '13px', width: '13px' }} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '1px' }}>
                          <span style={{ fontSize: '17px', fontWeight: 600, color: '#1E293B' }}>{platformScore}</span>
                          <span style={{ fontSize: '13px', fontWeight: 500, color: '#64748B' }}>/100</span>
                        </div>
                     </div>
                   )
                 })}
              </div>

              {/* Table Body / Metric Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '11px', overflow: 'hidden' }}>
                {multiPlatformData[0].metrics.map((metricPrototype, rowIndex) => {
                   return (
                     <div key={metricPrototype.id} 
                          onClick={() => onMetricClick && onMetricClick(metricPrototype.type)}
                          style={{ display: 'grid', gridTemplateColumns: '145px 1fr 1fr 1fr', gap: '0.72rem', padding: '1.15rem 1rem', borderBottom: rowIndex === multiPlatformData[0].metrics.length - 1 ? 'none' : '1px solid #E2E8F0', alignItems: 'center', transition: 'background 0.2s', cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                       
                       {/* Row Header (Metric Name) */}
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid #E2E8F0', paddingRight: '1.5rem', height: '100%', paddingLeft: '0.5rem' }}>
                         {renderCustomBadge(metricPrototype.type)}
                         <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#111827', lineHeight: 1 }}>{metricPrototype.title}</span>
                       </div>

                       {/* Data Cells (Values for each platform) */}
                       {multiPlatformData.map((platform, index) => {
                          const platformMetric = platform.metrics.find(m => m.type === metricPrototype.type);
                          const statusStyle = getStatusStyle(platformMetric.status);
                          return (
                            <div key={platform.id} 
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   onMetricClick && onMetricClick(metricPrototype.type, platform.id, platformMetric.status);
                                 }}
                                 style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 0.5rem', borderRight: index !== 2 ? '1px solid #E2E8F0' : 'none', paddingRight: index !== 2 ? '1.5rem' : '0.5rem', height: '100%', cursor: 'pointer', transition: 'background 0.2s', borderRadius: '4px' }} 
                                 onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} 
                                 onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                              <span style={{ flex: 1, textAlign: 'center', fontSize: '0.8125rem', fontWeight: 500, color: metricPrototype.type === 'promos' || metricPrototype.type === 'pricing' ? statusStyle.color : '#4B5563', lineHeight: 1 }}>{platformMetric.value}</span>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '-1px' }}>
                                {statusStyle.icon}
                              </div>
                            </div>
                          )
                       })}
                     </div>
                   )
                })}
              </div>

            </div>

        </div>
      </div>
      </div>
    </>,
    document.body
  );
};

export default RestaurantHealthModal;
