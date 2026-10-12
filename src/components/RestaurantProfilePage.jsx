import React, { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Utensils, Plus, ExternalLink, Star, BadgePercent, CheckCircle2, Eye, Activity, Clock, ShoppingBag, AlertCircle, ThumbsUp, Lightbulb, TrendingUp } from 'lucide-react';
import { supabase } from '../supabase';


const calculateVisibilityMetric = (visibilityScore) => {
  let status = 'optimal'; let score = 5;
  if (visibilityScore < 50) { status = 'critical'; score = 1; }
  else if (visibilityScore <= 70) { status = 'needs_action'; score = 3; }
  return { id: 'visibility', type: 'visibility', title: 'Visibility', value: `${visibilityScore} / 100`, status, score };
};

const calculatePricingMetric = (ratingStr, priceDeltaPercent) => {
  const rating = parseFloat(ratingStr.split(' /')[0]);
  let status = 'optimal'; let score = 10;
  if (priceDeltaPercent <= 0) { status = 'optimal'; score = 10; }
  else if (priceDeltaPercent <= 20) {
    if (rating >= 4.0) { status = 'optimal'; score = 8; }
    else { status = 'needs_action'; score = 5; }
  } else {
    if (rating >= 4.0) { status = 'needs_action'; score = 4; }
    else { status = 'critical'; score = 2; }
  }
  const valueStr = priceDeltaPercent === 0 ? 'Parity with Avg'
    : priceDeltaPercent > 0 ? `+${priceDeltaPercent}% vs Avg`
    : `${priceDeltaPercent}% vs Avg`;
  return { id: 'pricing', type: 'pricing', title: 'Price Gap', value: valueStr, status, score };
};

const multiPlatformData = [
  {
    id: 'deliveroo', name: 'Deliveroo', color: '#00CCBC',
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
    id: 'ubereats', name: 'Uber Eats', color: '#06C167',
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
    id: 'justeat', name: 'Just Eat', color: '#FF8000',
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

const getPlatformScore = (platform) => platform.metrics.reduce((sum, m) => sum + (m.score || 0), 0);

const renderCustomBadge = (type) => {
  const box = { width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 };
  let graphic;
  if (type === 'promos') {
    graphic = <BadgePercent size={20} fill="#dc2626" color="white" strokeWidth={1.5} />;
  } else {
    const isYellow = type === 'photos' || type === 'descriptions' || type === 'pricing' || type === 'visibility';
    const wrapStyle = isYellow
      ? { width: '20px', height: '20px', borderRadius: '50%', background: 'radial-gradient(circle at 30% 30%, #ffe600, #ffb300)', boxShadow: 'inset -2px -2px 6px rgba(0,0,0,0.1), inset 2px 2px 6px rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }
      : { width: '20px', height: '20px', borderRadius: '50%', backgroundColor: '#fef3c7', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' };
    let icon;
    if (type === 'rating') icon = <Star size={12} fill="currentColor" />;
    else if (type === 'photos') icon = <img src="/menu_photos_icon.png" alt="photos" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />;
    else if (type === 'descriptions') icon = <img src="/item_descriptions_icon.png" alt="desc" style={{ width: '13px', height: '13px', objectFit: 'contain' }} />;
    else if (type === 'visibility') icon = <Eye size={13} color="#000" strokeWidth={2.5} />;
    else if (type === 'pricing') icon = <span style={{ fontSize: '13px', fontWeight: 900, color: '#000', lineHeight: 1 }}>£</span>;
    else icon = <Activity size={12} color="#000" />;
    graphic = <div style={wrapStyle}>{icon}</div>;
  }
  return <div style={box}>{graphic}</div>;
};

const getStatusStyle = (status) => {
  if (status === 'optimal')      return { color: '#10B981', icon: <CheckCircle2 size={18} color="#10B981" strokeWidth={2.5} /> };
  if (status === 'needs_action') return { color: '#F59E0B', icon: <CheckCircle2 size={18} color="#F59E0B" strokeWidth={2.5} /> };
  return { color: '#EF4444', icon: <CheckCircle2 size={18} color="#EF4444" strokeWidth={2.5} /> };
};

const moduleStyle = { background: '#fcfaf8', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
  borderRadius: '24px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column'
};
const moduleHeaderStyle = { display: 'flex', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.05)' };
const moduleTitleStyle  = { fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Inter', sans-serif" };

const RestaurantProfilePage = ({ restaurantId, onBack, onCompare }) => {
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const onMetricClick = () => {};
  const [activeMenuCategory, setActiveMenuCategory] = useState(null);
  
  // Platform Pricing State
  const [activePricingPlatform, setActivePricingPlatform] = useState('Deliveroo');
  const [isOverlapModalOpen, setIsOverlapModalOpen] = useState(false);
  const [overlapModalPlatform, setOverlapModalPlatform] = useState('all');
  const [activePriceGapPlatform, setActivePriceGapPlatform] = useState('uber');
  const [activePromoFilter, setActivePromoFilter] = useState('all');
  const [selectedBundleId, setSelectedBundleId] = useState(null);
  const [activeBundleFilter, setActiveBundleFilter] = useState('uber');

  const promosData = [
    {
      id: 'p1',
      platform: 'uber',
      platformLogo: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128',
      platformName: 'UberEats',
      severity: 'Aggressive',
      severityColor: '#DC2626',
      severityBg: '#FEF2F2',
      severityBorder: '#FECACA',
      title: '20% off entire menu',
      description: 'Min spend £20.',
      descriptionColor: '#991B1B',
      titleColor: '#7F1D1D',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=128&q=80',
      imageAlt: 'Burger'
    },
    {
      id: 'p2',
      platform: 'deliveroo',
      platformLogo: 'https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128',
      platformName: 'Deliveroo',
      severity: 'Standard',
      severityColor: '#D97706',
      severityBg: '#FFFBEB',
      severityBorder: '#FDE68A',
      title: 'Free Delivery',
      description: 'Over £15 spend.',
      descriptionColor: '#B45309',
      titleColor: '#92400E',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=128&q=80',
      imageAlt: 'Delivery'
    },
    {
      id: 'p3',
      platform: 'justeat',
      platformLogo: 'https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128',
      platformName: 'JustEat',
      severity: 'Standard',
      severityColor: '#D97706',
      severityBg: '#FFFBEB',
      severityBorder: '#FDE68A',
      title: 'Free Garlic Bread',
      description: 'Over £25 spend.',
      descriptionColor: '#B45309',
      titleColor: '#92400E',
      image: 'https://images.unsplash.com/photo-1619531040582-1d54bd8d4ac0?auto=format&fit=crop&w=128&q=80',
      imageAlt: 'Garlic Bread'
    }
  ];

  const bundlePromosData = [
    {
      id: 'b1',
      platform: 'uber',
      title: 'Cheeseburger Meal Deal',
      category: 'High Threat',
      categoryColor: '#EF4444',
      categoryBg: '#FEF2F2',
      singleItemsBreakdown: '£8.50 + £3.50 + £2.50 = £14.50',
      bundlePrice: '£10.99',
      analysisText: "This competitor is located within 0.5 miles of your store and offers exact matching menu items. Their single item prices are kept artificially high to make this 24% bundle discount look like a steal.",
      strategyText: "They are pricing their core burger combo aggressively low to pull volume away from your standard £12.50 burger sales.",
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'b2',
      platform: 'deliveroo',
      title: 'Family Feast Bundle',
      category: 'Opportunity',
      categoryColor: '#10B981',
      categoryBg: '#D1FAE5',
      singleItemsBreakdown: '£12.50 + £12.50 + £5.00 + £5.00 = £35.00',
      bundlePrice: '£28.50',
      analysisText: "This bundle has high sales volume but a safe 18% margin hit. You already stock these exact ingredients across your menu.",
      strategyText: "Geared towards dinner time slots to capture family orders over single portions. Highly replicable for your kitchen.",
      image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'b3',
      platform: 'justeat',
      title: 'Wings & Drink Combo',
      category: 'Standard',
      categoryColor: '#64748B',
      categoryBg: '#F1F5F9',
      singleItemsBreakdown: '£7.00 + £2.50 = £9.50',
      bundlePrice: '£8.50',
      analysisText: "Standard combo to slightly increase AOV by attaching a high-margin drink.",
      strategyText: "Typical 10% discount to encourage drink attachment. No immediate strategic threat to your local volume.",
      image: 'https://images.unsplash.com/photo-1605063073740-4cebaebdb267?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'b4',
      platform: 'uber',
      title: 'Vegan Smash Deal',
      category: 'Opportunity',
      categoryColor: '#10B981',
      categoryBg: '#D1FAE5',
      singleItemsBreakdown: '£9.00 + £3.50 + £2.50 = £15.00',
      bundlePrice: '£12.50',
      analysisText: "High volume in an underserved local niche. They are currently the only takeaway in your radius offering this.",
      strategyText: "Targeting the growing plant-based demographic with a complete meal solution. You can capture this by bundling your existing vegan options.",
      image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'b5',
      platform: 'deliveroo',
      title: 'Loaded Share Box',
      category: 'High Threat',
      categoryColor: '#EF4444',
      categoryBg: '#FEF2F2',
      singleItemsBreakdown: '£8.50 + £8.50 + £5.00 = £22.00',
      bundlePrice: '£15.00',
      analysisText: "A massive 31% discount. This is heavily undercutting standard market prices for sides and sharers in your immediate area.",
      strategyText: "Pricing a massive share box extremely low to make single portions look expensive, which forces higher AOV.",
      image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=300&q=80'
    },
    {
      id: 'b6',
      platform: 'justeat',
      title: 'Late Night Wrap',
      category: 'Standard',
      categoryColor: '#64748B',
      categoryBg: '#F1F5F9',
      singleItemsBreakdown: '£7.50 + £3.50 = £11.00',
      bundlePrice: '£9.50',
      analysisText: "Standard 13% discount. Performs well in late hours but doesn't threaten your core lunch/dinner volume.",
      strategyText: "Time-parting strategy. Available only after 9PM to capture late night cravings.",
      image: 'https://images.unsplash.com/photo-1626700051175-10313c013009?auto=format&fit=crop&w=300&q=80'
    }
  ];
  const mockOverlapData = {
    all: {
      'Signature Mains': [
        { name: 'Truffle Burger', ours: '£14.50', theirs: '£15.00' },
        { name: 'Double Bacon Smash', ours: '£16.00', theirs: '£15.50' },
        { name: 'Spicy Brisket Wrap', ours: '£12.50', theirs: '£12.99' },
        { name: 'Vegan Truffle Patty', ours: '£13.00', theirs: '£13.00' },
        { name: 'Loaded Wagyu Nachos', ours: '£11.00', theirs: '£11.50' },
      ],
      'Premium Sides': [
        { name: 'Truffle Parmesan Fries', ours: '£6.00', theirs: '£6.50' },
        { name: 'Loaded Brisket Fries', ours: '£7.50', theirs: '£8.00' },
        { name: 'Sweet Potato Wedges', ours: '£5.00', theirs: '£5.50' },
        { name: 'Mac & Cheese Bites', ours: '£6.00', theirs: '£6.50' },
      ],
      'House Drinks': [
        { name: 'Oreo Milkshake', ours: '£5.50', theirs: '£6.00' },
        { name: 'House Craft Lemonade', ours: '£4.50', theirs: '£4.50' },
        { name: 'Strawberry Smash Shake', ours: '£5.50', theirs: '£6.00' },
      ]
    },
    deliveroo: {
      'Signature Mains': [
        { name: 'Truffle Burger', ours: '£14.50', theirs: '£15.00' },
        { name: 'Spicy Brisket Wrap', ours: '£12.50', theirs: '£12.99' },
      ],
      'Premium Sides': [
        { name: 'Truffle Parmesan Fries', ours: '£6.00', theirs: '£6.50' },
        { name: 'Sweet Potato Wedges', ours: '£5.00', theirs: '£5.50' },
      ],
      'House Drinks': [
        { name: 'Oreo Milkshake', ours: '£5.50', theirs: '£6.00' },
      ]
    },
    ubereats: {
      'Signature Mains': [
        { name: 'Double Bacon Smash', ours: '£16.00', theirs: '£15.50' },
        { name: 'Vegan Truffle Patty', ours: '£13.00', theirs: '£13.00' },
        { name: 'Spicy Brisket Wrap', ours: '£12.50', theirs: '£12.99' },
      ],
      'Premium Sides': [
        { name: 'Loaded Brisket Fries', ours: '£7.50', theirs: '£8.00' },
        { name: 'Mac & Cheese Bites', ours: '£6.00', theirs: '£6.50' },
      ],
      'House Drinks': [
        { name: 'House Craft Lemonade', ours: '£4.50', theirs: '£4.50' },
        { name: 'Strawberry Smash Shake', ours: '£5.50', theirs: '£6.00' },
      ]
    },
    justeat: {
      'Signature Mains': [
        { name: 'Loaded Wagyu Nachos', ours: '£11.00', theirs: '£11.50' },
      ],
      'Premium Sides': [
        { name: 'Truffle Parmesan Fries', ours: '£6.00', theirs: '£6.50' },
      ],
      'House Drinks': [
        { name: 'Oreo Milkshake', ours: '£5.50', theirs: '£6.00' },
      ]
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // MOCK DATA INTERCEPTOR
      if (typeof restaurantId === 'string' && restaurantId.startsWith('c')) {
        const numId = restaurantId.replace(/\D/g, '') || '1';
        setRestaurant({
          id: restaurantId,
          name: `Mock Competitor ${numId}`,
          hero_image_url: `https://loremflickr.com/800/400/restaurant,food?lock=${numId}`,
          city: 'London', address: 'London Area',
          cuisines: ['Various', 'Fast Food'],
          ubereats_url: 'https://ubereats.com/store/mock',
          deliveroo_url: 'https://deliveroo.co.uk/menu/mock',
          justeat_url:  'https://just-eat.co.uk/restaurants-mock',
          rating: (4 + Math.random()).toFixed(1)
        });
        setMenuItems([
          { id: 'm1', name: 'Classic Meal', price: 9.99, section_name: 'Mains' },
          { id: 'm2', name: 'Large Fries',  price: 3.99, section_name: 'Sides' },
          { id: 'm3', name: 'Soda',         price: 1.99, section_name: 'Drinks' }
        ]);
        setLoading(false);
        return;
      }
      const [restRes, menuRes] = await Promise.all([
        supabase.from('restaurants').select('*').eq('id', restaurantId).single(),
        supabase.from('menu_items').select('*').eq('restaurant_id', restaurantId).order('section_name').order('price', { ascending: false })
      ]);

      if (restRes.error) {
        console.error('Restaurant query error:', restRes.error);
        setRestaurant({ _error: restRes.error.message });
      } else if (restRes.data) {
        setRestaurant(restRes.data);
      } else {
        setRestaurant({ _error: 'No data returned and no error thrown' });
      }

      if (menuRes.data) {
        setMenuItems(menuRes.data);
      }
      
      setLoading(false);
    };

    if (restaurantId) {
      fetchData();
    } else {
      setRestaurant({ _error: 'restaurantId prop is missing or undefined' });
      setLoading(false);
    }
  }, [restaurantId]);

  // Group menu items by section_name
  const groupedMenu = menuItems.reduce((acc, item) => {
    let section = item.section_name || 'Other';
    // Strip all standard emojis
    section = section.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F200}-\u{1F251}\u{1F004}-\u{1F0CF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1FA00}-\u{1FAFF}\u{2B50}\u{1F900}-\u{1F9FF}]/gu, '').trim();
    if (!section) section = 'Other';
    
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {});

  const categories = Object.keys(groupedMenu);

  useEffect(() => {
    if (categories.length > 0 && !activeMenuCategory) {
      setActiveMenuCategory(categories[0]);
    }
  }, [categories, activeMenuCategory]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '1rem', color: '#64748b', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Loading profile...</div>
      </div>
    );
  }

  if (restaurant && restaurant._error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '1rem', color: '#EF4444', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Error: Could not load restaurant profile.</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>ID: {restaurantId}</div>
        <div style={{ fontSize: '0.8rem', color: '#EF4444', marginTop: '0.5rem', maxWidth: '400px', textAlign: 'center' }}>Details: {restaurant._error}</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100%', padding: '4rem', backgroundColor: '#f8fafc' }}>
        <div style={{ fontSize: '1rem', color: '#EF4444', fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>Error: Could not load restaurant profile. (Null)</div>
        <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '1rem' }}>ID: {restaurantId}</div>
      </div>
    );
  }

  const toTitleCase = (str) => {
    if (!str) return '';
    return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const displayRestaurantName = restaurant ? toTitleCase(restaurant.name) : '';
  const cuisineStr = Array.isArray(restaurant.cuisines) && restaurant.cuisines.length > 0 ? restaurant.cuisines[0] : 'Various';
  const locationStr = restaurant.address || (Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas[0] : (restaurant.city || 'London'));
  const hasUberEats = !!restaurant.ubereats_url;
  const hasDeliveroo = !!restaurant.deliveroo_url;
  const hasJustEat = !!restaurant.justeat_url;

  // Pricing Engine Logic
  const getDynamicPrice = (basePrice) => {
    let multiplier = 1.0;
    if (activePricingPlatform === 'Uber Eats') multiplier = 1.25;
    if (activePricingPlatform === 'Deliveroo') multiplier = 1.20;
    if (activePricingPlatform === 'Just Eat') multiplier = 1.15;
    
    return (parseFloat(basePrice) * multiplier).toFixed(2);
  };

  const platforms = [
    { 
      id: 'Deliveroo', 
      label: 'Deliveroo', 
      color: '#00CCBC',
      shadow: 'rgba(0, 204, 188, 0.2)',
      icon: 'https://cdn.simpleicons.org/deliveroo/white'
    },
    { 
      id: 'Uber Eats', 
      label: 'UberEats', 
      color: '#06C167', 
      shadow: 'rgba(6, 193, 103, 0.2)',
      icon: 'https://cdn.simpleicons.org/ubereats/white'
    },
    { 
      id: 'Just Eat', 
      label: 'Just Eat', 
      color: '#FF8000', 
      shadow: 'rgba(255, 128, 0, 0.2)',
      icon: 'https://cdn.simpleicons.org/justeat/white'
    }
  ];

  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      display: 'flex',
      flexDirection: 'column',
      color: '#0f172a'
    }}>
      
      {/* Main Content Dashboard Area */}
      <div style={{
        width: '100%',
        padding: '0.5rem 3rem 2rem 1%',
        flex: 1
      }}>
        
        {/* Page Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', marginLeft: '0.5rem' }}>
          {onBack && (
            <button 
              onClick={onBack}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '8px',
                width: '32px', height: '32px', cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#F9FAFB'; e.currentTarget.style.borderColor = '#D1D5DB'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFF'; e.currentTarget.style.borderColor = '#E5E7EB'; }}
            >
              <ArrowLeft size={16} color="#4B5563" />
            </button>
          )}
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0, fontFamily: "'Inter', sans-serif" }}>Restaurant Profile</h2>
        </div>

        {/* CSS Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '2rem'
        }} className="bento-grid">
          
          <style>
            {`
              @media (min-width: 1000px) {
                .bento-grid {
                  grid-template-columns: 1.1fr 1.25fr !important;
                }
              }
              .menu-scroll::-webkit-scrollbar { width: 6px; }
              .menu-scroll::-webkit-scrollbar-track { background: transparent; }
              .menu-scroll::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 10px; }
              .menu-scroll::-webkit-scrollbar-thumb:hover { background-color: #94a3b8; }
            `}
          </style>

          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', overflow: 'hidden' }}>
            

            {/* HERO CARD */}
            <div style={{ display: 'flex', flexDirection: 'column', borderRadius: '1rem', border: '1px solid rgba(0,0,0,0.05)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', backgroundColor: '#fff', overflow: 'hidden' }}>
              
              <div style={{ display: 'flex', minHeight: '200px' }}>
                {/* Left image */}
                <div style={{
                  flex: '0 0 35%',
                  backgroundImage: `url('${restaurant?.hero_image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'}')`,
                  backgroundSize: 'cover', backgroundPosition: 'center'
                }} />
                {/* Right content */}
                <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', backgroundColor: '#fff' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.4rem' }}>
                      <span style={{ fontFamily: "'Lufga', sans-serif", fontSize: '13px', fontWeight: 800, color: '#e05046' }}>MenuIQ</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Profile</span>
                    </div>
                    <button
                      onClick={() => {
                        if (onCompare) { onCompare(restaurant); }
                        else { window.dispatchEvent(new CustomEvent('open-competitors-matrix', { detail: { compareList: [restaurant] } })); }
                      }}
                      style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem', fontWeight: 700, border: 'none', cursor: 'pointer', backgroundColor: '#0f172a', color: '#fff', borderRadius: '9999px' }}>
                      ⇄ Compare
                    </button>
                  </div>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.1, textTransform: 'capitalize' }}>
                    {restaurant?.name || 'Loading...'}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748B', marginTop: '0.25rem', fontSize: '0.75rem', fontWeight: 500 }}>
                    <MapPin size={12} />
                    {restaurant?.city || 'London'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.1rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '2rem', fontWeight: 800, color: '#E86A58', letterSpacing: '-0.04em', lineHeight: 1 }}>
                    {restaurant?.rating ? Math.min(100, Math.round(parseFloat(restaurant.rating) * 20)) : '68'}
                  </span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#94A3B8', lineHeight: 1 }}>/100</span>
                </div>
                <div style={{ marginTop: '0.75rem' }}>
                  <div style={{ fontSize: '0.67rem', fontWeight: 700, color: '#64748b', marginBottom: '0.4rem' }}>Platform Coverage:</div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'nowrap' }}>
                    {[
                      { id: 'deliveroo', label: 'Deliveroo', color: '#00CCBC', ratingOffset: +0.4 },
                      { id: 'ubereats',  label: 'UberEats',  color: '#06C167', ratingOffset: +0.2 },
                      { id: 'justeat',   label: 'Just Eat',  color: '#FF8000', ratingOffset: -0.4 }
                    ].map(p => (
                      <div key={p.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem' }}>
                        <div style={{ background: p.color, padding: '0.25rem 0.6rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <img src={`https://cdn.simpleicons.org/${p.id}/white`} alt={p.label} style={{ height: '11px', width: '11px' }} />
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', whiteSpace: 'nowrap' }}>{p.label}</span>
                        </div>
                        <div style={{ fontSize: '9px', fontWeight: 800, color: p.ratingOffset < 0 ? '#DC2626' : '#64748B', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star size={8} fill={p.ratingOffset < 0 ? '#DC2626' : '#F59E0B'} color={p.ratingOffset < 0 ? '#DC2626' : '#F59E0B'} />
                          {(parseFloat(restaurant?.rating || 4) + p.ratingOffset).toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                </div>
              </div>
            </div>

            {/* SEPARATED PLATFORM HEALTH METRICS */}   <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '0.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Platform Health</h3>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                {multiPlatformData[0].metrics.map((proto) => (
                  <div key={proto.id} style={{ ...moduleStyle, borderRadius: '16px', padding: '1.25rem', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {renderCustomBadge(proto.type)}
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{proto.title}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {multiPlatformData.map((platform, index) => {
                        const m = platform.metrics.find(x => x.type === proto.type);
                        const s = getStatusStyle(m.status);
                        return (
                          <div key={platform.id} style={{ 
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '0.75rem 0',
                            borderBottom: index !== multiPlatformData.length - 1 ? '1px solid #E2E8F0' : 'none',
                            gap: '0.5rem'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <div style={{ background: platform.color, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <img src={`https://cdn.simpleicons.org/${platform.id}/white`} alt={platform.name} style={{ height: '9px', width: '9px' }} />
                              </div>
                              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4B5563', whiteSpace: 'nowrap' }}>{platform.name}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: proto.type === 'promos' || proto.type === 'pricing' ? s.color : '#111827', whiteSpace: 'nowrap' }}>{m.value}</span>
                              {s.icon}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Actions & Modules */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* ROW: 2-Column Split (Middle & Far Right) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', alignItems: 'stretch' }}>
              
              {/* MIDDLE COLUMN: Overlap, Threat Level, Price Gap */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                
                {/* Menu Overlap Module */}
                <div 
                  style={{ ...moduleStyle, cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}
                  onClick={() => setIsOverlapModalOpen(true)}
                  onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>OVERLAP LEVEL</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', marginBottom: '0.2rem' }}>
                      <div style={{ flex: 1, height: '8px', background: '#F8FAFC', borderRadius: '4px', overflow: 'hidden', display: 'flex', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '60%', height: '100%', background: '#EF4444' }} title="Signature Mains (60%)"></div>
                        <div style={{ width: '20%', height: '100%', background: '#F97316' }} title="Premium Sides (20%)"></div>
                        <div style={{ width: '5%', height: '100%', background: '#94A3B8' }} title="House Drinks (5%)"></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#EF4444', lineHeight: 1 }}>85%</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#CBD5E1' }}>/</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#EF4444', textTransform: 'uppercase' }}>HIGH OVERLAP</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      <span style={{ color: '#EF4444', whiteSpace: 'nowrap' }}>Mains 60%</span>
                      <span style={{ color: '#F97316', whiteSpace: 'nowrap' }}>Sides 20%</span>
                      <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>Drinks 5%</span>
                    </div>
                  </div>
                </div>

                {/* Threat Level Module */}
                <div style={{ ...moduleStyle, border: '1px solid rgba(0,0,0,0.06)', background: '#fff' }}>
                  <div style={{ padding: '0.8rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.15rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.02em' }}>THREAT LEVEL</span>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', marginBottom: '0.2rem' }}>
                      <div style={{ flex: 1, height: '8px', background: '#F8FAFC', borderRadius: '4px', overflow: 'hidden', display: 'flex', border: '1px solid #E2E8F0' }}>
                        <div style={{ width: '82%', height: '100%', background: '#DC2626' }} title="Threat Score (82%)"></div>
                        <div style={{ width: '18%', height: '100%', background: '#F1F5F9' }}></div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#DC2626', lineHeight: 1 }}>82%</span>
                        <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#CBD5E1' }}>/</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: 900, color: '#DC2626', textTransform: 'uppercase' }}>HIGH RISK</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', width: '100%' }}>
                      <span style={{ color: '#EF4444', whiteSpace: 'nowrap' }}>Price Gap: Vulnerable</span>
                      <span style={{ color: '#F97316', whiteSpace: 'nowrap' }}>Promos: Out-spent</span>
                    </div>
                  </div>
                </div>

                {/* Price Gap Analysis Module */}
                <div style={{ ...moduleStyle, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{...moduleHeaderStyle, padding: '1.25rem', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB' }}>
                    <h2 style={{ ...moduleTitleStyle, letterSpacing: '-0.02em', fontWeight: 800 }}>Price Gap</h2>
                    <div style={{ display: 'flex', gap: '0.75rem', paddingRight: '0.25rem', alignItems: 'center' }}>
                      <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                        <img src="https://www.google.com/s2/favicons?domain=ubereats.com&sz=128" alt="UberEats" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#E5E7EB', height: '24px' }} />
                      <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                        <img src="https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128" alt="Deliveroo" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ width: '1px', backgroundColor: '#E5E7EB', height: '24px' }} />
                      <div style={{ width: '40px', display: 'flex', justifyContent: 'center' }}>
                        <img src="https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128" alt="JustEat" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Minimized bottom padding to 0.5rem */}
                  <div style={{ padding: '0.5rem 1.25rem 0.5rem 1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    
                    {/* Table Body Rows */}
                    {[
                      { category: 'Mains', uber: -12, deliveroo: 0, justeat: 8 },
                      { category: 'Sides', uber: 0, deliveroo: -5, justeat: -2 },
                      { category: 'Drinks', uber: 5, deliveroo: 0, justeat: 0 }
                    ].map((row, i, arr) => {
                      const renderGridBadge = (val) => {
                        if (val === null || val === undefined) return <div style={{ width: '40px' }} />;
                        const isNegative = val < 0;
                        const isPositive = val > 0;
                        const isNeutral = val === 0;
                        let bgColor = isNeutral ? '#FEFCE8' : isNegative ? '#FEF2F2' : '#F0FDF4';
                        let textColor = isNeutral ? '#F59E0B' : isNegative ? '#DC2626' : '#16A34A';
                        return (
                          <div style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            width: '40px', height: '40px', borderRadius: '50%', background: bgColor, color: textColor,
                            flexShrink: 0, boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.05)'
                          }}>
                            {isNegative && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '-2px' }}><path d="M12 5v14M19 12l-7 7-7-7"/></svg>}
                            {isPositive && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '-2px' }}><path d="M12 19V5M5 12l7-7 7 7"/></svg>}
                            <span style={{ fontSize: '0.65rem', fontWeight: 800 }}>{isNeutral ? '=' : `${Math.abs(val)}%`}</span>
                          </div>
                        );
                      };

                      return (
                        <div key={i} style={{ 
                          display: 'flex', 
                          alignItems: 'center',
                          padding: '0.75rem 0',
                          borderBottom: i !== arr.length - 1 ? '1px solid #F1F5F9' : 'none'
                        }}>
                          <div style={{ flex: 1 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0f172a' }}>{row.category}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '0.75rem', paddingRight: '0.25rem', alignItems: 'center' }}>
                            {renderGridBadge(row.uber)}
                            <div style={{ width: '1px', backgroundColor: '#E5E7EB', height: '24px' }} />
                            {renderGridBadge(row.deliveroo)}
                            <div style={{ width: '1px', backgroundColor: '#E5E7EB', height: '24px' }} />
                            {renderGridBadge(row.justeat)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
              
              {/* FAR RIGHT COLUMN: Promos */}
              <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                
                {/* Active Promotions Module */}
                <div style={{ ...moduleStyle, flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{...moduleHeaderStyle, padding: '1.25rem', paddingBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #E5E7EB' }}>
                    <h2 style={{ ...moduleTitleStyle, letterSpacing: '-0.02em', fontWeight: 800 }}>Promos</h2>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <div 
                        onClick={() => setActivePromoFilter(activePromoFilter === 'uber' ? 'all' : 'uber')}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: activePromoFilter === 'uber' ? '#E2E8F0' : '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.25rem', borderRadius: '24px', gap: '0.4rem', paddingRight: '0.75rem', opacity: activePromoFilter === 'all' || activePromoFilter === 'uber' ? 1 : 0.5, transition: 'all 0.2s' }}>
                        <img src="https://www.google.com/s2/favicons?domain=ubereats.com&sz=128" alt="Uber" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}/>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#475569' }}>1</span>
                      </div>
                      <div 
                        onClick={() => setActivePromoFilter(activePromoFilter === 'deliveroo' ? 'all' : 'deliveroo')}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: activePromoFilter === 'deliveroo' ? '#E2E8F0' : '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.25rem', borderRadius: '24px', gap: '0.4rem', paddingRight: '0.75rem', opacity: activePromoFilter === 'all' || activePromoFilter === 'deliveroo' ? 1 : 0.5, transition: 'all 0.2s' }}>
                        <img src="https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128" alt="Deliveroo" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}/>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#475569' }}>1</span>
                      </div>
                      <div 
                        onClick={() => setActivePromoFilter(activePromoFilter === 'justeat' ? 'all' : 'justeat')}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', background: activePromoFilter === 'justeat' ? '#E2E8F0' : '#F8FAFC', border: '1px solid #E2E8F0', padding: '0.25rem', borderRadius: '24px', gap: '0.4rem', paddingRight: '0.75rem', opacity: activePromoFilter === 'all' || activePromoFilter === 'justeat' ? 1 : 0.5, transition: 'all 0.2s' }}>
                        <img src="https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128" alt="JustEat" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }}/>
                        <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#475569' }}>1</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ padding: '0.75rem 1rem', display: 'grid', gridAutoRows: 'max-content', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
                    
                    {promosData
                      .filter(promo => activePromoFilter === 'all' || promo.platform === activePromoFilter)
                      .map(promo => (
                      <div key={promo.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem', border: `1px solid ${promo.severityBorder}`, borderRadius: '12px', background: promo.severityBg }}>
                        <div style={{ width: '28px', height: '28px', flexShrink: 0, borderRadius: '6px', overflow: 'hidden', border: '1px solid white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          <img src={promo.image} alt={promo.imageAlt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.55rem', fontWeight: 900, color: promo.severityColor, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.15rem' }}>{promo.severity}</span>
                          <h4 style={{ margin: '0 0 0.15rem 0', fontSize: '0.75rem', fontWeight: 800, color: promo.titleColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{promo.title}</h4>
                          <p style={{ margin: 0, fontSize: '0.65rem', color: promo.descriptionColor, lineHeight: 1.2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{promo.description}</p>
                        </div>
                        <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingRight: '0.25rem' }}>
                          <img src={promo.platformLogo} alt={promo.platformName} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                        </div>
                      </div>
                    ))}
                    
                    {promosData.filter(promo => activePromoFilter === 'all' || promo.platform === activePromoFilter).length === 0 && (
                      <div style={{ padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                        No active promos on this platform.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>


            {/* Bundle Strategy */}
            <div style={moduleStyle}>
              <div style={{...moduleHeaderStyle, padding: '1.25rem', marginBottom: 0, borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <h2 style={moduleTitleStyle}>Bundle Strategy</h2>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  {/* Subtle Threat Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>🔴 2 High Threat Bundles</span>
                  </div>

                  {/* Platform Filters */}
                  {!selectedBundleId && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['uber', 'deliveroo', 'justeat'].map(platform => {
                        let logo, count;
                        if (platform === 'uber') { logo = 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128'; count = bundlePromosData.filter(b => b.platform === 'uber').length; }
                        else if (platform === 'deliveroo') { logo = 'https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128'; count = bundlePromosData.filter(b => b.platform === 'deliveroo').length; }
                        else if (platform === 'justeat') { logo = 'https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128'; count = bundlePromosData.filter(b => b.platform === 'justeat').length; }
                        
                        const isActive = activeBundleFilter === platform;
                        return (
                          <div 
                            key={platform}
                            onClick={() => setActiveBundleFilter(isActive ? 'all' : platform)}
                            style={{ 
                              display: 'flex', alignItems: 'center', gap: '0.3rem', 
                              padding: '0.2rem', 
                              borderRadius: '20px', cursor: 'pointer',
                              background: isActive ? '#FEF2F2' : '#F8FAFC',
                              color: isActive ? '#DC2626' : '#64748B',
                              border: `1px solid ${isActive ? '#FECACA' : '#E2E8F0'}`,
                              opacity: activeBundleFilter === 'all' || isActive ? 1 : 0.5,
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <img src={logo} alt={platform} style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, paddingRight: '0.3rem' }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedBundleId && (
                    <button 
                      onClick={() => setSelectedBundleId(null)}
                      style={{ background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#64748B', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', padding: '0.2rem 0.5rem', borderRadius: '4px' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#64748B'; }}
                    >
                      <ArrowLeft size={14} /> Back to grid
                    </button>
                  )}
                </div>
              </div>
              <div style={{ padding: '1.25rem', minHeight: '380px' }}>
                
                {!selectedBundleId ? (
                  /* GRID VIEW */
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                    {bundlePromosData.filter(b => activeBundleFilter === 'all' || b.platform === activeBundleFilter).map((bundle) => (
                      <div 
                        key={bundle.id}
                        onClick={() => setSelectedBundleId(bundle.id)}
                        style={{ 
                          border: '1px solid #E2E8F0', 
                          borderRadius: '12px', 
                          overflow: 'hidden',
                          background: '#fff',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                      >
                        <div style={{ width: '100%', height: '100px', backgroundColor: '#F1F5F9', position: 'relative' }}>
                          <img src={bundle.image} alt={bundle.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem' }}>
                            <img 
                              src={bundle.platform === 'uber' ? 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128' : bundle.platform === 'deliveroo' ? 'https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128' : 'https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128'} 
                              alt={bundle.platform} 
                              style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid white', boxShadow: '0 2px 4px rgba(0,0,0,0.15)' }} 
                            />
                          </div>
                          <div style={{ position: 'absolute', top: '0.5rem', right: '0.5rem' }}>
                            <span style={{ fontSize: '0.7rem', fontWeight: 900, color: bundle.categoryColor, background: bundle.categoryBg, padding: '0.25rem 0.5rem', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              {bundle.category}
                            </span>
                          </div>
                        </div>
                        <div style={{ padding: '0.75rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <h4 style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{bundle.title}</h4>
                        </div>
                      </div>
                    ))}
                    
                    {bundlePromosData.filter(b => activeBundleFilter === 'all' || b.platform === activeBundleFilter).length === 0 && (
                      <div style={{ gridColumn: '1 / -1', padding: '2rem', textAlign: 'center', color: '#64748B', fontSize: '0.85rem' }}>
                        No bundle deals found on this platform.
                      </div>
                    )}
                  </div>
                ) : (
                  /* DETAIL VIEW */
                  <div style={{ display: 'flex', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
                    {(() => {
                      const bundle = bundlePromosData.find(b => b.id === selectedBundleId);
                      if (!bundle) return null;
                      return (
                        <>
                          {/* Image side */}
                          <div style={{ width: '200px', flexShrink: 0, borderRadius: '12px', overflow: 'hidden', border: '1px solid #E2E8F0' }}>
                            <img src={bundle.image} alt={bundle.title} style={{ width: '100%', height: '100%', objectFit: 'cover', minHeight: '200px' }} />
                          </div>
                          
                          {/* Content side */}
                          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{bundle.title}</h3>
                              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: bundle.categoryColor, background: bundle.categoryBg, padding: '0.25rem 0.6rem', borderRadius: '6px' }}>
                                {bundle.category}
                              </span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.85rem', paddingBottom: '1rem', borderBottom: '1px dashed #E2E8F0' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                                <span>Single items price:</span>
                                <span>{bundle.singleItemsBreakdown}</span>
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#1E293B', fontWeight: 700, fontSize: '0.95rem' }}>
                                <span>Bundle Price:</span>
                                <span>{bundle.bundlePrice}</span>
                              </div>
                            </div>
                            
                            <div style={{ marginTop: '1rem', padding: '1rem', background: '#F8FAFC', borderRadius: '8px' }}>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#DC2626', display: 'block', marginBottom: '0.4rem' }}>Analysis</span>
                              <span style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, display: 'block', marginBottom: '0.75rem' }}>
                                {bundle.analysisText}
                              </span>
                              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#DC2626', display: 'block', marginBottom: '0.4rem' }}>Strategy</span>
                              <span style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5, display: 'block' }}>
                                {bundle.strategyText}
                              </span>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>


            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: translateY(-5px); }
                  to { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>

            {/* FULL MENU MATRIX */}
            <div style={{...moduleStyle, padding: 0, overflow: 'hidden'}}>
              
              <div style={{...moduleHeaderStyle, padding: '1.5rem', marginBottom: 0}}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                  <h2 style={moduleTitleStyle}>Full Menu Matrix</h2>
                  
                  {/* Platform Pricing Filters */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {platforms.map(p => {
                      const isActive = activePricingPlatform === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setActivePricingPlatform(p.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                            padding: '0.4rem 0.8rem',
                            background: p.color,
                            color: '#FFFFFF',
                            border: '2px solid transparent',
                            borderRadius: '9999px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: `0 1px 2px ${p.shadow}`,
                            opacity: 1,
                            transform: isActive ? 'scale(1.05)' : 'scale(1)',
                            filter: isActive ? 'saturate(1.2) brightness(1.05)' : 'saturate(1)'
                          }}
                        >
                          <img src={p.icon} alt={p.label} style={{ height: '14px', width: '14px' }} />
                          <span style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>{p.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              
              {/* Category Tabs Navigation */}
              {categories.length > 0 && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem', 
                  padding: '0.75rem 1.5rem',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  backgroundColor: 'transparent',
                  overflowX: 'auto',
                  scrollbarWidth: 'none'
                }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveMenuCategory(cat)}
                      style={{
                        padding: '0.4rem 0.8rem',
                        borderRadius: '999px',
                        border: 'none',
                        backgroundColor: activeMenuCategory === cat ? '#0f172a' : 'transparent',
                        color: activeMenuCategory === cat ? '#FFF' : '#64748b',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s ease',
                        fontFamily: "'Inter', sans-serif"
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
              
              <div className="menu-scroll" style={{ 
                maxHeight: '600px', 
                overflowY: 'auto',
                display: 'flex', 
                flexDirection: 'column' 
              }}>
                {categories.length > 0 && activeMenuCategory ? (
                  <div style={{ animation: 'fadeIn 0.2s ease-in-out' }}>
                    {groupedMenu[activeMenuCategory]?.map((dish, idx) => (
                      <div key={dish.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        padding: '1.25rem 1.5rem',
                        borderBottom: idx !== groupedMenu[activeMenuCategory].length - 1 ? '1px solid #E5E7EB' : 'none'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', flex: 1, paddingRight: '1rem' }}>
                          {/* Micro-imagery */}
                          {dish.image_url ? (
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={dish.image_url} alt={dish.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                          ) : (
                            <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#F3F4F6', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"></path>
                                <path d="M7 2v20"></path>
                                <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"></path>
                              </svg>
                            </div>
                          )}
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{dish.name}</span>
                            {dish.description && (
                              <span style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}>
                                {dish.description}
                              </span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem' }}>
                          <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#0f172a', flexShrink: 0, marginTop: '0.1rem' }}>
                            {dish.currency === 'GBP' ? '£' : ''}{getDynamicPrice(dish.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '3rem 0', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                    No menu items indexed yet.
                  </div>
                )}
              </div>
            </div>
          </div>



        </div>
      </div>
      
      {/* NEW OVERLAP MODAL */}
      {isOverlapModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          backdropFilter: 'blur(8px)',
          zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }} onClick={() => setIsOverlapModalOpen(false)}>
          <div style={{
            width: '900px', height: '700px',
            backgroundColor: '#ffffff', borderRadius: '24px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Top Section: Overview (35%) */}
            <div style={{ height: '35%', minHeight: '230px', backgroundColor: '#F8FAFC', padding: '2rem', borderBottom: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0F172A', margin: 0 }}>Menu Overlap</h2>
                </div>
                <button onClick={() => setIsOverlapModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                  <Plus size={24} color="#64748B" style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>

              <div style={{ display: 'flex', gap: '3rem', flex: 1 }}>
                {/* Aggregate Bar */}
                <div 
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', cursor: 'pointer', opacity: overlapModalPlatform === 'all' ? 1 : 0.6, transition: 'opacity 0.2s' }}
                  onClick={() => setOverlapModalPlatform('all')}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase' }}>Aggregate Overlap</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EF4444' }}>85%</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', background: '#F8FAFC', borderRadius: '6px', overflow: 'hidden', display: 'flex', border: '1px solid #E2E8F0', marginBottom: '0.5rem' }}>
                    <div style={{ width: '60%', height: '100%', background: '#EF4444' }} title="Signature Mains (60%)"></div>
                    <div style={{ width: '20%', height: '100%', background: '#F97316' }} title="Premium Sides (20%)"></div>
                    <div style={{ width: '5%', height: '100%', background: '#94A3B8' }} title="House Drinks (5%)"></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', width: '85%' }}>
                    <span style={{ color: '#EF4444' }}>Mains 60%</span>
                    <span style={{ color: '#F97316' }}>Sides 20%</span>
                    <span style={{ color: '#94A3B8' }}>Drinks 5%</span>
                  </div>
                </div>

                {/* Sub Bars */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', opacity: (overlapModalPlatform === 'all' || overlapModalPlatform === 'deliveroo') ? 1 : 0.4, transition: 'opacity 0.2s' }}
                      onClick={() => setOverlapModalPlatform('deliveroo')}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img src="https://cdn.simpleicons.org/deliveroo/00CCBC" alt="Deliveroo" style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '4px' }}><div style={{ width: '60%', height: '100%', background: '#00CCBC', borderRadius: '4px' }}></div></div>
                      <span style={{ width: '30px', fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>60%</span>
                    </div>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', opacity: (overlapModalPlatform === 'all' || overlapModalPlatform === 'ubereats') ? 1 : 0.4, transition: 'opacity 0.2s' }}
                      onClick={() => setOverlapModalPlatform('ubereats')}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img src="https://cdn.simpleicons.org/ubereats/06C167" alt="UberEats" style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '4px' }}><div style={{ width: '85%', height: '100%', background: '#06C167', borderRadius: '4px' }}></div></div>
                      <span style={{ width: '30px', fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>85%</span>
                    </div>
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', opacity: (overlapModalPlatform === 'all' || overlapModalPlatform === 'justeat') ? 1 : 0.4, transition: 'opacity 0.2s' }}
                      onClick={() => setOverlapModalPlatform('justeat')}
                    >
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                        <img src="https://cdn.simpleicons.org/justeat/FF8000" alt="Just Eat" style={{ width: '16px', height: '16px' }} />
                      </div>
                      <div style={{ flex: 1, height: '8px', background: '#E2E8F0', borderRadius: '4px' }}><div style={{ width: '30%', height: '100%', background: '#FF8000', borderRadius: '4px' }}></div></div>
                      <span style={{ width: '30px', fontSize: '0.75rem', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>30%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#FFFFFF' }}>
              
              {/* Platform Switcher */}
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #E2E8F0', gap: '1rem' }}>
                {[
                  { id: 'deliveroo', label: 'Deliveroo', color: '#00CCBC', logo: 'https://cdn.simpleicons.org/deliveroo/00CCBC' },
                  { id: 'ubereats', label: 'UberEats', color: '#06C167', logo: 'https://cdn.simpleicons.org/ubereats/06C167' },
                  { id: 'justeat', label: 'Just Eat', color: '#FF8000', logo: 'https://cdn.simpleicons.org/justeat/FF8000' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => setOverlapModalPlatform(overlapModalPlatform === p.id ? 'all' : p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.4rem 1.25rem 0.4rem 0.4rem',
                      borderRadius: '999px',
                      border: overlapModalPlatform === p.id ? `1px solid ${p.color}` : '1px solid #E2E8F0',
                      backgroundColor: overlapModalPlatform === p.id ? '#F8FAFC' : '#FFFFFF',
                      color: '#0F172A',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: overlapModalPlatform === p.id ? `0 0 0 1px ${p.color}` : '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #E2E8F0' }}>
                      <img src={p.logo} alt={p.label} style={{ width: '14px', height: '14px', objectFit: 'contain' }} />
                    </div>
                    {p.label}
                  </button>
                ))}
              </div>

              {/* 3 Columns */}
              <div style={{ flex: 1, display: 'flex', padding: '0 1rem' }}>
                {['Signature Mains', 'Premium Sides', 'House Drinks'].map((category, idx) => {
                  const items = mockOverlapData[overlapModalPlatform]?.[category] || [];
                  return (
                    <div key={category} style={{ 
                      flex: 1, 
                      display: 'flex', 
                      flexDirection: 'column', 
                      borderRight: idx < 2 ? '1px solid #F1F5F9' : 'none',
                      padding: '1.5rem 1rem'
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>{category}</h3>
                      <span style={{ background: '#F1F5F9', color: '#475569', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '999px' }}>
                        {items.length} OVERLAPPED
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }} className="menu-scroll">
                      {items.length > 0 ? items.map((item, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', paddingBottom: '1rem', borderBottom: i !== items.length - 1 ? '1px solid #F8FAFC' : 'none' }}>
                          <img 
                            src={`https://loremflickr.com/100/100/food?lock=${item.name.length + i * 10}`} 
                            alt={item.name} 
                            style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid #E2E8F0' }} 
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', flex: 1 }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>{item.name}</span>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                              <span style={{ color: '#64748B' }}>Ours: <strong style={{ color: '#0F172A' }}>{item.ours}</strong></span>
                              <span style={{ color: '#64748B' }}>Theirs: <strong style={{ color: '#0F172A' }}>{item.theirs}</strong></span>
                            </div>
                          </div>
                        </div>
                      )) : (
                        <div style={{ fontSize: '0.85rem', color: '#94A3B8', fontStyle: 'italic', textAlign: 'center', marginTop: '2rem' }}>
                          No overlapping items on this platform.
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        </div>
      )}
      
    </div>
  );
};

// moduleStyle defined at top
export default RestaurantProfilePage;
