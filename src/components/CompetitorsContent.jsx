import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Star, Search, X, ShieldAlert, Shield, Layers,
  TrendingUp, MapPin, Wifi, BarChart2, RefreshCw, Maximize, Minimize
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import RestaurantProfilePage from './RestaurantProfilePage';
import { supabase } from '../supabase';
import {
  getRankedCompetitors,
  TIER,
  threatFromScore,
} from '../utils/competitorEngine';
import ComparisonModal from './ComparisonModal';

// ─── Platform icons ────────────────────────────────────────────────────────────
const PLATFORM_ICONS = {
  ubereats:  'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128',
  deliveroo: 'https://www.google.com/s2/favicons?domain=deliveroo.co.uk&sz=128',
  justeat:   'https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128',
};

// ─── Map pin factories ─────────────────────────────────────────────────────────
const makeCustomPin = (restaurant, score) => {
  const threatColor = score >= 70 ? '#E86A58' : score >= 40 ? '#D97706' : '#10B981';
  const avatar = restaurant.hero_image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80';
  // Dynamic font size logic based on string length
  const nameLength = restaurant.name ? restaurant.name.length : 0;
  let dynamicFontSize = '11px';
  if (nameLength > 20) {
    dynamicFontSize = '9px';
  } else if (nameLength > 15) {
    dynamicFontSize = '10px';
  }

  return L.divIcon({
    className: 'custom-leaflet-banner-container',
    html: `
      <div class="map-inline-banner" style="display: flex; align-items: center;">
        <img class="banner-avatar" src="${avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; flex-shrink: 0;" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'" />
        <div class="banner-name" style="padding: 0 6px; font-weight: 700; font-size: ${dynamicFontSize}; color: #111; letter-spacing: -0.02em; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; white-space: normal; text-overflow: ellipsis; max-width: 90px; line-height: 1.1;">${restaurant.name}</div>
        <div class="banner-status-dot" style="width: 8px; height: 8px; border-radius: 50%; background: ${threatColor}; box-shadow: 0 0 0 2px rgba(255,255,255,0.8); flex-shrink: 0;"></div>
      </div>
    `,
    iconSize: [null, null],
    iconAnchor: [15, 15]
  });
};

// Calculates distance between two sets of coordinates
function getDistance(lat1, lng1, lat2, lng2) {
  const radlat1 = Math.PI * lat1 / 180;
  const radlat2 = Math.PI * lat2 / 180;
  const theta = lng1 - lng2;
  const radtheta = Math.PI * theta / 180;
  
  let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  if (dist > 1) dist = 1;
  dist = Math.acos(dist);
  dist = dist * 180 / Math.PI;
  dist = dist * 60 * 1.1515 * 1.609344; // Converts distance strictly to Kilometers
  return dist;
}

function getNearestCompetitors(ownerLat, ownerLng, fullDataset, count = 5) {
  if (!ownerLat || !ownerLng) return fullDataset.slice(0, count);
  return fullDataset
    .map(entry => {
      const shop = entry.restaurant;
      const distance = (shop.lat && shop.lng) ? getDistance(ownerLat, ownerLng, parseFloat(shop.lat), parseFloat(shop.lng)) : 9999;
      return { ...entry, distance };
    })
    .sort((a, b) => a.distance - b.distance)
    .slice(0, count);
}

const makeOwnerPin = (ownerRestaurant) => {
  const avatar = ownerRestaurant?.hero_image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80';
  const name = ownerRestaurant?.name || 'Your Shop';
  
  return L.divIcon({
    className: 'custom-owner-banner-wrapper',
    html: `
      <div class="map-inline-banner owner-pin-base" style="background: transparent; border: none; box-shadow: none; padding: 0; position: relative;">
        <svg class="owner-title-text" xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 24 24" fill="#DC2626" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 4px 6px rgba(0,0,0,0.3)); display: block; position: relative; z-index: 10;">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
          <circle cx="12" cy="10" r="3" fill="#ffffff"></circle>
        </svg>
        <div class="owner-title-text" style="position: absolute; top: 31px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(8px); padding: 4px 8px 4px 4px; border-radius: 20px; border: 1px solid rgba(0, 0, 0, 0.05); box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);">
          <img src="${avatar}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'" />
          <span style="font-size: 11px; font-weight: 700; color: #111; letter-spacing: -0.01em; white-space: nowrap;">${name}</span>
        </div>
      </div>
    `.trim(),
    iconSize: [null, null],
    iconAnchor: [13.5, 27]
  });
};

// ─── Tier config (colours / labels) ───────────────────────────────────────────
const TIER_CONFIG = {
  [TIER.DIRECT]:   { label: 'El Food',   shortLabel: 'El Food', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  [TIER.ADJACENT]: { label: 'Neighborhood', shortLabel: 'Neighborhood', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
};

// ─── Detect which platforms a restaurant is on from its URL fields ─────────────
function detectPlatforms(restaurant) {
  const plats = [];
  const len = restaurant.name ? restaurant.name.length : 0;
  if (restaurant.ubereats_url || len % 2 === 0) plats.push('ubereats');
  if (restaurant.deliveroo_url || len % 3 === 0) plats.push('deliveroo');
  plats.push('justeat');
  
  const uniquePlats = [...new Set(plats)];
  if (uniquePlats.length === 0) uniquePlats.push('ubereats');
  return uniquePlats;
}

// ─── East London default centre ───────────────────────────────────────────────
const EAST_LONDON = [51.538, 0.018];

// ══════════════════════════════════════════════════════════════════════════════
const CompetitorsContent = () => {

  // ── Data state ──────────────────────────────────────────────────────────────
  const [ownerRestaurant,   setOwnerRestaurant]   = useState(null);
  const [rankedCompetitors, setRankedCompetitors] = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);
  const [comparisonTarget,  setComparisonTarget]  = useState(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeTier,     setActiveTier]     = useState(null); // null | 1 | 2 | 'WATCHLIST'
  const [watchlistIds,   setWatchlistIds]   = useState([]);
  const [selectedItem,   setSelectedItem]   = useState(null); // full ranked entry
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activePills,    setActivePills]    = useState([]);   // 'No Delivery Fee' | 'Active Promos'
  const [isMapExpanded,  setIsMapExpanded]  = useState(true);
  const [isMapFullScreen, setIsMapFullScreen] = useState(false);
  const [activePlatformFilter, setActivePlatformFilter] = useState(null);
  const [viewMode, setViewMode] = useState('List');
  const [matrixCompetitors, setMatrixCompetitors] = useState([]); // Now stores full restaurant objects
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    const handleMatrixDataReady = () => {
      const saved = localStorage.getItem('matrix_selected_competitors');
      if (saved) {
        try {
          const list = JSON.parse(saved);
          if (list && list.length > 0) {
            setComparisonTarget(list[list.length - 1]); // Open popup
            
            // Silently update matrix
            setMatrixCompetitors(prev => {
              const newList = [...prev];
              list.forEach(item => {
                if (!newList.some(r => r.id === item.id)) {
                  newList.push(item);
                }
              });
              return newList.length > 3 ? newList.slice(0, 3) : newList;
            });
            localStorage.removeItem('matrix_selected_competitors');
          }
        } catch(e) {}
      }
    };
    handleMatrixDataReady();
    window.addEventListener('matrix-data-ready', handleMatrixDataReady);
    return () => window.removeEventListener('matrix-data-ready', handleMatrixDataReady);
  }, []);

  // ── Refs & Progressive Zoom State ───────────────────────────────────────────────
  const mapRef = useRef(null);
  const [isMacroView, setIsMacroView] = useState(false);

  // Dynamic area label for Tier 1
  const primaryAreaName = ownerRestaurant?.primaryArea || (ownerRestaurant?.areas && ownerRestaurant.areas.length > 0 ? ownerRestaurant.areas[0] : "Local Area");

  const ownerIcon = useMemo(() => makeOwnerPin(ownerRestaurant), [ownerRestaurant]);

  // Hardcoded owner coordinates for progressive load
  const ownerLat = 51.5285;
  const ownerLng = -0.0450;
  
  const GEOGRAPHIC_DETAIL_THRESHOLD = 14;
  const ZoomListener = () => {
    useMapEvents({
      zoomend: (e) => {
        const currentZoomLevel = e.target.getZoom();
        const mapContainerElement = e.target.getContainer();

        if (currentZoomLevel <= GEOGRAPHIC_DETAIL_THRESHOLD) {
          if (!isMacroView) setIsMacroView(true);
          mapContainerElement.classList.add('macro-zoom-active');
        } else {
          if (isMacroView) setIsMacroView(false);
          mapContainerElement.classList.remove('macro-zoom-active');
        }
      }
    });
    return null;
  };


  const handleRowClick = (entry) => {
    setSelectedItem(entry);
    const { restaurant } = entry;
    if (restaurant.lat && restaurant.lng && mapRef.current) {
      mapRef.current.flyTo([parseFloat(restaurant.lat), parseFloat(restaurant.lng)], 15, { duration: 1.2 });
    }
  };

  // ── Fetch owner + ranked competitors ─────────────────────────────────────────
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: restaurants, error: rErr } = await supabase
        .from('restaurants')
        .select('*')
        .limit(1);

      if (rErr) throw rErr;
      const owner = restaurants?.[0];
      if (!owner) { setError('No restaurant found. Complete onboarding first.'); return; }

      setOwnerRestaurant(owner);

      const ranked = await getRankedCompetitors(supabase, owner);
      setRankedCompetitors(ranked);
      setWatchlistIds(ranked.filter(r => r.restaurant.isWatchlisted).map(r => r.restaurant.id));
    } catch (err) {
      console.error('[Competitors] fetch error:', err.message);
      setError('Could not load competitors. Check your connection.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Derived counts ────────────────────────────────────────────────────────────
  const tier1Count = rankedCompetitors.filter(c => c.tier === TIER.DIRECT).length;
  const tier2Count = rankedCompetitors.filter(c => c.tier === TIER.ADJACENT).length;

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const baseDisplayList = rankedCompetitors.filter(c => {
    if (activeTier === 'WATCHLIST' && !watchlistIds.includes(c.restaurant.id)) return false;
    if (activeTier !== 'WATCHLIST' && activeTier !== null && c.tier !== activeTier) return false;
    if (searchQuery && !c.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activePills.includes('Active Promos')  && !(c.restaurant.promo_count > 0)) return false;
    if (activePills.includes('No Delivery Fee') && !(parseFloat(c.restaurant.delivery_fee || 1) === 0)) return false;
    if (activePills.includes('High Overlap') && !(c.score >= 50)) return false;
    return true;
  });

  const displayList = isMacroView 
    ? baseDisplayList 
    : getNearestCompetitors(ownerLat, ownerLng, baseDisplayList, 5);

  // ── Top 3 threats (Tier 1, sorted by score) ───────────────────────────────────
  const topThreats = [...rankedCompetitors]
    .filter(c => c.tier === TIER.DIRECT)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // ── Map centre ────────────────────────────────────────────────────────────────
  const mapCenter = (ownerRestaurant?.lat && ownerRestaurant?.lng)
    ? [parseFloat(ownerRestaurant.lat), parseFloat(ownerRestaurant.lng)]
    : EAST_LONDON;

  // ── Toggle helpers ────────────────────────────────────────────────────────────
  const toggleWatchlist = (id, e) => {
    if (e) e.stopPropagation();
    setWatchlistIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  const togglePill = (pill) =>
    setActivePills(prev => prev.includes(pill) ? prev.filter(p => p !== pill) : [...prev, pill]);
  const toggleTier = (t) => setActiveTier(prev => prev === t ? null : t);

  // ── Adapt ranked entry → modal-compatible shape ───────────────────────────────
  const toModalShape = (entry) => {
    if (!entry) return null;
    const { restaurant, tier, score, classification } = entry;
    const cfg = TIER_CONFIG[tier] || {};
    const threat = threatFromScore(score);
    return {
      id:          restaurant.id,
      name:        restaurant.name,
      image:       restaurant.hero_image_url || '',
      cuisine:     (restaurant.cuisines || []).join(', '),
      distance:    classification.distanceKm ? `${classification.distanceKm.toFixed(1)} km` : '—',
      threat:      tier === TIER.DIRECT ? 'red' : 'amber',
      threatLabel: threat.label,
      score,
      platforms:   detectPlatforms(restaurant),
      location:    (restaurant.areas || []).slice(0, 2).join(', '),
      deliveryFee: restaurant.delivery_fee ? `£${parseFloat(restaurant.delivery_fee).toFixed(2)} Delivery` : 'Free Delivery',
      promos:      restaurant.promo_count || 0,
      priceChanges: restaurant.price_change_count || (score > 60 ? 1 : 0),
      lastChange:  restaurant.last_price_change || (score > 60 ? 'Increased Classic Burger by £1.00' : 'No recent changes'),
      priceChangeDetails: {
        category: 'Burgers',
        itemName: 'Classic Burger',
        oldPrice: '£7.50',
        newPrice: '£8.50',
        changeText: 'Price Increase: +£1.00',
        isIncrease: true
      },
      menuCategories: [
        {
          category: 'Popular',
          items: [
            { name: 'Double Smash Burger', price: '£9.50', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80' },
            { name: 'Peri Peri Wings (6pcs)', price: '£5.99', image: 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=150&q=80' },
            { name: 'Loaded Fries', price: '£4.50', image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&w=150&q=80' }
          ]
        },
        {
          category: 'Mains',
          items: [
            { name: 'Classic Cheeseburger', price: '£7.50', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80' },
            { name: 'Spicy Chicken Wrap', price: '£6.50', image: 'https://images.unsplash.com/photo-1626804475297-41609ae9fa16?auto=format&fit=crop&w=150&q=80' }
          ]
        }
      ],
      promoItemImage: restaurant.hero_image_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=150&q=80',
      promoText: score > 60 ? '20% off on all Burgers (UberEats)' : 'Free Delivery over £15',
      menuChangeItemImage: restaurant.hero_image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80',
      sharedAreas: classification.sharedAreas || [],
      neighbouringAreas: classification.neighbouringAreas || [],
      tierLabel:   tier === TIER.DIRECT ? primaryAreaName : (cfg.shortLabel || ''),
    };
  };

  // ════════════════════════════════════════════════════════════════════════════
  if (selectedItem) {
    return (
      <div style={{ height: '100%', overflowY: 'auto' }}>
        <RestaurantProfilePage 
          restaurantId={toModalShape(selectedItem).id} 
          onBack={() => setSelectedItem(null)} 
          onCompare={(restaurant) => {
            setComparisonTarget(restaurant); // Open popup
            
            // Silently update matrix
            setMatrixCompetitors(prev => {
              if (prev.some(r => r.id === restaurant.id)) return prev;
              const newList = [...prev, restaurant];
              return newList.length > 3 ? newList.slice(0, 3) : newList;
            });
          }}
        />
        <ComparisonModal 
          isOpen={!!comparisonTarget} 
          onClose={() => setComparisonTarget(null)} 
          ownerRestaurant={ownerRestaurant} 
          competitorRestaurant={comparisonTarget} 
        />
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#EF4444',
          color: '#FFF',
          padding: '0.75rem 1.5rem',
          borderRadius: '8px',
          fontWeight: 600,
          fontSize: '0.875rem',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 2000,
          animation: 'slideDown 0.3s ease-out',
          fontFamily: "'Lufga', sans-serif"
        }}>
          {toastMessage}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <style>
          {`
            ${!isMapFullScreen ? '.leaflet-control-zoom { display: none !important; }' : ''}
          `}
        </style>

        {/* ── MAP ─────────────────────────────────────────────────────────── */}
        {isMapFullScreen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 99998
          }} onClick={() => {
            setIsMapFullScreen(false);
            setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
          }} />
        )}
        {isMapExpanded && (
        <div style={{
          position: isMapFullScreen ? 'fixed' : 'relative',
          top: isMapFullScreen ? '2rem' : 'auto',
          left: isMapFullScreen ? '2rem' : 'auto',
          right: isMapFullScreen ? '2rem' : 'auto',
          bottom: isMapFullScreen ? '2rem' : 'auto',
          height: isMapFullScreen ? 'calc(100vh - 4rem)' : '240px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: isMapFullScreen ? '0 25px 50px -12px rgba(0,0,0,0.5)' : '0 4px 20px rgba(0,0,0,0.08)',
          zIndex: isMapFullScreen ? 99999 : 1
        }}>
          {/* Platform Filters */}
          <div style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '1rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {['ubereats', 'deliveroo', 'justeat'].map(platform => {
               const isActive = activePlatformFilter === platform;
               return (
                 <button 
                   key={platform}
                   onClick={() => setActivePlatformFilter(isActive ? null : platform)}
                   style={{
                     width: '40px', height: '40px', borderRadius: '50%', border: isActive ? '2px solid #10B981' : '2px solid white', 
                     background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                     boxShadow: '0 2px 8px rgba(0,0,0,0.15)', cursor: 'pointer', padding: '6px',
                     transition: 'all 0.2s',
                     opacity: activePlatformFilter && !isActive ? 0.6 : 1
                   }}
                   title={`Filter by ${platform}`}
                 >
                   <img src={PLATFORM_ICONS[platform]} alt={platform} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                 </button>
               )
            })}
          </div>

          {/* Full Screen Toggle */}
          <button 
            onClick={() => {
              setIsMapFullScreen(!isMapFullScreen);
              setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
            }}
            style={{
              position: 'absolute', top: '1rem', right: '1rem', zIndex: 1000, 
              background: 'white', border: 'none', borderRadius: '8px', 
              padding: '0.5rem', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {isMapFullScreen ? <Minimize size={20} color="#374151" /> : <Maximize size={20} color="#374151" />}
          </button>
          <MapContainer center={[ownerLat, ownerLng]} zoom={15} zoomControl={false} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} ref={mapRef}>
            {isMapFullScreen && <ZoomControl position="topleft" />}
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="© CartoDB" />
            <ZoomListener />
            
            {/* Owner pin */}
            <Marker position={[ownerLat, ownerLng]} icon={ownerIcon} zIndexOffset={1000} />

            {/* Competitor pins (hidden when zoomed out based on user request) */}
            {!isMacroView && displayList
              .filter(entry => !activePlatformFilter || detectPlatforms(entry.restaurant).includes(activePlatformFilter))
              .map((entry) => {
              const { restaurant, tier, score } = entry;
              if (!restaurant.lat || !restaurant.lng) return null;
              const icon = makeCustomPin(restaurant, score);
              const cfg  = TIER_CONFIG[tier] || {};
              return (
                <Marker 
                  key={restaurant.id} 
                  position={[parseFloat(restaurant.lat), parseFloat(restaurant.lng)]} 
                  icon={icon}
                  eventHandlers={{
                    click: () => {
                      if (isMapFullScreen) setSelectedItem(entry);
                    }
                  }}
                >
                  {!isMapFullScreen && (
                  <Popup autoPanPaddingTopLeft={[20, 160]} className="custom-premium-popup-container">
                    <div style={{ padding: '0.25rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827', marginBottom: '2px' }}>{restaurant.name}</div>
                      <div style={{ color: cfg.color || '#6B7280', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '8px' }}>
                        {cfg.shortLabel} · Score: {score}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#4B5563', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9CA3AF' }}>Delivery:</span>
                          <strong>{restaurant.delivery_fee ? '£' + parseFloat(restaurant.delivery_fee).toFixed(2) : 'Free'}</strong>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span style={{ color: '#9CA3AF' }}>Promos:</span>
                          <strong>{restaurant.promo_count || 0} Active</strong>
                        </div>
                      </div>
                    </div>
                  </Popup>
                  )}
                </Marker>
              );
            })}
          </MapContainer>

          {/* Legend pill */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 30, background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '0.5rem 0.85rem', display: 'flex', gap: '0.85rem', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', backdropFilter: 'blur(6px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} />
              {primaryAreaName} — Same area
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }} />
              Neighborhood — Bordering
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#111' }} />
              You
            </div>
          </div>
        </div>
        )}

        {/* ── SEARCH STRIP ────────────────────────────────────────────────── */}
        <div style={{ marginTop: '-1rem', backgroundColor: '#fff', borderRadius: '9999px', padding: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: '0.5rem', paddingLeft: '1rem' }}>
            <Search size={16} color="#9CA3AF" />
            <input
              type="text"
              placeholder="Search restaurant..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.875rem', background: 'transparent', fontFamily: 'inherit', color: '#111827' }}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
          <div style={{ height: '2rem', width: '1px', backgroundColor: '#E5E7EB' }} />
          {/* Quick pill filters */}
          <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', paddingRight: '0.5rem' }}>
            {['No Delivery Fee', 'Active Promos', 'High Overlap'].map(pill => {
              const isActive = activePills.includes(pill);
              return (
                <button key={pill} onClick={() => togglePill(pill)}
                  style={{ padding: '0.375rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, backgroundColor: isActive ? 'rgba(232, 106, 88, 0.1)' : 'transparent', border: 'none', color: isActive ? '#E86A58' : '#4B5563', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
                  {pill}
                </button>
              );
            })}
          </div>
          <button
            onClick={fetchData}
            style={{ backgroundColor: '#E86A58', color: '#fff', padding: '0.5rem 1.5rem', borderRadius: '9999px', fontSize: '0.875rem', fontWeight: 600, border: 'none', cursor: 'pointer', marginRight: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'inherit' }}>
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* ── DIRECTORY PANEL ──────────────────────────────────────────────── */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* Header & View Mode Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>Competitor Directory</h2>
            
            <div style={{ display: 'flex', backgroundColor: '#F3F4F6', borderRadius: '8px', padding: '0.25rem' }}>
              <button 
                onClick={() => setViewMode('List')}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', backgroundColor: viewMode === 'List' ? '#FFF' : 'transparent', color: viewMode === 'List' ? '#111' : '#6B7280', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: viewMode === 'List' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontFamily: "'Lufga', sans-serif" }}
              >List View</button>
              <button 
                onClick={() => setViewMode('Matrix')}
                style={{ padding: '0.4rem 0.8rem', borderRadius: '6px', border: 'none', backgroundColor: viewMode === 'Matrix' ? '#FFF' : 'transparent', color: viewMode === 'Matrix' ? '#111' : '#6B7280', fontWeight: 600, fontSize: '0.75rem', cursor: 'pointer', boxShadow: viewMode === 'Matrix' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', fontFamily: "'Lufga', sans-serif" }}
              >Matrix View</button>
            </div>
          </div>

          {/* Tabs row */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.75rem', opacity: viewMode === 'Matrix' ? 0.5 : 1, pointerEvents: viewMode === 'Matrix' ? 'none' : 'auto' }}>
            {/* All */}
            <button onClick={() => setActiveTier(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: activeTier === null ? '#E86A58' : '#6B7280', cursor: 'pointer', position: 'relative', paddingBottom: '0.25rem', fontFamily: 'inherit' }}>
              All ({rankedCompetitors.length})
              {activeTier === null && <div style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, height: '2px', background: '#E86A58', borderRadius: '2px' }} />}
            </button>

            {/* Watchlist */}
            <button onClick={() => setActiveTier(activeTier === 'WATCHLIST' ? null : 'WATCHLIST')}
              style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: activeTier === 'WATCHLIST' ? '#E86A58' : '#6B7280', cursor: 'pointer', position: 'relative', paddingBottom: '0.25rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Star size={14} fill={activeTier === 'WATCHLIST' ? '#E86A58' : 'none'} />
              Watchlist ({watchlistIds.length})
              {activeTier === 'WATCHLIST' && <div style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, height: '2px', background: '#E86A58', borderRadius: '2px' }} />}
            </button>
          </div>

          {/* Active filter context label */}
          {activeTier !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: activeTier === TIER.DIRECT ? '#FEF2F2' : activeTier === 'WATCHLIST' ? '#FEFCE8' : '#FFFBEB', border: `1px solid ${activeTier === TIER.DIRECT ? '#FECACA' : activeTier === 'WATCHLIST' ? '#FEF08A' : '#FDE68A'}` }}>
              {activeTier === TIER.DIRECT
                ? <ShieldAlert size={14} color="#DC2626" />
                : activeTier === 'WATCHLIST'
                  ? <Star size={14} color="#EAB308" />
                  : <Shield size={14} color="#D97706" />}
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: activeTier === TIER.DIRECT ? '#991B1B' : activeTier === 'WATCHLIST' ? '#854D0E' : '#78350F' }}>
                {activeTier === TIER.DIRECT
                  ? `Showing ${tier1Count} direct competitors — restaurants serving the same areas as ${ownerRestaurant?.name || 'you'}`
                  : activeTier === 'WATCHLIST'
                    ? `Showing ${watchlistIds.length} curated watchlist targets`
                    : `Showing ${tier2Count} adjacent competitors — restaurants in bordering areas`}
              </span>
              <button onClick={() => setActiveTier(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}>
                <X size={14} />
              </button>
            </div>
          )}

          {/* ── LOADING ─────────────────────────────────────────────────── */}
          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #E5E7EB', borderTopColor: '#E86A58', animation: 'spin 0.9s linear infinite' }} />
              <p style={{ fontSize: '0.875rem', color: '#6B7280', fontWeight: 500 }}>
                Scanning {ownerRestaurant?.areas?.join(', ') || 'your area'} for competitors…
              </p>
            </div>
          )}

          {/* ── ERROR ───────────────────────────────────────────────────── */}
          {!loading && error && (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#B91C1C', background: '#FEF2F2', borderRadius: '12px' }}>
              <p style={{ fontWeight: 600 }}>{error}</p>
              <button onClick={fetchData} style={{ marginTop: '1rem', padding: '0.5rem 1.25rem', borderRadius: '9999px', background: '#111', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600 }}>
                Retry
              </button>
            </div>
          )}

          {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
          {!loading && !error && displayList.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6B7280' }}>
              <Layers size={32} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
              <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>
                {rankedCompetitors.length === 0
                  ? 'No competitors found in your delivery area'
                  : activeTier === TIER.DIRECT
                    ? 'No direct competitors match your filters'
                    : activeTier === 'WATCHLIST'
                      ? 'No targets in your watchlist match your filters'
                      : 'No adjacent competitors match your filters'}
              </p>
              {activeTier !== null && (
                <button onClick={() => setActiveTier(null)} style={{ marginTop: '0.75rem', padding: '0.4rem 1rem', borderRadius: '9999px', background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}>
                  Show all tiers
                </button>
              )}
            </div>
          )}

          {/* ── COMPETITOR CARDS / MATRIX VIEW ────────────────────────────────────────── */}
          {!loading && !error && viewMode === 'Matrix' && (
            <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', fontFamily: "'Lufga', sans-serif" }}>
              {/* Sticky Sidebar */}
              <div style={{ flex: '0 0 160px', position: 'sticky', left: 0, backgroundColor: '#FFFFFF', zIndex: 10, paddingTop: '200px', paddingRight: '1rem' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', margin: '0 0 0 0', display: 'flex', alignItems: 'flex-end', height: '3.5rem', paddingBottom: '0.5rem' }}>Performance</h3>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>MenuIQ Score</div>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>Rating</div>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>Reviews</div>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>Platforms</div>

                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111', margin: '0 0 0 0', display: 'flex', alignItems: 'flex-end', height: '4rem', paddingBottom: '0.5rem' }}>Financials</h3>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>Avg. Item Price</div>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>Delivery Fee</div>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>Active Promos</div>
                <div style={{ height: '3rem', display: 'flex', alignItems: 'center', color: '#6B7280', fontSize: '0.85rem' }}>Price Changes</div>
              </div>

              {/* Data Columns */}
              {matrixCompetitors.map((restaurant, idx) => {
                const isPrimary = idx === matrixCompetitors.length - 1; // Highlight the most recently added

                // Mock/Derived Data
                const score = restaurant.score || Math.floor(Math.random() * 30 + 60); 
                const rating = restaurant.rating || (Math.random() * 1 + 4).toFixed(1);
                const reviews = restaurant.reviews || Math.floor(Math.random() * 500 + 50);
                const platformsCount = detectPlatforms(restaurant).length;
                const avgPrice = restaurant.avg_price ? `£${parseFloat(restaurant.avg_price).toFixed(2)}` : '£12.50';
                const delivery = restaurant.delivery_fee ? `£${parseFloat(restaurant.delivery_fee).toFixed(2)}` : 'Free';
                const promos = restaurant.promo_count || 0;
                const priceChanges = restaurant.price_change_count || 0;

                const cellStyle = { height: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: '#111' };

                return (
                  <div key={restaurant.id} style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', backgroundColor: isPrimary ? '#F0FDF4' : '#F9FAFB', borderRadius: '24px', border: isPrimary ? '1px solid #BBF7D0' : '1px solid #E5E7EB', overflow: 'hidden', paddingBottom: '1.5rem', position: 'relative' }}>
                    
                    {/* Remove button */}
                    <button 
                      onClick={() => {
                        setMatrixCompetitors(prev => prev.filter(r => r.id !== restaurant.id));
                        if (matrixCompetitors.length === 1) setViewMode('List');
                      }}
                      style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 20, width: '28px', height: '28px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.9)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    >
                      <X size={14} color="#111" />
                    </button>

                    {/* Image Header (Flush with edges) */}
                    <div style={{ width: '100%', height: '200px', position: 'relative', flexShrink: 0 }}>
                      <img src={restaurant.hero_image_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={restaurant.name} />
                      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', padding: '2rem 1rem 0.75rem', color: '#fff', fontWeight: 800, textAlign: 'center', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {restaurant.name}
                      </div>
                    </div>

                    {/* Spacer for "Performance" heading */}
                    <div style={{ height: '3.5rem' }}></div>

                    {/* Cells */}
                    <div style={cellStyle}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <TrendingUp size={14} color="#2563EB" /> 
                         <span>{score} / 100</span>
                       </span>
                    </div>
                    <div style={cellStyle}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                         <Star size={14} fill="#2563EB" color="#2563EB" /> 
                         <span>{rating}</span>
                       </span>
                    </div>
                    <div style={cellStyle}>
                       <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#2563EB', fontWeight: 800 }}>
                         <span>{reviews}</span>
                       </span>
                    </div>
                    <div style={cellStyle}>
                       <span>{platformsCount} Active</span>
                    </div>

                    {/* Spacer for "Financials" heading */}
                    <div style={{ height: '4rem' }}></div>

                    <div style={cellStyle}>{avgPrice}</div>
                    <div style={cellStyle}>{delivery}</div>
                    <div style={cellStyle}>{promos}</div>
                    <div style={cellStyle}>
                       {priceChanges > 0 ? (
                         <span style={{ color: '#DC2626', fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#FEE2E2', borderRadius: '9999px' }}>{priceChanges} Updates</span>
                       ) : (
                         <span style={{ color: '#E86A58', fontSize: '0.85rem', fontWeight: 600 }}>Stable</span>
                       )}
                    </div>
                  </div>
                );
              })}
              {matrixCompetitors.length === 0 && (
                <div style={{ padding: '2rem', width: '100%', textAlign: 'center', color: '#6B7280' }}>No competitors selected for matrix.</div>
              )}
            </div>
          )}
          {!loading && !error && viewMode === 'List' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {displayList.map(({ restaurant, tier, score, classification, threat }) => {
                const cfg       = TIER_CONFIG[tier] || {};
                const platforms = detectPlatforms(restaurant);
                const isWatched = watchlistIds.includes(restaurant.id);
                const location  = (restaurant.areas && restaurant.areas.length > 0) ? restaurant.areas[0] : '—';

                return (
                  <div
                    key={restaurant.id}
                    onClick={() => handleRowClick({ restaurant, tier, score, classification, threat })}
                    style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer', border: `1px solid ${cfg.border || '#F3F4F6'}`, transition: 'all 0.18s', position: 'relative', overflow: 'hidden' }}
                    onMouseOver={e  => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(0,0,0,0.08)'; }}
                    onMouseOut={e   => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
                  >
                    {/* Tier colour bar on left edge */}
                    <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: cfg.color || '#E5E7EB', borderRadius: '16px 0 0 16px' }} />

                    {/* Restaurant image */}
                    <img
                      src={restaurant.hero_image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'}
                      alt={restaurant.name}
                      style={{ width: '96px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                      onError={e => { e.target.src = 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'; }}
                    />

                    {/* Name + meta */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#111827', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {restaurant.name}
                        </h3>
                        {/* Tier badge */}
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.15rem 0.55rem', borderRadius: '9999px', fontSize: '0.65rem', fontWeight: 800, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, textTransform: 'uppercase', letterSpacing: '0.03em', flexShrink: 0 }}>
                          {tier === TIER.DIRECT ? <ShieldAlert size={9} /> : <Shield size={9} />}
                          {location}
                        </span>
                        {/* Watchlist star */}
                        <button onClick={e => toggleWatchlist(restaurant.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <Star size={15} fill={isWatched ? '#F59E0B' : 'none'} color={isWatched ? '#F59E0B' : '#D1D5DB'} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span>Category: {(restaurant.cuisines || []).slice(0, 2).join(' and ') || '—'}</span>
                      </div>
                    </div>

                    {/* Stats columns */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>

                      {/* Platforms */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.3rem' }}>Platforms</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem', alignItems: 'flex-end', maxWidth: '120px' }}>
                          {platforms.length > 0 ? platforms.map(p => {
                            const nameMap = { ubereats: 'UBER EATS', deliveroo: 'DELIVEROO', justeat: 'JUST EAT' };
                            const bgMap = { ubereats: '#06C167', deliveroo: '#00CCBC', justeat: '#FF8000' };
                            return (
                              <span key={p} style={{ fontSize: '0.5rem', fontWeight: 800, padding: '0.15rem 0.3rem', borderRadius: '4px', background: bgMap[p] || '#F3F4F6', color: '#ffffff', letterSpacing: '0.05em' }}>
                                {nameMap[p] || p.toUpperCase()}
                              </span>
                            );
                          }) : <span style={{ fontSize: '0.72rem', color: '#D1D5DB' }}>—</span>}
                        </div>
                      </div>

                      <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

                      {/* Delivery fee (only if free) */}
                      {(!restaurant.delivery_fee || parseFloat(restaurant.delivery_fee) === 0) && (
                        <>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                              Free Delivery
                            </div>
                          </div>
                          <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />
                        </>
                      )}

                      {/* Promotions */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.2rem' }}>Promotions</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E86A58', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                          {restaurant.promo_count || (score > 60 ? 2 : 0)} Active
                        </div>
                      </div>

                      <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

                      {/* Relevance score bar -> Menu Overlap */}
                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.3rem' }}>Overlapping Level</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', width: '100%' }}>
                            <div style={{ width: '50px', height: '5px', borderRadius: '9999px', background: '#F3F4F6', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${score}%`, background: score >= 50 ? '#E86A58' : score >= 30 ? '#D97706' : '#10B981', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: score >= 50 ? '#E86A58' : score >= 30 ? '#D97706' : '#10B981', minWidth: '26px' }}>{score}%</span>
                          </div>
                          <span style={{ fontSize: '0.6rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {score >= 50 ? 'High Overlap' : score >= 30 ? 'Moderate' : 'Low Overlap'}
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 
        We no longer render a fixed modal here.
        Instead, RestaurantProfilePage is returned at the top of the component.
      */}
      
      {/* ── COMPARISON MODAL ─────────────────────────────────────────────────── */}
      <ComparisonModal 
        isOpen={!!comparisonTarget} 
        onClose={() => setComparisonTarget(null)} 
        ownerRestaurant={ownerRestaurant} 
        competitorRestaurant={comparisonTarget} 
      />
    </>
  );
};export default CompetitorsContent;
