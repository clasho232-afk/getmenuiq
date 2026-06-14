import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Star, Search, X, ShieldAlert, Shield, Layers,
  TrendingUp, MapPin, Wifi, BarChart2, RefreshCw
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import CompetitorSummaryModal from './CompetitorSummaryModal';
import { supabase } from '../supabase';
import {
  getRankedCompetitors,
  TIER,
  threatFromScore,
} from '../utils/competitorEngine';

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
  return L.divIcon({
    className: '',
    html: `
      <div style="display: flex; align-items: center; background: white; padding: 3px 8px 3px 3px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #E5E7EB; width: max-content;">
        <img src="${avatar}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'" />
        <div style="padding: 0 8px; font-weight: 700; font-size: 11px; color: #111;">${restaurant.name}</div>
        <div style="width: 8px; height: 8px; border-radius: 50%; background: ${threatColor}; box-shadow: 0 0 0 2px rgba(255,255,255,0.8);"></div>
      </div>
    `,
    iconSize: [null, null],
    iconAnchor: [15, 15]
  });
};

const ownerIcon   = L.divIcon({
  className: '',
  html: `<div style="width:20px;height:20px;background:#111;border-radius:50%;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,0.3);"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

// ─── Tier config (colours / labels) ───────────────────────────────────────────
const TIER_CONFIG = {
  [TIER.DIRECT]:   { label: 'Direct',   shortLabel: 'Tier 1', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  [TIER.ADJACENT]: { label: 'Adjacent', shortLabel: 'Tier 2', color: '#D97706', bg: '#FFFBEB', border: '#FDE68A' },
};

// ─── Detect which platforms a restaurant is on from its URL fields ─────────────
function detectPlatforms(restaurant) {
  const plats = [];
  if (restaurant.ubereats_url) plats.push('ubereats');
  // deliveroo_url and justeat_url not yet in DB schema — add when scraped
  return plats;
}

// ─── East London default centre ───────────────────────────────────────────────
const EAST_LONDON = [51.538, 0.018];

// ==========================================
// 1. GLOBAL INSTANCE LIFELINE
// ==========================================
// Make absolutely sure your map instance is attached to the window object 
// when you initialize it, like this: window.map = L.map('map-id', ...);
window.competitorLayerGroup = null; 

function createPopupContent(entry) {
  const { restaurant, tier, score } = entry;
  const cfg = TIER_CONFIG[tier] || {};
  return `
    <div style="padding: 0.25rem;">
      <div style="font-weight: 800; font-size: 0.85rem; color: #111827; margin-bottom: 2px;">${restaurant.name}</div>
      <div style="color: ${cfg.color || '#6B7280'}; font-size: 0.7rem; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">
        ${cfg.shortLabel || ''} · Score: ${score || 0}
      </div>
      <div style="font-size: 0.75rem; color: #4B5563; display: flex; flex-direction: column; gap: 4px;">
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #9CA3AF;">Delivery:</span>
          <strong>${restaurant.delivery_fee ? '£' + parseFloat(restaurant.delivery_fee).toFixed(2) : 'Free'}</strong>
        </div>
        <div style="display: flex; justify-content: space-between;">
          <span style="color: #9CA3AF;">Promos:</span>
          <strong>${restaurant.promo_count || 0} Active</strong>
        </div>
      </div>
    </div>
  `;
}

/**
 * Core rendering pipeline. Call this function inside EVERY tab click handler
 * passing the filtered array of competitors.
 * @param {Array} dataset - Array of restaurant objects containing lat and lng
 */
function populateWorkspaceMap(dataset) {
  // DIAGNOSTIC LOG 1: Verify data is actually reaching the map pipeline
  console.log("🗺️ Map Sync Triggered! Input dataset size:", dataset.length);
  if (dataset.length > 0) console.log("📦 Active Data Sample:", dataset[0]);

  // Fail-safe guard clause: If the map object isn't globally accessible, stop execution
  if (!window.map) {
    console.error("❌ CRITICAL: 'window.map' is undefined. Ensure your main map variable is assigned to window.map during initialization.");
    return;
  }

  // ==========================================
  // 2. LAYER CLEANING & RESET
  // ==========================================
  // If the layer group already exists, wipe it completely off the map grid
  if (window.competitorLayerGroup) {
    console.log("🧹 Clearing previous layer group markers...");
    window.competitorLayerGroup.clearLayers();
  } else {
    // If running for the first time, initialize a fresh Leaflet LayerGroup container
    console.log("🚀 Initializing new competitor LayerGroup container...");
    window.competitorLayerGroup = L.layerGroup().addTo(window.map);
  }

  // If the clicked tab dataset is empty (like an empty watchlist), stop here cleanly
  if (!dataset || dataset.length === 0) {
    console.warn("⚠️ Empty dataset passed. No markers to draw.");
    return;
  }

  // ==========================================
  // 3. MARKER INJECTION LOOP
  // ==========================================
  dataset.forEach((entry, index) => {
    const { restaurant, score } = entry;
    const lat = parseFloat(restaurant.lat);
    const lng = parseFloat(restaurant.lng);
    const hasActivePromos = restaurant.promo_count > 0;
    const avatarUrl = restaurant.hero_image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80';

    // Fail-safe coordinate check: Skip malformed data objects
    if (!lat || !lng) {
      console.error(`❌ Data Error at index ${index}: Missing 'lat' or 'lng' for`, restaurant);
      return; // Skip to next item
    }

    const threatColor = score >= 70 ? '#E86A58' : score >= 40 ? '#D97706' : '#10B981';

    // High-end custom HTML markup token container holding the logo thumbnail
    const customIconMarkup = `
      <div class="map-inline-banner" style="display: flex; align-items: center; background: white; padding: 3px 8px 3px 3px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); border: 1px solid #E5E7EB; width: max-content;">
        <img class="banner-avatar" src="${avatarUrl}" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'" alt="" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;" />
        <span class="banner-name" style="padding: 0 8px; font-weight: 700; font-size: 11px; color: #111;">${restaurant.name}</span>
        <span class="banner-status-dot ${hasActivePromos ? 'active-promo' : 'standard'}" style="width: 8px; height: 8px; border-radius: 50%; background: ${threatColor}; box-shadow: 0 0 0 2px rgba(255,255,255,0.8);"></span>
      </div>
    `;

    const customDivIcon = L.divIcon({
      html: customIconMarkup,
      className: 'custom-leaflet-banner-container', // Strips Leaflet default box wrapper styles
      iconSize: [null, null],                        // Allows dimensions to scale automatically via content font length
      iconAnchor: [15, 15]                           // Centers the text anchor point smoothly over coordinates
    });

    // Instantiate fresh marker coordinates
    const markerInstance = L.marker([lat, lng], { icon: customDivIcon });

    // Build and bind your responsive, unified promo layout popups
    const promoPopup = L.popup({
      autoPanPaddingTopLeft: L.point(20, 160),
      autoPanPaddingBottomRight: L.point(20, 20),
      className: 'custom-premium-popup-container'
    }).setContent(createPopupContent(entry));

    markerInstance.bindPopup(promoPopup);

    // Push marker directly into the dynamic layer group
    window.competitorLayerGroup.addLayer(markerInstance);
  });

  // ==========================================
  // 4. AUTOMATED VIEWPORT FRAMING
  // ==========================================
  const activeLayers = window.competitorLayerGroup.getLayers();
  console.log(`✅ Successfully mounted ${activeLayers.length} pins to window.competitorLayerGroup.`);

  if (activeLayers.length > 0) {
    // Self-calculate the precise bounding box of all pins and glide the camera to frame it
    const featureBounds = L.featureGroup(activeLayers).getBounds();
    window.map.flyToBounds(featureBounds, {
      padding: [50, 50],
      maxZoom: 15,
      duration: 1.0 // Cinematic camera transition transition speed
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
const CompetitorsContent = () => {

  // ── Data state ──────────────────────────────────────────────────────────────
  const [ownerRestaurant,   setOwnerRestaurant]   = useState(null);
  const [rankedCompetitors, setRankedCompetitors] = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState(null);

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [activeTier,     setActiveTier]     = useState(null); // null | 1 | 2 | 'WATCHLIST'
  const [watchlistIds,   setWatchlistIds]   = useState([]);
  const [selectedItem,   setSelectedItem]   = useState(null); // full ranked entry
  const [searchQuery,    setSearchQuery]    = useState('');
  const [activePills,    setActivePills]    = useState([]);   // 'No Delivery Fee' | 'Active Promos'
  const [isMapExpanded,  setIsMapExpanded]  = useState(true);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const mapRef = useRef(null);

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
  const displayList = rankedCompetitors.filter(c => {
    if (activeTier === 'WATCHLIST' && !watchlistIds.includes(c.restaurant.id)) return false;
    if (activeTier !== 'WATCHLIST' && activeTier !== null && c.tier !== activeTier) return false;
    if (searchQuery && !c.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activePills.includes('Active Promos')  && !(c.restaurant.promo_count > 0)) return false;
    if (activePills.includes('No Delivery Fee') && !(parseFloat(c.restaurant.delivery_fee || 1) === 0)) return false;
    return true;
  });

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
      priceChanges: restaurant.price_change_count || 0,
      lastChange:  restaurant.last_price_change || 'No recent changes',
      menuCategories: [],    // populated when RestaurantProfilePage fetches full menu
      sharedAreas: classification.sharedAreas || [],
      neighbouringAreas: classification.neighbouringAreas || [],
      tierLabel:   cfg.shortLabel || '',
    };
  };

  // ─── MapSyncController (Binds Leaflet map instance to global script) ──────────
  const MapSyncController = ({ dataset }) => {
    const map = useMap();
    useEffect(() => {
      window.map = map;
      populateWorkspaceMap(dataset);
    }, [dataset, map]);
    return null;
  };

  // ════════════════════════════════════════════════════════════════════════════
  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* ── MAP ─────────────────────────────────────────────────────────── */}
        {isMapExpanded && (
        <div style={{ position: 'relative', height: '240px', borderRadius: '24px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <MapContainer center={mapCenter} zoom={12} zoomControl={true} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }} ref={mapRef}>
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="© CartoDB" />
            <MapSyncController dataset={displayList} />
          </MapContainer>

          {/* Legend pill */}
          <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 30, background: 'rgba(255,255,255,0.95)', borderRadius: '12px', padding: '0.5rem 0.85rem', display: 'flex', gap: '0.85rem', boxShadow: '0 2px 10px rgba(0,0,0,0.12)', backdropFilter: 'blur(6px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} />
              Tier 1 — Same area
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#D97706' }} />
              Tier 2 — Bordering
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 700, color: '#374151' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#111' }} />
              You
            </div>
          </div>
        </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: isMapExpanded ? '-0.5rem' : '0' }}>
          <button 
            onClick={() => setIsMapExpanded(!isMapExpanded)}
            style={{ 
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: '9999px', padding: '0.25rem 1rem', 
              fontSize: '0.7rem', color: '#6B7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.25rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)', zIndex: 10 
            }}>
            {isMapExpanded ? '▲ Collapse Map' : '▼ Expand Map'}
          </button>
        </div>

        {/* ── SEARCH STRIP ────────────────────────────────────────────────── */}
        <div style={{ backgroundColor: '#fff', borderRadius: '9999px', padding: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
            {['No Delivery Fee', 'Active Promos'].map(pill => {
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

          {/* Tabs row */}
          <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.75rem' }}>
            {/* All */}
            <button onClick={() => setActiveTier(null)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: activeTier === null ? '#E86A58' : '#6B7280', cursor: 'pointer', position: 'relative', paddingBottom: '0.25rem', fontFamily: 'inherit' }}>
              All ({rankedCompetitors.length})
              {activeTier === null && <div style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, height: '2px', background: '#E86A58', borderRadius: '2px' }} />}
            </button>
            {/* Tier 1 */}
            <button onClick={() => setActiveTier(activeTier === TIER.DIRECT ? null : TIER.DIRECT)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: activeTier === TIER.DIRECT ? '#E86A58' : '#6B7280', cursor: 'pointer', position: 'relative', paddingBottom: '0.25rem', fontFamily: 'inherit' }}>
              Tier 1 — Direct ({tier1Count})
              {activeTier === TIER.DIRECT && <div style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, height: '2px', background: '#E86A58', borderRadius: '2px' }} />}
            </button>
            {/* Tier 2 */}
            <button onClick={() => setActiveTier(activeTier === TIER.ADJACENT ? null : TIER.ADJACENT)}
              style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: activeTier === TIER.ADJACENT ? '#E86A58' : '#6B7280', cursor: 'pointer', position: 'relative', paddingBottom: '0.25rem', fontFamily: 'inherit' }}>
              Tier 2 — Adjacent ({tier2Count})
              {activeTier === TIER.ADJACENT && <div style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, height: '2px', background: '#E86A58', borderRadius: '2px' }} />}
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

          {/* ── COMPETITOR CARDS ────────────────────────────────────────── */}
          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {displayList.map(({ restaurant, tier, score, classification, threat }) => {
                const cfg       = TIER_CONFIG[tier] || {};
                const platforms = detectPlatforms(restaurant);
                const isWatched = watchlistIds.includes(restaurant.id);
                const areas     = (restaurant.areas || []).slice(0, 2).join(', ') || '—';
                const sharedTip = classification.sharedAreas?.length
                  ? `Shares: ${classification.sharedAreas.join(', ')}`
                  : classification.neighbouringAreas?.length
                    ? `Borders: ${classification.neighbouringAreas.join(', ')}`
                    : '';

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
                          {cfg.shortLabel}
                        </span>
                        {/* Watchlist star */}
                        <button onClick={e => toggleWatchlist(restaurant.id, e)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                          <Star size={15} fill={isWatched ? '#F59E0B' : 'none'} color={isWatched ? '#F59E0B' : '#D1D5DB'} />
                        </button>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <MapPin size={11} />
                        <span title={sharedTip}>{areas}</span>
                        {classification.distanceKm && (
                          <span style={{ color: '#D1D5DB' }}>·&nbsp;{classification.distanceKm.toFixed(1)} km</span>
                        )}
                        <span style={{ color: '#D1D5DB' }}>·</span>
                        <span>{(restaurant.cuisines || []).slice(0, 2).join(', ') || '—'}</span>
                      </div>
                      {/* Shared area context */}
                      {sharedTip && (
                        <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', color: '#6B7280', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.35rem', background: '#F9FAFB', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid #F3F4F6', width: 'fit-content' }}>
                          <span style={{ fontSize: '0.75rem' }}>⚠️</span>
                          {sharedTip.replace('Shares:', 'Cross-zone boundary crossover:').replace('Borders:', 'Adjacent boundary crossover:')}
                        </div>
                      )}
                    </div>

                    {/* Stats columns */}
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexShrink: 0 }}>

                      {/* Platforms */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.3rem' }}>Platforms</div>
                        <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', flexWrap: 'wrap', maxWidth: '120px' }}>
                          {platforms.length > 0 ? platforms.map(p => {
                            const nameMap = { ubereats: 'UBER EATS', deliveroo: 'DELIVEROO', justeat: 'JUST EAT' };
                            return (
                              <span key={p} style={{ fontSize: '0.55rem', fontWeight: 800, padding: '0.2rem 0.4rem', borderRadius: '4px', background: '#F3F4F6', color: '#4B5563', letterSpacing: '0.05em' }}>
                                {nameMap[p] || p.toUpperCase()}
                              </span>
                            );
                          }) : <span style={{ fontSize: '0.72rem', color: '#D1D5DB' }}>—</span>}
                        </div>
                      </div>

                      <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

                      {/* Delivery fee */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.2rem' }}>Delivery</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>
                          {restaurant.delivery_fee
                            ? `£${parseFloat(restaurant.delivery_fee).toFixed(2)}`
                            : 'Free'}
                        </div>
                      </div>

                      <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

                      {/* Rating */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.2rem' }}>Rating</div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'flex', alignItems: 'center', gap: '0.25rem', justifyContent: 'flex-end' }}>
                          ⭐ {restaurant.rating ? parseFloat(restaurant.rating).toFixed(1) : '—'}
                        </div>
                      </div>

                      <div style={{ width: 1, height: 28, background: '#E5E7EB' }} />

                      {/* Relevance score bar */}
                      <div style={{ textAlign: 'right', minWidth: '80px' }}>
                        <div style={{ fontSize: '0.68rem', color: '#9CA3AF', fontWeight: 600, marginBottom: '0.3rem' }}>Threat Score</div>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', justifyContent: 'flex-end', width: '100%' }}>
                            <div style={{ width: '50px', height: '5px', borderRadius: '9999px', background: '#F3F4F6', overflow: 'hidden' }}>
                              <div style={{ height: '100%', width: `${score}%`, background: score >= 70 ? '#E86A58' : score >= 40 ? '#D97706' : '#10B981', borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                            </div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: score >= 70 ? '#E86A58' : score >= 40 ? '#D97706' : '#10B981', minWidth: '26px' }}>{score}</span>
                          </div>
                          <span style={{ fontSize: '0.6rem', color: '#6B7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            {score >= 70 ? 'High Threat' : score >= 40 ? 'Moderate' : 'Low Threat'}
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

      {/* ── COMPETITOR MODAL ──────────────────────────────────────────────── */}
      <CompetitorSummaryModal
        competitor={toModalShape(selectedItem)}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
};

export default CompetitorsContent;
