import React, { useEffect, useState } from 'react';
import { ArrowRight, AlertTriangle, Sparkles, Send, Wallet, Satellite, Megaphone, ChefHat, TrendingUp, TrendingDown, X, Eye, Clock, BarChart3, ChevronRight, AlertCircle, MapPin, Tag, Shield, Truck } from 'lucide-react';
import './DashboardContent.css';
import MarketPositionReport from './MarketPositionReport';
import DeliveryShadowModal from './DeliveryShadowModal';
import PromoTrackerModal from './PromoTrackerModal';
import CompetitorPriceModal from './CompetitorPriceModal';
import TerritoryAlertCard from './TerritoryAlertCard';
import RecommendationsModal from './RecommendationsModal';
import RecommendationsSimulationWidget from './RecommendationsSimulationWidget';
import AIGreeting from './AIGreeting';
import AICommandOverlay from './AICommandOverlay';
import { supabase } from '../supabase';

const PricingCard = ({ title, count, items, colorClass, onShowMore }) => {
  const displayedItems = items.slice(0, 2);

  return (
    <div className="glass-panel" style={{ flex: 1, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#4B5563' }}>{title}</h3>
        <span style={{ fontSize: '2rem', fontWeight: 800 }} className={colorClass}>{count}</span>
      </div>
      
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
          Top 2 Urgent
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {displayedItems.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.4)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(255,255,255,0.5)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img src={item.image} alt={item.name} style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.1)' }} />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: item.impact > 0 ? '#10B981' : '#EF4444', fontWeight: 500 }}>
                    {item.impact > 0 ? '+' : ''}£{item.impact} {item.impact > 0 ? 'gained' : 'lost'}
                  </div>
                </div>
              </div>
              <button style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
                <ArrowRight size={16} />
              </button>
            </div>
          ))}
        </div>
        
        {items.length > 2 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'auto', paddingTop: '1.5rem' }}>
            <button 
              onClick={onShowMore}
              style={{ background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Show more
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardContent = () => {
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [showPromos, setShowPromos] = React.useState(false);
  const [selectedPromoDetail, setSelectedPromoDetail] = React.useState(null);
  const [selectedMetric, setSelectedMetric] = React.useState(null);
  const [dismissedAlerts, setDismissedAlerts] = React.useState([]);
  const [priceAlertFilter, setPriceAlertFilter] = React.useState('all');
  const [showMarketReport, setShowMarketReport] = React.useState(false);
  const [showDeliveryShadow, setShowDeliveryShadow] = React.useState(false);
  const [imageErrors, setImageErrors] = React.useState({});
  const [selectedCompetitorForModal, setSelectedCompetitorForModal] = React.useState(null);
  const [isAIOverlayOpen, setIsAIOverlayOpen] = React.useState(false);
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = React.useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = React.useState(null);
  // Supabase live data
  const [restaurant, setRestaurant] = useState(null);
  const [livePromos, setLivePromos] = useState([]);
  const [liveMenuItems, setLiveMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch first restaurant — replace .limit(1) with user's restaurant later
        const { data: restaurantData, error: restError } = await supabase
          .from('restaurants')
          .select('id, name, hero_image_url, rating, rating_count, delivery_fee, estimated_delivery_time, cuisines, areas, address, city, is_open, price_range')
          .limit(1);

        if (restError) throw restError;
        const rest = restaurantData?.[0] || null;
        setRestaurant(rest);

        if (!rest) {
          console.log('No restaurant found');
          setLoading(false);
          return;
        }

        // Fetch menu items for this restaurant
        const { data: allItems, error: itemsError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, image_url, is_available, section_name')
          .eq('restaurant_id', rest.id);

        if (itemsError) throw itemsError;
        setLiveMenuItems(allItems || []);

        // Fetch competitor restaurants in same areas for promo tracker
        if (rest.areas && rest.areas.length > 0) {
          const { data: competitors, error: compError } = await supabase
            .from('restaurants')
            .select('id, name, hero_image_url, rating, delivery_fee, cuisines, areas')
            .overlaps('areas', rest.areas)
            .neq('id', rest.id)
            .limit(8);

          if (!compError) setLivePromos(competitors || []);
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const priceAlerts = [
    { id: 1, competitor: 'Domino\'s Ilford', category: 'Mains', logo: 'DM', logoColor: '#1D4ED8', item: 'Pepperoni Pizza', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=64&q=80', oldPrice: 11.99, newPrice: 13.99, direction: 'up', time: '12 min ago', isNew: true, youSellThis: true, isMine: true, platform: 'deliveroo', watchlisted: true },
    { id: 2, competitor: 'Pizza Palace Barking', category: 'Mains', logo: 'PP', logoColor: '#D97706', item: 'Garlic Bread', image: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=64&q=80', oldPrice: 4.99, newPrice: 3.49, direction: 'down', time: '34 min ago', isNew: true, youSellThis: true, isMine: true, platform: 'ubereats', watchlisted: true },
    { id: 3, competitor: 'Al-Amin Pizza', category: 'Sides', logo: 'AA', logoColor: '#059669', item: 'Cheesy Chips', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=64&q=80', oldPrice: 5.50, newPrice: 6.75, direction: 'up', time: '1 hr ago', isNew: true, youSellThis: true, isMine: false, platform: 'justeat', watchlisted: false },
    { id: 4, competitor: 'Fire Crust (NEW)', category: 'Mains', logo: 'FC', logoColor: '#DC2626', item: 'Store Opened', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=64&q=80', oldPrice: 0, newPrice: 0, direction: 'info', time: '2 hrs ago', isNew: false, youSellThis: false, isMine: true, platform: 'deliveroo', watchlisted: false, type: 'new_competitor' },
  ];

  const visibleAlerts = priceAlerts
    .filter(a => !dismissedAlerts.includes(a.id))
    .filter(a => priceAlertFilter === 'all' || a.isMine)
    .sort((a, b) => {
      // Float "You sell this" to top, then by recency (id ascending = newest first)
      if (a.youSellThis && !b.youSellThis) return -1;
      if (!a.youSellThis && b.youSellThis) return 1;
      return 0;
    });
  const newCount = visibleAlerts.filter(a => a.isNew).length;
  const affectsYouCount = visibleAlerts.filter(a => a.youSellThis).length;

  const promoCount = livePromos.length > 0 ? livePromos.length : 8; // using 8 for high threat test
  
  let bgGradientClass = 'bg-gradient-to-br from-[#E86A58] to-[#D55A48]'; // High
  if (promoCount <= 3) bgGradientClass = 'bg-gradient-to-br from-emerald-400 to-emerald-600'; // Low
  else if (promoCount <= 6) bgGradientClass = 'bg-gradient-to-br from-amber-400 to-orange-500'; // Medium
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: '3rem', width: '100%' }}>
        <div style={{ fontSize: '1.875rem', fontWeight: 700, flexShrink: 0 }}>Menu Pricing Health</div>
        <AIGreeting onClick={() => setIsAIOverlayOpen(true)} />
      </div>
      
      <AICommandOverlay isOpen={isAIOverlayOpen} onClose={() => setIsAIOverlayOpen(false)} />
      
      {/* Master Dashboard Wrapper */}
      <div className="w-full flex flex-col gap-6">
        
        {/* TOP ROW - 12-Column Grid matching 5-3-4 red box layout */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Child 1: Restaurant Health */}
          <div className="col-span-12 md:col-span-5">
            <div className="glass-panel breathing-glow rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)]" style={{ display: 'flex', overflow: 'hidden', padding: 0, height: '100%', background: '#fff' }}>
              {/* LEFT — Brand Identity Hero */}
              <div style={{ 
                flex: 1, 
                width: '50%',
                position: 'relative', 
                backgroundImage: `linear-gradient(to bottom, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.1) 40%, rgba(0, 0, 0, 0.6) 100%), url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80')`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                minHeight: '260px',
                borderTopLeftRadius: '1rem',
                borderBottomLeftRadius: '1rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '2rem'
              }}>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <h2 style={{ fontSize: '1.4rem', fontWeight: 400, color: '#fff', fontFamily: '"Playfair Display", serif', lineHeight: 1.2, margin: 0 }}>
                    Good evening,<br/>免果記<br/>Durian Pizza.
                  </h2>
                </div>
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Truck size={14} color="#fff" strokeWidth={2} />
                    <span style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 500 }}>
                      Est. 25 Min
                    </span>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ADE80', marginLeft: '0.25rem', boxShadow: '0 0 8px rgba(74, 222, 128, 0.6)' }} />
                  </div>
                </div>
              </div>

              {/* RIGHT — Health Overview Data */}
              <div style={{ flex: 1, width: '50%', padding: '2rem', display: 'flex', flexDirection: 'column', background: '#fff', justifyContent: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h2 className="font-sans" style={{ margin: 0, fontSize: '0.85rem', fontWeight: 800, letterSpacing: '0.05em', color: '#111', textTransform: 'uppercase' }}>Health Overview</h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#FCE7E7', color: '#991B1B', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 800 }}>
                    <AlertCircle size={12} strokeWidth={2.5} /> 64/100
                  </div>
                </div>
                
                {/* Secondary Metrics (Pristine Vertical List) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1, justifyContent: 'center' }}>
                  
                  {/* Row 1: Local Rank */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FCE7E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <MapPin size={16} color="#991B1B" />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em' }}>LOCAL RANK</span>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B', lineHeight: 1 }}>#14</span>
                  </div>

                  {/* Row 2: Price Gap */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#FCE7E7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Tag size={16} color="#991B1B" />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em' }}>PRICE GAP</span>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#991B1B', lineHeight: 1 }}>+8%</span>
                  </div>

                  {/* Row 3: Promo Threat */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Shield size={16} color="#166534" />
                      </div>
                      <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.05em' }}>PROMO THREAT</span>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#166534', lineHeight: 1 }}>40%</span>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Child 2: Promo Tracker */}
          <div className="col-span-12 md:col-span-3">
            <div onClick={() => setShowPromos(true)} className="w-full h-full bg-white rounded-[24px] p-6 shadow-sm border border-gray-100 flex items-center justify-between relative cursor-pointer group transition-transform duration-300 hover:-translate-y-1">
              
              {/* Left Typography Column */}
              <div className="flex flex-col z-10 w-3/5">
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                  Competitor Promos
                </span>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4">
                  Promo Tracker
                </h2>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-black text-[#E86A58] leading-none tracking-tighter">8</span>
                  <div className="flex flex-col pb-1">
                    <span className="text-sm font-bold text-gray-800 leading-tight">Active</span>
                    <span className="text-xs font-semibold text-gray-400">Promotions</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-[#E86A58] transition-colors mt-6">
                  View Market Data →
                </span>
              </div>

              {/* Right Animation Column */}
              <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                {/* Core Dot */}
                <div className="w-4 h-4 bg-[#E86A58] rounded-full z-20 shadow-[0_0_12px_rgba(232,106,88,0.8)]"></div>
                {/* Sonar Rings */}
                <div className="absolute w-16 h-16 border-2 border-[#E86A58] rounded-full opacity-60 animate-ping"></div>
                <div className="absolute w-24 h-24 border border-[#E86A58] rounded-full opacity-30 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
            </div>
          </div>

          {/* Child 3: Territory Alert Card */}
          <div className="col-span-12 md:col-span-4">
            <TerritoryAlertCard onClick={() => setShowDeliveryShadow(true)} />
          </div>
        </div>

        {/* BOTTOM ROW - 12-Column Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Pricing Overview Consolidated Card */}
        <div className="col-span-12 md:col-span-5">
          <div className="glass-panel rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] bg-[#FAF8F4]" style={{ height: '100%', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column' }}>
            <h3 className="font-sans text-xl font-bold text-gray-900 tracking-tight" style={{ marginBottom: '1.5rem', margin: 0 }}>Pricing Overview</h3>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
              {[
                { title: 'Parity Violations (Fix Now)', count: 2, color: '#EF4444', items: [
                  { name: 'Margherita Pizza', category: 'Mains', price: '£12.99', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=120&q=80', description: 'Platform Price: £12.99. Base Price: £13.50. You are violating pricing parity (UberEats price is lower than in-store).', platform: 'Uber Eats' },
                  { name: 'Cola Zero', category: 'Drinks', price: '£1.50', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=120&q=80', description: 'Platform Price: £1.50. Base Price: £2.00. Deliveroo price is lower than in-store.', platform: 'Deliveroo' }
                ]},
                { title: 'Below Market Average', count: 12, color: '#F59E0B', items: [
                  // Uber Eats
                  { name: 'Vegan Wrap', category: 'Wraps', price: '£5.50', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=120&q=80', description: 'Your price: £5.50. Market Average: £6.80.', platform: 'Uber Eats' },
                  { name: 'Avocado Toast', category: 'Breakfast', price: '£6.00', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=120&q=80', description: 'Your price: £6.00. Market Average: £7.50.', platform: 'Uber Eats' },
                  { name: 'Quinoa Bowl', category: 'Salads', price: '£8.50', image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=120&q=80', description: 'Your price: £8.50. Market Average: £9.50.', platform: 'Uber Eats' },
                  { name: 'Green Smoothie', category: 'Drinks', price: '£4.00', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=120&q=80', description: 'Your price: £4.00. Market Average: £5.20.', platform: 'Uber Eats' },
                  // JustEat
                  { name: 'Milkshake', category: 'Drinks', price: '£3.20', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=120&q=80', description: 'Your price: £3.20. Market Average: £4.00.', platform: 'JustEat' },
                  { name: 'Beef Burger', category: 'Mains', price: '£7.50', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=120&q=80', description: 'Your price: £7.50. Market Average: £9.00.', platform: 'JustEat' },
                  { name: 'Chicken Wings', category: 'Sides', price: '£5.00', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=120&q=80', description: 'Your price: £5.00. Market Average: £6.50.', platform: 'JustEat' },
                  { name: 'Loaded Fries', category: 'Sides', price: '£4.50', image: 'https://images.unsplash.com/photo-1576107232684-1279f390859f?auto=format&fit=crop&w=120&q=80', description: 'Your price: £4.50. Market Average: £5.80.', platform: 'JustEat' },
                  // Deliveroo
                  { name: 'Sweet Potato Fries', category: 'Sides', price: '£3.50', image: 'https://images.unsplash.com/photo-1596649285097-70b1cb3b3209?auto=format&fit=crop&w=120&q=80', description: 'Your price: £3.50. Market Average: £4.50.', platform: 'Deliveroo' },
                  { name: 'Margherita Pizza', category: 'Mains', price: '£9.00', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=120&q=80', description: 'Your price: £9.00. Market Average: £11.00.', platform: 'Deliveroo' },
                  { name: 'Garlic Bread', category: 'Sides', price: '£3.00', image: 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=120&q=80', description: 'Your price: £3.00. Market Average: £4.20.', platform: 'Deliveroo' },
                  { name: 'Chocolate Brownie', category: 'Desserts', price: '£4.00', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=120&q=80', description: 'Your price: £4.00. Market Average: £5.00.', platform: 'Deliveroo' }
                ]},
                { title: 'Above Market Average', count: 4, color: '#10B981', items: [
                  { name: 'Classic Cheeseburger', category: 'Mains', price: '£11.50', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=120&q=80', description: 'Your price: £11.50. Market Average: £9.50. High margin, but monitor sales volume.', platform: 'Uber Eats' },
                  { name: 'Onion Rings', category: 'Sides', price: '£4.00', image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?auto=format&fit=crop&w=120&q=80', description: 'Your price: £4.00. Market Average: £3.20. Slightly overpriced.', platform: 'JustEat' }
                ]}
              ].map((row, i) => (
                <div 
                  key={i}
                  onClick={() => setSelectedCard({ title: row.title, items: row.items, color: row.color })}
                  className="flex flex-row justify-between items-center py-3 border-b border-gray-100 last:border-0"
                  style={{ cursor: 'pointer', transition: 'all 0.2s', borderLeft: '1px solid transparent', borderRight: '1px solid transparent', borderTop: '1px solid transparent' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.6)'; e.currentTarget.querySelector('.chevron').style.opacity = '1'; e.currentTarget.querySelector('.chevron').style.transform = 'translateX(0)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.querySelector('.chevron').style.opacity = '0'; e.currentTarget.querySelector('.chevron').style.transform = 'translateX(-8px)'; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: row.color }}></div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#374151' }}>{row.title}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111' }}>{row.count}</span>
                    <span className="chevron" style={{ opacity: 0, transform: 'translateX(-8px)', transition: 'all 0.2s', color: '#9CA3AF', display: 'flex', alignItems: 'center' }}>
                      <ArrowRight size={18} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recommendations Widget (Moved to Row 2) */}
        <div className="col-span-12 md:col-span-3">
          <RecommendationsSimulationWidget onClick={() => setIsRecommendationsModalOpen(true)} />
        </div>

        {/* Empty col-span-4 to fill out 12 columns in bottom row */}
        <div className="hidden md:block md:col-span-4"></div>

        {/* Price Change Alerts (Grouped by Competitor) */}
        <div className="col-span-12">
          <div 
            className="glass-panel rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] bg-[#FAF8F4]" 
            style={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              boxSizing: 'border-box',
              padding: '1.5rem'
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider" style={{ marginBottom: '6px' }}>
                  PRICE CHANGES
                </div>
                <h3 className="font-sans text-xl font-bold text-gray-900 tracking-tight" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', margin: 0 }}>
                  Instant price alerts
                  {newCount > 0 && (
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#C85A17', background: 'rgba(214, 90, 49, 0.1)', padding: '2px 8px', borderRadius: '9999px', border: '1px solid rgba(214, 90, 49, 0.2)' }}>{newCount} new</span>
                  )}
                </h3>
              </div>
            </div>

            {/* Category Tabs */}
            <div style={{ display: 'flex', gap: '0.35rem', marginBottom: '1rem', background: '#F3F4F6', borderRadius: '8px', padding: '0.25rem', alignSelf: 'flex-start', width: 'fit-content' }}>
              {[
                { key: 'all', label: 'All', count: priceAlerts.filter(a => !dismissedAlerts.includes(a.id)).length },
                { key: 'mine', label: 'My Competitors', count: priceAlerts.filter(a => !dismissedAlerts.includes(a.id) && a.isMine).length }
              ].map((tab) => {
                const isActive = priceAlertFilter === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setPriceAlertFilter(tab.key)}
                    style={{
                      padding: '0.4rem 0.85rem',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.75rem',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? '#111' : '#6B7280',
                      background: isActive ? '#FFFFFF' : 'transparent',
                      boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem'
                    }}
                  >
                    {tab.label}
                    <span style={{ 
                      fontSize: '0.6rem', fontWeight: 700, 
                      color: isActive ? '#111' : '#9CA3AF',
                      background: isActive ? '#F3F4F6' : 'transparent', 
                      padding: '0.1rem 0.35rem', borderRadius: '4px',
                      transition: 'all 0.2s'
                    }}>{tab.count}</span>
                  </button>
                );
              })}
            </div>

            {/* Alerts Feed (Grouped) */}
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'auto', paddingRight: '0.25rem', gap: '0.5rem' }}>
              {Object.entries(
                visibleAlerts.reduce((acc, alert) => {
                  if (!acc[alert.competitor]) {
                    acc[alert.competitor] = { 
                      name: alert.competitor, 
                      logo: alert.logo, 
                      logoColor: alert.logoColor, 
                      image: alert.image, 
                      changes: [], 
                      youSellMatchCount: 0 
                    };
                  }
                  acc[alert.competitor].changes.push(alert);
                  if (alert.youSellThis) acc[alert.competitor].youSellMatchCount++;
                  return acc;
                }, {})
              ).map(([compName, compData]) => {
                return (
                  <div 
                    key={compName}
                    onClick={() => setSelectedCompetitorForModal(compData)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '1rem',
                      background: '#FFFFFF',
                      borderRadius: '12px',
                      border: '1px solid #E5E0D8',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.01)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
                      e.currentTarget.style.borderColor = '#D1D5DB';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.01)';
                      e.currentTarget.style.borderColor = '#E5E0D8';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img 
                        src={compData.image} 
                        alt={compName} 
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(0,0,0,0.06)' }} 
                      />
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {compName}
                          {compData.changes.some(c => c.watchlisted) && (
                            <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>WATCHLIST</span>
                          )}
                        </div>
                        {compData.youSellMatchCount > 0 ? (
                          <div style={{ fontSize: '0.75rem', color: '#C85A17', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <AlertCircle size={10} /> {compData.youSellMatchCount} matching items
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>General updates</div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{
                        background: 'rgba(0,0,0,0.03)',
                        color: '#4B5563',
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        {compData.changes.length} changes
                      </div>
                      <ChevronRight size={18} color="#9CA3AF" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ROW 3 - Blind Spots & Email Preview */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Feature 2: Real Blind Spot Engine */}
          <div className="col-span-12 md:col-span-6">
            <div className="glass-panel rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] bg-[#FAF8F4]" style={{ height: '100%', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column' }}>
              <h3 className="font-sans text-xl font-bold text-gray-900 tracking-tight" style={{ marginBottom: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Eye size={20} color="#10B981" /> Menu Blind Spots
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#6B7280', marginBottom: '1.5rem' }}>
                We analyzed 15 Tier 1 competitors in your area. You are missing high-value items that your competitors are successfully selling.
              </p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🍕</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111', fontSize: '0.95rem' }}>Stuffed Crust Pizza</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>Sold by 8 of 15 competitors</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>Avg Market Price</div>
                    <div style={{ fontWeight: 800, color: '#10B981' }}>£13.50</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: '#fff', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '8px', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🍟</div>
                    <div>
                      <div style={{ fontWeight: 700, color: '#111', fontSize: '0.95rem' }}>Loaded Chicken Fries</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>Sold by 6 of 15 competitors</div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600 }}>Avg Market Price</div>
                    <div style={{ fontWeight: 800, color: '#10B981' }}>£6.20</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 23: Weekly Intelligence Email Preview */}
          <div className="col-span-12 md:col-span-6">
            <div className="glass-panel rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)]" style={{ height: '100%', padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', background: 'linear-gradient(145deg, #111827, #1F2937)' }}>
              <h3 className="font-sans text-xl font-bold text-white tracking-tight" style={{ marginBottom: '1.5rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Send size={20} color="#60A5FA" /> Weekly Intelligence Email
              </h3>
              <p style={{ fontSize: '0.85rem', color: '#9CA3AF', marginBottom: '1.5rem' }}>
                Preview of the digest sending to your inbox every Monday at 8:00 AM.
              </p>

              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ fontWeight: 800, color: '#111', fontSize: '1.1rem', borderBottom: '2px solid #F3F4F6', paddingBottom: '0.5rem' }}>MenuIQ Weekly Briefing</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#EF4444', marginTop: '6px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>3 Price Changes Detected</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Domino's and Pizza Palace updated their prices.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B', marginTop: '6px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>New Promo Alert</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Fire Crust launched a "Spend £20 Save £5" deal.</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981', marginTop: '6px' }} />
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#111' }}>Recommended Action</div>
                      <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>Lower the price of your Vegan Wrap to match the market average of £6.80.</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Master Dashboard Wrapper */}
      </div>


      {/* Modal Overlay for "Pricing Overview" Drill-down */}
      {selectedCard && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '1200px', maxWidth: '95%', height: '80vh', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(250,248,244,0.95)', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.25rem', fontWeight: 700, color: selectedCard.color || '#000', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: selectedCard.color || '#000' }}></span>
                {selectedCard.title} Items
              </h3>
              <button onClick={() => setSelectedCard(null)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>×</span>
              </button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '2rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {['Uber Eats', 'JustEat', 'Deliveroo'].map(platform => {
                const platformItems = selectedCard.items.filter(i => (i.platform === platform));
                const platformColors = {
                  'Uber Eats': '#06C167',
                  'JustEat': '#F36D00',
                  'Deliveroo': '#00CCBC'
                };
                return (
                  <div key={platform} style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <h4 className="font-sans" style={{ fontSize: '1.25rem', fontWeight: 800, color: platformColors[platform] || '#111', margin: 0 }}>{platform}</h4>
                    </div>
                    <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                      {platformItems.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '2rem', color: '#9CA3AF', fontSize: '0.9rem' }}>No items in this category.</div>
                      ) : (
                        platformItems.map((item, i) => {
                          const parts = item.description ? item.description.split('. ') : [];
                          const pricePart = parts[0] || '';
                          const restPart = parts.length > 1 ? '. ' + parts.slice(1).join('. ') : (item.description && item.description.endsWith('.') && parts.length === 1 ? '.' : '');
                          return (
                            <div key={i} onClick={() => setSelectedItemDetails(item)} style={{ display: 'flex', gap: '1rem', background: '#fff', borderRadius: '12px', padding: '0.75rem', border: '1px solid #E5E7EB', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', alignItems: 'center', minWidth: 0, cursor: 'pointer', transition: 'transform 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                              <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <h4 className="font-sans" style={{ fontSize: '1rem', fontWeight: 700, color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</h4>
                                  <span className="font-sans" style={{ fontSize: '1rem', fontWeight: 800, color: '#111', flexShrink: 0, marginLeft: '0.5rem' }}>{item.price || '£--'}</span>
                                </div>
                                <span className="font-sans" style={{ color: '#6B7280', fontSize: '0.75rem', fontWeight: 600, marginTop: '0.1rem' }}>{item.category || 'Category'}</span>
                                <p className="font-sans" style={{ fontSize: '0.75rem', margin: '0.25rem 0 0 0', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {pricePart.includes('Your price') ? (
                                    <>
                                      <span style={{ color: '#E86A58' }}>{pricePart}</span>
                                      <span style={{ color: '#9CA3AF' }}>{restPart}</span>
                                    </>
                                  ) : (
                                    <span style={{ color: '#9CA3AF' }}>{item.description || 'Detailed item performance and market positioning information goes here.'}</span>
                                  )}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedItemDetails && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 110, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '400px', maxWidth: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#fff', borderRadius: '16px', border: '1px solid #E5E7EB', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', position: 'relative' }}>
            <button onClick={() => setSelectedItemDetails(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', width: '32px', height: '32px', borderRadius: '50%', border: 'none', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="#4B5563" />
            </button>
            <img src={selectedItemDetails.image} alt={selectedItemDetails.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h3 className="font-sans" style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, color: '#111' }}>{selectedItemDetails.name}</h3>
                <span className="font-sans" style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111' }}>{selectedItemDetails.price}</span>
              </div>
              <span className="font-sans" style={{ display: 'inline-block', background: '#F3F4F6', color: '#4B5563', fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px', marginBottom: '1rem' }}>{selectedItemDetails.category || 'Category'}</span>
              {(() => {
                const parts = selectedItemDetails.description ? selectedItemDetails.description.split('. ') : [];
                const pricePart = parts[0] || '';
                const restPart = parts.length > 1 ? '. ' + parts.slice(1).join('. ') : (selectedItemDetails.description && selectedItemDetails.description.endsWith('.') && parts.length === 1 ? '.' : '');
                return (
                  <p className="font-sans" style={{ color: '#4B5563', fontSize: '0.9rem', lineHeight: 1.5, margin: 0 }}>
                    {pricePart.includes('Your price') ? (
                      <>
                        <span style={{ color: '#E86A58', fontWeight: 600 }}>{pricePart}</span>
                        <span>{restPart}</span>
                      </>
                    ) : (
                      <span>{selectedItemDetails.description || 'No detailed description available.'}</span>
                    )}
                  </p>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {/* Modal Overlay for Promos */}
      <PromoTrackerModal 
        isOpen={showPromos} 
        onClose={() => setShowPromos(false)} 
        livePromos={livePromos} 
      />
      {/* Modal Overlay for Metric Details */}
      {selectedMetric && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 100, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '400px', maxWidth: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(255,255,255,0.9)', border: '1px solid #E5E7EB' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#000', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {selectedMetric.name} 
                {selectedMetric.isWarning && <AlertTriangle size={18} color="#EF4444" />}
              </h3>
              <button onClick={() => setSelectedMetric(null)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #E5E7EB', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#f3f4f6'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>×</span>
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1, color: selectedMetric.isWarning ? '#EF4444' : '#000' }}>{selectedMetric.score}</span>
              </div>
              <p style={{ color: '#4B5563', fontSize: '1rem', lineHeight: 1.6, background: 'rgba(255,255,255,0.6)', padding: '1rem', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                {selectedMetric.details}
              </p>
              
              <button style={{ width: '100%', padding: '0.75rem', borderRadius: '9999px', background: '#000', color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
                <Sparkles size={16} /> Analyze deeply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Market Position Prompt Card */}
      <div className="glass-panel" onClick={() => setShowMarketReport(true)} style={{ padding: '1rem 1.25rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem', transition: 'all 0.2s', border: '1px solid rgba(224,80,70,0.08)' }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.borderColor = 'rgba(224,80,70,0.2)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'rgba(224,80,70,0.08)'; }}
      >
        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg, #e05046 0%, #c44035 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <BarChart3 size={16} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111' }}>You haven't benchmarked against the full market yet</p>
          <p style={{ fontSize: '0.65rem', color: '#9CA3AF' }}>See where you rank against 47 similar restaurants →</p>
        </div>
        <ChevronRight size={16} color="#D1D5DB" />
      </div>

      <MarketPositionReport isOpen={showMarketReport} onClose={() => setShowMarketReport(false)} />
      {showDeliveryShadow && <DeliveryShadowModal onClose={() => setShowDeliveryShadow(false)} />}
      {isRecommendationsModalOpen && <RecommendationsModal onClose={() => setIsRecommendationsModalOpen(false)} />}
      <CompetitorPriceModal 
        isOpen={!!selectedCompetitorForModal} 
        onClose={() => setSelectedCompetitorForModal(null)}
        competitor={selectedCompetitorForModal ? {
          name: selectedCompetitorForModal.name,
          logo: selectedCompetitorForModal.logo,
          logoColor: selectedCompetitorForModal.logoColor,
          image: selectedCompetitorForModal.image
        } : null}
        priceChanges={selectedCompetitorForModal?.changes || []}
      />
    </div>
  );
};

export default DashboardContent;
