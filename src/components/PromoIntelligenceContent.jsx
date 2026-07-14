import React, { useState, useEffect } from 'react';
import { Target, MapPin, SlidersHorizontal, ChevronDown, Activity, Zap, Shield, Scale } from 'lucide-react';
import { mockLondonEcosystem } from '../data/mockLondonEcosystem';

// ================================================================
// PROMO INTELLIGENCE ENGINE — PURE LOGIC
// ================================================================

function getTimeVariable() {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[day];
  const isTuesday = day === 2;

  const isAfterMidnight = hour < 2;
  const effectiveDay = isAfterMidnight ? (day === 0 ? 6 : day - 1) : day;
  const isEvening = hour >= 18 || isAfterMidnight;

  let state = 'OFF';
  if (day >= 1 && day <= 5 && hour >= 12 && hour < 18) state = 'QUIET';
  else if (isEvening) {
    if (effectiveDay >= 1 && effectiveDay <= 4) state = 'BUSY';
    if (effectiveDay === 5 || effectiveDay === 6 || effectiveDay === 0) state = 'HYPER';
  }
  return { state, dayName, hour, isTuesday };
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

// ================================================================
// PHASE 1 — MARKET DIAGNOSIS
// Reads live conditions and produces a structured diagnosis.
// No promo decision is made here — only facts are collected.
// ================================================================

function diagnoseMarket(promos, platform, timeObj) {
  const { state, dayName, hour, isTuesday } = timeObj;
  const pp = promos.filter(p => p.platform === platform);

  // --- Promo type breakdown ---
  const promoTypeMap = {};
  pp.forEach(p => {
    const t = p.type || 'Unknown';
    promoTypeMap[t] = (promoTypeMap[t] || 0) + 1;
  });
  const promoTypeSummary = Object.entries(promoTypeMap)
    .map(([type, count]) => `${count}x ${type}`)
    .join(', ');

  const directOverlap = pp.filter(p =>
    p.itemOverlapLevel === 'direct_match_promo' ||
    p.itemOverlapLevel === 'direct_match' ||
    p.itemOverlapLevel === 'same_cuisine'
  );

  // --- Threat scoring ---
  const volumeScore = pp.length === 0 ? 0 : pp.length <= 2 ? 8 : pp.length <= 5 ? 14 : 20;
  const AG_SCORES_LOCAL = { free_delivery: 6, Delivery: 6, free_item: 12, 'Free Item': 12, spend_save: 18, Threshold: 18, discount_low: 24, discount_high: 30, Discount: 24, bogo: 35, BOGO: 35 };
  const OL_SCORES_LOCAL = { same_cuisine: 15, direct_match: 30, direct_match_promo: 45 };
  let aggressivenessScore = 0;
  let topPromo = null;
  pp.forEach(p => {
    const s = AG_SCORES_LOCAL[p.promoCategory] || AG_SCORES_LOCAL[p.type] || 6;
    if (s > aggressivenessScore) { aggressivenessScore = s; topPromo = p; }
  });
  const itemOverlapScore = pp.length > 0
    ? pp.reduce((max, p) => Math.max(max, OL_SCORES_LOCAL[p.itemOverlapLevel] || 15), 0)
    : 0;
  const totalScore = Math.min(volumeScore + aggressivenessScore + itemOverlapScore, 100);
  let threatLevel = 'Low';
  if (totalScore > 25 && totalScore <= 50) threatLevel = 'Moderate';
  if (totalScore > 50 && totalScore <= 75) threatLevel = 'High';
  if (totalScore > 75) threatLevel = 'Extreme';

  // --- Human-readable time label ---
  const ampm = hour >= 12 ? 'pm' : 'am';
  const hour12 = hour % 12 || 12;
  const timeLabel = `${hour12}${ampm} on ${dayName}`;

  const timeDescription = {
    QUIET: 'a quiet traffic window — moderate organic demand, low competition',
    BUSY: 'a busy traffic window — high organic demand, elevated competition',
    HYPER: 'a peak traffic window — maximum platform demand of the week',
    OFF: 'an off-peak window — very low platform traffic'
  }[state] || 'an unknown traffic window';

  return {
    state, dayName, hour, isTuesday, timeLabel, timeDescription,
    totalPromos: pp.length,
    directOverlapCount: directOverlap.length,
    promoTypeSummary: promoTypeSummary || 'None',
    topPromo,
    threatLevel, totalScore,
    volumeScore, aggressivenessScore, itemOverlapScore,
    structuredMetrics: {
      totalArea: pp.length,
      totalCategory: directOverlap.length,
      categoryExample: directOverlap.length > 0 ? directOverlap[0] : null
    }
  };
}

// ================================================================
// PHASE 2 — PROMO FORMULATION (Case Study Applied)
// Takes the market diagnosis and applies validated research to
// produce a promo recommendation with full reasoning chain.
// ================================================================

function formulatePromo(diagnosis, platform) {
  const { state, threatLevel, timeLabel, timeDescription, totalPromos, directOverlapCount, promoTypeSummary, topPromo, isTuesday } = diagnosis;
  const isJustEat = platform === 'justeats';

  // Build the market summary prefix that goes into every reason
  const marketSummary = totalPromos === 0
    ? `The market scan shows zero active promos right now.`
    : `The market scan detected ${totalPromos} active promo${totalPromos > 1 ? 's' : ''} (${promoTypeSummary})${directOverlapCount > 0 ? `, of which ${directOverlapCount} are from restaurants in your direct category` : ''}. ${topPromo ? `The most aggressive offer is from ${topPromo.restaurant} running "${topPromo.promo}".` : ''}`;

  const timeSummary = `${timeLabel} is ${timeDescription}.`;

  const tuesdayNote = isTuesday && isJustEat
    ? ` Today is Tuesday — opt into JustEat Cheeky Tuesday now. The platform co-funds part of the 20% cost so your net cost is closer to 10–12%. This is the cheapest high-visibility play available to you today.`
    : '';

  const options = [];

  if (state === 'QUIET') {
    if (threatLevel === 'Low') {
      options.push({ type: 'Conservative', title: 'Hold & Monitor', promoType: 'None',
        reason: `${timeSummary} ${marketSummary} With no competitor activity and quiet traffic, holding your margins is the right call — there is nothing to defend against and organic demand is insufficient to justify a promo cost.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Visibility Boost', promoType: isJustEat && isTuesday ? 'Cheeky Tuesday — 20% off £15+' : 'Free Delivery or Free Item Add-on',
        reason: `${timeSummary} ${marketSummary} No competition means every order you capture right now is purely incremental — it is not stealing from your own peak hours. A Free Item add-on costs you ~£0.80 in food vs. ~£5 for a 20% discount, with the same conversion impact. Research shows "free" consistently outperforms "% off" in customer psychology.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Market Capture', promoType: '15% off hero items with £15 minimum spend',
        reason: `${timeSummary} ${marketSummary} With competitors asleep, an aggressive play captures all quiet-time traffic for yourself. Always enforce a minimum spend threshold (£15+) — without it, 15% off on a low-value order combined with 30% platform commission can push the order into a net loss.${tuesdayNote}` });
    } else if (threatLevel === 'Moderate') {
      options.push({ type: 'Conservative', title: 'Free Delivery Shield', promoType: 'Free Delivery',
        reason: `${timeSummary} ${marketSummary} Competitors are active during a quiet window — they are building algorithm ranking for later. Free Delivery is the cheapest defence: it costs a fraction of a % discount and places you inside the "Free Delivery" filter tab that a large share of customers browse first. It protects your food margin completely.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Counter with Value', promoType: isJustEat && isTuesday ? 'Cheeky Tuesday — 20% off £15+' : 'Free Item add-on or 10–15% off with £15 min spend',
        reason: `${timeSummary} ${marketSummary} Competitors are buying feed position during a quiet window — counter before they pull customers who would otherwise find you first. Research principle: if they are running % off, respond with a Free Item instead. Your cost: ~£0.80. Their cost on 20% off: ~£5. You win on margin every time.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Volume Push', promoType: '20% off orders over £20',
        reason: `${timeSummary} ${marketSummary} Overpower the moderate competition during this quiet window. Enforce a £20 minimum spend — this forces a higher basket size that dilutes the 20% cost and keeps you above your break-even threshold. Never run 20% off without a minimum spend floor.${tuesdayNote}` });
    } else {
      options.push({ type: 'Conservative', title: 'Anchor with Free Delivery', promoType: 'Free Delivery only',
        reason: `${timeSummary} ${marketSummary} Heavy competitor promo spend during quiet hours means they are buying future algorithm ranking at a high cost. Your counter: run Free Delivery only as a cheap visibility anchor. Their promo cost is 5–10× yours — let them burn margin while you protect it.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Strategic Counter', promoType: '15% off hero items with £20 min spend, or Spend & Save (£5 off £25)',
        reason: `${timeSummary} ${marketSummary} High competitor pressure requires a counter — but on your terms. Target your highest-margin hero items only, not a blanket menu discount. Spend & Save (£5 off £25) is especially powerful: it raises basket size, protects margin on small orders, and appears as attractive as a % discount to the customer.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Match & Contain', promoType: '20–25% off with £20 minimum spend',
        reason: `${timeSummary} ${marketSummary} Competitors are monopolising quiet-hour feed position. Match their aggression — but the £20+ minimum spend is non-negotiable. Without it, 25% off combined with 30% platform commission on a small order is a guaranteed net loss on every order.${tuesdayNote}` });
    }
  } else if (state === 'BUSY') {
    if (threatLevel === 'Low') {
      options.push({ type: 'Conservative', title: 'Organic Maximisation', promoType: 'None',
        reason: `${timeSummary} ${marketSummary} Peak traffic, zero competitor promos — this is the ideal trading scenario. Every order arriving right now is 100% organic. Running any promo means paying to discount orders you would receive anyway. Hold and collect the full margin.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Focus on Ops, Not Promos', promoType: 'None',
        reason: `${timeSummary} ${marketSummary} High demand, no competition. The highest-ROI action right now is zero promo spend. Instead, focus on kitchen speed: platform algorithms track preparation time as a live ranking signal, and a drop from 4.5 to 4.0 stars can reduce your platform ranking by 20–30%, costing more than any promo could recover.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Low-Cost Volume Push', promoType: 'Free Delivery only',
        reason: `${timeSummary} ${marketSummary} If pushing maximum volume is the goal, Free Delivery is the only justifiable promo during a no-threat busy window — it appears in the filter tab without touching food margin. Any % off here means discounting orders that were already coming to you organically.${tuesdayNote}` });
    } else if (threatLevel === 'Moderate') {
      options.push({ type: 'Conservative', title: 'Margin Priority', promoType: 'None',
        reason: `${timeSummary} ${marketSummary} Busy period with moderate competitor activity. Your organic demand during this window is strong enough to absorb some competition — the moderate threat level is unlikely to significantly shift order share. Protecting margins is the right priority.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Free Delivery Only', promoType: 'Free Delivery',
        reason: `${timeSummary} ${marketSummary} Competitor promos are active during peak. Free Delivery is the lowest-cost response — a fraction of the cost of % off, and it places you in the Free Delivery filter. Critical rule from case study research: never match competitors' % discount with your own % discount during busy hours. Counter value with value, not price with price.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Free Item Counter', promoType: 'Free Item add-on (e.g. free side or drink)',
        reason: `${timeSummary} ${marketSummary} Case study finding: a free side costs ~£0.80–£1.20. A 20% discount on a £25 order costs ~£5. The perceived value to the customer is almost identical. By countering with a Free Item instead of matching on price, you spend 75–85% less for the same competitive effect.${tuesdayNote}` });
    } else {
      options.push({ type: 'Conservative', title: 'Defensive Free Delivery', promoType: 'Free Delivery',
        reason: `${timeSummary} ${marketSummary} Heavy competitor activity during peak hours. Free Delivery maintains your baseline feed visibility without triggering a destructive margin war. You are not winning this window outright — but you are not losing ground either, and you protect your margin entirely.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Value Counter', promoType: 'Free Item + Free Delivery, or Spend & Save (£5 off £25)',
        reason: `${timeSummary} ${marketSummary} You are actively losing orders during peak. Research rule: never match a % discount with another % discount during peak — it triggers a margin war neither side can win profitably. Combined Free Item + Free Delivery costs ~£1.50 total. A competitor's 20% off costs them ~£5. Counter value with value.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Targeted Match', promoType: '20% off with £25 minimum spend — never BOGO',
        reason: `${timeSummary} ${marketSummary} You are losing serious order share during your best trading window. Match the competitor's discount level but enforce a £25+ minimum spend. Avoid BOGO at all costs — on a £30 order, BOGO combined with 30% platform commission leaves under £3 net profit on food that costs £10 to make. A 20% off with minimum spend is survivable. BOGO is a margin massacre.${tuesdayNote}` });
    }
  } else {
    if (threatLevel === 'Low') {
      options.push({ type: 'Conservative', title: 'Absolute Hold', promoType: 'None',
        reason: `${timeSummary} ${marketSummary} This is the single highest-value organic trading window of the week — Friday and Saturday evenings account for 55–65% of all weekly delivery demand. Zero competitor threat. Do not spend a penny on promos. A 4.5-star restaurant with no promo outperforms a 4.0-star with 30% off in every platform algorithm.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Organic Window', promoType: 'None',
        reason: `${timeSummary} ${marketSummary} Peak hour, no threat. The highest-ROI action is zero promo spend. Use this window to focus on kitchen prep speed — platforms track preparation time as a live ranking signal. Slower prep during HYPER directly reduces your visibility for the next trading session.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Volume Amplifier', promoType: 'Free Delivery on this platform only',
        reason: `${timeSummary} ${marketSummary} If pushing beyond organic volume is the goal, Free Delivery on this single platform is the only justifiable play. Research shows running promos across all three platforms simultaneously during HYPER does not generate sufficient incremental return to justify the cross-platform cost.${tuesdayNote}` });
    } else if (threatLevel === 'Moderate') {
      options.push({ type: 'Conservative', title: 'Hold & Monitor', promoType: 'None',
        reason: `${timeSummary} ${marketSummary} Peak hour with moderate competition. The organic traffic volume during HYPER is substantial enough to absorb moderate competitor promos without you spending anything. Monitor live order volume — if it drops below your expected peak baseline, activate Free Delivery immediately.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Single Platform Play', promoType: 'Free Delivery on this platform only',
        reason: `${timeSummary} ${marketSummary} Moderate competition during your best trading window. Run Free Delivery on this one platform only — not across all three. Case study finding: the incremental return of simultaneous multi-platform promos during HYPER does not justify the combined cost. Stay targeted.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Free Item Differentiator', promoType: 'Free Item add-on (e.g. free garlic bread or soft drink)',
        reason: `${timeSummary} ${marketSummary} Differentiate from moderately active competitors. A free side has very high perceived value while costing ~£0.80–£1.20 in food. Research consistently shows "free" outperforms "% off" in customer conversion — at a fraction of the cost. This is the most efficient promo type available.${tuesdayNote}` });
    } else {
      options.push({ type: 'Conservative', title: 'Value Counter', promoType: 'Free Item + Free Delivery',
        reason: `${timeSummary} ${marketSummary} Heavy competitor promos during peak. Avoid matching large % discounts. Counter with Free Item + Free Delivery — your combined cost: ~£1.50. A competitor running 25% off a £25 order spends £6.25. You achieve identical feed visibility at 76% lower cost.${tuesdayNote}` });
      options.push({ type: 'Normal', title: 'Promo War Response', promoType: topPromo?.type === 'BOGO' ? 'Counter BOGO with Free Item + Free Delivery (never match BOGO)' : 'Match competitor % within 5% with £25 min spend',
        reason: `${timeSummary} ${marketSummary} Peak-hour promo war — you are losing visible feed share in the highest-volume window of the week. Case study rule: if competitors run BOGO, counter with Free Item — never match BOGO directly (it is a margin massacre). If they run % off, match within 5% but enforce a £25+ minimum spend to protect margin.${tuesdayNote}` });
      options.push({ type: 'Aggressive', title: 'Full Response', promoType: '25% off with £25 minimum spend — never BOGO',
        reason: `${timeSummary} ${marketSummary} All-out peak-hour response. Match competitor aggression at 25% but enforce £25+ minimum spend — without it, combined platform commission (30%) and discount (25%) on a small order guarantees a net loss. Avoid BOGO entirely: on a £30 order, BOGO plus commission leaves you netting ~£3–5 on food that cost £10 to prepare.${tuesdayNote}` });
    }
  }

  return options;
}

function runIntel(promos) {
  const timeObj = getTimeVariable();
  const platforms = [
    { key: 'ubereats',  label: 'Uber Eats' },
    { key: 'deliveroo', label: 'Deliveroo' },
    { key: 'justeats',  label: 'Just Eat' },
  ];
  const results = platforms.map(plt => {
    const diagnosis = diagnoseMarket(promos, plt.key, timeObj);
    const outputOptions = formulatePromo(diagnosis, plt.key);
    return { ...plt, time: timeObj.state, timeObj, diagnosis, threatData: diagnosis, outputOptions };
  });

  const sorted = [...results].sort((a, b) => (b.diagnosis.totalScore || 0) - (a.diagnosis.totalScore || 0));
  return { time: timeObj.state, timeObj, results, topResult: sorted[0] };
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
  const urlParams = new URLSearchParams(window.location.search);
  const initialPlatform = urlParams.get('platform') || 'ubereats';
  const [intelPlatform, setIntelPlatform] = useState(initialPlatform);
  const [selectedPromoOption, setSelectedPromoOption] = useState(null);
  const [activePromoFilter, setActivePromoFilter] = useState('All');
  const [expandedPromoIndex, setExpandedPromoIndex] = useState(null);

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

    const promos = mockLondonEcosystem.flatMap(restaurant => 
      restaurant.promos.map(promo => {
        let mappedType = 'Discount';
        const titleLower = promo.title.toLowerCase();
        if (titleLower.includes('buy 1 get 1') || titleLower.includes('bogo')) mappedType = 'Buy 1 Get 1 Free';
        else if (titleLower.includes('% off') || promo.type === 'Discount') mappedType = '20% Off Orders';
        else if (titleLower.includes('delivery')) mappedType = 'Free Delivery';
        else if (titleLower.includes('free')) mappedType = 'Free Item';
        
        return {
          logo: restaurant.image,
          name: restaurant.name,
          type: mappedType,
          status: 'Active',
          details: `${promo.title} — ${promo.description}`,
          itemImage: promo.image || restaurant.topDishes?.[0]?.image || restaurant.image
        };
      })
    );

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
            borderRadius: '16px',
            padding: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '24px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
            border: '1px solid rgba(0,0,0,0.04)',
            flexShrink: 0,
            transform: 'translateY(-10%)',
            position: 'relative',
            zIndex: 5
          }}>
            {[
              { label: 'Total Competitors', value: '142' },
              { label: 'Ilford', value: '45' },
              { label: 'Neighborhood', value: '97' },
              { label: 'Active Promos', value: '18' },
            ].map(stat => (
              <div key={stat.label} style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'center', flex: 1 }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', letterSpacing: '0.01em', textAlign: 'center', fontFamily: 'Inter, sans-serif' }}>{stat.label}</span>
                <span style={{ fontSize: '20px', fontWeight: 700, color: '#E86A58' }}>{stat.value}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', margin: 0 }}>
              Live Promos
            </h3>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#6B7280' }}>
              {promos.filter(p => {
                if (activePromoFilter === 'All') return true;
                if (activePromoFilter === 'BOGO') return p.type.includes('Buy 1 Get 1 Free');
                if (activePromoFilter === 'Discount') return p.type.includes('% Off');
                if (activePromoFilter === 'Free Delivery') return p.type === 'Free Delivery';
                return true;
              }).length} Active
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['All', 'BOGO', 'Discount', 'Free Delivery'].map(filter => {
              const isActive = activePromoFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActivePromoFilter(filter)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isActive ? `1px solid ${platformConfig.bg}` : '1px solid rgba(0,0,0,0.06)',
                    background: isActive ? `${platformConfig.bg}15` : '#FFFFFF',
                    color: isActive ? platformConfig.bg : '#6B7280',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? 'none' : '0 2px 4px rgba(0,0,0,0.02)',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px', marginBottom: '24px', padding: '0 8px' }}>
            {/* Glowing Ring */}
            <div style={{
              width: '100px', height: '100px', borderRadius: '50%',
              background: `conic-gradient(#DC2626 0% 20%, #F59E0B 20% 65%, #10B981 65% 100%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 8px 20px rgba(0,0,0,0.06)'
            }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%', background: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.02)'
              }}>
                <span style={{ fontSize: '24px', color: '#111', fontWeight: 700, lineHeight: 1 }}>
                  {promos.filter(p => {
                    if (activePromoFilter === 'All') return true;
                    if (activePromoFilter === 'BOGO') return p.type.includes('Buy 1 Get 1 Free');
                    if (activePromoFilter === 'Discount') return p.type.includes('% Off');
                    if (activePromoFilter === 'Free Delivery') return p.type === 'Free Delivery';
                    return true;
                  }).length}
                </span>
                <span style={{ fontSize: '9px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '4px' }}>
                  {activePromoFilter === 'All' ? 'Total' : activePromoFilter}
                </span>
              </div>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
              {[
                { label: 'BOGO', pct: '20%', color: '#DC2626' },
                { label: 'Discount', pct: '45%', color: '#F59E0B' },
                { label: 'Free Delivery', pct: '35%', color: '#10B981' }
              ].map(d => {
                const isFaded = activePromoFilter !== 'All' && activePromoFilter !== d.label;
                return (
                  <div key={d.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', opacity: isFaded ? 0.3 : 1, transition: 'opacity 0.2s ease' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: d.color, boxShadow: `0 0 8px ${d.color}60` }}></div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#4B5563' }}>{d.label}</span>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{d.pct}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexShrink: 0, flexDirection: 'column' }}>

            <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', padding: '0 20px', marginBottom: '8px', marginTop: '8px' }}>
                <span style={{ flex: 2, fontSize: '11px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>PROMOS</span>
                <span style={{ flex: 1, fontSize: '11px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em' }}>TYPE</span>
                <span style={{ width: '70px', fontSize: '11px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.05em', textAlign: 'right' }}>STATUS</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {promos.filter(p => {
                  if (activePromoFilter === 'All') return true;
                  if (activePromoFilter === 'BOGO') return p.type.includes('Buy 1 Get 1 Free');
                  if (activePromoFilter === 'Discount') return p.type.includes('% Off');
                  if (activePromoFilter === 'Free Delivery') return p.type === 'Free Delivery';
                  return true;
                }).map((p, i) => {
                  const isExpanded = expandedPromoIndex === i;
                  return (
                    <div key={i} style={{
                      background: '#FFFFFF',
                      borderRadius: '14px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <div 
                        onClick={() => setExpandedPromoIndex(isExpanded ? null : i)}
                        style={{
                          padding: '12px 20px',
                          display: 'flex',
                          alignItems: 'center',
                          cursor: 'pointer',
                          transition: 'background 0.2s ease',
                          background: isExpanded ? '#F9FAFB' : 'transparent'
                        }}
                      >
                        <div style={{ flex: 2, display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F3F4F6', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <img src={p.logo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }} />
                            <span style={{ display: 'none', fontSize: '14px', fontWeight: 700, color: '#9CA3AF' }}>{p.name.charAt(0)}</span>
                          </div>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{p.name}</span>
                        </div>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '4px', overflow: 'hidden', flexShrink: 0, border: '1px solid #E5E7EB' }}>
                            <img 
                              src={p.type === 'Free Delivery' ? '/promo_conservative.png' : p.type === 'Buy 1 Get 1 Free' ? '/promo_aggressive.png' : '/promo_normal.png'} 
                              alt="Promo level"
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>{p.type}</span>
                        </div>

                        <div style={{ width: '70px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#DC2626' }}>
                          {p.status}
                        </div>
                      </div>

                      {isExpanded && (
                        <div style={{
                          padding: '12px 20px 16px 64px',
                          borderTop: '1px solid rgba(0,0,0,0.04)',
                          background: '#FAFAFA',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px'
                        }}>
                          <div style={{ width: '46px', height: '46px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                            <img src={p.itemImage} alt="Promo item" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                          <div style={{ fontSize: '12px', color: '#4B5563', lineHeight: 1.4 }}>
                            <strong style={{ color: '#111', display: 'block', marginBottom: '2px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Offer Details</strong> 
                            {p.details}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
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

          const threatLevel = res.diagnosis?.threatLevel || res.threatData?.level || 'Low';
          const statusMeta = {
            Low:      { label: 'Quiet', color: '#10B981' },
            Moderate: { label: 'Busy',  color: '#F59E0B' },
            High:     { label: 'Hyper', color: '#E63946' },
            Extreme:  { label: 'Hyper', color: '#E63946' },
          }[threatLevel] || { label: 'Quiet', color: '#10B981' };
          const isPulsing = threatLevel === 'High' || threatLevel === 'Extreme';

          return (
            <div
              key={res.key}
              onClick={() => handlePlatformClick(res.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                cursor: 'pointer',
                border: isSelected ? `1px solid ${platformColor}40` : '1px solid rgba(0,0,0,0.06)',
                background: isSelected ? `${platformColor}08` : '#FFFFFF',
                borderRadius: '14px',
                transition: 'all 0.2s ease',
                boxShadow: isSelected ? `0 4px 16px ${platformColor}18` : '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              {/* Left: logo + name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: platformGradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  <img src={iconUrl} alt={res.label} style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                </div>
                <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#334155', letterSpacing: '0.01em', fontFamily: 'Inter, sans-serif' }}>
                  {res.label}
                </span>
              </div>

              {/* Right: dot + status */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingRight: '4px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: statusMeta.color,
                  boxShadow: `0 0 8px ${statusMeta.color}80`,
                  animation: isPulsing ? 'live-pulse 1.5s infinite' : 'none'
                }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569' }}>{statusMeta.label}</span>
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

                {/* PHASE 1 — MARKET DIAGNOSIS */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#F3F4F6', borderRadius: '4px', padding: '2px 8px', fontWeight: 800 }}>Phase 1</span> Market Diagnosis
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: '#F3F4F6', borderRadius: '16px', overflow: 'hidden' }}>
                    {/* Time */}
                    <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Time Window</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>
                        {activePlatformData?.diagnosis?.timeLabel} · {activePlatformData?.diagnosis?.state}
                      </span>
                    </div>
                    {/* Active Promos */}
                    <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Active Promos in Area</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#111' }}>{activePlatformData?.diagnosis?.totalPromos}</span>
                    </div>
                    {/* Promo Types */}
                    <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, flexShrink: 0 }}>Promo Types Detected</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>{activePlatformData?.diagnosis?.promoTypeSummary || 'None'}</span>
                    </div>
                    {/* Direct Overlap */}
                    <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Direct Category Overlap</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: activePlatformData?.diagnosis?.directOverlapCount > 0 ? '#DC2626' : '#111' }}>
                        {activePlatformData?.diagnosis?.directOverlapCount} restaurant{activePlatformData?.diagnosis?.directOverlapCount !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Score Breakdown */}
                    <div style={{ background: '#F9FAFB', padding: '14px 16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>Threat Score Breakdown</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[
                          { label: 'Volume (how many promos)', score: activePlatformData?.diagnosis?.volumeScore, max: 20 },
                          { label: 'Aggressiveness (promo type)', score: activePlatformData?.diagnosis?.aggressivenessScore, max: 35 },
                          { label: 'Item Overlap (menu match)', score: activePlatformData?.diagnosis?.itemOverlapScore, max: 45 },
                        ].map(({ label, score, max }) => (
                          <div key={label}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                              <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 500 }}>{label}</span>
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>{score ?? 0} / {max}</span>
                            </div>
                            <div style={{ height: '5px', background: '#E5E7EB', borderRadius: '99px', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${((score ?? 0) / max) * 100}%`, background: (score ?? 0) / max > 0.6 ? '#EF4444' : (score ?? 0) / max > 0.3 ? '#F59E0B' : '#10B981', borderRadius: '99px', transition: 'width 0.4s ease' }} />
                            </div>
                          </div>
                        ))}
                        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #E5E7EB', marginTop: '4px' }}>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#111' }}>Total Threat Score</span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#111' }}>{activePlatformData?.diagnosis?.totalScore ?? 0} / 100</span>
                        </div>
                      </div>
                    </div>

                    {/* Threat Level */}
                    <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600 }}>Threat Level</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: activePlatformData?.diagnosis?.threatLevel === 'Low' ? '#059669' : activePlatformData?.diagnosis?.threatLevel === 'Moderate' ? '#D97706' : '#DC2626' }}>
                        {activePlatformData?.diagnosis?.threatLevel}
                      </span>
                    </div>
                    {/* Most Aggressive Competitor */}
                    {activePlatformData?.diagnosis?.topPromo && (
                      <div style={{ background: '#fff', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 600, flexShrink: 0 }}>Top Competitor</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151', textAlign: 'right' }}>
                          {activePlatformData.diagnosis.topPromo.restaurant} — "{activePlatformData.diagnosis.topPromo.promo}"
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* PHASE 2 — PROMO FORMULATION */}
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ background: '#111', color: '#fff', borderRadius: '4px', padding: '2px 8px', fontWeight: 800 }}>Phase 2</span> Promo Formulation
                  </div>

                  <div style={{ fontSize: '13px', color: '#4B5563', lineHeight: 1.7, fontWeight: 500, background: '#F9FAFB', padding: '16px', borderRadius: '16px', border: '1px solid #F3F4F6', marginBottom: '16px' }}>
                    {selectedPromoOption.reason}
                  </div>
                </div>

                {/* Suggested Promo */}
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
