import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Star, Search, X, ShieldAlert, Shield, Layers,
  TrendingUp, MapPin, Wifi, BarChart2, Maximize, Minimize, GitCompare
} from 'lucide-react';
import { MapContainer, TileLayer, Circle, Marker, Tooltip, Popup, useMap, useMapEvents, ZoomControl } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
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
const customPinCache = new Map();
const makeCustomPin = (restaurant, score) => {
  const cacheKey = `${restaurant.id}-${score}`;
  if (customPinCache.has(cacheKey)) return customPinCache.get(cacheKey);

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

  const icon = L.divIcon({
    className: 'custom-profile-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translateY(-100%) scale(0.6); transform-origin: bottom center; padding-bottom: 4px;">
        <!-- Profile Card -->
        <div style="background: #FFF; border-radius: 6px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); max-width: 110px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: 4px; font-family: 'Inter', sans-serif;">
          <img src="${avatar}" style="width: 100%; height: 42px; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'" />
          <div style="padding: 6px 8px; text-align: center; width: 100%; box-sizing: border-box;">
            <div style="font-weight: 500; font-size: 12px; color: #1F2937; line-height: 1.2; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${restaurant.name}</div>
          </div>
        </div>
        <!-- Status Dot -->
        <div style="width: 12px; height: 12px; border-radius: 50%; background: ${threatColor}; box-shadow: 0 0 0 2px #FFF, 0 2px 4px rgba(0,0,0,0.2);"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
  
  customPinCache.set(cacheKey, icon);
  return icon;
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

const ownerPinCache = new Map();
const makeOwnerPin = (ownerRestaurant) => {
  const cacheKey = ownerRestaurant?.id || 'owner';
  if (ownerPinCache.has(cacheKey)) return ownerPinCache.get(cacheKey);

  const avatar = ownerRestaurant?.hero_image_url || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80';
  const name = ownerRestaurant?.name || 'Your Shop';
  const icon = L.divIcon({
    className: 'custom-owner-profile-pin',
    html: `
      <div style="display: flex; flex-direction: column; align-items: center; transform: translateY(-100%); padding-bottom: 4px; z-index: 9999; position: relative;">
        <!-- Profile Card -->
        <div style="background: #FFF; border-radius: 6px; border: 2px solid #DC2626; box-shadow: 0 4px 10px rgba(0,0,0,0.15); max-width: 110px; overflow: hidden; display: flex; flex-direction: column; margin-bottom: 4px; font-family: 'Inter', sans-serif;">
          <img src="${avatar}" style="width: 100%; height: 42px; object-fit: cover; display: block;" onerror="this.src='https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=150&q=80'" />
          <div style="padding: 6px 8px; text-align: center; width: 100%; box-sizing: border-box;">
            <div style="font-weight: 600; font-size: 12px; color: #1F2937; line-height: 1.2; letter-spacing: 0.02em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;">${name}</div>
          </div>
        </div>
        <!-- Status Dot (Pulse effect) -->
        <div style="width: 12px; height: 12px; border-radius: 50%; background: #DC2626; box-shadow: 0 0 0 2px #FFF, 0 0 0 5px rgba(220, 38, 38, 0.25), 0 2px 6px rgba(0,0,0,0.2);"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
  ownerPinCache.set(cacheKey, icon);
  return icon;
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

const MapBoundsListener = ({ isFullScreen, setMapBounds, ownerRestaurant, ownerLat, ownerLng }) => {
  const map = useMapEvents({
    zoomend: () => setMapBounds(map.getBounds()),
    moveend: () => setMapBounds(map.getBounds()),
    resize: () => setMapBounds(map.getBounds())
  });

  useEffect(() => {
    if (map) {
      map.invalidateSize();
      if (isFullScreen) {
        const lat = parseFloat(ownerRestaurant?.lat) || ownerLat;
        const lng = parseFloat(ownerRestaurant?.lng) || ownerLng;
        map.setView([lat, lng], 16, { animate: false });
      }
      setMapBounds(map.getBounds());
      const t = setTimeout(() => {
        map.invalidateSize();
        setMapBounds(map.getBounds());
      }, 150);
      setTimeout(() => map.invalidateSize(), 500);
      return () => clearTimeout(t);
    }
  }, [map, isFullScreen]);

  return null;
};

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
  const [removedCompetitorIds, setRemovedCompetitorIds] = useState([]);
  const [searchQuery,    setSearchQuery]    = useState('');
  const [searchLoading,  setSearchLoading]  = useState(false);
  const [searchResults,  setSearchResults]  = useState([]);
  const [activePromoFilters, setActivePromoFilters] = useState([]); // 'No Delivery Fee' | 'Active Promos'
  const [activePlatformFilters, setActivePlatformFilters] = useState([]);
  const [activeAreaFilters, setActiveAreaFilters] = useState([]);
  const [activeCuisineFilters, setActiveCuisineFilters] = useState([]);
  const [activeOverlapFilter, setActiveOverlapFilter] = useState([]); // Now an array for multi-select
  
  // High-Density Ribbon Popover States
  const [isCuisinePopoverOpen, setIsCuisinePopoverOpen] = useState(false);
  const [isOverlapPopoverOpen, setIsOverlapPopoverOpen] = useState(false);
  const [isAreaComboboxOpen, setIsAreaComboboxOpen] = useState(false);
  const [isPlatformPopoverOpen, setIsPlatformPopoverOpen] = useState(false);
  const [isPromosPopoverOpen, setIsPromosPopoverOpen] = useState(false);
  const [areaSearchQuery, setAreaSearchQuery] = useState('');
  
  const cuisineRef = useRef(null);
  const overlapRef = useRef(null);
  const areaRef = useRef(null);
  const platformRef = useRef(null);
  const promosRef = useRef(null);

  const [viewMode, setViewMode] = useState('Map'); // 'Map' | 'List' | 'Matrix'
  const [matrixCompetitors, setMatrixCompetitors] = useState([]); // Now stores full restaurant objects
  const [toastMessage, setToastMessage] = useState('');
  const [mapBounds, setMapBounds] = useState(null);
  const [visibleMapCompetitors, setVisibleMapCompetitors] = useState([]);
  const [hoveredCompetitorId, setHoveredCompetitorId] = useState(null);

  const uniqueAreas = useMemo(() => {
    const areas = new Set();
    rankedCompetitors.forEach(c => {
      if (c.restaurant.areas) c.restaurant.areas.forEach(a => areas.add(a));
    });
    return Array.from(areas).sort();
  }, [rankedCompetitors]);

  const uniqueCuisines = useMemo(() => {
    const cuisines = new Set();
    rankedCompetitors.forEach(c => {
      if (c.restaurant.cuisines) c.restaurant.cuisines.forEach(cu => cuisines.add(cu));
    });
    return Array.from(cuisines).sort();
  }, [rankedCompetitors]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cuisineRef.current && !cuisineRef.current.contains(e.target)) setIsCuisinePopoverOpen(false);
      if (overlapRef.current && !overlapRef.current.contains(e.target)) setIsOverlapPopoverOpen(false);
      if (areaRef.current && !areaRef.current.contains(e.target)) setIsAreaComboboxOpen(false);
      if (platformRef.current && !platformRef.current.contains(e.target)) setIsPlatformPopoverOpen(false);
      if (promosRef.current && !promosRef.current.contains(e.target)) setIsPromosPopoverOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Dynamic area label for Tier 1
  const primaryAreaName = ownerRestaurant?.primaryArea || (ownerRestaurant?.areas && ownerRestaurant.areas.length > 0 ? ownerRestaurant.areas[0] : "Local Area");

  const ownerIcon = useMemo(() => makeOwnerPin(ownerRestaurant), [ownerRestaurant]);

  const ownerLat = 51.5285;
  const ownerLng = -0.0450;

  const handleRowClick = (entry) => {
    setSelectedItem(entry);
    const { restaurant } = entry;
    if (restaurant.lat && restaurant.lng && mapRef.current) {
      mapRef.current.flyTo([parseFloat(restaurant.lat), parseFloat(restaurant.lng)], 16, { duration: 1.2 });
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

      let ranked = await getRankedCompetitors(supabase, owner);

      // Inject Mock Data to populate map
      const names = ["Burger Queen", "Pasta Palace", "Curry Express", "Vegan Bites", "Sushi Station", "Taco Fiesta", "Grill Master", "Pizza Pronto", "Wok & Roll", "Salad Bowl", "Kebab King", "Noodle Ninja", "Bento Box", "Roast Hub", "Deli Delight", "Pancake House"];
      const images = [
        "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1544025162-831e5f8f9cdb?auto=format&fit=crop&w=300&q=80",
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80"
      ];
      
      const mockCompetitors = Array.from({ length: 40 }).map((_, i) => {
        const angle = Math.random() * Math.PI * 2;
        const radiusMiles = 0.1 + Math.random() * 2.0; // within 2 miles
        const radiusDeg = radiusMiles / 69;
        const platIdx = Math.floor(Math.random() * 3);
        const platforms = ['ubereats_url', 'deliveroo_url', 'justeat_url'];
        
        return {
          tier: Math.random() > 0.5 ? TIER.DIRECT : TIER.ADJACENT,
          score: Math.floor(Math.random() * 50) + 40,
          restaurant: {
            id: `mock-${i}`,
            name: names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : ''),
            lat: (parseFloat(owner.lat) || 51.5285) + radiusDeg * Math.cos(angle),
            lng: (parseFloat(owner.lng) || -0.0450) + (radiusDeg * Math.sin(angle)) / Math.cos((parseFloat(owner.lat) || 51.5285) * Math.PI / 180),
            delivery_fee: (Math.random() * 3).toFixed(2),
            promo_count: Math.floor(Math.random() * 3),
            hero_image_url: images[i % images.length],
            [platforms[platIdx]]: 'http://example.com',
            [platforms[(platIdx + 1) % 3]]: Math.random() > 0.5 ? 'http://example.com' : null
          }
        };
      });
      
      ranked = [...ranked, ...mockCompetitors];

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
  const baseDisplayList = useMemo(() => {
    return rankedCompetitors.filter(c => {
      if (activeTier === 'WATCHLIST' && !watchlistIds.includes(c.restaurant.id)) return false;
      if (activeTier !== 'WATCHLIST' && activeTier !== null && c.tier !== activeTier) return false;
      if (removedCompetitorIds.includes(c.restaurant.id)) return false;
      if (activePromoFilters.includes('Active Promos')  && !(c.restaurant.promo_count > 0)) return false;
      if (activePromoFilters.includes('No Delivery Fee') && !(parseFloat(c.restaurant.delivery_fee || 1) === 0)) return false;
      
      // New Filter Ribbon Logic
      if (activePlatformFilters.length > 0) {
        const platforms = detectPlatforms(c.restaurant);
        const hasMatch = activePlatformFilters.some(p => platforms.includes(p));
        if (!hasMatch) return false;
      }
      if (activeAreaFilters.length > 0) {
        if (!c.restaurant.areas) return false;
        const hasMatch = activeAreaFilters.some(area => c.restaurant.areas.includes(area));
        if (!hasMatch) return false;
      }
      if (activeOverlapFilter.length > 0) {
        const matchesHigh = activeOverlapFilter.includes('High') && c.score > 70;
        const matchesMed = activeOverlapFilter.includes('Med') && (c.score >= 30 && c.score <= 70);
        const matchesLow = activeOverlapFilter.includes('Low') && c.score < 30;
        if (!matchesHigh && !matchesMed && !matchesLow) return false;
      }
      if (activeCuisineFilters.length > 0) {
        if (!c.restaurant.cuisines) return false;
        const hasMatch = activeCuisineFilters.some(cuisine => c.restaurant.cuisines.includes(cuisine));
        if (!hasMatch) return false;
      }

      return true;
    });
  }, [rankedCompetitors, activeTier, watchlistIds, removedCompetitorIds, activePromoFilters, activePlatformFilters, activeAreaFilters, activeOverlapFilter, activeCuisineFilters]);

  // ── Recalculate visible competitors when map bounds change ────────────────────
  useEffect(() => {
    if (!mapBounds || viewMode !== 'Map') {
      setVisibleMapCompetitors(prev => prev.length === 0 ? prev : []);
      return;
    }

    const visible = baseDisplayList.filter(entry => {
      const { restaurant } = entry;
      if (!restaurant.lat || !restaurant.lng) return false;

      const latLng = L.latLng(parseFloat(restaurant.lat), parseFloat(restaurant.lng));
      return mapBounds.contains(latLng);
    });

    setVisibleMapCompetitors(prev => {
      if (prev.length !== visible.length) return visible;
      const isSame = prev.every((item, idx) => item.restaurant.id === visible[idx].restaurant.id);
      return isSame ? prev : visible;
    });
  }, [mapBounds, baseDisplayList, viewMode]);

  const displayList = baseDisplayList;

  // ── Global Search Autocomplete ──────────────────────────────────────────────────
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearchLoading(true);
    const timer = setTimeout(async () => {
      try {
        // 1. Search local ranked competitors (to ensure mock data visible on screen is found)
        const localMatches = rankedCompetitors
          .filter(c => c.restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()))
          .map(c => c.restaurant);

        // 2. Search full Supabase database
        const { data, error } = await supabase
          .from('restaurants')
          .select('id, name, hero_image_url, city, cuisines, lat, lng')
          .ilike('name', `%${searchQuery}%`)
          .limit(8);
          
        let combined = [...localMatches];
        if (!error && data) {
          data.forEach(dbRes => {
            if (!combined.some(c => c.id === dbRes.id)) {
              combined.push(dbRes);
            }
          });
        }
        
        setSearchResults(combined.slice(0, 8));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

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
      
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', background: 'linear-gradient(to bottom, rgba(253, 251, 247, 0) 0%, rgba(253, 251, 247, 0.4) 40%, rgba(253, 251, 247, 0.4) 100%)', overflow: 'hidden' }}>

        {/* MAIN SPLIT CONTAINER */}
        <div style={{ display: 'flex', flexDirection: 'row-reverse', flex: 1, minHeight: 0, overflow: 'visible', gap: '1.5rem', padding: '1.5rem 2rem 1.5rem 2rem' }}>
          {/* ── MAP ─────────────────────────────────────────────────────────── */}
          {viewMode === 'Map' && (
          <div style={{ position: 'relative', flex: 1, height: 'calc(100% - 3.5vh)', minHeight: 0, overflow: 'hidden', borderRadius: '24px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', backgroundColor: '#FFF', marginTop: '3.5vh' }}>
          {/* Platform Filters */}
          <MapContainer center={[ownerLat, ownerLng]} zoom={16} zoomControl={false} scrollWheelZoom={true} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} ref={mapRef}>
            <ZoomControl position="topright" />
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" attribution="© CartoDB" />
            <MapBoundsListener 
              isFullScreen={viewMode === 'Map'} 
              setMapBounds={setMapBounds} 
              ownerRestaurant={ownerRestaurant} 
              ownerLat={ownerLat} 
              ownerLng={ownerLng} 
            />
            
            {/* Owner pin */}
            <Marker position={[ownerLat, ownerLng]} icon={ownerIcon} zIndexOffset={1000} />

            {/* Competitor pins */}
            <MarkerClusterGroup chunkedLoading maxClusterRadius={60}>
            {baseDisplayList
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
                      setSelectedItem(entry);
                    }
                  }}
                >
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
                </Marker>
              );
            })}
            </MarkerClusterGroup>
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
          )} {/* End Map */}

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <div style={{ 
            width: viewMode === 'Map' ? '564px' : '100%', 
            marginLeft: viewMode === 'Map' ? '-0.875rem' : '0', 
            marginRight: viewMode === 'Map' ? '0.5rem' : '0',
            borderRight: viewMode === 'Map' ? '1px solid #E5E7EB' : 'none',
            flexShrink: 0, 
            display: 'flex', 
            flexDirection: 'column', 
            height: 'calc(100% - 3.5vh)', 
            marginTop: '3.5vh', 
            minHeight: 0, 
            position: 'relative' 
          }}>
            <h2 style={{ position: 'absolute', top: '-3rem', left: '0.75rem', margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111827', fontFamily: "'Inter', sans-serif" }}>Competitors</h2>

            {/* ── DIRECTORY CARD (MODULE) ──────────────────────────────────────────────── */}
            <div style={{ 
              flex: 1, 
              minHeight: 0,
              display: 'flex', 
              flexDirection: 'column', 
              overflowY: 'auto'
            }}>

              {/* ── STICKY CONTROL DECK ──────────────────────────────────────────────── */}
              <div style={{ 
                position: 'sticky', 
                top: 0, 
                zIndex: 10, 
                background: '#F5F3EC',
                padding: '0 3rem 0.5rem 0.75rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                {/* Row 1: Search Input */}
                <div style={{ position: 'relative', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#FFF', border: '1px solid #E5E7EB', borderRadius: viewMode === 'Map' ? '24px' : '16px', padding: '10px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                    <Search size={16} color="#9CA3AF" />
                    <input
                      type="text"
                      placeholder="Search competitor name globally..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px', background: 'transparent', fontFamily: "'Inter', sans-serif", color: '#111827' }}
                    />
                    {searchQuery && (
                      <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex', padding: 0 }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  
                  {/* Search Autocomplete Dropdown */}
                  {searchQuery.length >= 2 && (
                    <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: '#FFF', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB', zIndex: 1000, overflow: 'hidden' }}>
                      {searchLoading ? (
                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>Searching database...</div>
                      ) : searchResults.length > 0 ? (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                          {searchResults.map(res => (
                            <div 
                              key={res.id}
                              onClick={() => {
                                const existing = baseDisplayList.find(c => c.restaurant.id === res.id);
                                if (existing) {
                                  setSelectedItem(existing);
                                } else {
                                  setSelectedItem({ restaurant: res, score: 0, tier: 2, classification: { distanceKm: null } });
                                }
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                              style={{ padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', borderBottom: '1px solid #F3F4F6', transition: 'background-color 0.2s', fontFamily: "'Inter', sans-serif" }}
                              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <img src={res.hero_image_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80'} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} alt="" />
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{res.name}</div>
                                <div style={{ fontSize: '11px', color: '#6B7280' }}>{res.city || 'London'} • {res.cuisines ? res.cuisines[0] : 'Restaurant'}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{ padding: '12px', textAlign: 'center', fontSize: '12px', color: '#6B7280', fontFamily: "'Inter', sans-serif" }}>No competitors found globally</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Row 2: Tabs and Filter Dropdowns */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.08)', paddingBottom: '0.75rem', marginTop: '0.25rem', opacity: viewMode === 'Matrix' ? 0.5 : 1, pointerEvents: viewMode === 'Matrix' ? 'none' : 'auto' }}>
                  {/* Left Side: Tabs */}
                  <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                    {/* All */}
                    <button onClick={() => setActiveTier(null)}
                      style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: activeTier === null ? '#E86A58' : '#6B7280', cursor: 'pointer', position: 'relative', paddingBottom: '0.25rem', fontFamily: "'Inter', sans-serif" }}>
                      All ({rankedCompetitors.length})
                      {activeTier === null && <div style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, height: '2px', background: '#E86A58', borderRadius: '2px' }} />}
                    </button>

                    {/* Watchlist */}
                    <button onClick={() => setActiveTier(activeTier === 'WATCHLIST' ? null : 'WATCHLIST')}
                      style={{ background: 'transparent', border: 'none', fontSize: '0.85rem', fontWeight: 600, color: activeTier === 'WATCHLIST' ? '#E86A58' : '#6B7280', cursor: 'pointer', position: 'relative', paddingBottom: '0.25rem', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Star size={14} fill={activeTier === 'WATCHLIST' ? '#E86A58' : 'none'} />
                      Watchlist ({watchlistIds.length})
                      {activeTier === 'WATCHLIST' && <div style={{ position: 'absolute', bottom: '-12px', left: 0, right: 0, height: '2px', background: '#E86A58', borderRadius: '2px' }} />}
                    </button>
                  </div>

                  {/* Right Side: Filter Dropdowns */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {/* Platforms Popover */}
                  <div style={{ position: 'relative' }} ref={platformRef}>
                    <button 
                      onClick={() => { setIsPlatformPopoverOpen(!isPlatformPopoverOpen); setIsCuisinePopoverOpen(false); setIsOverlapPopoverOpen(false); setIsPromosPopoverOpen(false); setIsAreaComboboxOpen(false); }}
                      style={{ padding: '4px 10px', borderRadius: viewMode === 'Map' ? '24px' : '16px', border: activePlatformFilters.length > 0 ? '1px solid #E86A58' : '1px solid #E5E7EB', backgroundColor: activePlatformFilters.length > 0 ? '#FFF0EE' : '#FFF', fontSize: '12px', fontWeight: 500, color: activePlatformFilters.length > 0 ? '#E86A58' : '#1F2937', cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Platforms {activePlatformFilters.length > 0 && `(${activePlatformFilters.length})`} <span style={{ fontSize: '10px' }}>⌄</span>
                    </button>
                    {isPlatformPopoverOpen && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: '0', backgroundColor: '#FFF', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB', zIndex: 1000, width: '150px', padding: '0.5rem' }}>
                        {['ubereats', 'deliveroo', 'justeat'].map(platform => {
                          const isChecked = activePlatformFilters.includes(platform);
                          const labels = { ubereats: 'Uber Eats', deliveroo: 'Deliveroo', justeat: 'Just Eat' };
                          return (
                            <label key={platform} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => {
                                  if (isChecked) setActivePlatformFilters(prev => prev.filter(p => p !== platform));
                                  else setActivePlatformFilters(prev => [...prev, platform]);
                                }} 
                                style={{ accentColor: '#E86A58', cursor: 'pointer' }}
                              />
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <div style={{ width: '16px', height: '16px', borderRadius: '50%', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2px', background: 'white' }}>
                                  <img src={PLATFORM_ICONS[platform]} alt={platform} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </div>
                                {labels[platform]}
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Cuisine Popover */}
                  <div style={{ position: 'relative' }} ref={cuisineRef}>
                    <button 
                      onClick={() => { setIsCuisinePopoverOpen(!isCuisinePopoverOpen); setIsPlatformPopoverOpen(false); setIsOverlapPopoverOpen(false); setIsPromosPopoverOpen(false); setIsAreaComboboxOpen(false); }}
                      style={{ padding: '4px 10px', borderRadius: viewMode === 'Map' ? '24px' : '16px', border: activeCuisineFilters.length > 0 ? '1px solid #E86A58' : '1px solid #E5E7EB', backgroundColor: activeCuisineFilters.length > 0 ? '#FFF0EE' : '#FFF', fontSize: '12px', fontWeight: 500, color: activeCuisineFilters.length > 0 ? '#E86A58' : '#1F2937', cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Cuisine {activeCuisineFilters.length > 0 && `(${activeCuisineFilters.length})`} <span style={{ fontSize: '10px' }}>⌄</span>
                    </button>
                    {isCuisinePopoverOpen && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: '0', backgroundColor: '#FFF', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB', zIndex: 1000, width: '180px', maxHeight: '200px', overflowY: 'auto', padding: '0.5rem' }}>
                        {uniqueCuisines.map(cuisine => {
                          const isChecked = activeCuisineFilters.includes(cuisine);
                          return (
                            <label key={cuisine} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => {
                                  if (isChecked) setActiveCuisineFilters(prev => prev.filter(c => c !== cuisine));
                                  else setActiveCuisineFilters(prev => [...prev, cuisine]);
                                }} 
                                style={{ accentColor: '#E86A58', cursor: 'pointer' }}
                              />
                              {cuisine}
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Promos Popover */}
                  <div style={{ position: 'relative' }} ref={promosRef}>
                    <button 
                      onClick={() => { setIsPromosPopoverOpen(!isPromosPopoverOpen); setIsPlatformPopoverOpen(false); setIsCuisinePopoverOpen(false); setIsOverlapPopoverOpen(false); setIsAreaComboboxOpen(false); }}
                      style={{ padding: '4px 10px', borderRadius: viewMode === 'Map' ? '24px' : '16px', border: activePromoFilters.length > 0 ? '1px solid #E86A58' : '1px solid #E5E7EB', backgroundColor: activePromoFilters.length > 0 ? '#FFF0EE' : '#FFF', fontSize: '12px', fontWeight: 500, color: activePromoFilters.length > 0 ? '#E86A58' : '#1F2937', cursor: 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      Promos {activePromoFilters.length > 0 && `(${activePromoFilters.length})`} <span style={{ fontSize: '10px' }}>⌄</span>
                    </button>
                    {isPromosPopoverOpen && (
                      <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: '0', backgroundColor: '#FFF', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', border: '1px solid #E5E7EB', zIndex: 1000, width: '160px', padding: '0.5rem' }}>
                        {['Active Promos', 'No Delivery Fee'].map(promo => {
                          const isChecked = activePromoFilters.includes(promo);
                          return (
                            <label key={promo} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px', cursor: 'pointer', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>
                              <input 
                                type="checkbox" 
                                checked={isChecked} 
                                onChange={() => {
                                  if (isChecked) setActivePromoFilters(prev => prev.filter(p => p !== promo));
                                  else setActivePromoFilters(prev => [...prev, promo]);
                                }} 
                                style={{ accentColor: '#E86A58', cursor: 'pointer' }}
                              />
                              {promo}
                            </label>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

                {/* Active filter context label */}
                {activeTier !== null && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1rem', borderRadius: '10px', background: activeTier === TIER.DIRECT ? '#FEF2F2' : activeTier === 'WATCHLIST' ? '#FEFCE8' : '#FFFBEB', border: `1px solid ${activeTier === TIER.DIRECT ? '#FECACA' : activeTier === 'WATCHLIST' ? '#FEF08A' : '#FDE68A'}`, fontFamily: "'Inter', sans-serif", marginTop: '0.5rem' }}>
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
              </div>
              {/* ── END STICKY CONTROL DECK ────────────────────────────────────────── */}

              {/* ── SCROLLING FEED ─────────────────────────────────────────────────── */}
              <div style={{ padding: '0.5rem 3rem 1.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

                {/* ── LOADING ─────────────────────────────────────────────────── */}
                {loading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem', gap: '1rem', fontFamily: "'Inter', sans-serif" }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem', paddingBottom: '6rem', fontFamily: "'Inter', sans-serif" }}>
              {displayList.map(({ restaurant, tier, score }) => {
                const isSelected = matrixCompetitors.some(r => r.id === restaurant.id);
                const locationString = Array.isArray(restaurant.areas) && restaurant.areas.length > 0 ? restaurant.areas[0] : (restaurant.city || 'London');
                
                let scoreColor = '#EF4444'; 
                if (score >= 80) scoreColor = '#10B981'; 
                else if (score >= 50) scoreColor = '#F59E0B'; 
                
                return (
                  <div 
                    key={restaurant.id}
                    onClick={() => {
                      setMatrixCompetitors(prev => {
                        if (prev.some(r => r.id === restaurant.id)) return prev.filter(r => r.id !== restaurant.id);
                        if (prev.length >= 3) {
                          setToastMessage('Maximum 4 competitors (including you) can be compared.');
                          setTimeout(() => setToastMessage(''), 3000);
                          return prev;
                        }
                        return [...prev, restaurant];
                      });
                    }}
                    style={{
                      backgroundColor: '#FCFBF8',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      border: isSelected ? '2px solid #E86A58' : '1px solid rgba(0,0,0,0.15)',
                      boxShadow: isSelected ? '0 4px 15px rgba(232, 106, 88, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      transition: 'transform 0.2s ease, box-shadow 0.2s ease, border 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = isSelected ? '0 16px 40px -8px rgba(232, 106, 88, 0.4)' : '0 16px 40px -8px rgba(0,0,0,0.12)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isSelected ? '0 4px 15px rgba(232, 106, 88, 0.3)' : '0 4px 15px rgba(0,0,0,0.05)'; }}
                  >
                    {isSelected && (
                      <div style={{ position: 'absolute', top: '10px', right: '10px', backgroundColor: '#E86A58', color: '#fff', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.2)', fontSize: '14px', fontWeight: 900 }}>
                        ✓
                      </div>
                    )}
                    
                    {/* Compare Button */}
                    <div 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setComparisonTarget(restaurant);
                        setMatrixCompetitors(prev => {
                          if (prev.some(r => r.id === restaurant.id)) return prev;
                          const newList = [...prev, restaurant];
                          return newList.length > 3 ? newList.slice(0, 3) : newList;
                        });
                      }}
                      style={{ position: 'absolute', top: '10px', right: isSelected ? '70px' : '40px', backgroundColor: '#FFF', color: '#9CA3AF', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#3B82F6'; e.currentTarget.style.backgroundColor = '#EFF6FF'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = '#FFF'; }}
                      title="Compare competitor"
                    >
                      <GitCompare size={12} />
                    </div>

                    {/* Hide Button */}
                    <div 
                      onClick={(e) => { e.stopPropagation(); setRemovedCompetitorIds(prev => [...prev, restaurant.id]); }}
                      style={{ position: 'absolute', top: '10px', right: isSelected ? '40px' : '10px', backgroundColor: '#FFF', color: '#9CA3AF', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10, boxShadow: '0 2px 4px rgba(0,0,0,0.1)', cursor: 'pointer', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = '#FFF'; }}
                      title="Remove from list"
                    >
                      <X size={12} />
                    </div>
                    <div style={{ height: '140px', width: '100%', overflow: 'hidden', backgroundColor: '#F3F1EC', position: 'relative' }}>
                      <img src={restaurant.hero_image_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80'} alt={restaurant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem', flex: 1 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {restaurant.name}
                        </h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                          {/* Menu Overlap Metric */}
                          <div style={{ flex: '0 0 50%', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ fontSize: '0.65rem', fontWeight: 600, color: '#6B7280' }}>Overlap</span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#4B5563' }}>{score}%</span>
                            </div>
                            <div style={{ width: '100%', height: '3px', backgroundColor: '#F3F4F6', borderRadius: '999px', overflow: 'hidden' }}>
                              <div style={{ width: `${score}%`, height: '100%', backgroundColor: score >= 50 ? '#E86A58' : score >= 30 ? '#D97706' : '#10B981', borderRadius: '999px' }} />
                            </div>
                          </div>

                          {/* Health Score Metric */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.1rem', marginTop: '-0.2rem', textAlign: 'right' }}>
                            <span style={{ fontSize: '0.5rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Health Score</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.1rem', justifyContent: 'flex-end' }}>
                              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: scoreColor, letterSpacing: '-0.02em', lineHeight: 1 }}>{score}</span>
                              <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#64748B' }}>/100</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto', paddingTop: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#8A92A6', fontSize: '0.65rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <MapPin size={10} color="#8A92A6" />
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{locationString}</span>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111', flexShrink: 0 }}>
                           {restaurant.delivery_fee ? `£${parseFloat(restaurant.delivery_fee).toFixed(2)}` : 'Free'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {!loading && !error && viewMode === 'Map' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', minHeight: 0, paddingBottom: '6rem' }}>
              {displayList.map((entry) => {
                const { restaurant, score } = entry;
                return (
                <div 
                  key={restaurant.id} 
                  onClick={() => setSelectedItem(entry)}
                  style={{ 
                    display: 'flex', flexDirection: 'column', gap: '0.65rem', 
                    padding: '1rem', borderRadius: '16px', cursor: 'pointer', 
                    transition: 'all 0.2s ease', backgroundColor: '#FCFBF8',
                    border: '1px solid rgba(0,0,0,0.15)',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                  }} 
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 16px 40px -8px rgba(0,0,0,0.12)';
                    setHoveredCompetitorId(restaurant.id);
                  }} 
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.05)';
                    setHoveredCompetitorId(null);
                  }}
                >
                  {/* Top Row */}
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', position: 'relative' }}>
                    
                    {/* Hide Button */}
                    <div 
                      onClick={(e) => { e.stopPropagation(); setRemovedCompetitorIds(prev => [...prev, restaurant.id]); }}
                      style={{ position: 'absolute', top: '-4px', right: '-4px', color: '#9CA3AF', cursor: 'pointer', padding: '4px', borderRadius: '50%', transition: 'all 0.2s' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.backgroundColor = '#FEF2F2'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title="Remove from list"
                    >
                      <X size={14} />
                    </div>

                    <img src={restaurant.hero_image_url || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80'} alt="" style={{ width: '52px', height: '52px', borderRadius: '8px', objectFit: 'cover' }} />
                    <div style={{ flex: 1, minWidth: 0, paddingRight: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px' }}>
                          {restaurant.name}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#6B7280', marginTop: '4px' }}>
                        Category: {restaurant.cuisines?.length > 0 ? restaurant.cuisines.join(', ') : 'Pizza and Turkish'}
                      </div>
                    </div>
                  </div>

                  {/* Bottom Stats Row */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #F3F4F6', paddingTop: '0.65rem' }}>
                    
                    {/* Delivery */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '70px' }}>
                      <span style={{ fontSize: '0.55rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Delivery</span>
                      <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#111', marginTop: '2px' }}>{restaurant.delivery_fee && parseFloat(restaurant.delivery_fee) > 0 ? '£'+parseFloat(restaurant.delivery_fee).toFixed(2) : 'Free Delivery'}</span>
                    </div>

                    <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }}></div>

                    {/* Promotions */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '60px' }}>
                      <span style={{ fontSize: '0.55rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase' }}>Promotions</span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#EF4444', marginTop: '2px' }}>{restaurant.promo_count || 1} Active</span>
                    </div>

                    <div style={{ width: '1px', height: '24px', backgroundColor: '#E5E7EB' }}></div>

                    {/* Overlap */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', width: '80px', justifyContent: 'center' }}>
                      <span style={{ fontSize: '0.5rem', color: '#9CA3AF', fontWeight: 700, textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Overlap Level</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', width: '100%', marginTop: '3px' }}>
                        <div style={{ flex: 1, height: '4px', backgroundColor: '#FEE2E2', borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: score + '%', height: '100%', backgroundColor: '#EF4444' }}></div>
                        </div>
                        <span style={{ fontSize: '0.65rem', fontWeight: 800, color: '#EF4444', lineHeight: 1 }}>{score}%</span>
                      </div>
                      <span style={{ fontSize: '0.45rem', fontWeight: 800, color: '#6B7280', marginTop: '3px', textAlign: 'right', width: '100%', whiteSpace: 'nowrap' }}>{score >= 70 ? 'HIGH' : score >= 40 ? 'MED' : 'LOW'} OVERLAP</span>
                    </div>

                  </div>
                </div>
                );
              })}
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
    </div>
    </div>
    </div>

      {/* 
        We no longer render a fixed modal here.
        Instead, RestaurantProfilePage is returned at the top of the component.
      */}

      {/* Floating Action Bar for Matrix Mode */}
      {viewMode === 'Matrix' && matrixCompetitors.length > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111',
          borderRadius: '999px',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1.5rem',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'slideUp 0.3s ease-out'
        }}>
          <span style={{ color: '#FFF', fontWeight: 600, fontSize: '0.85rem', fontFamily: "'Lufga', sans-serif" }}>
            <span style={{ color: '#E86A58' }}>{matrixCompetitors.length}</span> Restaurants selected for comparison.
          </span>
          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-comparison-modal', { detail: { competitorsList: matrixCompetitors } }));
            }}
            style={{
              backgroundColor: '#E86A58',
              color: '#FFF',
              border: 'none',
              borderRadius: '999px',
              padding: '0.5rem 1rem',
              fontWeight: 800,
              fontSize: '0.75rem',
              cursor: 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              transition: 'transform 0.2s ease',
              fontFamily: "'Lufga', sans-serif"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            Run Matrix
          </button>
        </div>
      )}
      
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
