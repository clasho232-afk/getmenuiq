import React, { useState, useEffect, useRef } from 'react';
import { Target, MapPin, SlidersHorizontal, ChevronDown, ChevronUp, X, Sparkles, Search, Tag, Copy, Truck, Banknote, Gift, Filter } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, CircleMarker, ZoomControl, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import eastLondonAreas from './east_london_areas.json';
import RestaurantProfileModal from './RestaurantProfileModal';

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
  const level = total <= 25 ? 'LOW' : total <= 60 ? 'MEDIUM' : 'HIGH';

  return { total, level, volumeScore, aggressivenessScore, itemOverlapScore, count: pp.length, topPromo };
}

const STATE_MATRIX = {
  QUIET_LOW: { action: 'LIGHT', promoType: 'Free Delivery or 10% off', strategy: 'Low platform traffic. A small promo boosts visibility efficiently.' },
  QUIET_MEDIUM: { action: 'COUNTER', promoType: 'Free Item add-on', strategy: 'Competitors active during quiet hours. Match their energy.' },
  QUIET_HIGH: { action: 'COUNTER', promoType: '15-20% off hero items', strategy: 'Aggressive competitor push. Counter immediately before losing lunch.' },
  BUSY_LOW: { action: 'HOLD', promoType: 'None', strategy: 'Organic demand is high. No threat detected.' },
  BUSY_MEDIUM: { action: 'LIGHT', promoType: 'Free Delivery only', strategy: 'Some competition. Low-cost visibility play recommended.' },
  BUSY_HIGH: { action: 'COUNTER', promoType: 'Free Item or Spend & Save', strategy: 'Losing orders during peak. Counter with value, not heavy discount.' },
  HYPER_LOW: { action: 'HOLD', promoType: 'None', strategy: 'Maximum platform traffic. Best organic window.' },
  HYPER_MEDIUM: { action: 'LIGHT', promoType: 'Free Delivery', strategy: 'Peak hour competition. Stay visible cheaply on this platform.' },
  HYPER_HIGH: { action: 'MATCH', promoType: 'Match within 5%', strategy: 'Peak hour promo war. High direct item overlap detected.' },
};

function getStateOutput(time, threat) {
  if (time === 'OFF') return { action: 'HOLD', promoType: 'None', strategy: 'Platform activity near zero.' };
  return STATE_MATRIX[`${time}_${threat}`] || STATE_MATRIX['BUSY_LOW'];
}

function runIntel(promos) {
  const time = getTimeVariable();
  const platforms = [
    { key: 'ubereats',  label: 'UBEREATS' },
    { key: 'deliveroo', label: 'DELIVEROO' },
    { key: 'justeats',  label: 'JUSTEATS' },
  ];
  const ACTION_PRIORITY = { MATCH: 4, COUNTER: 3, LIGHT: 2, HOLD: 1 };
  
  const results = platforms.map(plt => {
    const td = getThreatData(promos, plt.key);
    const output = getStateOutput(time, td.level);
    return { ...plt, time, threatData: td, output };
  });
  
  const sorted = [...results].sort(
    (a, b) => (ACTION_PRIORITY[b.output.action] || 0) - (ACTION_PRIORITY[a.output.action] || 0)
  );
  
  return { time, results, topResult: sorted[0] };
}

function getSinglePromoThreatScore(promo) {
  let score = 0;
  score += AG_SCORES[promo.promoCategory] || AG_SCORES[promo.type] || 6;
  score += OL_SCORES[promo.itemOverlapLevel] || 15;
  return Math.min(score, 100);
}

const MapController = ({ center, zoom, selectedPromo }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedPromo) {
      const current = map.getCenter();
      const isAlreadyCentered = Math.abs(current.lat - selectedPromo.lat) < 0.0001 && Math.abs(current.lng - selectedPromo.lng) < 0.0001;
      if (!isAlreadyCentered) {
        map.flyTo([selectedPromo.lat, selectedPromo.lng], 16, { duration: 1.2 });
      }
    } else if (center) {
      const current = map.getCenter();
      const isAlreadyCentered = Math.abs(current.lat - center[0]) < 0.0001 && Math.abs(current.lng - center[1]) < 0.0001;
      if (!isAlreadyCentered) {
        map.flyTo(center, zoom, { duration: 1.2 });
      }
    }
  }, [center, zoom, selectedPromo, map]);
  return null;
};

// ================================================================
// COMPONENT
// ================================================================

const PromoTrackerModal = ({ isOpen, onClose }) => {
  const [intelPlatforms, setIntelPlatforms] = useState(['all']);
  const [promoTypeFilter, setPromoTypeFilter] = useState(['all']);
  const [searchQuery, setSearchQuery] = useState('');
  const [areaFilter, setAreaFilter] = useState('ilford');
  const [sortBy, setSortBy] = useState('threat_desc');
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [profileModalPromo, setProfileModalPromo] = useState(null);
  const [showPlatformFilter, setShowPlatformFilter] = useState(false);
  const [expandedRestaurants, setExpandedRestaurants] = useState({});
  const filterDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowPlatformFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const staticPromos = [
    {
      id: 1, lat: 51.560, lng: 0.081,
      restaurant: "Domino's Ilford", promo: '25% off selected pizzas',
      type: 'Discount', active: 'Active',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90',
      platform: 'deliveroo', location: 'ilford', itemOverlapLevel: 'direct_match_promo', overlapContext: 'Margherita, Pepperoni',
    },
    {
      id: 2, lat: 51.520, lng: 0.060,
      restaurant: 'Pizza Palace Barking', promo: 'Buy 1 Get 1 Free',
      type: 'BOGO', active: 'Active',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=90',
      platform: 'deliveroo', location: 'neighborhood', itemOverlapLevel: 'direct_match', overlapContext: 'Cheese Pizza',
    },
    {
      id: 3, lat: 51.550, lng: 0.088,
      restaurant: 'Al-Amin Pizza', promo: 'Free Delivery',
      type: 'Delivery', active: 'Active',
      image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=90',
      platform: 'justeats', location: 'ilford', itemOverlapLevel: 'same_cuisine', overlapContext: 'Pizza, Italian',
    },
    {
      id: 4, lat: 51.554, lng: 0.076,
      restaurant: 'Fire Crust', promo: 'Spend £20 Save £5',
      type: 'Threshold', active: 'Active',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=90',
      platform: 'deliveroo', location: 'ilford', itemOverlapLevel: 'same_cuisine', overlapContext: 'Pizza',
    },
    {
      id: 5, lat: 51.558, lng: 0.072,
      restaurant: 'Burger Boss Ilford', promo: '20% off entire menu',
      type: 'Discount', active: 'Active',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=90',
      platform: 'ubereats', location: 'ilford', itemOverlapLevel: 'none', overlapContext: 'Burgers',
    },
    {
      id: 6, lat: 51.562, lng: 0.085,
      restaurant: 'Wok Master', promo: 'Free Spring Rolls',
      type: 'Free Item', active: 'Active',
      image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=90',
      platform: 'justeats', location: 'ilford', itemOverlapLevel: 'same_broad_category', overlapContext: 'Asian',
    },
    {
      id: 7, lat: 51.530, lng: 0.070,
      restaurant: 'Gourmet Burger Kitchen', promo: '20% off over £20',
      type: 'Threshold', active: 'Active',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=90',
      platform: 'ubereats', location: 'neighborhood', itemOverlapLevel: 'none', overlapContext: 'Burgers',
    },
    {
      id: 8, lat: 51.535, lng: 0.075,
      restaurant: 'Chicken Stop Barking', promo: 'Free Fries with Meal',
      type: 'Free Item', active: 'Active',
      image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=90',
      platform: 'justeats', location: 'neighborhood', itemOverlapLevel: 'same_cuisine', overlapContext: 'Chicken',
    },
    { id: 9, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Free Garlic Bread', type: 'Free Item', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'ubereats', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'Sides' },
    { id: 10, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Spend £30 get £10 off', type: 'Threshold', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'justeats', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'Pizzas' },
    { id: 11, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Free Delivery over £15', type: 'Delivery', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'All' },
    { id: 12, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Buy 1 Get 1 Free Large Pizza', type: 'BOGO', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'ubereats', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'Pizzas' },
    { id: 13, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: '15% off Pick-up', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'justeats', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'All' },
    { id: 14, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Free drink with meal', type: 'Free Item', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'Drinks' },
    { id: 15, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: '£5 off your first order', type: 'Threshold', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'ubereats', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'All' },
    { id: 16, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'BOGO Medium Pizzas', type: 'BOGO', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'justeats', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'Pizzas' },
    { id: 17, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: '10% off Student Discount', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo', location: 'ilford', itemOverlapLevel: 'direct_match', overlapContext: 'All' },
  ];

  const intelData = runIntel(staticPromos);
  
  useEffect(() => {
    // Top result auto-select is no longer strictly necessary with 'all' default, but left intact for other logic if needed.
  }, []);

  const handlePlatformClick = (key) => {
    if (key === 'all') {
      setIntelPlatforms(['all']);
    } else {
      let next = [...intelPlatforms];
      if (next.includes('all')) {
        next = [key];
      } else if (next.includes(key)) {
        next = next.filter(k => k !== key);
        if (next.length === 0) next = ['all'];
      } else {
        next.push(key);
      }
      setIntelPlatforms(next);
    }
    setSelectedPromo(null);
  };

  const handlePromoTypeClick = (type) => {
    if (type === 'all') {
      setPromoTypeFilter(['all']);
    } else {
      let next = [...promoTypeFilter];
      if (next.includes('all')) {
        next = [type];
      } else if (next.includes(type)) {
        next = next.filter(k => k !== type);
        if (next.length === 0) next = ['all'];
      } else {
        next.push(type);
      }
      setPromoTypeFilter(next);
    }
    setSelectedPromo(null);
  };

  const handleAreaClick = (area) => {
    setAreaFilter(area);
    setSelectedPromo(null);
  };

  let displayFeed = staticPromos.filter(p => {
    const matchPlatform = intelPlatforms.includes('all') ? true : intelPlatforms.includes(p.platform);
    const matchArea = areaFilter === 'all' ? true : p.location === areaFilter;
    const matchType = promoTypeFilter.includes('all') ? true : promoTypeFilter.includes(p.type);
    
    let matchSearch = true;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      matchSearch = p.restaurant.toLowerCase().includes(q) || 
                    p.promo.toLowerCase().includes(q) || 
                    p.overlapContext.toLowerCase().includes(q) ||
                    p.type.toLowerCase().includes(q);
    }
    
    return matchPlatform && matchArea && matchType && matchSearch;
  });

  displayFeed = displayFeed.sort((a, b) => {
    if (sortBy === 'threat_desc') {
      return getSinglePromoThreatScore(b) - getSinglePromoThreatScore(a);
    }
    return 0;
  });

  // Calculate Map Center based on selected area
  const centerLat = areaFilter === 'ilford' ? 51.5588 : 51.5371;
  const centerLng = areaFilter === 'ilford' ? 0.0711 : 0.0710;
  const mapCenter = [centerLat, centerLng];

  if (!isOpen) return null;

  return (
    <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' 
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ 
        width: '1100px', maxWidth: '95vw', height: '700px', maxHeight: '90vh', 
        background: '#FCFAF6', borderRadius: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', 
        display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' 
      }}>
        
        <div style={{ width: '60%', height: '100%', position: 'relative', background: '#E5E7EB' }}>
          <MapContainer 
            center={mapCenter}
            zoom={13.5}
            zoomControl={false}
            scrollWheelZoom={true}
            style={{ width: '100%', height: '100%' }}
          >
            <MapController center={mapCenter} zoom={13.5} selectedPromo={selectedPromo} />
            <ZoomControl position="bottomright" />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            
            {(() => {
              const groupedMarkers = displayFeed.reduce((acc, promo) => {
                if (!acc[promo.restaurant]) {
                  acc[promo.restaurant] = {
                    restaurant: promo.restaurant,
                    lat: promo.lat,
                    lng: promo.lng,
                    image: promo.image,
                    platform: promo.platform,
                    promos: []
                  };
                }
                acc[promo.restaurant].promos.push(promo);
                return acc;
              }, {});

              return Object.values(groupedMarkers).map((group) => {
                const PLATFORM_COLORS = {
                  ubereats: '#06C167',
                  deliveroo: '#00CCBC',
                  justeats: '#F36D00',
                  justeat: '#F36D00'
                };
                const color = PLATFORM_COLORS[group.platform.toLowerCase()] || '#E63946';
                const isSelected = selectedPromo && group.promos.some(p => p.id === selectedPromo.id);
                
                return (
                  <CircleMarker 
                    key={group.restaurant}
                    center={[group.lat, group.lng]}
                    radius={isSelected ? 10 : 8}
                    pathOptions={{ color: color, fillColor: color, fillOpacity: 1, weight: isSelected ? 3 : 2, className: isSelected ? 'modal-pulse-marker-active' : 'modal-pulse-marker' }}
                    eventHandlers={{
                      click: () => {
                        setSelectedPromo(group.promos[0]);
                        if (group.promos.length > 1) {
                          setExpandedRestaurants(prev => ({ ...prev, [group.restaurant]: true }));
                        }
                      }
                    }}
                  >
                    {isSelected && (
                      <Tooltip permanent interactive={true} direction="top" offset={[0, -12]} className="custom-map-tooltip">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileModalPromo({ ...group.promos[0], promos: group.promos });
                          }}
                          style={{ display: 'flex', flexDirection: 'column', width: '140px', overflow: 'hidden', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <img src={group.image} style={{ width: '100%', height: '70px', objectFit: 'cover' }} alt={group.restaurant} />
                          <div style={{ padding: '8px 6px', textAlign: 'center', background: '#FFF' }}>
                            <div style={{ fontWeight: 600, fontSize: '13px', color: '#111', fontFamily: "'Lufga', sans-serif", lineHeight: '1.3' }}>{group.restaurant}</div>
                            {group.promos.length > 1 && (
                              <div style={{ fontSize: '10px', color: '#E05046', fontWeight: 600, marginTop: '2px' }}>{group.promos.length} Promos</div>
                            )}
                          </div>
                        </div>
                      </Tooltip>
                    )}
                  </CircleMarker>
                );
              });
            })()}
          </MapContainer>

          <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, pointerEvents: 'none' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 700, 
              color: '#111', 
              margin: 0, 
              textShadow: '0 2px 10px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,1), 0 4px 20px rgba(255,255,255,0.8)'
            }}>
              Active Promos Map
            </h2>
          </div>

          <div style={{ 
            position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', 
            zIndex: 1000, display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.85)', 
            backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', padding: '6px', borderRadius: '14px', 
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.5)' 
          }}>
            <button onClick={() => handleAreaClick('ilford')} style={{ padding: '8px 20px', borderRadius: '10px', background: areaFilter === 'ilford' ? '#111' : 'transparent', border: 'none', fontSize: '13px', fontWeight: 600, color: areaFilter === 'ilford' ? '#FFF' : '#4B5563', cursor: 'pointer', transition: 'all 0.2s' }}>
              Ilford
            </button>
            <button onClick={() => handleAreaClick('neighborhood')} style={{ padding: '8px 20px', borderRadius: '10px', background: areaFilter === 'neighborhood' ? '#111' : 'transparent', border: 'none', fontSize: '13px', fontWeight: 600, color: areaFilter === 'neighborhood' ? '#FFF' : '#4B5563', cursor: 'pointer', transition: 'all 0.2s' }}>
              Neighborhood
            </button>
          </div>
        </div>

        <div style={{ width: '40%', height: '100%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '-10px 0 30px rgba(0,0,0,0.03)', zIndex: 20 }}>
          
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 30 }}>
            <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
              <X size={18} color="#4B5563" />
            </button>
          </div>

          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Promo Activity Feed
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#6B7280', background: '#F3F4F6', padding: '2px 8px', borderRadius: '999px' }}>
                  {displayFeed.length} {displayFeed.length === 1 ? 'result' : 'results'}
                </span>
              </h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} color="#6B7280" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                <input 
                  type="text" 
                  placeholder="Search promos, food..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '13px', outline: 'none', background: '#FAFAFA', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ position: 'relative' }} ref={filterDropdownRef}>
                <button 
                  onClick={() => setShowPlatformFilter(!showPlatformFilter)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#FFFFFF', border: '1px solid #E5E7EB', padding: '8px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 500, color: '#111', cursor: 'pointer', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                >
                  <SlidersHorizontal size={14} />
                  Filter
                </button>
                {showPlatformFilter && (
                  <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', background: '#FFF', border: '1px solid #E5E7EB', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px', width: 'max-content', minWidth: '180px', maxHeight: '400px', overflowY: 'auto' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>Platforms</div>
                    <button onClick={() => { handlePlatformClick('all'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: intelPlatforms.includes('all') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>All Platforms</span>
                    </button>
                    <button onClick={() => { handlePlatformClick('ubereats'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: intelPlatforms.includes('ubereats') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <img src="https://cdn.simpleicons.org/ubereats/06C167" alt="UberEats" style={{ width: '16px', height: '16px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>UberEats</span>
                    </button>
                    <button onClick={() => { handlePlatformClick('deliveroo'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: intelPlatforms.includes('deliveroo') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <img src="https://cdn.simpleicons.org/deliveroo/00CCBC" alt="Deliveroo" style={{ width: '16px', height: '16px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Deliveroo</span>
                    </button>
                    <button onClick={() => { handlePlatformClick('justeats'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: intelPlatforms.includes('justeats') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <img src="https://cdn.simpleicons.org/justeat/FF8000" alt="Just Eat" style={{ width: '16px', height: '16px' }} />
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#111' }}>Just Eat</span>
                    </button>

                    <div style={{ height: '1px', background: '#E5E7EB', margin: '4px 0' }}></div>

                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', padding: '4px 8px', letterSpacing: '0.5px' }}>Promo Types</div>
                    <button onClick={() => { handlePromoTypeClick('all'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: promoTypeFilter.includes('all') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <Filter size={14} color="#4B5563" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>All Types</span>
                    </button>
                    <button onClick={() => { handlePromoTypeClick('Discount'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: promoTypeFilter.includes('Discount') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <Tag size={14} color="#4B5563" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>Discount (e.g. 10% off)</span>
                    </button>
                    <button onClick={() => { handlePromoTypeClick('BOGO'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: promoTypeFilter.includes('BOGO') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <Copy size={14} color="#4B5563" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>BOGO (Buy 1 Get 1)</span>
                    </button>
                    <button onClick={() => { handlePromoTypeClick('Delivery'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: promoTypeFilter.includes('Delivery') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <Truck size={14} color="#4B5563" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>Free Delivery</span>
                    </button>
                    <button onClick={() => { handlePromoTypeClick('Threshold'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: promoTypeFilter.includes('Threshold') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <Banknote size={14} color="#4B5563" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>Threshold (Spend £X)</span>
                    </button>
                    <button onClick={() => { handlePromoTypeClick('Free Item'); }} style={{ padding: '8px 12px', borderRadius: '8px', background: promoTypeFilter.includes('Free Item') ? '#F3F4F6' : 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', width: '100%', justifyContent: 'flex-start' }}>
                      <Gift size={14} color="#4B5563" />
                      <span style={{ fontSize: '12px', fontWeight: 500, color: '#111', whiteSpace: 'nowrap' }}>Free Item</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="invisible-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: '#FCFAF6' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(() => {
                const groupedFeed = displayFeed.reduce((acc, promo) => {
                  if (!acc[promo.restaurant]) {
                    acc[promo.restaurant] = {
                      restaurant: promo.restaurant,
                      image: promo.image,
                      promos: []
                    };
                  }
                  acc[promo.restaurant].promos.push(promo);
                  return acc;
                }, {});

                return Object.values(groupedFeed).map((group) => {
                  const isExpanded = expandedRestaurants[group.restaurant];
                  const hasMultiple = group.promos.length > 1;

                  return (
                    <div key={group.restaurant} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div 
                        onClick={() => {
                          if (hasMultiple) {
                            setExpandedRestaurants(prev => ({ ...prev, [group.restaurant]: !prev[group.restaurant] }));
                          } else {
                            setSelectedPromo(group.promos[0]);
                          }
                        }}
                        style={{ 
                          background: (!hasMultiple && selectedPromo?.id === group.promos[0].id) ? 'rgba(224, 80, 70, 0.05)' : '#FFFFFF', 
                          border: (!hasMultiple && selectedPromo?.id === group.promos[0].id) ? '1px solid rgba(224, 80, 70, 0.3)' : 'none', 
                          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                          borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', 
                          justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                          cursor: 'pointer', transition: 'all 0.2s',
                          transform: (!hasMultiple && selectedPromo?.id === group.promos[0].id) ? 'translateY(-2px)' : 'none'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img src={group.image} alt={group.restaurant} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#111' }}>{group.restaurant}</span>
                              {hasMultiple && (
                                <span style={{ background: '#E05046', color: '#FFF', fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '99px' }}>{group.promos.length} Promos</span>
                              )}
                            </div>
                            {!hasMultiple ? (
                              <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 400 }}>{group.promos[0].promo}</span>
                            ) : (
                              <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 400 }}>Multiple active offers detected</span>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {!hasMultiple ? (
                            <>
                              <img src={`https://cdn.simpleicons.org/${group.promos[0].platform === 'ubereats' ? 'ubereats/06C167' : group.promos[0].platform === 'deliveroo' ? 'deliveroo/00CCBC' : 'justeat/FF8000'}`} alt={group.promos[0].platform} style={{ width: '16px', height: '16px' }} />
                              <div style={{ width: '76px', display: 'flex', justifyContent: 'flex-end' }}>
                                <span style={{ background: 'rgba(224, 80, 70, 0.08)', color: '#E05046', border: '1px solid rgba(224, 80, 70, 0.2)', fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{group.promos[0].type}</span>
                              </div>
                            </>
                          ) : (
                            isExpanded ? <ChevronUp size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />
                          )}
                        </div>
                      </div>

                      {hasMultiple && isExpanded && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px', marginBottom: '8px' }}>
                          {group.promos.map((promo) => {
                            const isSelected = selectedPromo?.id === promo.id;
                            return (
                              <div 
                                key={promo.id} 
                                onClick={() => setSelectedPromo(promo)}
                                style={{ 
                                  background: isSelected ? 'rgba(224, 80, 70, 0.05)' : '#FFFFFF', 
                                  border: isSelected ? '1px solid rgba(224, 80, 70, 0.3)' : 'none', 
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                                  borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', 
                                  justifyContent: 'space-between', cursor: 'pointer', transition: 'all 0.2s',
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img src={promo.image} alt="Promo" style={{ width: '28px', height: '28px', borderRadius: '6px', objectFit: 'cover' }} />
                                  <span style={{ fontSize: '13px', color: '#111', fontWeight: 500 }}>{promo.promo}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                  <img src={`https://cdn.simpleicons.org/${promo.platform === 'ubereats' ? 'ubereats/06C167' : promo.platform === 'deliveroo' ? 'deliveroo/00CCBC' : 'justeat/FF8000'}`} alt={promo.platform} style={{ width: '14px', height: '14px' }} />
                                  <div style={{ width: '76px', display: 'flex', justifyContent: 'flex-end' }}>
                                    <span style={{ background: 'rgba(224, 80, 70, 0.08)', color: '#E05046', border: '1px solid rgba(224, 80, 70, 0.2)', fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '6px', whiteSpace: 'nowrap' }}>{promo.type}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
        
        <style>{`
          .dashboard-mini-map-polygon {
            filter: drop-shadow(0px 1px 2px rgba(40, 167, 69, 0.15));
          }
          .modal-pulse-marker { animation: modal-pulse 2s infinite; }
          .modal-pulse-marker-active { animation: modal-pulse-active 1s infinite; }
          @keyframes modal-pulse {
            0% { filter: drop-shadow(0 0 0 rgba(230, 57, 70, 0.7)); }
            50% { filter: drop-shadow(0 0 10px rgba(230, 57, 70, 0.6)); }
            100% { filter: drop-shadow(0 0 0 rgba(230, 57, 70, 0)); }
          }
          @keyframes modal-pulse-active {
            0% { filter: drop-shadow(0 0 0 rgba(17, 17, 17, 0.9)); }
            50% { filter: drop-shadow(0 0 16px rgba(17, 17, 17, 0.8)); }
            100% { filter: drop-shadow(0 0 0 rgba(17, 17, 17, 0)); }
          }
          .custom-map-tooltip {
            background: rgba(255, 255, 255, 0.95);
            border: none;
            border-radius: 6px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            backdrop-filter: blur(4px);
            padding: 0 !important;
            overflow: hidden;
          }
        `}</style>
      </div>

      <RestaurantProfileModal 
        isOpen={!!profileModalPromo} 
        onClose={() => setProfileModalPromo(null)} 
        restaurant={profileModalPromo} 
      />
    </div>
  );
};

export default PromoTrackerModal;
