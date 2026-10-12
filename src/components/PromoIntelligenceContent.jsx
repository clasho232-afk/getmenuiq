import React, { useState } from 'react';
import { Target, Zap, Info, ChevronDown, ChevronUp, MapPin, Layers, Search, Star, Sparkles } from 'lucide-react';
import { mockLondonEcosystem } from '../data/mockLondonEcosystem';

const PLATFORM_ICONS = {
  ubereats: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128',
  deliveroo: 'https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128',
  justeats: 'https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128',
};

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
  const pp = promos.filter(p => p.platformKey === platform || platform === 'all');
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
  const level = total <= 25 ? 'LOW' : total <= 60 ? 'MEDIUM' : 'HIGH';

  return { total, level, volumeScore, aggressivenessScore, itemOverlapScore, count: pp.length, topPromo };
}

function getStrategyStack(platformKey, time, threat, strategyMode) {
  const isGrowth = strategyMode === 'growth';
  const IMG_STORE = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=64&h=64&fit=crop';
  const IMG_PIZZA = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=64&h=64&fit=crop';
  const IMG_MEAL  = 'https://images.unsplash.com/photo-1594212885974-297eb0d36cda?w=64&h=64&fit=crop';

  if (platformKey === 'ubereats') {
    if (isGrowth) {
      return {
        action: 'AGGRESSIVE STACK',
        primary: {
          type: '25% Off Storewide', desc: 'Min spend £20. Get into the primary deals carousel.', img: IMG_STORE,
          detail: {
            verdict: 'strong',
            verdictLabel: 'Strong Match',
            profile: 'Blending In',
            profileNote: '4 nearby competitors are in the Deals carousel at 20%. You need to beat them.',
            reasons: ['4 of 7 nearby competitors at 20% — you need ≥20% to appear in the Deals carousel at all', 'Running 25% leapfrogs them in carousel ranking with a visually larger badge', 'Friday evening is peak — this is the highest ROI window of the week for chicken/burger shops'],
            risks: ['At 25% off + 35% Uber commission, net margin drops ~8–10% per order. Set a £20 min spend.', 'Running more than 3 weeks consecutively trains customers to wait for discounts — rotate after 2 weeks.'],
            pairWith: { label: 'BOGO on Hero Item', note: 'Gives you a second badge on your listing tile, standing out from competitors who only show the % off badge.' },
            timing: "Thu–Sun only. Peak window: Fri 18:00–21:00.",
            howItWorks: "UberEats surfaces restaurants running ≥20% off in its \"Deals\" carousel — a dedicated high-traffic zone sitting above organic search. A 25% threshold beats the typical 20% market baseline, pushing you to the top of that carousel with a visually larger badge.",
            uplift: { orders: '+35–55%', newCustomers: '~60% of clicks are new users', visibility: 'Top 3 carousel position likely' },
            tactics: "Pair with a £20 min spend. Exclude lowest-margin add-ons from the discount if possible.",
            competitorContext: "4 of your 7 nearby competitors are at 20% off. Your 25% will leapfrog them in carousel ranking."
          }
        },
        hook: {
          type: 'BOGO on Hero Item', desc: 'Convert scrollers instantly. Stacks with storewide.', img: IMG_PIZZA,
          detail: {
            verdict: 'caution',
            verdictLabel: 'Proceed with Caution',
            profile: 'Blending In',
            profileNote: '2 nearby competitors already running BOGO. You need to differentiate on item choice.',
            reasons: ['BOGO creates a second badge on your listing tile — customers see you twice in the feed', 'Deal-hunters specifically filter for BOGO on UberEats — high intent traffic', 'Pairs with your 25% storewide promo for maximum discovery surface coverage'],
            risks: ['Food cost doubles on the BOGO item. Only use items with ≥65% gross margin (e.g. wings, sides).', 'If UberEats stacks both your promos, a customer could get 25% off AND a free item — model this before launching.'],
            pairWith: { label: '25% Off Storewide', note: 'Run alongside the % off promo for dual-badge visibility on your listing tile.' },
            timing: "Lunch 12:00–14:00 and early evening 17:00–19:00.",
            howItWorks: "Buy One Get One on your best-selling item creates irresistible perceived value. On UberEats, BOGO is listed as a separate promo badge — you get two visual touchpoints on your listing tile simultaneously.",
            uplift: { orders: '+25–40% on that item', newCustomers: 'High — BOGO is a top search filter used by deal-hunters', visibility: 'Dual badge on listing tile' },
            tactics: "Choose a hero item priced £8–£12 with high margin. Wings and sides work best for takeaways.",
            competitorContext: "2 direct competitors are running BOGO this week. You need this to stay competitive in the deals-filter results."
          }
        },
        bundle: {
          type: 'Mega Family Bundle', desc: 'Increase AOV without extra commission hit.', img: IMG_MEAL,
          detail: {
            verdict: 'strong',
            verdictLabel: 'Strong Match',
            profile: 'Winning',
            profileNote: '5 nearby competitors run bundles silently. Making yours visible gives you an edge.',
            reasons: ['5 competitors run unlabelled bundles — yours will be the only visible deal in this category', 'Families and groups order in peak Fri–Sun windows — bundles match their intent perfectly', 'Commission applies to bundle price, not individual items — you protect margin better than % off'],
            risks: ['If a bundle component sells out mid-service, the whole deal breaks — have backup items ready.', 'Poorly priced bundles feel like a trick. The saving must be obvious and real.'],
            pairWith: { label: '25% Off Storewide', note: 'The bundle drives AOV for group orders; the % off drives volume from solo customers — they target different segments.' },
            timing: "Fri–Sun only, 17:00–21:00.",
            howItWorks: "A bundled deal groups items at a set price that feels cheaper than buying individually — but you control the math. Commission applies to the bundle price, not the individual item prices, protecting your margin.",
            uplift: { orders: 'AOV +£6–12', newCustomers: 'Moderate — targets families', visibility: 'Featured in Deals + Popular' },
            tactics: "Name it evocatively: 'The Friday Night Box' outperforms 'Family Meal Deal'. Feature a photo of the full spread.",
            competitorContext: "5 local competitors are running unlabelled bundles not showing as platform promos. They're winning basket size silently."
          }
        },
        reason: "UberEats allows promo stacking. Overwhelming the competition with a multi-layered attack maximises presence across two discovery surfaces: the Deals carousel and the BOGO filter. Combined with a margin-safe bundle, you drive volume without cannibalising profitability."
      };
    } else {
      return {
        action: 'DEFENSIVE STACK',
        primary: {
          type: '20% Off Storewide', desc: 'Min spend £20. Matches current market baseline.', img: IMG_STORE,
          detail: {
            verdict: 'caution',
            verdictLabel: 'Proceed with Caution',
            profile: 'Invisible',
            profileNote: '6 nearby competitors are in the Deals carousel. You are currently not visible there.',
            reasons: ['Without ≥20% storewide you do not appear in the UberEats Deals carousel — the primary Friday night discovery surface', '6 nearby competitors are already there — every minute you are absent costs you orders', 'At exactly 20% you match the baseline without over-discounting beyond the market norm'],
            risks: ['At 20% off + 35% Uber commission, net margin drops to ~45% of normal. A £20 min spend is essential.', 'You will not be differentiated from 6 identical 20% off listings — your photos and rating decide who wins.'],
            pairWith: { label: 'Combo Meal Bundle', note: 'Running a visible bundle alongside gives you a second badge and a reason to choose you over the other 5 restaurants at identical 20% off.' },
            timing: "Thu–Sun only. Peak window: Fri–Sat 17:00–22:00.",
            howItWorks: "UberEats explicitly boosts restaurants running ≥20% off into the Deals carousel — the highest-traffic discovery section. At exactly 20% you meet the threshold without over-discounting beyond the market norm.",
            uplift: { orders: '+20–30%', newCustomers: '~45% carousel clicks', visibility: 'Deals carousel guaranteed' },
            tactics: "Set a £20 minimum spend. Exclude your lowest-margin items from the discount.",
            competitorContext: "6 nearby competitors are at 20% off. Without this promo you are algorithmically invisible in the Deals section."
          }
        },
        hook: null,
        bundle: {
          type: 'Combo Meal', desc: 'Protect margin while increasing AOV.', img: IMG_MEAL,
          detail: {
            verdict: 'strong',
            verdictLabel: 'Strong Match',
            profile: 'Winning',
            profileNote: 'Competitors compete on % off. A combo positions you as higher value, not just cheaper.',
            reasons: ['Competitors focus on % off — a visible combo deal is a point of differentiation in the same feed', 'Combos are set at menu level, not as a platform promo — commission applies to the bundle price, protecting margin', 'Increases AOV by £4–8 per converted order without giving away blanket discounts'],
            risks: ['Pricing must feel like a real saving — target 10–15% cheaper than buying items separately.', 'A poor combo photo kills conversion. One clear, well-lit shot of the full spread is non-negotiable.'],
            pairWith: { label: '20% Off Storewide', note: 'The 20% gets you into the Deals carousel. The combo gives customers a reason to pick you over the other 6 restaurants also at 20%.' },
            timing: "All week, peaks Mon–Fri 12:00–14:00 (lunch) and Fri–Sat 17:00–22:00 (dinner).",
            howItWorks: "A combo groups your most popular main with sides/drinks at a bundled price. Unlike platform % discounts, combos are set at menu level — commission applies to the bundle price rather than individual items, giving you direct margin control.",
            uplift: { orders: 'AOV +£4–8', newCustomers: 'Low — drives repeat value', visibility: 'Popular tag in menu' },
            tactics: "Name it specifically: 'The Barking Lunch Box' beats 'Combo Meal A'. Show the crossed-out individual price vs. combo price in your menu photo.",
            competitorContext: "Your competitors are primarily competing on % off. A well-photographed combo at a fair price positions you as higher-value — not just cheap."
          }
        },
        reason: "With the market at 20% off, you need to match to stay visible in the UberEats Deals carousel — but going further burns margin unnecessarily. The combo meal compensates by increasing AOV from customers who convert, protecting profitability even at the discounted rate."
      };
    }
  } else if (platformKey === 'deliveroo') {
    if (isGrowth) {
      return {
        action: 'HEAVY COUNTER',
        primary: {
          type: 'BOGO on Hero Item', desc: 'Highest conversion rate promo on Deliveroo.', img: IMG_PIZZA,
          detail: {
            howItWorks: "Deliveroo prohibits stacking multiple platform-level promos simultaneously — unlike UberEats, you can only run one active platform promo at a time. BOGO is the single highest-converting individual promo type on Deliveroo, historically outperforming % off by 15–25% in click-to-order rate.",
            uplift: { orders: '+30–45%', newCustomers: '~55% from new users who filter for BOGO', visibility: '#1 performing promo badge type on Deliveroo listings' },
            timing: "BOGO is strongest at lunch (12:00–14:00) and early evening (17:00–20:00). Deliveroo skews toward working professionals — these windows align with group and office ordering.",
            risks: ["Food cost doubles on the BOGO item. Ensure your hero item has ≥65% gross margin.", "Deliveroo charges commission on the stated menu price before the BOGO discount — effective commission per-transaction is higher than on % off promos."],
            tactics: "Choose a hero item priced £9–£14. Don't pick your cheapest item — the free item must feel like a genuine get. Run for 2 weeks max, then rotate to Spend & Save to avoid training customers to only order on BOGO weeks.",
            competitorContext: "Shoreditch Grind is running BOGO on Flat White this week. You need a food-category BOGO to counter before they cement the BOGO badge in your area's customer memory."
          }
        },
        hook: null,
        bundle: {
          type: 'Premium Meal Deal', desc: 'AOV driver alongside the BOGO.', img: IMG_MEAL,
          detail: {
            howItWorks: "On Deliveroo, a Meal Deal is set at menu level — not as a platform promo — meaning it runs independently alongside your active platform BOGO. This two-pronged approach means: customers using the BOGO filter find you via platform discovery, while customers browsing your menu organically see the meal deal upsell.",
            uplift: { orders: 'AOV increase of +£8–14 on orders that take the meal deal', newCustomers: 'Low — effective for repeat customer upsell', visibility: "Visible in the menu's own Deals section tile" },
            timing: "Premium meal deals over-index on Friday and Saturday evenings when customers are in a treat mindset and willing to spend more.",
            risks: ["Premium implies quality — if your photos or packaging don't match the premium price point, expect cart abandonment.", "Deliveroo's 'Premium' label is self-declared — ensure your restaurant rating is above 4.5⭐ before using premium positioning."],
            tactics: "Price at a believable saving — £27.99 for items worth £35 individually. Include a soft drink (Deliveroo doesn't charge extra commission on included drinks vs. alcohol). Use 'Limited Time' language in the description.",
            competitorContext: "No competitors in your 2mi Deliveroo zone are currently running a premium meal deal — this is a clear blue-ocean positioning opportunity."
          }
        },
        reason: "Deliveroo blocks promo stacking — you have one platform promo shot. BOGO is statistically your strongest single weapon on this platform. The premium meal deal runs at menu-level alongside it, ensuring customers who discover you via BOGO still have a high-AOV option."
      };
    } else {
      return {
        action: 'SMART COUNTER',
        primary: {
          type: 'Spend & Save', desc: '£5 off £25. Better margin than % off.', img: IMG_STORE,
          detail: {
            howItWorks: "Spend & Save (Threshold Discount) gives customers a fixed amount off when they hit a minimum spend. Unlike % off promos, the saving is capped — making it dramatically better for your margin on high-AOV orders. A £5 off £25 gives 20% effective discount only at exactly £25 — orders above that benefit you more.",
            uplift: { orders: '+15–25%', newCustomers: 'Moderate — threshold promos are less discoverable than BOGO but more profitable', visibility: 'Listed in Deals section with a smaller badge than BOGO' },
            timing: "Works best for dinner orders (18:00–21:00) where customers are already planning higher-spend group meals. Avoid pure lunch targeting — office orders often stay below the £25 threshold.",
            risks: ["Customers just below the threshold (e.g. £23 basket) sometimes abandon rather than add more — consider nudging with a 'Popular Add-on' suggestion on your menu.", "Deliveroo charges commission on the pre-discount price. Your net on a £25 order: £25 - £5 saving - 35% commission = ~£13. Confirm this is profitable for your cost structure."],
            tactics: "Set threshold 25–30% above your current AOV. If AOV is £18, set threshold at £22. Use £ off language — '£5 off' feels more concrete and trustworthy than '20% off' even when mathematically equivalent.",
            competitorContext: "The 3 most threatening competitors in your Deliveroo zone are running blanket % off promos and burning margin. Your Spend & Save positions you as strategically smarter while still appearing in the Deals section."
          }
        },
        hook: null,
        bundle: null,
        reason: "Deliveroo only allows one active platform promo. With the market doing % off, Spend & Save is the smarter weapon — it caps your discount exposure, forces higher basket sizes, and protects your bottom line while still giving you Deals section visibility."
      };
    }
  } else if (platformKey === 'justeats') {
    return {
      action: 'TUESDAY OPT-IN',
      primary: {
        type: 'Cheeky Tuesday 20% Off', desc: 'Opt in for platform visibility boost.', img: IMG_STORE,
        detail: {
          howItWorks: "Just Eat's 'Cheeky Tuesday' is a platform-wide promotional event where participating restaurants receive algorithmically boosted placement in search results and the homepage deals section. It is opt-in but free to join — Just Eat absorbs the marketing spend and promotes the event. The 20% discount is funded by you but the extra visibility is funded by Just Eat.",
          uplift: { orders: '+40–70% on Tuesdays vs. non-Cheeky-Tuesday weeks', newCustomers: '~70% of Cheeky Tuesday orders come from customers who haven\'t ordered from that restaurant in 30+ days', visibility: 'Homepage featured placement + Deals filter badge' },
          timing: "Tuesday only, 11:00–23:00. Prepare inventory and staff — Cheeky Tuesday can spike orders 2–3x your normal Tuesday volume if you have strong ratings.",
          risks: ["Not opting in means you're algorithmically deprioritised on Tuesdays — customers see opted-in restaurants first. Absence is effectively a search-rank penalty.", "A surge of Cheeky Tuesday orders with poor execution (late delivery, wrong items) will tank your weekly ratings. Only opt in if your kitchen can genuinely handle the volume."],
          tactics: "Opt in every Tuesday without exception — the algorithm rewards consistency. Temporarily limit your menu to your 10 fastest-to-prepare items on Tuesdays to maintain quality under pressure. Respond to every Cheeky Tuesday review within 24h.",
          competitorContext: "All 7 of your monitored competitors are opted into Cheeky Tuesday. Absence is not an option — you are invisible to Just Eat's deal-seeking traffic every Tuesday you miss."
        }
      },
      hook: {
        type: 'Free Delivery', desc: 'Toggle on in delivery settings for max visibility.', img: IMG_MEAL,
        detail: {
          howItWorks: "Just Eat allows restaurants to absorb delivery fees — toggling Free Delivery on means customers see no delivery charge, giving your listing a 'Free Delivery' badge. This is one of the most-used search filters on Just Eat, applied in ~38% of all browsing sessions.",
          uplift: { orders: '+20–35% on sessions using the Free Delivery filter', newCustomers: '~50% of Free Delivery filter users are new customers comparison shopping', visibility: 'Free Delivery badge on listing tile + filter inclusion' },
          timing: "Keep Free Delivery on Tuesdays to pair with Cheeky Tuesday for a maximum dual-badge combination. Consider toggling off on Friday and Saturday evenings where delivery-fee sensitivity is lower — customers may convert anyway, saving you the cost.",
          risks: ["Absorbing delivery costs reduces per-order margin by £1.50–£3.50 depending on distance. On low-AOV orders this can make individual orders unprofitable.", "Free Delivery filter is competitive — you'll appear alongside all other free delivery restaurants including large chains with better ratings."],
          tactics: "Apply free delivery above a minimum order threshold (e.g. free on orders over £15) to protect margin on small orders. Combined with Cheeky Tuesday, your listing shows both badges simultaneously — 'Cheeky Tuesday 20% Off + Free Delivery' — appearing in two deal filters at once.",
          competitorContext: "4 of your 7 competitors offer free delivery on Tuesdays. Without it, your Cheeky Tuesday listing appears inferior to competitors showing both badges."
        }
      },
      bundle: null,
      reason: "Tuesday traffic on Just Eat is artificially concentrated by the Cheeky Tuesday algorithm. Opting in is non-negotiable — non-participants are effectively penalised in search ranking. Adding Free Delivery creates a dual-badge listing that dominates both the deals and delivery-filter discovery surfaces simultaneously."
    };
  } else {
    return { action: 'MIXED', primary: null, hook: null, bundle: null, reason: 'Varies by platform.' };
  }
}


function runIntel(promos, strategyMode) {
  const time = getTimeVariable();
  const platforms = [
    { key: 'ubereats',  label: 'UBEREATS' },
    { key: 'deliveroo', label: 'DELIVEROO' },
    { key: 'justeats',  label: 'JUSTEATS' },
    { key: 'all',  label: 'OVERALL MARKET' },
  ];
  
  const results = platforms.map(plt => {
    const td = getThreatData(promos, plt.key);
    const stack = getStrategyStack(plt.key, time, td.level, strategyMode);
    return { ...plt, time, threatData: td, output: stack };
  });
  
  return { time, results };
}


const GLASS_PANEL_STYLE = {
  background: 'rgba(255, 255, 255, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.9)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.04)',
  borderRadius: '20px',
};

const PromoIntelligenceContent = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const [intelPlatforms, setIntelPlatforms] = useState(['ubereats', 'deliveroo', 'justeats']);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [selectedPromoDetail, setSelectedPromoDetail] = useState(null);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [targetFilter, setTargetFilter] = useState('All');
  const [threatFilter, setThreatFilter] = useState('All');
  const [platformFilters, setPlatformFilters] = useState([]);
  const [platformDropdownOpen, setPlatformDropdownOpen] = useState(false);
  const [activeLeftTab, setActiveLeftTab] = useState('feed');
  
  const [strategyMode, setStrategyMode] = useState('margin'); // 'margin' or 'growth'
  const [expandedPromoIndex, setExpandedPromoIndex] = useState(null);
  const [intelPlatformDropdownOpen, setIntelPlatformDropdownOpen] = useState(false);

  const platforms = [
    { key: 'deliveroo', name: 'Deliveroo', color: '#00CCBC', bg: '#00CCBC' },
    { key: 'ubereats', name: 'Uber Eats', color: '#06C167', bg: '#000' },
    { key: 'justeats', name: 'Just Eat', color: '#FF8000', bg: '#FF8000' }
  ];

  // Map and enrich mock data with our new categorizations
  let promos = mockLondonEcosystem.flatMap(restaurant => 
    restaurant.promos.map(promo => {
      const titleLower = promo.title.toLowerCase();
      
      // Determine Type
      let type = 'Discount';
      if (titleLower.includes('buy 1 get 1') || titleLower.includes('bogo')) type = 'BOGO';
      else if (titleLower.includes('free delivery')) type = 'Free Delivery';
      else if (titleLower.includes('free')) type = 'Free Item';

      // Determine Target
      let target = 'Entire Menu';
      if (titleLower.includes('fries') || titleLower.includes('drink') || titleLower.includes('side')) target = 'Sides/Drinks';
      else if (titleLower.includes('burger') || titleLower.includes('pizza') || titleLower.includes('chicken')) target = 'Mains';

      // Determine Threat Level
      let threatLevel = 'Fair';
      let threatColor = '#F59E0B'; // yellow/orange
      if (type === 'BOGO' || titleLower.includes('25%') || titleLower.includes('30%') || titleLower.includes('50%')) {
        threatLevel = 'High';
        threatColor = '#EF4444'; // red
      }

      // Generate the deal summary for the yellow pill
      let dealSummary = promo.title;
      if (type === 'BOGO') dealSummary = 'BOGO';
      else if (titleLower.includes('% off')) {
        const match = titleLower.match(/\d+%\s*off/);
        if (match) dealSummary = match[0].toUpperCase();
      }

      return {
        logo: restaurant.image,
        name: restaurant.name,
        type: type,
        target: target,
        threatLevel: threatLevel,
        threatColor: threatColor,
        dealSummary: dealSummary,
        title: promo.title,
        status: 'Active',
        details: promo.description,
        itemImage: promo.image || restaurant.topDishes?.[0]?.image || restaurant.image,
        platformKey: ['ubereats', 'deliveroo', 'justeats'][Math.floor(Math.random() * 3)] // Mock platform association
      };
    })
  );

  // Apply filters
  promos = promos.filter(p => {
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (targetFilter !== 'All' && p.target !== targetFilter) return false;
    if (threatFilter !== 'All' && p.threatLevel !== threatFilter) return false;
    if (platformFilters.length > 0) {
      if (!platformFilters.includes(p.platformKey)) return false;
    }
    return true;
  });

  const highThreatPromos = promos.filter(p => p.threatLevel === 'High');
  const intelResult = runIntel(highThreatPromos, strategyMode);
  
  const ACTION_COLORS = { 'MATCH': '#EF4444', 'HEAVY COUNTER': '#EF4444', 'COUNTER': '#F59E0B', 'SMART COUNTER': '#F59E0B', 'AGGRESSIVE STACK': '#EF4444', 'DEFENSIVE STACK': '#3B82F6', 'TUESDAY OPT-IN': '#F59E0B', 'LIGHT': '#3B82F6', 'HOLD': '#10B981' };

  // Market Overview Calculations
  const totalPromosActive = promos.length;
  const highThreatCount = promos.filter(p => p.threatLevel === 'High').length;
  const bundleCount = promos.filter(p => p.type === 'BOGO' || p.type === 'Bundle').length;

  const myActivePromos = [
    {
      title: '20% Off Orders Over £20',
      details: 'Entire Menu',
      itemImage: promos[0]?.itemImage || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=64&q=80',
      platformKey: 'ubereats',
      target: 'Entire Menu',
      effectiveness: 'Optimal',
      effColor: '#10B981',
    },
    {
      title: 'Buy 1 Get 1 Free',
      details: 'Pizzas only',
      itemImage: promos[1]?.itemImage || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=64&q=80',
      platformKey: 'deliveroo',
      target: 'Entire Menu',
      effectiveness: 'Mismatch',
      effColor: '#F59E0B',
    },
    {
      title: 'Free Delivery',
      details: 'Min order £15',
      itemImage: promos[2]?.itemImage || 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80',
      platformKey: 'justeats',
      target: 'Delivery Fee',
      effectiveness: 'Overkill',
      effColor: '#EF4444',
    }
  ];
  
  const typeCounts = {};
  promos.forEach(p => { typeCounts[p.type] = (typeCounts[p.type] || 0) + 1; });
  const sortedTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]);
  const topTypesText = sortedTypes.slice(0, 2).map(([type, count]) => `${type} (${Math.round((count/Math.max(totalPromosActive, 1))*100)}%)`).join(', ');

  const platformHeat = intelResult.results.filter(r => r.key !== 'all').sort((a, b) => b.threatData.total - a.threatData.total)[0];

  const overviewStats = {
    deliveroo: { competitors: 42, promos: 18 },
    ubereats: { competitors: 56, promos: 34 },
    justeats: { competitors: 38, promos: 12 },
  };

  return (
    <div style={{ 
      minHeight: '110vh', 
      background: 'transparent',
      padding: '24px 24px 120px 24px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '24px', 
      fontFamily: "'Inter', sans-serif" 
    }}>
      <style>{`
        @keyframes threatPulse {
          0% { background-color: rgba(255, 0, 0, 0.05); }
          50% { background-color: rgba(255, 0, 0, 0.15); }
          100% { background-color: rgba(255, 0, 0, 0.05); }
        }
        .high-threat-row {
          animation: threatPulse 2s infinite ease-in-out;
        }
      `}</style>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px', flex: 1 }}>
        
        {/* 1. TOP OVERVIEW SECTION (Floating Glass, 75% Width) */}
        <div style={{ ...GLASS_PANEL_STYLE, padding: '20px 24px 16px 24px', display: 'flex', alignItems: 'center', width: '75%', gap: '16px' }}>
            
            {/* Title */}
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Promo Intel
            </div>

            <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.1)', margin: '0 8px' }} />

            {/* Total Promos Block */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL PROMOS:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#E86A58', lineHeight: 1 }}>64</span>
              </div>
            </div>

            <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)', margin: '0 12px' }} />

            {/* Total Competitors Block */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TOTAL COMPETITORS:</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#1E293B', lineHeight: 1 }}>136</span>
              </div>
            </div>

            <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)', margin: '0 12px' }} />

            {/* Time Metric */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>TIME:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {(() => {
                  const globalState = intelResult?.time === 'OFF' ? 'Quiet' : intelResult?.time === 'PEAK' ? 'Hyper' : 'Busy';
                  const globalColor = globalState === 'Hyper' ? '#EF4444' : globalState === 'Busy' ? '#F59E0B' : '#10B981';
                  return (
                    <>
                      <div className="animate-pulse" style={{ width: '10px', height: '10px', borderRadius: '50%', background: globalColor, boxShadow: `0 0 8px ${globalColor}` }} />
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: '#475569', lineHeight: 1 }}>{globalState}</span>
                    </>
                  );
                })()}
              </div>
            </div>

            <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.1)', margin: '0 12px' }} />

            {/* Platform Status Block */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              {platforms.map((p, index) => {
                const mockLevels = ['Low', 'Medium', 'High'];
                const pLevel = mockLevels[index % 3];
                const statusText = pLevel === 'High' ? 'Hyper' : pLevel === 'Medium' ? 'Busy' : 'Quiet';
                const statusColor = pLevel === 'High' ? '#EF4444' : pLevel === 'Medium' ? '#F59E0B' : '#10B981';
                
                return (
                  <div key={p.key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <img src={PLATFORM_ICONS[p.key]} alt={p.name} style={{ width: '24px', height: '24px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div className="animate-pulse" style={{ width: '6px', height: '6px', borderRadius: '50%', background: statusColor, boxShadow: `0 0 6px ${statusColor}` }} />
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#475569' }}>{statusText}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

        {/* TWO COLUMN GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 0.7fr', gap: '24px', flex: 1 }}>
          
          {/* 2. LEFT SECTION (Floating Glass) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, height: '100%' }}>
            
            {/* Promo Feed Container */}
            <div style={{ ...GLASS_PANEL_STYLE, display: 'flex', flexDirection: 'column', overflow: 'hidden', flex: 1, minHeight: '500px' }}>
              
              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid rgba(0,0,0,0.06)', background: 'transparent' }}>
                <div 
                  onClick={() => setActiveLeftTab('feed')}
                  style={{ flex: 1, textAlign: 'center', padding: '16px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', color: activeLeftTab === 'feed' ? '#E86A58' : '#94A3B8', borderBottom: activeLeftTab === 'feed' ? '2px solid #E86A58' : '2px solid transparent', transition: 'all 0.2s' }}
                >
                  Live Competitor Promos
                </div>
                <div 
                  onClick={() => setActiveLeftTab('psychology')}
                  style={{ flex: 1, textAlign: 'center', padding: '16px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', color: activeLeftTab === 'psychology' ? '#E86A58' : '#94A3B8', borderBottom: activeLeftTab === 'psychology' ? '2px solid #E86A58' : '2px solid transparent', transition: 'all 0.2s' }}
                >
                  Bundle Promos
                </div>
                <div 
                  onClick={() => setActiveLeftTab('my_promos')}
                  style={{ flex: 1, textAlign: 'center', padding: '16px', cursor: 'pointer', fontWeight: 800, fontSize: '0.75rem', color: activeLeftTab === 'my_promos' ? '#E86A58' : '#94A3B8', borderBottom: activeLeftTab === 'my_promos' ? '2px solid #E86A58' : '2px solid transparent', transition: 'all 0.2s' }}
                >
                  My Active Promos
                </div>
              </div>

              {/* Filter Mechanism Toolbar */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  
                  {/* Promo Count Label */}
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B', display: 'flex', alignItems: 'center', gap: '4px', marginRight: '4px' }}>
                    <span style={{ color: '#E86A58' }}>Promos:</span> {promos.length}
                  </div>
                  
                  <div style={{ width: '1px', height: '16px', background: 'rgba(0,0,0,0.06)', margin: '0 4px' }} />

                  {/* Platform Custom Filter */}
                  <div style={{ position: 'relative' }} onMouseLeave={() => setPlatformDropdownOpen(false)}>
                    <div 
                      onClick={() => setPlatformDropdownOpen(!platformDropdownOpen)}
                      style={{ display: 'flex', alignItems: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', height: '32px', padding: '0 10px', cursor: 'pointer', gap: '8px', whiteSpace: 'nowrap', width: '140px' }}
                    >
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>Platform:</span>
                      <div style={{ flex: 1, display: 'flex', gap: '4px', alignItems: 'center' }}>
                        {platformFilters.length === 0 ? (
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>All</span>
                        ) : (
                          platformFilters.map(key => (
                            <img key={key} src={PLATFORM_ICONS[key]} alt={key} style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
                          ))
                        )}
                      </div>
                      <ChevronDown size={12} color="#94A3B8" style={{ flexShrink: 0 }} />
                    </div>
                    
                    {platformDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, padding: '8px', display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '140px' }}>
                        <div 
                          onClick={() => { setPlatformFilters([]); setPlatformDropdownOpen(false); }} 
                          style={{ fontSize: '0.75rem', padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', background: platformFilters.length === 0 ? '#F8FAFC' : 'transparent', fontWeight: platformFilters.length === 0 ? 700 : 500, color: '#1E293B', whiteSpace: 'nowrap' }}
                        >
                          All Platforms
                        </div>
                        {['deliveroo', 'ubereats', 'justeats'].map(key => {
                          const isSelected = platformFilters.includes(key);
                          return (
                            <div 
                              key={key} 
                              onClick={() => {
                                if (isSelected) setPlatformFilters(platformFilters.filter(k => k !== key));
                                else setPlatformFilters([...platformFilters, key]);
                              }} 
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', padding: '8px 12px', cursor: 'pointer', borderRadius: '6px', background: isSelected ? '#F8FAFC' : 'transparent', fontWeight: isSelected ? 700 : 500, color: '#1E293B', whiteSpace: 'nowrap' }}
                            >
                              <img src={PLATFORM_ICONS[key]} style={{ width: '16px', height: '16px', borderRadius: '50%' }} />
                              <span style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{key === 'ubereats' ? 'Uber Eats' : key === 'deliveroo' ? 'Deliveroo' : 'Just Eat'}</span>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Other Dropdowns */}
                  {['Category', 'Threat'].map((filterName) => {
                    if (activeLeftTab === 'psychology' && filterName === 'Category') return null;
                    const value = filterName === 'Category' ? targetFilter : threatFilter;
                    const setter = filterName === 'Category' ? setTargetFilter : setThreatFilter;
                    const options = filterName === 'Category' ? ['All', 'Entire Menu', 'Mains', 'Sides/Drinks'] :
                                    ['All', 'High', 'Fair'];
                    
                    return (
                      <div key={filterName} style={{ display: 'flex', alignItems: 'center', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', height: '32px', padding: '0 10px', cursor: 'pointer' }}>
                        <select 
                          value={value}
                          onChange={(e) => setter(e.target.value)}
                          style={{ appearance: 'none', border: 'none', background: 'none', outline: 'none', fontSize: '0.7rem', fontWeight: 600, color: '#475569', paddingRight: '16px', cursor: 'pointer' }}
                        >
                          <option value="All">{filterName}: All</option>
                          {options.filter(o => o !== 'All').map(opt => (
                            <option key={opt} value={opt}>{filterName}: {opt}</option>
                          ))}
                        </select>
                        <ChevronDown size={12} color="#94A3B8" style={{ marginLeft: '-12px', pointerEvents: 'none' }} />
                      </div>
                    );
                  })}

                  {/* Search Bar */}
                  {activeLeftTab === 'feed' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '0 10px', height: '32px', width: '250px', marginLeft: 'auto' }}>
                      <Search size={14} color="#94A3B8" />
                      <input 
                        type="text" 
                        placeholder="Search promos..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{ border: 'none', background: 'none', outline: 'none', fontSize: '0.7rem', width: '100%', color: '#1E293B' }} 
                      />
                    </div>
                  )}
                </div>
              </div>

              {activeLeftTab === 'feed' && (
                <>
              {/* Feed List */}
              <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
                
                {/* Table Header */}
                <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', padding: '20px 24px 12px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <div style={{ flex: '2' }}>Promo Details</div>
                  <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                  <div style={{ flex: '1.5' }}>Restaurant</div>
                  <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                  <div style={{ width: '100px' }}>Platform</div>
                  <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                  <div style={{ flex: '1' }}>Threat</div>
                  <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                  <div style={{ flex: '1' }}>Category</div>
                </div>

                {promos.length === 0 ? (
                  <div style={{ padding: '32px', textAlign: 'center', color: '#64748B', fontSize: '0.75rem', fontWeight: 500 }}>No promos match this filter.</div>
                ) : (
                  promos.map((p, i) => {
                    const isExpanded = expandedPromoIndex === i;
                    const isLast = i === promos.length - 1;
                    return (
                      <div key={i} className={!isExpanded && p.threatLevel === 'High' ? 'high-threat-row' : ''} style={{
                        ...(isExpanded ? { background: '#F8FAFC' } : p.threatLevel !== 'High' ? { background: 'transparent' } : {}), 
                        borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.12)',
                        cursor: 'pointer', transition: 'border 0.2s'
                      }}>
                        {/* Feed Row */}
                        <div onClick={() => setExpandedPromoIndex(isExpanded ? null : i)} style={{ padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
                          
                          {/* Promo Details (Image & Title) */}
                          <div style={{ flex: '2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ position: 'relative' }}>
                              <img src={p.itemImage} alt="Promo item" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</span>
                            </div>
                          </div>

                          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                          {/* Restaurant Name */}
                          <div style={{ flex: '1.5', display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#1E293B' }}>{p.name}</span>
                          </div>

                          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                          {/* Platform */}
                          <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <img src={PLATFORM_ICONS[p.platformKey]} alt="Platform" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1E293B', textTransform: 'capitalize' }}>{p.platformKey === 'ubereats' ? 'Uber Eats' : p.platformKey === 'deliveroo' ? 'Deliveroo' : 'Just Eat'}</span>
                          </div>

                          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />
                          
                          {/* Threat Level */}
                          <div style={{ flex: '1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.threatColor }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: p.threatColor }}>{p.threatLevel}</span>
                          </div>

                          <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                          {/* Target / Type */}
                          <div style={{ flex: '1', display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.7rem', color: '#1E293B', fontWeight: 700 }}>{p.target}</span>
                          </div>

                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                          <div style={{ padding: '0px 24px 20px 80px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <img src={p.itemImage} alt="Promo" style={{ width: '40px', height: '40px', borderRadius: '6px', objectFit: 'cover' }} />
                            <div style={{ fontSize: '0.75rem', color: '#475569', lineHeight: 1.5 }}>
                              <strong style={{ color: '#1E293B', display: 'block', marginBottom: '2px', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Promo Details</strong> 
                              {p.title} â€” {p.details}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              </>
              )}
              {activeLeftTab === 'psychology' && (
                <div style={{ display: 'flex', flexDirection: 'column', overflowX: 'auto', overflowY: 'auto', flex: 1 }}>
                  
                  {/* Table Header */}
                  <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', padding: '20px 24px 12px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div style={{ flex: '1', textAlign: 'center' }}>Bundle Promo</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ flex: '1', textAlign: 'center' }}>Restaurant</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ width: '90px', textAlign: 'center' }}>Platform</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ flex: '3.5', textAlign: 'center' }}>Item Breakdown</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ width: '72px', textAlign: 'center' }}>Actual Cost</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ width: '72px', textAlign: 'center' }}>Bundle Cost</div>
                  </div>                  
                  
                  {/* Psych Rows */}
                  {[
                    { 
                      name: 'The Decoy Bundle', rest: 'Competitor Benchmark', img: promos[0]?.itemImage || '', actual: '£5.99', bundle: '£4.99', platform: 'justeats',
                      items: [
                        { name: 'Burger', price: '£3.99', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Fries', price: '£1.00', img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Drink', price: '£1.00', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=64&q=80' }
                      ]
                    },
                    { 
                      name: 'Family Feast', rest: 'Pizza Express', img: promos[1]?.itemImage || '', actual: '£18.50', bundle: '£14.99', platform: 'deliveroo',
                      items: [
                        { name: 'Pizza', price: '£9.50', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Wings', price: '£4.00', img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Garlic Bread', price: '£2.50', img: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Drink', price: '£2.50', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=64&q=80' }
                      ]
                    },
                    { 
                      name: 'Lunch Rush Combo', rest: 'Wagamama', img: promos[2]?.itemImage || '', actual: '£12.90', bundle: '£9.90', platform: 'ubereats',
                      items: [
                        { name: 'Katsu', price: '£8.90', img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Gyoza', price: '£2.50', img: 'https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Drink', price: '£1.50', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=64&q=80' }
                      ]
                    },
                    { 
                      name: 'Ultimate Mega Burger Box For Two', rest: 'Burger King', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80', actual: '£15.99', bundle: '£11.99', platform: 'deliveroo',
                      items: [
                        { name: 'Burger', price: '£5.99', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Fries', price: '£2.00', img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80' }
                      ]
                    },
                    { 
                      name: 'Super Saver Family Weekend Feast With Extra Sides And Drinks Included', rest: 'KFC', img: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=64&q=80', actual: '£25.50', bundle: '£18.00', platform: 'ubereats',
                      items: [
                        { name: 'Chicken', price: '£12.00', img: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Fries', price: '£3.00', img: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Gravy', price: '£1.50', img: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=64&q=80' },
                        { name: 'Drink', price: '£1.50', img: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=64&q=80' }
                      ]
                    }
                  ].map((combo, idx) => {
                    const isDense = combo.items.length > 3;
                    const imgSize = isDense ? '16px' : '24px';
                    const priceSize = isDense ? '0.6rem' : '0.75rem';
                    const nameSize = isDense ? '0.5rem' : '0.65rem';
                    const plusSize = isDense ? '0.65rem' : '0.9rem';
                    const plusMargin = isDense ? '-10px' : '-16px';
                    
                    const actualNum = parseFloat(combo.actual.replace(/[^0-9.]/g, ''));
                    const bundleNum = parseFloat(combo.bundle.replace(/[^0-9.]/g, ''));
                    const discountPct = Math.round((1 - (bundleNum / actualNum)) * 100);
                    const promoNameSize = combo.name.length > 30 ? '0.55rem' : '0.65rem';

                    return (
                    <div key={idx} style={{ borderBottom: '1px solid rgba(0,0,0,0.12)', transition: 'all 0.2s', padding: '16px 24px', display: 'flex', alignItems: 'center' }}>
                        
                        <div style={{ flex: '1', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', textAlign: 'center' }}>
                          <img src={combo.img} alt="Bundle item" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: promoNameSize, lineHeight: 1.3, fontWeight: 800, color: '#1E293B', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}>{combo.name}</span>
                          </div>
                        </div>

                        <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                        {/* Restaurant */}
                        <div style={{ flex: '1', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>{combo.rest}</span>
                        </div>

                        <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                        {/* Platform */}
                        <div style={{ width: '90px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                          <img src={PLATFORM_ICONS[combo.platform]} alt="Platform" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1E293B', textTransform: 'capitalize' }}>{combo.platform === 'ubereats' ? 'Uber Eats' : combo.platform === 'deliveroo' ? 'Deliveroo' : 'Just Eat'}</span>
                        </div>

                        <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                        <div style={{ flex: '3.5', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: isDense ? '4px' : '12px' }}>
                           {combo.items.map((item, itemIdx) => (
                              <React.Fragment key={itemIdx}>
                                 <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isDense ? '2px' : '4px' }}>
                                   <div style={{ display: 'flex', alignItems: 'center', gap: isDense ? '2px' : '4px' }}>
                                      <img src={item.img} style={{ width: imgSize, height: imgSize, borderRadius: '50%', objectFit: 'cover', boxShadow: '0 2px 6px rgba(0,0,0,0.08)' }} alt={item.name} />
                                      <span style={{ fontSize: priceSize, fontWeight: 800, color: '#1E293B', letterSpacing: '-0.02em' }}>{item.price}</span>
                                   </div>
                                   <span style={{ fontSize: nameSize, color: '#64748B', fontWeight: 600 }}>{item.name}</span>
                                 </div>
                                 {itemIdx < combo.items.length - 1 && (
                                   <span style={{ fontSize: plusSize, color: '#CBD5E1', fontWeight: 800, marginTop: plusMargin }}>+</span>
                                 )}
                              </React.Fragment>
                           ))}
                        </div>

                        <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                        <div style={{ width: '72px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94A3B8', textDecoration: 'line-through' }}>{combo.actual}</span>
                        </div>

                        <div style={{ width: '1px', height: '40px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />
                        
                        <div style={{ width: '72px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#E86A58', lineHeight: 1 }}>{combo.bundle}</span>
                          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10B981', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 700 }}>
                            -{discountPct}%
                          </div>
                        </div>
                    </div>
                  )})}
                </div>
              )}
              {activeLeftTab === 'my_promos' && (
                <div style={{ display: 'flex', flexDirection: 'column', overflowY: 'auto', flex: 1 }}>
                  {/* Table Header */}
                  <div style={{ position: 'sticky', top: 0, zIndex: 10, background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', padding: '20px 24px 12px 24px', borderBottom: '1px solid rgba(0,0,0,0.06)', fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <div style={{ flex: '2' }}>Promo Details</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ width: '100px' }}>Platform</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ flex: '1.5' }}>Effectiveness</div>
                    <div style={{ width: '1px', height: '12px', background: 'transparent', margin: '0 16px' }} />
                    <div style={{ flex: '1.5' }}>Category</div>
                  </div>

                  {myActivePromos.map((p, i) => {
                    const isLast = i === myActivePromos.length - 1;
                    return (
                      <div key={i} style={{ borderBottom: isLast ? 'none' : '1px solid rgba(0,0,0,0.12)', padding: '12px 24px', display: 'flex', alignItems: 'center' }}>
                        
                        {/* Promo Details */}
                        <div style={{ flex: '2', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={p.itemImage} alt="Promo item" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover', border: '1px solid #E2E8F0' }} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#1E293B' }}>{p.title}</span>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                        {/* Platform */}
                        <div style={{ width: '100px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <img src={PLATFORM_ICONS[p.platformKey]} alt="Platform" style={{ width: '14px', height: '14px', borderRadius: '50%' }} />
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#1E293B', textTransform: 'capitalize' }}>{p.platformKey === 'ubereats' ? 'Uber Eats' : p.platformKey === 'deliveroo' ? 'Deliveroo' : 'Just Eat'}</span>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />
                        
                        {/* Effectiveness */}
                        <div style={{ flex: '1.5', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.effColor }} />
                          <span style={{ fontSize: '0.7rem', fontWeight: 800, color: p.effColor, textTransform: 'uppercase' }}>{p.effectiveness}</span>
                        </div>

                        <div style={{ width: '1px', height: '24px', background: 'rgba(0,0,0,0.06)', margin: '0 16px' }} />

                        {/* Target / Type */}
                        <div style={{ flex: '1.5', display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.7rem', color: '#1E293B', fontWeight: 700 }}>{p.target}</span>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>



          </div>

          ﻿          {/* 3. RIGHT SECTION (Floating Glass) */}
          <div style={{ ...GLASS_PANEL_STYLE, padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0, height: '100%' }}>
            
            {/* Header: AI Strategy & Threats */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>
                    Promo Threat Radar
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', background: 'rgba(239,68,68,0.1)', padding: '4px 8px', borderRadius: '100px' }}>
                    {highThreatPromos.length}
                  </span>
                </div>
                
                {/* STRATEGY MODE TOGGLE */}
                <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '100px', padding: '4px' }}>
                  <div 
                    onClick={() => setStrategyMode('margin')}
                    style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', background: strategyMode === 'margin' ? '#FFF' : 'transparent', color: strategyMode === 'margin' ? '#1E293B' : '#94A3B8', boxShadow: strategyMode === 'margin' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    MARGIN
                  </div>
                  <div 
                    onClick={() => setStrategyMode('growth')}
                    style={{ padding: '6px 12px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s', background: strategyMode === 'growth' ? '#FFF' : 'transparent', color: strategyMode === 'growth' ? '#1E293B' : '#94A3B8', boxShadow: strategyMode === 'growth' ? '0 2px 8px rgba(0,0,0,0.05)' : 'none' }}
                  >
                    GROWTH
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {platforms.map(p => {
                  const htPromos = highThreatPromos.filter(promo => promo.platformKey === p.key).length;
                  const totalPlatformPromos = overviewStats[p.key].promos;
                  
                  // If all 3 are selected, we treat them as 'default' state (no opacity drop)
                  // If less than 3 are selected, the inactive ones drop in opacity
                  const isFullyActive = intelPlatforms.includes(p.key);
                  const isFiltered = intelPlatforms.length < 3;
                  const opacity = isFiltered && !isFullyActive ? 0.4 : 1;
                  const bg = isFiltered && isFullyActive ? '#F8FAFC' : 'transparent';
                  const border = isFiltered && isFullyActive ? '1px solid #E2E8F0' : '1px solid transparent';
                  
                  return (
                    <div 
                      key={p.key} 
                      onClick={() => {
                        if (intelPlatforms.length === 1 && intelPlatforms[0] === p.key) {
                          // Toggle off -> reset to all
                          setIntelPlatforms(['ubereats', 'deliveroo', 'justeats']);
                        } else {
                          // Select only this one
                          setIntelPlatforms([p.key]);
                        }
                      }}
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center', 
                        gap: '6px', 
                        flex: 1,
                        cursor: 'pointer',
                        padding: '8px 4px',
                        borderRadius: '12px',
                        background: bg,
                        border: border,
                        opacity: opacity,
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={PLATFORM_ICONS[p.key]} alt={p.name} style={{ width: '20px', height: '20px', borderRadius: '6px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', whiteSpace: 'nowrap' }}>
                          {totalPlatformPromos} PROMO{totalPlatformPromos !== 1 ? 'S' : ''}
                        </span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#E86A58', whiteSpace: 'nowrap' }}>
                          {htPromos} THREAT{htPromos !== 1 ? 'S' : ''}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.06)' }} />

            {/* AI Strategy Rendering */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', flex: 1, overflowY: 'auto', paddingRight: '8px' }}>
              {intelPlatforms.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94A3B8', fontSize: '0.8rem', fontWeight: 500 }}>
                  Select a platform to view AI Strategy recommendations.
                </div>
              ) : (
                intelPlatforms.map(platformKey => {
                  const activeIntel = intelResult.results.find(r => r.key === platformKey);
                  if (!activeIntel || !activeIntel.output) return null;
                  
                  const actionColor = ACTION_COLORS[activeIntel.output.action] || '#1E293B';
                  
                  return (
                    <div key={platformKey} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '24px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recommended Promo Stack</div>
                        
                        {/* Primary Pull */}
                        {activeIntel.output.primary && (
                          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img src={activeIntel.output.primary.img} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} alt="Primary" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#E86A58', textTransform: 'uppercase' }}>1. Primary Pull</div>
                              <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>{activeIntel.output.primary.type}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{activeIntel.output.primary.desc}</div>
                            </div>
                            <button 
                              onClick={() => setSelectedPromoDetail({ title: activeIntel.output.primary.type, desc: activeIntel.output.primary.desc, reason: activeIntel.output.reason, category: 'Primary Pull', img: activeIntel.output.primary.img, detail: activeIntel.output.primary.detail })}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                            >
                              Detail
                            </button>
                          </div>
                        )}

                        {/* The Hook */}
                        {activeIntel.output.hook && (
                          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img src={activeIntel.output.hook.img} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} alt="Hook" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#3B82F6', textTransform: 'uppercase' }}>2. The Hook</div>
                              <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>{activeIntel.output.hook.type}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{activeIntel.output.hook.desc}</div>
                            </div>
                            <button 
                              onClick={() => setSelectedPromoDetail({ title: activeIntel.output.hook.type, desc: activeIntel.output.hook.desc, reason: activeIntel.output.reason, category: 'The Hook', img: activeIntel.output.hook.img, detail: activeIntel.output.hook.detail })}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                            >
                              Detail
                            </button>
                          </div>
                        )}

                        {/* The Basket Builder */}
                        {activeIntel.output.bundle && (
                          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <img src={activeIntel.output.bundle.img} style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }} alt="Bundle" />
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#10B981', textTransform: 'uppercase' }}>3. Basket Builder</div>
                              <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>{activeIntel.output.bundle.type}</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>{activeIntel.output.bundle.desc}</div>
                            </div>
                            <button 
                              onClick={() => setSelectedPromoDetail({ title: activeIntel.output.bundle.type, desc: activeIntel.output.bundle.desc, reason: activeIntel.output.reason, category: 'Basket Builder', img: activeIntel.output.bundle.img, detail: activeIntel.output.bundle.detail })}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                            >
                              Detail
                            </button>
                          </div>
                        )}
                        
                        {/* Blue Ocean / Hidden Bundle Opportunity */}
                        {strategyMode === 'margin' && (
                          <div 
                            style={{ background: '#FFF', padding: '16px', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', display: 'flex', gap: '12px', alignItems: 'center', transition: 'all 0.2s' }}
                          >
                            <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E293B' }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                              <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Stealth Opportunity Detected</div>
                              <div style={{ fontSize: '0.9rem', color: '#1E293B', fontWeight: 800 }}>Unlabelled Competitor Bundles</div>
                              <div style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 500 }}>Click to view calculated bundle combinations to match market.</div>
                            </div>
                            <button 
                              onClick={() => setIsBundleModalOpen(true)}
                              style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#FEF2F2', color: '#EF4444', fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', alignSelf: 'flex-start' }}
                            >
                              Detail
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>


          </div>
        </div>
      </div>

      {/* Bundle Opportunity Modal */}
      {isBundleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '480px', background: '#FFF', borderRadius: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.1)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>Bundle Opportunity</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 500, color: '#64748B' }}>Stealth Competitor Moves</span>
                </div>
              </div>
              <button onClick={() => setIsBundleModalOpen(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.6 }}>
                <strong>7 competitors</strong> in your 2mi radius are running meal deal bundles. <strong>5 of them are unlabelled</strong> (not showing as promos in search filters), effectively giving them a hidden conversion boost.
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Calculated Combinations to Match Market</div>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=64&h=64&fit=crop" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="Pizza Combo" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>Pizza + Fries + Drink</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Standard Price: £18.49</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>£14.99</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E86A58' }}>Save £3.50</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <img src="https://images.unsplash.com/photo-1594212885974-297eb0d36cda?w=64&h=64&fit=crop" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="Burger Combo" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>Burger + Fries + Drink</span>
                      <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Standard Price: £16.29</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10B981' }}>£13.49</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E86A58' }}>Save £2.80</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: '24px', background: '#F8FAFC', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setIsBundleModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #CBD5E1', background: '#FFF', color: '#475569', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={() => setIsBundleModalOpen(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#8B5CF6', color: '#FFF', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)' }}>
                Mark as Implemented
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedPromoDetail && (() => {
        const d = selectedPromoDetail.detail;
        const verdictColors = {
          strong:  { bg: '#F0FDF4', border: '#86EFAC', text: '#166534', dot: '#22C55E' },
          caution: { bg: '#FFFBEB', border: '#FCD34D', text: '#92400E', dot: '#F59E0B' },
          risk:    { bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B', dot: '#EF4444' },
        };
        const vc = verdictColors[d?.verdict] || verdictColors.caution;

        return (
          <div onClick={() => setSelectedPromoDetail(null)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.45)', backdropFilter: 'blur(8px)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
            <div onClick={e => e.stopPropagation()} style={{ width: '560px', background: '#FFF', borderRadius: '20px', boxShadow: '0 24px 48px rgba(0,0,0,0.12)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* Header */}
              <div style={{ padding: '20px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  {selectedPromoDetail.img && (
                    <img src={selectedPromoDetail.img} style={{ width: '48px', height: '48px', borderRadius: '10px', objectFit: 'cover' }} alt="Promo" />
                  )}
                  <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#E86A58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{selectedPromoDetail.category}</div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#1E293B', lineHeight: 1.2 }}>{selectedPromoDetail.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>{selectedPromoDetail.desc}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedPromoDetail(null)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: '4px' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0', overflowY: 'auto' }}>

                {/* Verdict Banner */}
                {d?.verdictLabel && (
                  <div style={{ margin: '20px 24px 0', background: vc.bg, border: `1px solid ${vc.border}`, borderRadius: '12px', padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: vc.dot, flexShrink: 0, marginTop: '4px' }} />
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 800, color: vc.text, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{d.verdictLabel}</div>
                      {d.profileNote && <div style={{ fontSize: '0.82rem', color: vc.text, fontWeight: 500, marginTop: '3px', opacity: 0.85 }}>{d.profileNote}</div>}
                    </div>
                  </div>
                )}

                {/* Why Now */}
                {d?.reasons?.length > 0 && (
                  <div style={{ margin: '20px 24px 0' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>Why Now</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {d.reasons.map((r, i) => (
                        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                          <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px' }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#E86A58" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                          </div>
                          <span style={{ fontSize: '0.84rem', color: '#334155', lineHeight: 1.5, fontWeight: 500 }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timing + Risks side by side */}
                <div style={{ display: 'flex', gap: '12px', margin: '20px 24px 0' }}>
                  {d?.timing && (
                    <div style={{ flex: 1, background: '#F8FAFC', borderRadius: '10px', padding: '14px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Best Timing</div>
                      <div style={{ fontSize: '0.82rem', color: '#334155', fontWeight: 500, lineHeight: 1.5 }}>{d.timing}</div>
                    </div>
                  )}
                  {d?.risks?.length > 0 && (
                    <div style={{ flex: 1, background: '#FFF8F7', borderRadius: '10px', padding: '14px', border: '1px solid #FECDD3' }}>
                      <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#E86A58', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '6px' }}>Watch Out</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {d.risks.map((r, i) => (
                          <div key={i} style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 500, lineHeight: 1.5 }}>{r}</div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Pair With */}
                {d?.pairWith && (
                  <div style={{ margin: '16px 24px 24px', background: '#F8FAFC', borderRadius: '10px', padding: '14px 18px', border: '1px solid #E2E8F0', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(232,106,88,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#E86A58" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>Pair With</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E293B' }}>{d.pairWith.label}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748B', fontWeight: 500, marginTop: '2px', lineHeight: 1.5 }}>{d.pairWith.note}</div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default PromoIntelligenceContent;
