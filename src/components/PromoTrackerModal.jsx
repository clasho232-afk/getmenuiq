import React, { useState, useEffect } from 'react';
import { Target, MapPin, SlidersHorizontal, ChevronDown, X, Sparkles } from 'lucide-react';
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

// Map Controller for Zooming/Panning
const MapController = ({ bounds, selectedPromo }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedPromo) {
      map.flyTo([selectedPromo.lat, selectedPromo.lng], 16, { duration: 1.2 });
    } else if (bounds) {
      map.flyToBounds(bounds, { padding: [20, 20], duration: 1.2 });
    }
  }, [bounds, selectedPromo, map]);
  return null;
};

// ================================================================
// COMPONENT
// ================================================================

const PromoTrackerModal = ({ isOpen, onClose }) => {
  const [intelPlatform, setIntelPlatform] = useState(null);
  const [areaFilter, setAreaFilter] = useState('ilford');
  const [sortBy, setSortBy] = useState('threat_desc');
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [profileModalPromo, setProfileModalPromo] = useState(null);

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
  ];

  const intelData = runIntel(staticPromos);
  
  useEffect(() => {
    if (!intelPlatform && intelData.topResult) {
      setIntelPlatform(intelData.topResult.key);
    }
  }, []);

  const handlePlatformClick = (key) => {
    if (intelPlatform === key) {
      setIntelPlatform('all');
    } else {
      setIntelPlatform(key);
    }
    setSelectedPromo(null);
  };

  const handleAreaClick = (area) => {
    setAreaFilter(area);
    setSelectedPromo(null);
  };

  let displayFeed = staticPromos.filter(p => {
    const matchPlatform = intelPlatform === 'all' || intelPlatform === null ? true : p.platform === intelPlatform;
    const matchArea = areaFilter === 'all' ? true : p.location === areaFilter;
    return matchPlatform && matchArea;
  });

  displayFeed = displayFeed.sort((a, b) => {
    if (sortBy === 'threat_desc') {
      return getSinglePromoThreatScore(b) - getSinglePromoThreatScore(a);
    }
    return 0;
  });

  // Calculate Map Bounds based on selected area
  const primarySector = areaFilter === 'ilford' 
    ? (eastLondonAreas.find(s => s.name === 'Ilford') || eastLondonAreas[0])
    : (eastLondonAreas.find(s => s.name === 'Barking and Dagenham') || eastLondonAreas[0]);

  let bounds = null;
  if (primarySector && primarySector.bounds) {
    const lats = primarySector.bounds.map(b => b[0]);
    const lngs = primarySector.bounds.map(b => b[1]);
    bounds = [
      [Math.min(...lats), Math.min(...lngs)],
      [Math.max(...lats), Math.max(...lngs)]
    ];
  }

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
        background: '#FAFAFA', borderRadius: '24px', boxShadow: '0 24px 48px rgba(0,0,0,0.15)', 
        display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative' 
      }}>
        
        <div style={{ width: '60%', height: '100%', position: 'relative', background: '#E5E7EB' }}>
          {bounds ? (
            <MapContainer 
              bounds={bounds}
              boundsOptions={{ padding: [20, 20] }}
              zoomControl={false}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapController bounds={bounds} selectedPromo={selectedPromo} />
              <ZoomControl position="bottomright" />
              <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
              <Polygon 
                positions={primarySector.bounds}
                pathOptions={{ 
                  color: '#28a745',
                  weight: 1.5,
                  fillOpacity: 0.0,
                  lineCap: "round",
                  lineJoin: "round",
                  className: 'dashboard-mini-map-polygon'
                }}
              />
              {displayFeed.map((promo) => {
                const threatScore = getSinglePromoThreatScore(promo);
                const color = threatScore > 25 ? '#E63946' : '#F59E0B';
                const isSelected = selectedPromo?.id === promo.id;
                
                return (
                  <CircleMarker 
                    key={promo.id}
                    center={[promo.lat, promo.lng]}
                    radius={isSelected ? 10 : 8}
                    pathOptions={{ color: color, fillColor: color, fillOpacity: 1, weight: isSelected ? 3 : 2, className: isSelected ? 'modal-pulse-marker-active' : 'modal-pulse-marker' }}
                    eventHandlers={{
                      click: () => {
                        setSelectedPromo(promo);
                      }
                    }}
                  >
                    {isSelected && (
                      <Tooltip permanent interactive={true} direction="top" offset={[0, -12]} className="custom-map-tooltip">
                        <div 
                          onClick={(e) => {
                            e.stopPropagation();
                            setProfileModalPromo(promo);
                          }}
                          style={{ display: 'flex', flexDirection: 'column', width: '140px', overflow: 'hidden', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          <img src={promo.image} style={{ width: '100%', height: '70px', objectFit: 'cover' }} alt={promo.restaurant} />
                          <div style={{ padding: '8px 6px', textAlign: 'center', background: '#FFF' }}>
                            <div style={{ fontWeight: 800, fontSize: '13px', color: '#111', fontFamily: "'Lufga', sans-serif", lineHeight: '1.3' }}>{promo.restaurant}</div>
                          </div>
                        </div>
                      </Tooltip>
                    )}
                  </CircleMarker>
                );
              })}
            </MapContainer>
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
              Map Unavailable
            </div>
          )}

          <div style={{ position: 'absolute', top: '24px', left: '24px', zIndex: 1000, pointerEvents: 'none' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: 900, 
              color: '#111', 
              margin: 0, 
              textShadow: '0 2px 10px rgba(255,255,255,0.9), 0 0 4px rgba(255,255,255,1), 0 4px 20px rgba(255,255,255,0.8)'
            }}>
              Active Promos Map
            </h2>
          </div>
        </div>

        <div style={{ width: '40%', height: '100%', background: '#FFFFFF', display: 'flex', flexDirection: 'column', position: 'relative', boxShadow: '-10px 0 30px rgba(0,0,0,0.03)', zIndex: 20 }}>
          
          <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 30 }}>
            <button onClick={onClose} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}>
              <X size={18} color="#4B5563" />
            </button>
          </div>

          <div style={{ padding: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111', margin: '0 0 16px 0' }}>Competitor Activity Feed</h3>
            
            <div style={{ display: 'flex', flexWrap: 'nowrap', gap: '6px' }}>
              <button onClick={() => handlePlatformClick('all')} style={{ padding: '4px 8px', borderRadius: '999px', background: intelPlatform === 'all' || !intelPlatform ? '#111' : '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: intelPlatform === 'all' || !intelPlatform ? '#FFF' : '#111' }}>All</span>
                <span style={{ background: intelPlatform === 'all' || !intelPlatform ? '#374151' : '#F3F4F6', color: intelPlatform === 'all' || !intelPlatform ? '#FFF' : '#4B5563', padding: '2px 6px', borderRadius: '999px', fontSize: '10px', fontWeight: 700 }}>{staticPromos.length}</span>
              </button>
              
              <button onClick={() => handlePlatformClick('ubereats')} style={{ padding: '4px 8px', borderRadius: '999px', background: intelPlatform === 'ubereats' ? '#111' : '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#06C167', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>U</div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: intelPlatform === 'ubereats' ? '#FFF' : '#111' }}>UberEats</span>
              </button>

              <button onClick={() => handlePlatformClick('deliveroo')} style={{ padding: '4px 8px', borderRadius: '999px', background: intelPlatform === 'deliveroo' ? '#111' : '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#00CCBC', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>D</div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: intelPlatform === 'deliveroo' ? '#FFF' : '#111' }}>Deliveroo</span>
              </button>

              <button onClick={() => handlePlatformClick('justeats')} style={{ padding: '4px 8px', borderRadius: '999px', background: intelPlatform === 'justeats' ? '#111' : '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: '#FF8000', color: '#fff', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>J</div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: intelPlatform === 'justeats' ? '#FFF' : '#111' }}>JustEats</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button onClick={() => handleAreaClick('ilford')} style={{ padding: '6px 16px', borderRadius: '8px', background: areaFilter === 'ilford' ? '#111' : '#F3F4F6', border: 'none', fontSize: '13px', fontWeight: 600, color: areaFilter === 'ilford' ? '#FFF' : '#4B5563', cursor: 'pointer' }}>
                Ilford
              </button>
              <button onClick={() => handleAreaClick('neighborhood')} style={{ padding: '6px 16px', borderRadius: '8px', background: areaFilter === 'neighborhood' ? '#111' : '#F3F4F6', border: 'none', fontSize: '13px', fontWeight: 600, color: areaFilter === 'neighborhood' ? '#FFF' : '#4B5563', cursor: 'pointer' }}>
                Neighborhood
              </button>
            </div>
          </div>

          <div className="invisible-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', background: '#FAFAFA' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {displayFeed.map((promo) => {
                const platformInitial = promo.platform === 'ubereats' ? 'U' : promo.platform === 'deliveroo' ? 'D' : 'J';
                const platformColor = promo.platform === 'ubereats' ? '#06C167' : promo.platform === 'deliveroo' ? '#00CCBC' : '#FF8000';
                const isSelected = selectedPromo?.id === promo.id;
                
                return (
                  <div 
                    key={promo.id} 
                    onClick={() => {
                      setSelectedPromo(promo);
                    }}
                    style={{ 
                      background: isSelected ? '#F9FAFB' : '#FFFFFF', 
                      border: isSelected ? '2px solid #111' : '1px solid #E5E7EB', 
                      borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', 
                      justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      cursor: 'pointer', transition: 'all 0.2s',
                      transform: isSelected ? 'translateY(-2px)' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img src={promo.image} alt={promo.restaurant} style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }} />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: '#111' }}>{promo.restaurant}</span>
                          <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: platformColor, color: '#fff', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>{platformInitial}</div>
                        </div>
                        <span style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>{promo.promo}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                      <span style={{ background: '#F3F4F6', color: '#4B5563', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>{promo.type}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ padding: '24px', background: '#FFFFFF', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
            <button style={{ width: '100%', background: '#111', color: '#FFF', border: 'none', padding: '16px', borderRadius: '999px', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
              <Sparkles size={18} />
              Suggest Strategy
            </button>
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
