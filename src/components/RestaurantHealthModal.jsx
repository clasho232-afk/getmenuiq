import React, { useState } from 'react';
import { X, Activity, TrendingDown, TrendingUp, Search, Info, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Sparkles, Target, Zap, LayoutList, Crosshair, MapPin } from 'lucide-react';

const mockHealthData = {
  overallScore: 68,
  pillars: [
    {
      id: 'visibility',
      name: 'Visibility & Rank',
      score: 55,
      status: 'warning',
      description: 'Search rankings are dropping. Losing impression share on major keywords in Ilford.',
      expandable: true,
      icon: <Target size={18} />,
      action: 'Run a targeted sponsored placement on Deliveroo for "Pizza".',
      keywords: [
        { term: 'Pizza', searchVolume: 'High', rankings: { ubereats: 10, deliveroo: 12, justeat: 8 } },
        { term: 'Burgers', searchVolume: 'Med', rankings: { ubereats: 4, deliveroo: 6, justeat: 5 } },
        { term: 'Fried Chicken', searchVolume: 'Med', rankings: { ubereats: 15, deliveroo: 18, justeat: 11 } }
      ]
    },
    {
      id: 'pricing',
      name: 'Pricing Optimization',
      score: 85,
      status: 'good',
      description: 'Menu pricing is highly competitive within your neighborhood, but specific items can be optimized for better margin.',
      expandable: true,
      icon: <Crosshair size={18} />,
      action: 'Maintain current pricing strategy. Price gap is healthy (+1%).',
      pricingData: {
        mains: [
          { name: 'Truffle Burger', price: '£12.99', status: 'overpriced', platform: 'ubereats', image: 'https://images.unsplash.com/photo-1594212580737-67eb1c2b53df?auto=format&fit=crop&w=150&q=80' },
          { name: 'Margherita', price: '£10.99', status: 'underpriced', platform: 'deliveroo', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=150&q=80' }
        ],
        drinks: [
          { name: 'Craft Cola', price: '£4.50', status: 'overpriced', platform: 'ubereats', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=150&q=80' }
        ],
        sides: [
          { name: 'Loaded Fries', price: '£4.99', status: 'underpriced', platform: 'deliveroo', image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=150&q=80' }
        ],
        analysis: {
          mains: "Mains are generally priced competitively, but premium items are losing conversion due to a 15% markup over local averages on UberEats.",
          drinks: "High margin opportunity. Craft sodas are priced lower than the neighborhood baseline; a slight increase could yield +5% overall profit.",
          sides: "Sides are seeing excellent attach rates on Deliveroo. Slight underpricing is driving high volume, so maintaining current strategy is recommended."
        }
      }
    },
    {
      id: 'promos',
      name: 'Promo Optimization',
      score: 40,
      status: 'critical',
      description: 'Competitors are heavily discounting, but you have no active promos.',
      action: 'Launch a localized promotion.',
      expandable: true,
      promoData: {
        currentPromos: [
          { platform: 'ubereats', offer: '20% Off Entire Menu', alignment: 'mismatch', marketContext: 'Market is highly focused on delivery fee elimination.' },
          { platform: 'deliveroo', offer: 'Free Delivery over £15', alignment: 'optimal', marketContext: 'Matches peak competitor strategy.' },
          { platform: 'justeat', offer: 'No Active Promo', alignment: 'mismatch', marketContext: 'Direct competitors are running aggressive BOGO deals.' }
        ],
        intelSuggestions: [
          { platform: 'ubereats', action: 'Switch to Free Delivery', reasoning: 'Matches 60% of top performers in your radius.' },
          { platform: 'justeat', action: 'Launch BOGO on Mains', reasoning: 'Counter "Local Diner" who just captured 15% impression share.' }
        ]
      },
      icon: <Zap size={18} />
    }
  ]
};

const getScoreColor = (score) => {
  if (score >= 90) return '#10B981'; // Green
  if (score >= 70) return '#3B82F6'; // Blue
  if (score >= 50) return '#F59E0B'; // Orange
  return '#EF4444'; // Red
};

const getRankColor = (rank) => {
  if (rank <= 5) return '#059669'; // Green
  if (rank <= 15) return '#D97706'; // Orange
  return '#DC2626'; // Red
};

const RestaurantHealthModal = ({ isOpen, onClose, restaurant }) => {
  const [expandedPillar, setExpandedPillar] = useState('visibility');
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .metric-card {
          transition: all 0.2s ease;
        }
        .metric-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 11px rgba(0,0,0,0.04);
          border-color: #CBD5E1 !important;
        }
      `}</style>
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(7px)', zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.8rem', fontFamily: '"Inter", system-ui, -apple-system, sans-serif' }} onClick={onClose}>
      
      <div 
        className="glass-panel" 
        style={{ 
          background: 'rgba(255, 255, 255, 0.95)', 
          backdropFilter: 'blur(18px)',
          width: '100%', 
          maxWidth: '900px', 
          maxHeight: '90vh',
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '22px', 
          boxShadow: '0 23px 45px -11px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.5) inset', 
          overflow: 'hidden',
          animation: 'modalFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        {/* Header Area (Split Layout) */}
        <div style={{ 
          display: 'flex',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)', 
          position: 'relative',
          minHeight: '234px'
        }}>
          <button onClick={onClose} style={{ position: 'absolute', top: '14px', right: '14px', background: '#F1F5F9', border: 'none', cursor: 'pointer', color: '#64748B', width: '29px', height: '29px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', zIndex: 10 }}>
            <X size={14} strokeWidth={2.5} />
          </button>

          {/* Left Side - Image */}
          <div style={{ width: '45%', position: 'relative' }}>
             {restaurant?.hero_image_url ? (
                <img src={restaurant.hero_image_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Restaurant Hero" />
             ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8', background: '#F1F5F9' }}>No Image Available</div>
             )}
          </div>

          {/* Right Side - Details */}
          <div style={{ 
            width: '60%', 
            padding: '1.35rem 2.7rem 1.35rem 1.35rem', 
            background: 'linear-gradient(180deg, rgba(248, 250, 252, 0.8) 0%, rgba(255, 255, 255, 0) 100%)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              
              {/* Left Group: Branding and Title */}
              <div style={{ display: 'flex', flexDirection: 'column', flex: '1 1 auto', paddingRight: '1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.675rem' }}>
                  <span style={{ fontFamily: "'Lufga', sans-serif", fontSize: '18px', fontWeight: 800, color: '#e05046' }}>MenuIQ</span>
                  <span style={{ fontSize: '0.63rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: '0.18rem' }}>Intelligence</span>
                </div>
                <h2 style={{ 
                  fontSize: '1.26rem', 
                  fontWeight: 800, 
                  color: '#0F172A', 
                  margin: 0, 
                  letterSpacing: '-0.02em', 
                  lineHeight: 1.1,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {restaurant?.name || 'Baked & Loaded'}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.315rem', color: '#64748B', marginTop: '0.45rem', fontSize: '0.765rem', fontWeight: 500 }}>
                  <MapPin size={13} />
                  Ilford, London
                </div>
              </div>

              {/* Right Group: Typography-Driven Score */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, whiteSpace: 'nowrap', marginTop: '0.225rem', marginRight: '1.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.135rem' }}>
                  <span style={{ fontSize: '3.15rem', fontWeight: 900, color: '#0F172A', letterSpacing: '-0.04em', lineHeight: 1 }}>{mockHealthData.overallScore}</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#94A3B8', lineHeight: 1 }}>/100</span>
                </div>
                <div style={{ fontSize: '0.63rem', fontWeight: 800, color: getScoreColor(mockHealthData.overallScore), textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.225rem', display: 'flex', alignItems: 'center', gap: '0.225rem' }}>
                  <Activity size={11} strokeWidth={3} />
                  Fair Health
                </div>
              </div>

            </div>

            {/* Platform Availability (Red Box Area) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.675rem', marginTop: 'auto' }}>
              
              {/* Deliveroo */}
              <div style={{ background: '#00CCBC', padding: '0.315rem 0.765rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.36rem', boxShadow: '0 2px 4px rgba(0, 204, 188, 0.2)' }}>
                <img src="https://cdn.simpleicons.org/deliveroo/white" alt="Deliveroo" style={{ height: '13px', width: '13px' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>Deliveroo</span>
              </div>

              {/* UberEats */}
              <div style={{ background: '#06C167', padding: '0.315rem 0.765rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.36rem', boxShadow: '0 2px 4px rgba(6, 193, 103, 0.2)' }}>
                <img src="https://cdn.simpleicons.org/ubereats/white" alt="UberEats" style={{ height: '13px', width: '13px' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>UberEats</span>
              </div>

              {/* Just Eat */}
              <div style={{ background: '#FF8000', padding: '0.315rem 0.765rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.36rem', boxShadow: '0 2px 4px rgba(255, 128, 0, 0.2)' }}>
                <img src="https://cdn.simpleicons.org/justeat/white" alt="Just Eat" style={{ height: '13px', width: '13px' }} />
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF' }}>Just Eat</span>
              </div>

            </div>
          </div>
        </div>

        {/* Lower Section - Vertical Stack */}
        <div style={{ padding: '0', overflowY: 'auto', flex: 1, background: '#F8FAFC' }}>
            
            {/* Section Header */}
            <div style={{ padding: '1.8rem 2.7rem 0.9rem 2.7rem', background: '#F8FAFC' }}>
              <h3 style={{ fontSize: '0.99rem', fontWeight: 900, color: '#E86A58', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Metrics</h3>
            </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.675rem', padding: '0 2.7rem 2.7rem 2.7rem' }}>

            {mockHealthData.pillars.map((pillar, index) => {
              const accentColor = getScoreColor(pillar.score);

              return (
                <div key={pillar.id} className="metric-card" style={{ 
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px solid #E2E8F0',
                  borderRadius: '11px',
                  padding: '1.35rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Clickable Header Row */}
                    <div 
                      onClick={() => pillar.expandable && setExpandedPillar(expandedPillar === pillar.id ? null : pillar.id)}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: pillar.expandable ? 'pointer' : 'default', userSelect: 'none' }}
                    >
                      {/* Left Element (Identity): Title */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.675rem' }}>
                        <h4 style={{ fontSize: '1.035rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>{pillar.name}</h4>
                        {pillar.status === 'critical' && <span style={{ background: '#FEF2F2', color: '#DC2626', fontSize: '0.585rem', fontWeight: 800, padding: '0.135rem 0.36rem', borderRadius: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Critical</span>}
                      </div>

                      {/* Right Element (Metric): Score & Chevron */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.125rem' }}>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                          <span style={{ fontSize: '1.35rem', fontWeight: 900, color: accentColor, fontFamily: 'monospace', lineHeight: 1 }}>{pillar.score}</span>
                          <span style={{ fontSize: '0.765rem', fontWeight: 700, color: '#94A3B8' }}>/100</span>
                        </div>
                        {pillar.expandable && (
                            <div style={{ color: '#94A3B8', display: 'flex', alignItems: 'center' }}>
                            {expandedPillar === pillar.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                            </div>
                        )}
                      </div>
                    </div>

                    {/* Expandable Content */}
                    {expandedPillar === pillar.id && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', marginTop: '1.125rem' }}>
                        <div style={{ flex: 1, width: '100%' }}>
                          {/* Keyword Matrix */}
                          {pillar.keywords && (
                            <div style={{ width: '100%', marginBottom: '1.125rem', border: '1px solid #E2E8F0', borderRadius: '11px', overflow: 'hidden', background: '#FFFFFF' }}>
                              <div style={{ display: 'flex', alignItems: 'center', background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', padding: '0.675rem 0.9rem' }}>
                                <div style={{ flex: 1, fontSize: '0.63rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Keyword Target</div>
                                <div style={{ width: '90px', display: 'flex', justifyContent: 'center' }}>
                                  <div style={{ background: '#06C167', padding: '0.225rem 0.54rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.27rem', boxShadow: '0 1px 2px rgba(6, 193, 103, 0.2)' }}>
                                    <img src="https://cdn.simpleicons.org/ubereats/white" alt="UberEats" style={{ height: '9px', width: '9px' }} />
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#0F172A' }}>UberEats</span>
                                  </div>
                                </div>
                                <div style={{ width: '90px', display: 'flex', justifyContent: 'center' }}>
                                  <div style={{ background: '#00CCBC', padding: '0.225rem 0.54rem', borderRadius: '8999px', display: 'flex', alignItems: 'center', gap: '0.27rem', boxShadow: '0 1px 2px rgba(0, 204, 188, 0.2)' }}>
                                    <img src="https://cdn.simpleicons.org/deliveroo/white" alt="Deliveroo" style={{ height: '9px', width: '9px' }} />
                                    <span style={{ fontSize: '9px', fontWeight: 800, color: '#0F172A' }}>Deliveroo</span>
                                  </div>
                                </div>
                              </div>
                              
                              {pillar.keywords.map((kw, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', borderBottom: i < pillar.keywords.length - 1 ? '1px solid #F1F5F9' : 'none', padding: '0.9rem' }}>
                                  <div style={{ flex: 1, fontSize: '0.765rem', fontWeight: 700, color: '#E86A58' }}>"{kw.term}"</div>
                                  <div style={{ width: '90px', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.81rem', fontWeight: 900, color: getRankColor(kw.rankings.ubereats), fontFamily: 'monospace' }}>#{kw.rankings.ubereats}</span>
                                  </div>
                                  <div style={{ width: '90px', display: 'flex', justifyContent: 'center' }}>
                                    <span style={{ fontSize: '0.81rem', fontWeight: 900, color: getRankColor(kw.rankings.deliveroo), fontFamily: 'monospace' }}>#{kw.rankings.deliveroo}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Pricing Optimization UI */}
                          {pillar.pricingData && (
                            <div style={{ width: '100%', marginBottom: '1.125rem' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.8rem' }}>
                                {/* Mains Column */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.45rem', marginBottom: '0.225rem' }}>Mains</div>
                                  {pillar.pricingData.mains.map((item, idx) => (
                                    <div key={idx} style={{ padding: '0.45rem 0', display: 'flex', alignItems: 'center', gap: '0.675rem', borderBottom: idx < pillar.pricingData.mains.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                      <img src={item.image} alt={item.name} style={{ width: '25px', height: '25px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.315rem', marginTop: '0.18rem' }}>
                                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#0F172A' }}>{item.price}</span>
                                          {item.platform === 'ubereats' && <img src="https://cdn.simpleicons.org/ubereats/06C167" alt="UberEats" style={{ height: '10px', width: '10px', marginLeft: '0.09rem' }} />}
                                          {item.platform === 'deliveroo' && <img src="https://cdn.simpleicons.org/deliveroo/00CCBC" alt="Deliveroo" style={{ height: '10px', width: '10px', marginLeft: '0.09rem' }} />}
                                          <span style={{ fontSize: '0.54rem', fontWeight: 800, padding: '0.09rem 0.27rem', borderRadius: '4px', marginLeft: 'auto', background: item.status === 'overpriced' ? '#FEF2F2' : '#F0FDF4', color: item.status === 'overpriced' ? '#DC2626' : '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.status}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {/* Drinks Column */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.45rem', marginBottom: '0.225rem' }}>Drinks</div>
                                  {pillar.pricingData.drinks.map((item, idx) => (
                                    <div key={idx} style={{ padding: '0.45rem 0', display: 'flex', alignItems: 'center', gap: '0.675rem', borderBottom: idx < pillar.pricingData.drinks.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                      <img src={item.image} alt={item.name} style={{ width: '25px', height: '25px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.315rem', marginTop: '0.18rem' }}>
                                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#0F172A' }}>{item.price}</span>
                                          {item.platform === 'ubereats' && <img src="https://cdn.simpleicons.org/ubereats/06C167" alt="UberEats" style={{ height: '10px', width: '10px', marginLeft: '0.09rem' }} />}
                                          {item.platform === 'deliveroo' && <img src="https://cdn.simpleicons.org/deliveroo/00CCBC" alt="Deliveroo" style={{ height: '10px', width: '10px', marginLeft: '0.09rem' }} />}
                                          <span style={{ fontSize: '0.54rem', fontWeight: 800, padding: '0.09rem 0.27rem', borderRadius: '4px', marginLeft: 'auto', background: item.status === 'overpriced' ? '#FEF2F2' : '#F0FDF4', color: item.status === 'overpriced' ? '#DC2626' : '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.status}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                {/* Sides Column */}
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                  <div style={{ fontSize: '0.675rem', fontWeight: 800, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid #E2E8F0', paddingBottom: '0.45rem', marginBottom: '0.225rem' }}>Sides</div>
                                  {pillar.pricingData.sides.map((item, idx) => (
                                    <div key={idx} style={{ padding: '0.45rem 0', display: 'flex', alignItems: 'center', gap: '0.675rem', borderBottom: idx < pillar.pricingData.sides.length - 1 ? '1px solid #F1F5F9' : 'none' }}>
                                      <img src={item.image} alt={item.name} style={{ width: '25px', height: '25px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.315rem', marginTop: '0.18rem' }}>
                                          <span style={{ fontSize: '0.675rem', fontWeight: 800, color: '#0F172A' }}>{item.price}</span>
                                          {item.platform === 'ubereats' && <img src="https://cdn.simpleicons.org/ubereats/06C167" alt="UberEats" style={{ height: '10px', width: '10px', marginLeft: '0.09rem' }} />}
                                          {item.platform === 'deliveroo' && <img src="https://cdn.simpleicons.org/deliveroo/00CCBC" alt="Deliveroo" style={{ height: '10px', width: '10px', marginLeft: '0.09rem' }} />}
                                          <span style={{ fontSize: '0.54rem', fontWeight: 800, padding: '0.09rem 0.27rem', borderRadius: '4px', marginLeft: 'auto', background: item.status === 'overpriced' ? '#FEF2F2' : '#F0FDF4', color: item.status === 'overpriced' ? '#DC2626' : '#16A34A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.status}</span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* Category Analysis */}
                              {pillar.pricingData.analysis && (
                                <div style={{ marginTop: '1.8rem', padding: '1.35rem', background: '#F8FAFC', borderRadius: '11px' }}>
                                  <h5 style={{ fontSize: '0.765rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.9rem 0' }}>Overview</h5>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                    <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                                      <div style={{ width: '72px', fontSize: '0.675rem', fontWeight: 800, color: '#64748B', paddingTop: '0.09rem' }}>MAINS</div>
                                      <div style={{ flex: 1, fontSize: '0.765rem', color: '#475569', lineHeight: 1.5 }}>{pillar.pricingData.analysis.mains}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                                      <div style={{ width: '72px', fontSize: '0.675rem', fontWeight: 800, color: '#64748B', paddingTop: '0.09rem' }}>DRINKS</div>
                                      <div style={{ flex: 1, fontSize: '0.765rem', color: '#475569', lineHeight: 1.5 }}>{pillar.pricingData.analysis.drinks}</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.9rem', alignItems: 'flex-start' }}>
                                      <div style={{ width: '72px', fontSize: '0.675rem', fontWeight: 800, color: '#64748B', paddingTop: '0.09rem' }}>SIDES</div>
                                      <div style={{ flex: 1, fontSize: '0.765rem', color: '#475569', lineHeight: 1.5 }}>{pillar.pricingData.analysis.sides}</div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Promo Optimization Details */}
                          {pillar.promoData && (
                            <div style={{ width: '100%' }}>
                              {/* Current Promos Analysis */}
                              <div style={{ marginBottom: '1.8rem' }}>
                                <div style={{ fontSize: '0.648rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.9rem' }}>Active Promos</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.675rem' }}>
                                  {pillar.promoData.currentPromos.map((promo, idx) => (
                                    <div key={idx} style={{ display: 'flex', gap: '0.9rem', padding: '1.125rem', background: '#FFFFFF', borderRadius: '11px', border: '1px solid #E2E8F0' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', paddingRight: '0.9rem', borderRight: '1px solid #E2E8F0' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: promo.platform === 'ubereats' ? '#000000' : promo.platform === 'deliveroo' ? '#00CCBC' : '#FF8000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                                          <img src={`https://cdn.simpleicons.org/${promo.platform}/white`} alt={promo.platform} style={{ width: '22px', height: '22px' }} />
                                        </div>
                                      </div>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.45rem' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                          <span style={{ fontSize: '0.752rem', fontWeight: 800, color: '#0F172A' }}>{promo.offer}</span>
                                          <span style={{ fontSize: '0.545rem', fontWeight: 800, padding: '0.18rem 0.45rem', borderRadius: '4px', background: promo.alignment === 'optimal' ? '#F0FDF4' : '#FEF2F2', color: promo.alignment === 'optimal' ? '#16A34A' : '#DC2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{promo.alignment}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '0.673rem', color: '#64748B', lineHeight: 1.5 }}>{promo.marketContext}</p>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* Intel Suggestions */}
                              <div style={{ padding: '1.35rem', background: 'linear-gradient(135deg, #FFF1F0 0%, #FFF5F4 100%)', borderRadius: '11px', border: '1px solid #FFE4E1' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.9rem' }}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#E86A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                  <h5 style={{ margin: 0, fontSize: '0.648rem', fontWeight: 800, color: '#E86A58', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Promo Intel Suggestions</h5>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                                  {pillar.promoData.intelSuggestions.map((suggestion, idx) => (
                                    <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.9rem' }}>
                                      <div style={{ width: '25px', height: '25px', flexShrink: 0, borderRadius: '50%', background: '#FFFFFF', border: '1px solid #FFE4E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <img src={`https://cdn.simpleicons.org/${suggestion.platform}/${suggestion.platform === 'ubereats' ? '06C167' : suggestion.platform === 'deliveroo' ? '00CCBC' : 'FF8000'}`} alt={suggestion.platform} style={{ width: '11px', height: '11px' }} />
                                      </div>
                                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.225rem' }}>
                                        <span style={{ fontSize: '0.648rem', fontWeight: 800, color: '#0F172A' }}>{suggestion.action}</span>
                                        <span style={{ fontSize: '0.612rem', color: '#64748B' }}>{suggestion.reasoning}</span>
                                      </div>
                                      <button style={{ padding: '0.36rem 0.675rem', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '5px', fontSize: '0.576rem', fontWeight: 700, color: '#0F172A', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>Apply</button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          <p style={{ fontSize: '0.855rem', color: '#64748B', margin: '0', fontWeight: 500, lineHeight: 1.5 }}>{pillar.description}</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default RestaurantHealthModal;
