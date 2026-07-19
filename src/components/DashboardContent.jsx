import React, { useEffect, useState } from 'react';
import { Activity, ArrowRight, AlertTriangle, Sparkles, Send, Wallet, Satellite, Megaphone, ChefHat, TrendingUp, TrendingDown, X, Eye, Clock, BarChart3, ChevronRight, AlertCircle, MapPin, Tag, Shield, Truck } from 'lucide-react';
import './DashboardContent.css';
import MarketPositionReport from './MarketPositionReport';
import AuditCommandCenterModal from './AuditCommandCenterModal';
import RestaurantHealthModal from './RestaurantHealthModal';
import DeliveryShadowModal from './DeliveryShadowModal';
import PromoTrackerModal from './PromoTrackerModal';
import CompetitorPriceModal from './CompetitorPriceModal';

import RecommendationsModal from './RecommendationsModal';
import VisibilityEngineWidget from './VisibilityEngineWidget';
import VisibilityEngineModal from './VisibilityEngineModal';
import AIGreeting from './AIGreeting';
import AICommandOverlay from './AICommandOverlay';
import { supabase } from '../supabase';
import InstantPriceAlertsWidget from './InstantPriceAlertsWidget';
import MarketStatusCard from './MarketStatusCard';
import { MapContainer, TileLayer, Polygon, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import eastLondonAreas from './east_london_areas.json';

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom, { animate: false });
    }
  }, [center, zoom, map]);
  return null;
};

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

const categoryData = {
  All: { mains: { u: 12, o: 8 }, sides: { u: 4, o: 3 }, drinks: { u: 2, o: 15 } },
  Deliveroo: { mains: { u: 4, o: 2 }, sides: { u: 1, o: 0 }, drinks: { u: 1, o: 4 } },
  UberEats: { mains: { u: 5, o: 4 }, sides: { u: 2, o: 1 }, drinks: { u: 1, o: 6 } },
  JustEat: { mains: { u: 3, o: 2 }, sides: { u: 1, o: 2 }, drinks: { u: 0, o: 5 } }
};

const AnimatedNumber = ({ value }) => {
  const [displayValue, setDisplayValue] = React.useState(value);
  
  React.useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;
    
    const duration = 400;
    const startTime = performance.now();
    
    const animate = (time) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      
      setDisplayValue(Math.round(start + (end - start) * easeOut));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    requestAnimationFrame(animate);
  }, [value, displayValue]);
  
  return displayValue;
};

const DashboardContent = () => {
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [showPromos, setShowPromos] = React.useState(false);
  const [selectedPromoDetail, setSelectedPromoDetail] = React.useState(null);
  const [selectedMetric, setSelectedMetric] = React.useState(null);
  const [showHealthModal, setShowHealthModal] = React.useState(false);
  const [dismissedAlerts, setDismissedAlerts] = React.useState([]);
  const [priceAlertFilter, setPriceAlertFilter] = React.useState('all');
  const [showMarketReport, setShowMarketReport] = React.useState(false);
  const [showDeliveryShadow, setShowDeliveryShadow] = React.useState(false);
  const [imageErrors, setImageErrors] = React.useState({});
  const [selectedCompetitorForModal, setSelectedCompetitorForModal] = React.useState(null);
  const [isAIOverlayOpen, setIsAIOverlayOpen] = React.useState(false);
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] = React.useState(false);
  const [selectedItemDetails, setSelectedItemDetails] = React.useState(null);
  const [selectedPlatformFilter, setSelectedPlatformFilter] = React.useState('Deliveroo');
  const [showVisibilityModal, setShowVisibilityModal] = React.useState(false);
  const [selectedVisibilityPlatform, setSelectedVisibilityPlatform] = React.useState('All');
  // 1. Pull the active, user-selected ID string token directly out of local storage
  const savedSessionId = localStorage.getItem('menu_iq_active_store_id');
  if (!savedSessionId) {
    console.warn("⚠️ No active session found. Routing back to find-your-restaurant portal.");
  }
  const finalSessionId = savedSessionId || "602"; // Fallback to prevent crash if accessed directly

  // Simulating Platform-Wide Scaling Matrix (Mock Session)
  const storeSessionProfileB = { 
    id: finalSessionId,
    restaurantId: finalSessionId, 
    name: "Chesters Ilford",
    estimated_delivery_time: "Est. 20 Min",
    hero_image_url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800",
    primaryArea: "Ilford", 
    areaSublabel: "Redbridge" 
  };
  const activeUserSession = storeSessionProfileB;

  // Supabase live data
  const [restaurant, setRestaurant] = useState(null);
  const [livePromos, setLivePromos] = useState([]);
  const [liveMenuItems, setLiveMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dynamic map center state
  const [mapCenter, setMapCenter] = useState([51.5588, 0.0711]); // Default to Ilford

  const [monitoredAreas, setMonitoredAreas] = useState(['Ilford']);

  useEffect(() => {
    const handleStorageUpdate = (e) => {
      if (e.detail) {
        setMonitoredAreas(e.detail);
      }
    };
    
    const stored = localStorage.getItem('menu_iq_monitored_areas');
    if (stored) {
      try {
        setMonitoredAreas(JSON.parse(stored));
      } catch (err) {}
    }

    window.addEventListener('monitoring-areas-updated', handleStorageUpdate);
    return () => window.removeEventListener('monitoring-areas-updated', handleStorageUpdate);
  }, []);

  const currentBoroughName = monitoredAreas[0] || activeUserSession?.primaryArea || 'Ilford';

  useEffect(() => {
    let isMounted = true;
    const fetchLocation = async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(currentBoroughName)},London,UK&format=json`);
        const data = await response.json();
        
        if (data && data.length > 0 && isMounted) {
          const validResult = data[0];
          if (validResult && validResult.lat && validResult.lon) {
            setMapCenter([parseFloat(validResult.lat), parseFloat(validResult.lon)]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic location from Nominatim:", err);
      }
    };
    
    fetchLocation();
    return () => { isMounted = false; };
  }, [currentBoroughName]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        console.log(`📡 Fetching profile header definitions for Restaurant ID: [${activeUserSession.restaurantId}]`);
        
        // 1. Run the Supabase query select pipeline
        const { data: restaurantData, error: restError } = await supabase
          .from('restaurants')
          .select('id, name, hero_image_url, rating, rating_count, delivery_fee, estimated_delivery_time, cuisines, areas, address, city, is_open, price_range')
          .eq('id', activeUserSession.restaurantId)
          .maybeSingle(); // .maybeSingle() is safer than .single() because it returns null instead of throwing an error if 0 rows match

        // 2. Critical Catch: If there's an explicit database network network error, step out to fallback
        if (restError) throw restError;

        let rest = restaurantData;

        // 3. Evaluation Check: If row exists, hydrate the UI layers with live database values
        if (rest) {
          console.log("✅ Row match verified. Hydrating layout with live database items:", rest.name);
          setRestaurant(rest);
        } else {
          // 4. Fallback Execution: If restaurant is null (0 rows returned), force recovery with session state
          console.warn(`⚠️ Supabase returned 0 rows for ID: [${activeUserSession.restaurantId}]. Triggering fallback recovery state...`);
          rest = {
            id: activeUserSession.restaurantId,
            name: activeUserSession.name || "Chesters Ilford",
            estimated_delivery_time: activeUserSession.estimated_delivery_time || "Est. 20 Min",
            hero_image_url: activeUserSession.hero_image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
            areas: [activeUserSession.primaryArea]
          };
          setRestaurant(rest);
        }

        // Fetch menu items for this restaurant
        const { data: allItems, error: itemsError } = await supabase
          .from('menu_items')
          .select('id, name, description, price, image_url, is_available, section_name')
          .eq('restaurant_id', rest.id);

        if (!itemsError) setLiveMenuItems(allItems || []);

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
        console.error("❌ Supabase Data Sync Interrupted:", err.message);
        // If the network request fails entirely, apply fallback values to unfreeze the UI state instantly
        setRestaurant({
          id: activeUserSession.restaurantId,
          name: activeUserSession.name || "Chesters Ilford",
          estimated_delivery_time: activeUserSession.estimated_delivery_time || "Est. 20 Min",
          hero_image_url: activeUserSession.hero_image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800',
          areas: [activeUserSession.primaryArea]
        });
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
  

  const centerLat = mapCenter[0];
  const centerLng = mapCenter[1];

  const mockCompetitors = [
    { id: 1, lat: centerLat + 0.005, lng: centerLng + 0.005, threat: 'high' },
    { id: 2, lat: centerLat - 0.008, lng: centerLng + 0.002, threat: 'medium' },
    { id: 3, lat: centerLat + 0.002, lng: centerLng - 0.006, threat: 'high' },
    { id: 4, lat: centerLat - 0.004, lng: centerLng - 0.008, threat: 'medium' },
    { id: 5, lat: centerLat + 0.008, lng: centerLng - 0.002, threat: 'medium' },
  ];


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: '3rem', width: '100%' }}>
        <div style={{ fontSize: '1.875rem', fontWeight: 700, flexShrink: 0, letterSpacing: '-0.02em', transform: 'translateY(45%)' }}>Dashboard</div>
      </div>
      
      {/* Floating AI Greeting */}
      <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 50, background: '#ffffff', padding: '0.75rem 1.25rem', borderRadius: '999px', boxShadow: '0 4px 20px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)', border: '1px solid rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.2s ease' }} className="hover:-translate-y-1 hover:shadow-lg">
        <AIGreeting onClick={() => setIsAIOverlayOpen(true)} />
      </div>
      
      <AICommandOverlay isOpen={isAIOverlayOpen} onClose={() => setIsAIOverlayOpen(false)} />
      
      {/* Master Dashboard Wrapper */}
      <div className="w-full flex flex-col gap-6">
        
        {/* TOP ROW - 12-Column Grid matching 5-3-4 red box layout */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Child 1: Restaurant Health */}
          <div className="col-span-12 md:col-span-5 dashboard-card restaurant-hero-card">
            <div className="breathing-glow rounded-2xl shadow-sm border border-[rgba(0,0,0,0.05)] transition-transform duration-300 hover:-translate-y-1" style={{ display: 'flex', overflow: 'hidden', padding: 0, height: '100%', backgroundColor: 'transparent' }}>
              {/* LEFT — Brand Identity Hero */}
              <div id="dashboard-hero-bg" className="hero-image-cover-wrapper" style={{ 
                flex: 1, 
                width: '50%',
                position: 'relative', 
                backgroundImage: `url('${restaurant?.hero_image_url || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80'}')`, 
                backgroundSize: 'cover', 
                backgroundPosition: 'center',
                minHeight: '260px',
                borderTopLeftRadius: '1rem',
                borderBottomLeftRadius: '1rem'
              }}>
              </div>

              {/* RIGHT — MenuIQ Intelligence Snapshot */}
              <div 
                className="pricing-gauge-card"
                style={{ 
                  flex: 1, 
                  width: '50%', 
                  padding: '1.75rem', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'space-between', 
                  cursor: 'pointer', 
                  borderRadius: 0, // override the rounded corners on the left side to sit flush with the image
                  borderTopRightRadius: '1rem',
                  borderBottomRightRadius: '1rem',
                  borderLeft: 'none'
                }}  
                onClick={() => setShowHealthModal(true)}

              >
                {/* Branding and Title */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontFamily: "'Lufga', sans-serif", fontSize: '15px', fontWeight: 800, color: '#e05046' }}>MenuIQ</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', marginTop: '0.15rem' }}>Intelligence</span>
                  </div>
                  <h2 className="font-bold tracking-normal" style={{ fontSize: '1.15rem', color: '#0F172A', margin: 0, lineHeight: 1.1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textTransform: 'capitalize' }}>
                    {restaurant?.name || 'Loading...'}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#64748B', marginTop: '0.35rem', fontSize: '0.7rem', fontWeight: 500 }}>
                    <MapPin size={12} />
                    {currentBoroughName || 'Ilford'}, London
                  </div>
                </div>

                {/* Score Area */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.1rem' }}>
                      <span style={{ fontSize: '2.75rem', fontWeight: 900, color: '#E86A58', letterSpacing: '-0.04em', lineHeight: 1 }}>68</span>
                      <span style={{ fontSize: '0.99rem', fontWeight: 700, color: '#94A3B8', lineHeight: 1 }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* Platform Pills Section */}
                <div style={{ display: 'flex', flexDirection: 'column', marginTop: '1rem' }}>
                  <div className="font-bold" style={{ fontSize: '0.67rem', color: '#64748b', marginBottom: '0.4rem' }}>
                    Platform Coverage:
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'nowrap', transform: 'translateY(10%)' }}>
                    <div style={{ background: '#00CCBC', padding: '0.25rem 0.6rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 1px 2px rgba(0, 204, 188, 0.2)', flexShrink: 0 }}>
                      <img src="https://cdn.simpleicons.org/deliveroo/white" alt="Deliveroo" style={{ height: '11px', width: '11px' }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Deliveroo</span>
                    </div>
                    <div style={{ background: '#06C167', padding: '0.25rem 0.6rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 1px 2px rgba(6, 193, 103, 0.2)', flexShrink: 0 }}>
                      <img src="https://cdn.simpleicons.org/ubereats/white" alt="UberEats" style={{ height: '11px', width: '11px' }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>UberEats</span>
                    </div>
                    <div style={{ background: '#FF8000', padding: '0.25rem 0.6rem', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '0.3rem', boxShadow: '0 1px 2px rgba(255, 128, 0, 0.2)', flexShrink: 0 }}>
                      <img src="https://cdn.simpleicons.org/justeat/white" alt="Just Eat" style={{ height: '11px', width: '11px' }} />
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap' }}>Just Eat</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Child 2: Promo Tracker (Combined Map & Tracker) */}
          <div className="col-span-12 md:col-span-3 flex flex-col">
            <div 
              onClick={() => setShowPromos(true)} 
              className="harmonized-card-bg w-full flex-1 rounded-[24px] flex items-stretch justify-between relative cursor-pointer group transition-transform duration-300 hover:-translate-y-1 overflow-hidden"
            >
              
              <div 
                className="flex flex-col justify-center z-20 w-[60%] shrink-0 relative pointer-events-none"
                style={{ paddingLeft: '26px', paddingRight: '0.5rem' }}
              >
                <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">
                  Competitor Promos
                </span>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-4">
                  Promo Tracker
                </h2>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-black text-[#E86A58] leading-none tracking-tighter">{promoCount}</span>
                  <div className="flex flex-col pb-1">
                    <span className="text-sm font-bold text-gray-800 leading-tight">Active</span>
                    <span className="text-xs font-semibold text-gray-400">Promotions</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-gray-400 group-hover:text-[#E86A58] transition-colors mt-6">
                  View Market Data →
                </span>
              </div>

              {/* Right Map Interface Column */}
              <div 
                className="relative w-[55%] shrink-0 -ml-[15%] z-10 pointer-events-none"
                style={{ 
                  WebkitMaskImage: 'linear-gradient(to right, transparent, black 35%)',
                  maskImage: 'linear-gradient(to right, transparent, black 35%)'
                }}
              >
                <MapContainer 
                    center={mapCenter}
                    zoom={13.5}
                    zoomControl={false}
                    dragging={false}
                    doubleClickZoom={false}
                    scrollWheelZoom={false}
                    attributionControl={false}
                    style={{ width: '100%', height: '100%', minHeight: '200px' }}
                  >
                    <MapUpdater center={mapCenter} zoom={13.5} />
                    <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                  </MapContainer>

              </div>
            </div>
          </div>

          {/* Child 3: Live Market Status */}
          <div className="col-span-12 md:col-span-4">
            <MarketStatusCard />
          </div>
        </div>

        {/* BOTTOM ROW - 12-Column Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Pricing Overview Consolidated Card */}
        <div className="col-span-12 md:col-span-5">
          <div className="pricing-gauge-card transition-transform duration-300 hover:-translate-y-1" style={{ minHeight: '280px', height: '100%', padding: 0, flexDirection: 'row' }}>
            {/* Left 60% Column */}
            <div style={{ width: '60%', padding: '1.25rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {/* Header with Filters */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid rgba(228, 226, 228, 0.6)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-0">Menu Pricing</h2>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { id: 'All', label: 'All', color: '#E86A58', iconUrl: null },
                    { id: 'Deliveroo', label: 'Deliveroo', color: '#00CCBC', iconUrl: 'https://cdn.simpleicons.org/deliveroo' },
                    { id: 'UberEats', label: 'UberEats', color: '#06C167', iconUrl: 'https://cdn.simpleicons.org/ubereats' },
                    { id: 'JustEat', label: 'Just Eat', color: '#F36D00', iconUrl: 'https://cdn.simpleicons.org/justeat' }
                  ].map(platform => {
                    const isActive = selectedPlatformFilter === platform.id;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatformFilter(platform.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: '30px',
                          width: platform.id === 'All' ? 'auto' : '38px',
                          padding: platform.id === 'All' ? '0 1rem' : '0',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          transition: 'all 0.2s',
                          background: isActive ? platform.color : '#ffffff',
                          color: isActive ? '#ffffff' : '#6B7280',
                          boxShadow: isActive ? `0 4px 12px ${platform.color}40` : '0 2px 4px rgba(0,0,0,0.02)',
                          border: isActive ? 'none' : '1px solid rgba(0,0,0,0.05)',
                          cursor: 'pointer'
                        }}
                      >
                        {platform.iconUrl && (
                          <img 
                            src={platform.iconUrl} 
                            alt={platform.label} 
                            style={{ 
                              width: '18px', 
                              height: '18px', 
                              objectFit: 'contain',
                              filter: isActive ? 'brightness(0) invert(1)' : 'grayscale(100%) opacity(50%)'
                            }} 
                          />
                        )}
                        {platform.id === 'All' && platform.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Flat Continuous Stacked Bar Centerpiece */}
              <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '1rem 0.25rem' }}>
                <div style={{ height: '1.75rem', width: '100%', display: 'flex', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'rgba(0,0,0,0.05)', position: 'relative', zIndex: 10 }}>
                  {/* Underpriced Segment (Amber) */}
                  <div style={{ height: '100%', width: '25%', backgroundColor: '#F59E0B' }}></div>
                  {/* Stable Segment (Teal) */}
                  <div style={{ height: '100%', width: '50%', backgroundColor: '#10B981' }}></div>
                  {/* Overpriced Segment (Red) */}
                  <div style={{ height: '100%', width: '25%', backgroundColor: '#FF5E3A' }}></div>
                </div>
                
                {/* Value markers above the gauge for visual context */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 1.25rem', marginTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#F59E0B' }}>25%</span>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981', textAlign: 'center', flexGrow: 1 }}>50%</span>
                  <span className="animate-text-pulse" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#FF5E3A' }}>25%</span>
                </div>
              </div>
              
              {/* Metrics Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingTop: '1rem', borderTop: '1px solid rgba(228, 226, 228, 0.6)', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                {/* Underpriced Metric */}
                <div 
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '0.5rem', transition: 'background-color 0.2s', flex: 1 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setSelectedCard({
                    title: 'Underpriced Items',
                    color: '#E86A58',
                    items: [
                      { name: 'Vegan Wrap', category: 'Wraps', price: '£5.50', image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £6.80. (£1.30 below market)', platform: 'Uber Eats' },
                      { name: 'Avocado Toast', category: 'Breakfast', price: '£6.00', image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £7.50. (£1.50 below market)', platform: 'Uber Eats' },
                      { name: 'Milkshake', category: 'Drinks', price: '£3.20', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £4.00. (£0.80 below market)', platform: 'JustEat' }
                    ]
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#F59E0B', boxShadow: '0 0 8px rgba(245,158,11,0.4)', flexShrink: 0 }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Underpriced</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '0.875rem', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', lineHeight: '1' }}>142</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', marginTop: '2px' }}>items</span>
                  </div>
                </div>
                
                {/* Stable Metric */}
                <div 
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '0.5rem', transition: 'background-color 0.2s', flex: 1 }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(16,185,129,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  onClick={() => setSelectedCard({
                    title: 'Stable Items',
                    color: '#10B981',
                    items: [
                      { name: 'Classic Cheeseburger', category: 'Mains', price: '£9.50', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £9.50. (Matches market perfectly)', platform: 'Uber Eats' }
                    ]
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#10B981', boxShadow: '0 0 8px rgba(16,185,129,0.4)', flexShrink: 0 }}></div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>Stable</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '0.875rem', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', lineHeight: '1' }}>284</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', marginTop: '2px' }}>items</span>
                  </div>
                </div>
                
                {/* Overpriced Metric (Pulsing) */}
                <div 
                  className="animate-text-pulse" 
                  style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', padding: '0.5rem', margin: '-0.5rem', borderRadius: '0.5rem', transition: 'background-color 0.2s', flex: 1 }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255,94,58,0.05)'; e.currentTarget.style.animationPlayState = 'paused'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.animationPlayState = 'running'; }}
                  onClick={() => setSelectedCard({
                    title: 'Above Market Average',
                    color: '#FF5E3A',
                    items: [
                      { name: 'Margherita Pizza', category: 'Mains', price: '£15.00', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £13.50. (£1.50 above market)', platform: 'Uber Eats' },
                      { name: 'Cola Zero', category: 'Drinks', price: '£2.50', image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=120&q=80', description: 'Market Average: £2.00. (£0.50 above market)', platform: 'Deliveroo' }
                    ]
                  })}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
                    <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '9999px', backgroundColor: '#ff5e3a', boxShadow: '0 0 8px rgba(255,94,58,0.5)', flexShrink: 0 }}></div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>Overpriced</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', paddingLeft: '0.875rem', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111', lineHeight: '1' }}>142</span>
                    <span style={{ fontSize: '11px', fontWeight: 500, color: '#9CA3AF', marginTop: '2px' }}>items</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 40% Column - Category Breakdown */}
            <div style={{ width: '40%', padding: '1.5rem', borderLeft: '1px solid rgba(228, 226, 228, 0.6)', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.25rem' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>Category Breakdown</div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '0.75rem', alignItems: 'center', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                {/* Column Headers */}
                <div></div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.08em' }}>Under</div>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.08em' }}>Over</div>
                
                {/* Mains */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>Mains</div>
                
                {/* Underpriced Column */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                  background: 'rgba(245,158,11,0.1)', padding: '4px 0', borderRadius: '12px',
                  minWidth: '42px', opacity: categoryData[selectedPlatformFilter]?.mains.u === 0 ? 0.3 : 1
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', lineHeight: 1 }}>
                    <AnimatedNumber value={categoryData[selectedPlatformFilter]?.mains.u ?? 0} />
                  </span>
                </div>
                
                {/* Overpriced Column */}
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                  background: 'rgba(255,94,58,0.1)', padding: '4px 0', borderRadius: '12px',
                  minWidth: '42px', opacity: categoryData[selectedPlatformFilter]?.mains.o === 0 ? 0.3 : 1
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5E3A', lineHeight: 1 }}>
                    <AnimatedNumber value={categoryData[selectedPlatformFilter]?.mains.o ?? 0} />
                  </span>
                </div>

                {/* Sides */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>Sides</div>
                
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                  background: 'rgba(245,158,11,0.1)', padding: '4px 0', borderRadius: '12px',
                  minWidth: '42px', opacity: categoryData[selectedPlatformFilter]?.sides.u === 0 ? 0.3 : 1
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', lineHeight: 1 }}>
                    <AnimatedNumber value={categoryData[selectedPlatformFilter]?.sides.u ?? 0} />
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                  background: 'rgba(255,94,58,0.1)', padding: '4px 0', borderRadius: '12px',
                  minWidth: '42px', opacity: categoryData[selectedPlatformFilter]?.sides.o === 0 ? 0.3 : 1
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5E3A', lineHeight: 1 }}>
                    <AnimatedNumber value={categoryData[selectedPlatformFilter]?.sides.o ?? 0} />
                  </span>
                </div>

                {/* Drinks */}
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111' }}>Drinks</div>
                
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                  background: 'rgba(245,158,11,0.1)', padding: '4px 0', borderRadius: '12px',
                  minWidth: '42px', opacity: categoryData[selectedPlatformFilter]?.drinks.u === 0 ? 0.3 : 1
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#F59E0B', lineHeight: 1 }}>
                    <AnimatedNumber value={categoryData[selectedPlatformFilter]?.drinks.u ?? 0} />
                  </span>
                </div>
                
                <div style={{ 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', 
                  background: 'rgba(255,94,58,0.1)', padding: '4px 0', borderRadius: '12px',
                  minWidth: '42px', opacity: categoryData[selectedPlatformFilter]?.drinks.o === 0 ? 0.3 : 1
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#FF5E3A', lineHeight: 1 }}>
                    <AnimatedNumber value={categoryData[selectedPlatformFilter]?.drinks.o ?? 0} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
 
        {/* Visibility Engine Widget (Moved to Row 2) */}
        <div className="col-span-12 md:col-span-3">
          <div style={{ height: '280px', overflow: 'hidden' }}>
            <VisibilityEngineWidget 
              onPlatformClick={(platform) => { 
                setSelectedVisibilityPlatform(platform); 
                setShowVisibilityModal(true); 
              }} 
            />
          </div>
        </div>

        {/* Price Change Alerts (Grouped by Competitor) - Moved to Red Box */}
        <div className="col-span-12 md:col-span-4" style={{ display: 'flex', flexDirection: 'column' }}>
          <InstantPriceAlertsWidget />
        </div>
      </div>


      </div>
      {/* End Master Dashboard Wrapper */}


      {/* Modal Overlay for "Pricing Overview" Drill-down */}
      {selectedCard && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999, background: 'rgba(255,255,255,0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel modal-content" style={{ width: '1200px', maxWidth: '95%', height: '80vh', padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', background: 'rgba(250,248,244,0.95)', border: '1px solid #E5E7EB', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: selectedCard.color || '#000', margin: 0, display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: selectedCard.color || '#000' }}></span>
                  {selectedCard.title}
                </h3>
              </div>
              
              {/* Contextual Filtering (Platform Toggle Inheriting State) */}
              <div style={{ display: 'flex', justifyContent: 'center', flex: 1 }}>
                <div style={{ display: 'flex', gap: '0.25rem', background: '#fff', padding: '0.25rem', borderRadius: '9999px', border: '1px solid #E5E7EB' }}>
                  {[
                    { id: 'All', label: 'All', color: '#E86A58', iconUrl: null },
                    { id: 'Deliveroo', label: 'Deliveroo', color: '#00CCBC', iconUrl: 'https://cdn.simpleicons.org/deliveroo' },
                    { id: 'UberEats', label: 'UberEats', color: '#06C167', iconUrl: 'https://cdn.simpleicons.org/ubereats' },
                    { id: 'JustEat', label: 'Just Eat', color: '#F36D00', iconUrl: 'https://cdn.simpleicons.org/justeat' }
                  ].map(platform => {
                    const isActive = selectedPlatformFilter === platform.id;
                    return (
                      <button
                        key={platform.id}
                        onClick={() => setSelectedPlatformFilter(platform.id)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          height: '24px', width: platform.id === 'All' ? 'auto' : '28px',
                          padding: platform.id === 'All' ? '0 0.75rem' : '0',
                          borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 700,
                          transition: 'all 0.2s',
                          background: isActive ? platform.color : '#ffffff',
                          color: isActive ? '#ffffff' : '#6B7280',
                          border: 'none', cursor: 'pointer'
                        }}
                      >
                        {platform.iconUrl && (
                          <img 
                            src={platform.iconUrl} 
                            alt={platform.label} 
                            style={{ 
                              width: '14px', height: '14px', objectFit: 'contain',
                              filter: isActive ? 'brightness(0) invert(1)' : 'grayscale(100%) opacity(50%)'
                            }} 
                          />
                        )}
                        {platform.id === 'All' && platform.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', flex: 1 }}>
                <button onClick={() => setSelectedCard(null)} style={{ width: '36px', height: '36px', borderRadius: '50%', border: '1px solid #E5E7EB', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s, transform 0.2s' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'scale(1)'; }}>
                  <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>×</span>
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '2rem', flex: 1, minHeight: 0, overflow: 'hidden' }}>
              {['Mains', 'Sides', 'Drinks'].map(category => {
                const categoryItems = selectedCard.items.filter(i => {
                  const matchCategory = i.category === category;
                  const matchPlatform = selectedPlatformFilter === 'All' ? true : (i.platform === selectedPlatformFilter || i.platform.replace(' ', '') === selectedPlatformFilter);
                  return matchCategory && matchPlatform;
                });
                
                return (
                  <div key={category} style={{ display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', borderBottom: '2px solid #E5E7EB', paddingBottom: '0.75rem', marginBottom: '1rem' }}>
                      <h4 className="font-sans" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#374151', margin: 0, fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{category}</h4>
                      <div style={{ background: 'rgba(0,0,0,0.05)', color: '#6B7280', fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                        {categoryItems.length}
                      </div>
                    </div>
                    
                    <div className="custom-scrollbar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                      {categoryItems.length === 0 ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9CA3AF', fontSize: '0.9rem', opacity: 0.6, fontWeight: 500, paddingBottom: '2rem', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                          [ • 0 items ]
                        </div>
                      ) : (
                        categoryItems.map((item, i) => {
                          let varianceText = item.description || '';
                          if (varianceText.includes('below market')) {
                            varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (', ' | ↓ ').replace(' below market)', '');
                          } else if (varianceText.includes('above market')) {
                            varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (', ' | ↑ ').replace(' above market)', '');
                          } else if (varianceText.includes('Matches market perfectly')) {
                            varianceText = varianceText.replace('Market Average: ', 'Market Avg: ').replace('. (Matches market perfectly)', ' | =');
                          }
                          
                          const platformKey = item.platform === 'Just Eat' || item.platform === 'JustEat' ? 'justeat' : item.platform.toLowerCase().replace(' ', '');
                          
                          return (
                            <div key={i} onClick={() => setSelectedItemDetails(item)} style={{ display: 'flex', gap: '1rem', background: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', borderRadius: '12px', padding: '0.75rem', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: '0 4px 6px rgba(0,0,0,0.02)', alignItems: 'center', minWidth: 0, cursor: 'pointer', transition: 'transform 0.1s' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                              <img src={item.image} alt={item.name} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} />
                              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', overflow: 'hidden' }}>
                                    <img src={`https://cdn.simpleicons.org/${platformKey}/9CA3AF`} alt={item.platform} style={{ width: '12px', height: '12px', flexShrink: 0 }} />
                                    <h4 className="font-sans" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{item.name}</h4>
                                  </div>
                                  <span className="font-sans" style={{ fontSize: '0.95rem', fontWeight: 400, color: '#374151', flexShrink: 0, marginLeft: '0.5rem', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>{item.price || '£--'}</span>
                                </div>
                                <p className="font-sans" style={{ color: '#6B7280', fontSize: '0.75rem', margin: '0.25rem 0 0 0', lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}>
                                  {varianceText}
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
        <AuditCommandCenterModal 
          activeItem={selectedItemDetails} 
          initialPlatform={selectedItemDetails.platform ? selectedItemDetails.platform.toLowerCase().replace(/\s+/g, '') : 'deliveroo'} 
          onClose={() => setSelectedItemDetails(null)} 
        />
      )}

      {/* Restaurant Health Detailed Modal */}
      <RestaurantHealthModal 
        isOpen={showHealthModal} 
        onClose={() => setShowHealthModal(false)} 
        restaurant={restaurant}
      />

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

      {/* Visibility Engine Modal */}
      <VisibilityEngineModal 
        isOpen={showVisibilityModal} 
        onClose={() => setShowVisibilityModal(false)} 
        initialPlatform={selectedVisibilityPlatform} 
      />

    </div>
  );
};

export default DashboardContent;
