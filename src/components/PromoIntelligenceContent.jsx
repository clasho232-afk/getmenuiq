import React, { useState, useEffect } from 'react';
import { Target, MapPin, SlidersHorizontal, ChevronDown, Activity, Zap, Shield, Scale } from 'lucide-react';

// ================================================================
// PROMO INTELLIGENCE ENGINE — PURE LOGIC
// ================================================================

function getTimeVariable() {
  const now = new Date();
  const day = now.getDay(); 
  const hour = now.getHours();

  const isAfterMidnight = hour < 2;
  const effectiveDay = isAfterMidnight ? (day === 0 ? 6 : day - 1) : day;
  const isEvening = hour >= 18 || isAfterMidnight;

  if (day >= 1 && day <= 5 && hour >= 12 && hour < 18) return 'QUIET';
  if (isEvening) {
    if (effectiveDay >= 1 && effectiveDay <= 4) return 'BUSY'; 
    if (effectiveDay === 5 || effectiveDay === 6 || effectiveDay === 0) return 'HYPER';
  }
  return 'OFF';
}

const AG_SCORES = {
  free_delivery: 6, Delivery: 6,
  free_item: 12, 'Free Item': 12,
  spend_save: 18, Threshold: 18,
  discount_low: 24,
  discount_high: 30, Discount: 24,
  bogo: 35, BOGO: 35,
};
const OL_SCORES = { same_cuisine: 15, direct_match: 30, direct_match_promo: 45 };

function getThreatData(promos, platform) {
  const pp = promos.filter(p => p.platform === platform);
  const volumeScore = pp.length === 0 ? 0 : pp.length <= 2 ? 8 : pp.length <= 5 ? 14 : 20;

  let topPromo = null;
  let aggressivenessScore = 0;
  pp.forEach(p => {
    const s = AG_SCORES[p.promoCategory] || AG_SCORES[p.type] || 6;
    if (s > aggressivenessScore) { aggressivenessScore = s; topPromo = p; }
  });

  const itemOverlapScore = pp.length > 0
    ? pp.reduce((max, p) => Math.max(max, OL_SCORES[p.itemOverlapLevel] || 15), 0)
    : 0;

  const total = Math.min(volumeScore + aggressivenessScore + itemOverlapScore, 100);
  let level = 'Low';
  if (total > 25 && total <= 50) level = 'Moderate';
  if (total > 50 && total <= 75) level = 'High';
  if (total > 75) level = 'Extreme';

  const directMatches = pp.filter(p => p.itemOverlapLevel === 'direct_match_promo' || p.itemOverlapLevel === 'direct_match' || p.itemOverlapLevel === 'same_cuisine');
  
  let description = '';
  if (pp.length === 0) {
     description = `No competitor activity detected on ${platform.toUpperCase()} right now.`;
  } else {
     description = `${level} Threat. ${pp.length} restaurants in Ilford right now are running promos. `;
     
     if (directMatches.length > 0) {
        description += `${directMatches.length} restaurants in your category are offering aggressive discounts (like '${directMatches[0].promo}'). `;
     }
     if (topPromo && (!directMatches.length || topPromo.restaurant !== directMatches[0].restaurant)) {
        description += `The most aggressive overall offer is from ${topPromo.restaurant} running '${topPromo.promo}'. `;
     }
  }

  const structuredMetrics = {
     totalArea: pp.length,
     totalCategory: directMatches.length,
     categoryExample: directMatches.length > 0 ? directMatches[0] : null
  };

  return { total, level, volumeScore, aggressivenessScore, itemOverlapScore, count: pp.length, topPromo, description, structuredMetrics };
}

function getPromoOptions(time, threatLevel) {
  const options = [];
  
  if (time === 'QUIET') {
    if (threatLevel === 'Low') {
      options.push({ type: 'Conservative', title: 'Hold & Monitor', promoType: 'None', reason: 'No need to spend margin when traffic is quiet and competition is low.' });
      options.push({ type: 'Normal', title: 'Visibility Boost', promoType: 'Free Delivery or 10% off', reason: 'No competition right now. A small push during quiet time is highly efficient — almost every order gained is incremental.' });
      options.push({ type: 'Aggressive', title: 'Market Capture', promoType: '15% Off Entire Menu', reason: "Aggressively capture the limited quiet time traffic while competitors are completely asleep." });
    } else if (threatLevel === 'Moderate') {
      options.push({ type: 'Conservative', title: 'Defensive Delivery', promoType: 'Free Delivery', reason: 'Stay visible cheaply without cutting food margins during a quiet hour.' });
      options.push({ type: 'Normal', title: 'Match Energy', promoType: 'Free Item add-on or 10-15% off', reason: 'Some competitors are active during a quiet window. Match their energy before they pull customers who would otherwise find you first.' });
      options.push({ type: 'Aggressive', title: 'Volume Push', promoType: '20% Off Orders', reason: 'Overpower the moderate threat directly to dominate the quiet hour entirely.' });
    } else { // High/Extreme
      options.push({ type: 'Conservative', title: 'Protect Margins', promoType: 'None', reason: 'Competitors are burning cash during quiet hours. Protect your margins and wait for peak.' });
      options.push({ type: 'Normal', title: 'Strategic Counter', promoType: '15-20% off hero items, or Spend & Save', reason: 'Competitors are aggressively pushing. Counter immediately before losing lunch, but avoid BOGO matching.' });
      options.push({ type: 'Aggressive', title: 'Direct Match', promoType: 'Match Competitor (25%+ off)', reason: 'Do not let competitors monopolize the quiet hours. Match their heavy discounts to retain market share.' });
    }
  } else if (time === 'BUSY') {
    if (threatLevel === 'Low') {
      options.push({ type: 'Conservative', title: 'Organic Maximization', promoType: 'None', reason: 'Organic demand is high. No threat detected. Running a promo here burns margin for volume you would get anyway.' });
      options.push({ type: 'Normal', title: 'Hold Strategy', promoType: 'None', reason: 'Traffic is elevated and no one is competing. Every order during BUSY with no threat is organic.' });
      options.push({ type: 'Aggressive', title: 'Greedy Capture', promoType: 'Free Delivery', reason: 'Capitalize on high traffic to secure maximum volume while competitors are quiet.' });
    } else if (threatLevel === 'Moderate') {
      options.push({ type: 'Conservative', title: 'Margin Focus', promoType: 'None', reason: 'Traffic is busy, margin protection is prioritized over moderate threats.' });
      options.push({ type: 'Normal', title: 'Low-cost Visibility', promoType: 'Free Delivery only', reason: 'Some competitor activity during a busy window. Free Delivery is the lowest-cost way to stay visible without cutting price.' });
      options.push({ type: 'Aggressive', title: 'Counter Value', promoType: 'Free Item', reason: 'Push slightly harder than competitors to ensure you win the busy period outright.' });
    } else { // High/Extreme
      options.push({ type: 'Conservative', title: 'Defensive Delivery', promoType: 'Free Delivery', reason: 'Maintain baseline visibility without entering a destructive discount war during peak.' });
      options.push({ type: 'Normal', title: 'Value Counter', promoType: 'Free Item or Spend & Save (Not %)', reason: 'Losing orders during peak. Counter with value, not heavy discount. Do not match a % discount with another % discount.' });
      options.push({ type: 'Aggressive', title: 'Direct Match', promoType: 'Match % Discount directly', reason: 'Competitors are heavily discounting. Match them directly to ensure absolutely no lost orders.' });
    }
  } else { // HYPER / OFF
    if (threatLevel === 'Low') {
      options.push({ type: 'Conservative', title: 'Absolute Hold', promoType: 'None', reason: 'Maximum traffic, zero threat. Do not spend a penny on promos.' });
      options.push({ type: 'Normal', title: 'Organic Window', promoType: 'None', reason: 'This is the best organic window of the week. Focus on photos, ratings, and delivery time instead.' });
      options.push({ type: 'Aggressive', title: 'Fuel the Fire', promoType: 'Free Delivery', reason: 'Pour fuel on the fire. Add Free Delivery to an already perfect organic window to maximize volume.' });
    } else if (threatLevel === 'Moderate') {
      options.push({ type: 'Conservative', title: 'Hold & Monitor', promoType: 'None', reason: "Organic traffic is immense. Do not waste money matching moderate threats." });
      options.push({ type: 'Normal', title: 'Targeted Play', promoType: 'Free Delivery on this platform only', reason: 'Some competition during peak hour. One low-cost visibility play on the most active platform only.' });
      options.push({ type: 'Aggressive', title: 'Value Differentiator', promoType: 'Free Item', reason: 'Differentiate with high perceived value to actively pull traffic from moderately active competitors.' });
    } else { // High/Extreme
      options.push({ type: 'Conservative', title: 'Margin Protection', promoType: 'Free Item / Spend & Save', reason: 'Avoid matching heavy discounts, counter with pure value to protect margins during war.' });
      options.push({ type: 'Normal', title: 'Promo War Defense', promoType: 'Match within 5% or Free Item', reason: 'Peak hour promo war. Client is losing visible share in the highest-volume window. Match or counter directly.' });
      options.push({ type: 'Aggressive', title: 'Nuclear Option', promoType: 'BOGO or 30% Off', reason: 'Crush competitors in the highest-volume window of the week. Absolute market domination.' });
    }
  }
  
  return options;
}

function runIntel(promos) {
  const time = getTimeVariable();
  const platforms = [
    { key: 'ubereats',  label: 'UBEREATS' },
    { key: 'deliveroo', label: 'DELIVEROO' },
    { key: 'justeats',  label: 'JUSTEATS' },
  ];
  const results = platforms.map(plt => {
    const td = getThreatData(promos, plt.key);
    const outputOptions = getPromoOptions(time, td.level);
    return { ...plt, time, threatData: td, outputOptions };
  });
  
  const sorted = [...results].sort((a, b) => (b.threatData.total || 0) - (a.threatData.total || 0));
  
  return { time, results, topResult: sorted[0] };
}

// ================================================================
// COMPONENT
// ================================================================

const PromoOptionCard = ({ option, onClick }) => {
  let imageUrl = '';
  let themeColor = '';
  
  if (option.type === 'Aggressive') {
    imageUrl = '/promo_aggressive.png';
    themeColor = '#EF4444'; // Red
  } else if (option.type === 'Normal') {
    imageUrl = '/promo_normal.png';
    themeColor = '#10B981'; // Green
  } else {
    imageUrl = '/promo_conservative.png';
    themeColor = '#EAB308'; // Yellow
  }

  return (
    <div 
      className="glass-panel"
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        marginBottom: '16px',
        border: '1px solid rgba(0,0,0,0.05)',
        background: '#FFFFFF',
        borderRadius: '20px',
        boxShadow: '0 6px 20px -10px rgba(0, 0, 0, 0.04)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 12px 30px -10px rgba(0, 0, 0, 0.08)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 6px 20px -10px rgba(0, 0, 0, 0.04)';
      }}
    >
       {/* Image Section */}
       <div style={{ width: '100%', height: '90px', flexShrink: 0, position: 'relative' }}>
          <img 
            src={imageUrl} 
            alt={option.type} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,1) 95%, rgba(255,255,255,1) 100%)'
          }}></div>
       </div>

       {/* Content Section */}
       <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
             <div style={{ flex: 1, paddingRight: '12px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                   Promo
                </div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
                   {option.promoType}
                </div>
             </div>
             
             <div style={{ flexShrink: 0, textAlign: 'right' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: themeColor, textTransform: 'uppercase', letterSpacing: '0' }}>
                  {option.type === 'Normal' ? 'Optimal' : option.type} Strategy
                </span>
             </div>
          </div>

          <div>
             <div style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                Algorithm Reasoning
             </div>
             <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.4, fontWeight: 500 }}>
                {option.reason}
             </div>
          </div>
       </div>
    </div>
  )
}

const PromoIntelligenceContent = () => {
  const [intelPlatform, setIntelPlatform] = useState('ubereats');
  const [selectedPromoOption, setSelectedPromoOption] = useState(null);

  const staticPromos = [
    { restaurant: "Domino's Ilford", promo: '25% off selected pizzas', type: 'Discount', active: 'Active', platform: 'deliveroo', itemOverlapLevel: 'direct_match_promo' },
    { restaurant: 'Pizza Palace Barking', promo: 'Buy 1 Get 1 Free', type: 'BOGO', active: 'Active', platform: 'deliveroo', itemOverlapLevel: 'direct_match' },
    { restaurant: 'Al-Amin Pizza', promo: 'Free Delivery', type: 'Delivery', active: 'Active', platform: 'justeats', itemOverlapLevel: 'same_cuisine' },
    { restaurant: 'Fire Crust', promo: 'Spend £20 Save £5', type: 'Threshold', active: 'Active', platform: 'deliveroo', itemOverlapLevel: 'same_cuisine' },
    { restaurant: 'Burger Boss Ilford', promo: '20% off entire menu', type: 'Discount', active: 'Active', platform: 'ubereats', itemOverlapLevel: 'none' },
    { restaurant: 'Wok Master', promo: 'Free Spring Rolls', type: 'Free Item', active: 'Active', platform: 'justeats', itemOverlapLevel: 'same_broad_category' },
  ];

  const intelData = runIntel(staticPromos);
  const activePlatformData = intelData.results.find(r => r.key === intelPlatform);

  const handlePlatformClick = (key) => {
    setIntelPlatform(intelPlatform === key ? null : key);
  };

  const timeColors = {
    QUIET: '#3B82F6', BUSY: '#EF4444', HYPER: '#8B5CF6', OFF: '#6B7280'
  };
  const activeTimeColor = timeColors[intelData.time] || timeColors.OFF;

  const renderDetailView = () => {
    if (!intelPlatform) {
      return (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
          <Target size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
          <div style={{ fontSize: '16px', fontWeight: 500 }}>Select a platform to view promo intel details.</div>
        </div>
      );
    }

    const platformConfig = {
      ubereats: { name: 'Uber Eats', bg: '#000000', text: '#FFF', logoInner: '#06C167' },
      deliveroo: { name: 'Deliveroo', bg: '#00CCBC', text: '#FFF', logoInner: '#FFF' },
      justeats: { name: 'Just Eats', bg: '#FF8000', text: '#FFF', logoInner: '#FFF' },
    }[intelPlatform];

    const currentPlatformData = intelData.results.find(r => r.key === intelPlatform);

    const distribution = [
      { label: 'BOGO', count: 30, color: '#111' },
      { label: '> 10% Discount', count: 25, color: '#3B82F6' },
      { label: '10% Discount', count: 14, color: '#EC4899' },
      { label: 'Free Delivery', count: 20, color: '#10B981' },
      { label: 'No promotion', count: 53, color: '#E5E7EB' },
    ];
    
    const totalDist = 142;
    let currentPct = 0;
    const gradientStops = distribution.map(d => {
      const start = currentPct;
      const pct = (d.count / totalDist) * 100;
      currentPct += pct;
      return `${d.color} ${start}% ${currentPct}%`;
    }).join(', ');

    const promos = [
      { logo: '/logo_bk.png', name: 'Burger King', type: 'Buy 1 Get 1 Free', status: 'Active' },
      { logo: '/logo_pizza.png', name: 'Pizza Express', type: '20% Off Orders', status: 'Active' },
      { logo: '/logo_wagamama.png', name: 'Wagamama', type: 'Free Delivery', status: 'Active' },
      { logo: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=100&h=100&fit=crop', name: 'KFC', type: 'Family Bucket Deal', status: 'Active' },
    ];

    return (
      <div style={{
        background: '#FCFBFA',
        borderRadius: '24px',
        padding: '32px',
        position: 'relative',
        display: 'flex',
        border: '1px solid rgba(0,0,0,0.05)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
        gap: '40px'
      }}>
        <button 
          onClick={() => setIntelPlatform(null)}
          style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#6B7280', zIndex: 10 }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* LEFT COLUMN: Platform Info (60%) */}
        <div style={{ flex: '0 0 58%', display: 'flex', flexDirection: 'column', paddingRight: '40px', borderRight: '1px solid rgba(55, 65, 81, 0.2)' }}>
          
          <div style={{
            background: `linear-gradient(135deg, ${platformConfig.bg}, ${platformConfig.bg}dd)`,
            borderRadius: '20px',
            height: '100px',
            width: '100%',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
            flexShrink: 0,
          }}>
            {intelPlatform === 'ubereats' ? (
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: platformConfig.logoInner, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontSize: '15px', fontWeight: 700, color: '#111', lineHeight: 1, textAlign: 'center', letterSpacing: '-0.05em' }}>Uber<br/>Eats</span>
              </div>
            ) : (
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: platformConfig.logoInner, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <span style={{ fontSize: '15px', fontWeight: 700, color: platformConfig.bg, lineHeight: 1.1, textAlign: 'center' }}>{platformConfig.name.split(' ')[0]}</span>
              </div>
            )}
            <h2 style={{ color: platformConfig.text, fontSize: '32px', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
              {platformConfig.name}
            </h2>
          </div>

          <div style={{
            background: '#FFFFFF',
            borderRadius: '20px',
            padding: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '32px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.04)',
            flexShrink: 0,
            transform: 'translateY(-10%)',
            position: 'relative',
            zIndex: 5
          }}>
            {[
              { label: 'TOTAL COMPETITORS', value: '142' },
              { label: 'ILFORD', value: '45' },
              { label: 'NEIGHBORHOOD', value: '97' },
              { label: 'AVG. DISCOUNT', value: '15%' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase', textAlign: 'center' }}>{stat.label}</span>
                <span style={{ fontSize: '22px', fontWeight: 700, color: '#E86A58' }}>{stat.value}</span>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '20px', marginTop: 0, flexShrink: 0 }}>
            Promotion Distribution
          </h3>

          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexShrink: 0, flexDirection: 'column' }}>
            
            <div style={{
              width: '100%',
              background: '#FFFFFF',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '24px'
            }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {distribution.map(d => (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: d.color }}></div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#4B5563' }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{d.count}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div style={{
                  width: '160px', height: '160px', borderRadius: '50%',
                  background: `conic-gradient(${gradientStops})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{
                    width: '120px', height: '120px', borderRadius: '50%', background: '#fff',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.05)'
                  }}>
                    <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600, marginBottom: '2px' }}>Active</span>
                    <span style={{ fontSize: '24px', color: '#111', fontWeight: 700 }}>63%</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', padding: '0 24px', marginBottom: '12px', marginTop: '12px' }}>
                <span style={{ flex: 2, fontSize: '12px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>PROMOS</span>
                <span style={{ flex: 1, fontSize: '12px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>TYPE</span>
                <span style={{ width: '80px', fontSize: '12px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textAlign: 'right' }}>STATUS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {promos.map((p, i) => (
                  <div key={i} style={{
                    background: '#FFFFFF',
                    borderRadius: '16px',
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                  }}>
                    <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F3F4F6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                        <span style={{ display: 'none', fontSize: '16px', fontWeight: 700, color: '#9CA3AF' }}>{p.name.charAt(0)}</span>
                      </div>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>{p.name}</span>
                    </div>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E5E7EB' }}>
                        <img 
                          src={p.type === 'Free Delivery' ? '/promo_conservative.png' : p.type === 'Buy 1 Get 1 Free' ? '/promo_aggressive.png' : '/promo_normal.png'} 
                          alt="Promo level"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>{p.type}</span>
                    </div>

                    <div style={{ width: '80px', textAlign: 'right', fontSize: '13px', fontWeight: 700, color: '#DC2626' }}>
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Recommended Promos (40%) */}
        <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#1F2937', marginBottom: '24px', marginTop: 0, flexShrink: 0 }}>
            Recommended Promos
          </h3>
          
          <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
            {currentPlatformData?.outputOptions?.map((opt, i) => (
               <PromoOptionCard key={i} option={opt} onClick={() => setSelectedPromoOption(opt)} />
            ))}
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="invisible-scrollbar" style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'linear-gradient(to bottom, transparent 0%, #FFFFFF 100%)', overflowY: 'auto', padding: '24px 32px 32px 32px' }}>
      
      <style>{`
        @keyframes pulse-glow {
          0% { box-shadow: 0 0 0 0 ${activeTimeColor}66; }
          70% { box-shadow: 0 0 0 12px transparent; }
          100% { box-shadow: 0 0 0 0 transparent; }
        }
        .invisible-scrollbar::-webkit-scrollbar { width: 0px; background: transparent; }
        .invisible-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
        
        .premium-glass-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.7) 100%);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.03), inset 0 1px 0 rgba(255,255,255,1);
          border: 1px solid rgba(255,255,255,0.6);
          border-radius: 24px;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .premium-glass-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 60px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,1);
          background: linear-gradient(135deg, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0.8) 100%);
        }
        
        .text-gradient {
          background-clip: text;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>

      {/* 1. Top Hero Section */}
      <div style={{ padding: '0 0 1.5rem 0', flexShrink: 0 }}>
        <h1 style={{ fontSize: '18px', fontWeight: 500, lineHeight: 1.4, color: '#6B7280', margin: 0, maxWidth: '1000px', letterSpacing: '-0.01em' }}>
          Real-time analysis of competitive promo pressure across all active delivery platforms.
        </h1>
      </div>

      {/* 2. Strategy Matrix (Bento Grid) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '1.5rem', flexShrink: 0 }}>
        {intelData.results.map((res) => {
          const isSelected = intelPlatform === res.key;
          
          let platformColor = '#111';
          let platformGradient = '';
          let iconUrl = '';
          if (res.key === 'ubereats') { platformColor = '#06C167'; platformGradient = 'linear-gradient(135deg, #111111, #2d2d2d)'; iconUrl = 'https://cdn.simpleicons.org/ubereats/white'; }
          if (res.key === 'deliveroo') { platformColor = '#00CCBC'; platformGradient = 'linear-gradient(135deg, #00CCBC, #00A699)'; iconUrl = 'https://cdn.simpleicons.org/deliveroo/white'; }
          if (res.key === 'justeats') { platformColor = '#FF8000'; platformGradient = 'linear-gradient(135deg, #FF8000, #E67300)'; iconUrl = 'https://cdn.simpleicons.org/justeat/white'; }

          return (
            <div 
              key={res.key}
              onClick={() => handlePlatformClick(res.key)}
              style={{ 
                padding: '16px',
                cursor: 'pointer',
                border: isSelected ? `2px solid ${platformColor}40` : '1px solid rgba(0,0,0,0.03)',
                boxShadow: isSelected ? `0 10px 30px rgba(0,0,0,0.05)` : '0 4px 15px rgba(0,0,0,0.02)',
                background: '#FFFFFF',
                borderRadius: '20px',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: platformGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                  <img src={iconUrl} alt={res.label} style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                </div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#111', letterSpacing: '0.02em' }}>{res.label}</div>
              </div>
              
              <div>
                <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px', fontWeight: 700 }}>
                  COMPETITOR ACTIVITY
                </div>
                <div className="text-gradient" style={{ fontSize: '24px', fontWeight: 700, backgroundImage: 'linear-gradient(135deg, #111 0%, #4B5563 100%)', letterSpacing: '-0.03em' }}>
                  {res.threatData.level}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Detailed View (Replaces old lower section) */}
      <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '2rem' }}>
        {renderDetailView()}
      </div>

      {/* Promo Details Modal */}
      {selectedPromoOption && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', zIndex: 99999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
          animation: 'fadeIn 0.2s ease-out'
        }} onClick={() => setSelectedPromoOption(null)}>
          <div style={{
            background: '#FFFFFF', borderRadius: '24px', width: '100%', maxWidth: '600px',
            overflow: 'hidden', display: 'flex', flexDirection: 'column',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.6)',
            transform: 'translateY(0)', animation: 'slideUp 0.3s ease-out'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Modal Header Image */}
            <div style={{ width: '100%', height: '140px', position: 'relative' }}>
              <img 
                src={selectedPromoOption.type === 'Aggressive' ? '/promo_aggressive.png' : selectedPromoOption.type === 'Normal' ? '/promo_normal.png' : '/promo_conservative.png'} 
                alt={selectedPromoOption.type} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, transparent 0%, #FFFFFF 100%)' }}></div>
              <button 
                onClick={() => setSelectedPromoOption(null)}
                style={{ position: 'absolute', top: '16px', right: '16px', width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#111', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div style={{ padding: '0 32px 32px 32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', marginTop: '-10px', position: 'relative', zIndex: 2 }}>
                <span style={{ 
                  background: selectedPromoOption.type === 'Aggressive' ? '#FEF2F2' : selectedPromoOption.type === 'Normal' ? '#ECFDF5' : '#FEF9C3',
                  color: selectedPromoOption.type === 'Aggressive' ? '#EF4444' : selectedPromoOption.type === 'Normal' ? '#10B981' : '#EAB308',
                  padding: '4px 12px', borderRadius: '99px', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0'
                }}>
                  {selectedPromoOption.type === 'Normal' ? 'Optimal' : selectedPromoOption.type} Strategy
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#111', margin: '0 0 24px 0', letterSpacing: '-0.02em' }}>
                {selectedPromoOption.title}
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* 1. Algorithm Reasoning (Time + Competitor) */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>Algorithm Reasoning</div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '16px', background: '#F9FAFB', padding: '16px', borderRadius: '16px', border: '1px solid #F3F4F6' }}>
                    
                    {/* Time Context */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Time Context</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111' }}>
                        {(() => {
                           const now = new Date();
                           const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                           const dayName = days[now.getDay()];
                           const rawHour = now.getHours();
                           const ampm = rawHour >= 12 ? 'pm' : 'am';
                           const hour12 = rawHour % 12 || 12;
                           return `${hour12}${ampm} on ${dayName} is considered a ${activePlatformData?.time} traffic window`;
                        })()}
                      </div>
                    </div>

                    <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }}></div>

                    {/* Competitor Activity with Metrics */}
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Competitor Activity</div>
                      
                      <div style={{ fontSize: '13px', color: '#111', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <div>
                           <span style={{ fontWeight: 700 }}>Active Promos:</span> {activePlatformData?.threatData?.structuredMetrics?.totalArea} in your area.
                        </div>
                        <div>
                           <span style={{ fontWeight: 700 }}>Direct Overlap:</span> {activePlatformData?.threatData?.structuredMetrics?.totalCategory} in your exact category.
                        </div>
                        
                        <div style={{ color: '#4B5563', marginTop: '4px' }}>
                           {activePlatformData?.threatData?.structuredMetrics?.totalCategory > 0 ? 
                             `The most aggressive overlapping competitor is offering '${activePlatformData?.threatData?.structuredMetrics?.categoryExample?.promo}'.` :
                             `None of the active promos are from direct competitors in your category.`
                           }
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.6, fontWeight: 500 }}>
                    {selectedPromoOption.reason}
                  </div>
                </div>

                {/* 2. Suggested Promo */}
                <div style={{ background: '#F9FAFB', padding: '16px', borderRadius: '16px', border: '1px solid #F3F4F6', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <img 
                      src={selectedPromoOption.type === 'Aggressive' ? '/promo_aggressive.png' : selectedPromoOption.type === 'Normal' ? '/promo_normal.png' : '/promo_conservative.png'} 
                      alt="Strategy Thumbnail" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Suggested Promo Action</div>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: '#111' }}>{selectedPromoOption.promoType}</div>
                  </div>
                </div>

              </div>

              <div style={{ display: 'flex', marginTop: '32px' }}>
                <button 
                  onClick={() => setSelectedPromoOption(null)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#F3F4F6', color: '#4B5563', fontWeight: 700, fontSize: '14px', border: 'none', cursor: 'pointer', transition: 'background 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#F3F4F6'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PromoIntelligenceContent;
