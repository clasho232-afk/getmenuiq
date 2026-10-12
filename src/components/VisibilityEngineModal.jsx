import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X, Search, Crosshair, TrendingUp, TrendingDown, Minus, Eye, Activity, Info, ArrowLeft, Clock, RefreshCw, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, Tooltip, ZoomControl, Circle } from 'react-leaflet';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid } from 'recharts';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../supabase';
import { ErrorBoundary } from './ErrorBoundary';

// Platform Icons based on design language
const PlatformIconOnly = ({ platform, size = 14, color = null }) => {
  const plat = platform.toLowerCase().replace(/\s+/g, '');
  const safeColor = color ? color.replace('#', '') : null;
  const cDeliveroo = safeColor || '00CCBC';
  const cUber = safeColor || '06C167';
  const cJustEat = safeColor || 'FF8000';
  
  if (plat === 'deliveroo') return <img src={`https://cdn.simpleicons.org/deliveroo/${cDeliveroo}`} alt="Deliveroo" style={{ width: size, height: size }} />;
  if (plat === 'ubereats') return <img src={`https://cdn.simpleicons.org/ubereats/${cUber}`} alt="Uber Eats" style={{ width: size, height: size }} />;
  if (plat === 'justeat') return <img src={`https://cdn.simpleicons.org/justeat/${cJustEat}`} alt="Just Eat" style={{ width: size, height: size }} />;
  return null;
};

// Real 2D Digital Location Pin (Classic sleek map marker)
const RedLocationPin = ({ size = 18, color = '#EF4444', style = {} }) => {
  const width = size;
  const height = Math.round(size * (32 / 24));
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 24 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg" 
      style={{ flexShrink: 0, display: 'inline-block', verticalAlign: 'middle', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))', ...style }}
    >
      <path 
        d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" 
        fill={color} 
      />
      <circle cx="12" cy="11.5" r="4.5" fill="#FFFFFF" />
    </svg>
  );
};

// Real 2D Location Pin HTML Generator for Leaflet map markers
const realLocationPinSvgHtml = (color = '#EF4444', isSelected = false) => {
  const w = isSelected ? 28 : 24;
  const h = isSelected ? 37 : 32;
  return `
    <svg width="${w}" height="${h}" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: block; filter: drop-shadow(0 3px 6px rgba(15, 23, 42, 0.25));">
      <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="${color}"/>
      <circle cx="12" cy="11.5" r="4.5" fill="#FFFFFF"/>
    </svg>
  `;
};
const real3DPushpinSvgHtml = realLocationPinSvgHtml;

// Haversine distance in miles between two coordinates
const haversineDistanceMiles = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 9999;
  const R = 3958.8; // Earth radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Distinct Leaflet marker icon for the selected takeaway's location center
const createTakeawayCenterIcon = (name = 'Your Store') => {
  return L.divIcon({
    className: 'takeaway-center-icon',
    html: `
      <div style="position: absolute; top: 0; left: 0; transform: translate(-50%, -100%); pointer-events: auto; display: flex; flex-direction: column; align-items: center; z-index: 1000;">
        <div style="background: #0F172A; color: #FFFFFF; font-size: 10px; font-weight: 800; padding: 4px 10px; border-radius: 9999px; box-shadow: 0 4px 12px rgba(15,23,42,0.3); white-space: nowrap; margin-bottom: 5px; display: flex; align-items: center; gap: 5px; border: 1.5px solid #FFFFFF; letter-spacing: 0.02em;">
          <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981; display: inline-block; box-shadow: 0 0 6px #10B981;"></span>
          ${name} (Store)
        </div>
        <svg width="30" height="38" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));">
          <path d="M12 0C5.37258 0 0 5.37258 0 12C0 21 12 32 12 32C12 32 24 21 24 12C24 5.37258 18.6274 0 12 0Z" fill="#0F172A"/>
          <circle cx="12" cy="11.5" r="5.5" fill="#FFFFFF"/>
          <circle cx="12" cy="11.5" r="3" fill="#10B981"/>
        </svg>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0]
  });
};

// ── Subscription Tiers & Quota Configurations ──────────────────────────────
const TIER_CONFIG = {
  Free:     { label: 'Free',     maxPins: 1, maxKeywords: 2, badgeColor: '#64748B', nextTier: 'Silver' },
  Silver:   { label: 'Silver',   maxPins: 3, maxKeywords: 5, badgeColor: '#0284C7', nextTier: 'Gold' },
  Gold:     { label: 'Gold',     maxPins: 5, maxKeywords: 10, badgeColor: '#D97706', nextTier: 'Platinum' },
  Platinum: { label: 'Platinum', maxPins: 7, maxKeywords: 20, badgeColor: '#7C3AED', nextTier: null }
};

// ── Master Catalog of High-Volume Food Keywords ─────────────────────────────
const MASTER_KEYWORD_CATALOG = [
  'Burger', 'Fried Chicken', 'Pizza', 'Kebab', 'Halal', 'Wings', 'Desserts',
  'Biryani', 'Indian', 'Chinese', 'Sushi', 'Bubble Tea', 'Peri Peri', 'Grill',
  'Wraps', 'Loaded Fries', 'Doner', 'Noodles', 'Vegan', 'Breakfast'
];


// Separate Component: Last Update & Manual Refresh Widget in MenuIQ Theme Red
const LastUpdateSyncWidget = ({ lastUpdatedTime, isPinging, pingSuccess, onPing }) => {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #F1F5F9',
      borderRadius: '20px',
      padding: '16px 18px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)'
    }}>
      {/* Top: Last Update Info */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={13} color="#94A3B8" />
          <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Last Update
          </span>
        </div>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A', fontVariantNumeric: 'tabular-nums' }}>
          {lastUpdatedTime}
        </span>
      </div>

      {/* Bottom: Manual Refresh Button in MenuIQ Theme Red */}
      <button
        onClick={onPing}
        disabled={isPinging}
        style={{
          width: '100%',
          padding: '11px 14px',
          borderRadius: '12px',
          border: 'none',
          background: isPinging ? '#DC2626' : '#EF4444',
          color: '#FFFFFF',
          fontSize: '12px',
          fontWeight: 700,
          cursor: isPinging ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: '0 4px 14px rgba(239, 68, 68, 0.25)',
          opacity: isPinging ? 0.85 : 1
        }}
        onMouseEnter={(e) => {
          if (!isPinging) {
            e.currentTarget.style.background = '#DC2626';
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 6px 18px rgba(239, 68, 68, 0.35)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isPinging) {
            e.currentTarget.style.background = '#EF4444';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 14px rgba(239, 68, 68, 0.25)';
          }
        }}
      >
        <RefreshCw 
          size={13} 
          color="#FFFFFF" 
          style={{
            animation: isPinging ? 'spin 0.8s linear infinite' : 'none',
            flexShrink: 0
          }} 
        />
        <span>
          {isPinging ? 'Pinging Latest Data...' : pingSuccess ? 'Data Updated!' : 'Manual Update'}
        </span>
      </button>
    </div>
  );
};

// Mock Avatars for Competitors
const mockAvatars = [
  'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=64&h=64&fit=crop',
  'https://images.unsplash.com/photo-1564834724105-918b73d1b9e0?w=64&h=64&fit=crop'
];
const getAvatar = (seed) => mockAvatars[seed % mockAvatars.length];

// Top 10 Competitors List for Each Platform
const platformTop10Competitors = {
  'Deliveroo': [
    { rank: '#1', name: 'Cranbrook Burger House', pins: '3/3 Pins', share: '98%', status: 'Dominant' },
    { rank: '#2', name: 'Ilford Spice & Grill', pins: '3/3 Pins', share: '94%', status: 'High Threat' },
    { rank: '#3', name: 'Gourmet Burger Co', pins: '3/3 Pins', share: '89%', status: 'High Threat' },
    { rank: '#4', name: 'Honest Burgers Ilford', pins: '2/3 Pins', share: '82%', status: 'Competitor' },
    { rank: '#5', name: 'Smash Bros Express', pins: '2/3 Pins', share: '78%', status: 'Competitor' },
    { rank: '#6', name: 'Five Guys Central', pins: '2/3 Pins', share: '71%', status: 'Competitor' },
    { rank: '#7', name: 'Patty & Bun East', pins: '2/3 Pins', share: '65%', status: 'Moderate' },
    { rank: '#8', name: 'Shake Shack Westfield', pins: '1/3 Pins', share: '59%', status: 'Moderate' },
    { rank: '#9', name: 'Black Bear Burger', pins: '1/3 Pins', share: '52%', status: 'Emerging' },
    { rank: '#10', name: 'Bleecker Street Burgers', pins: '1/3 Pins', share: '46%', status: 'Emerging' }
  ],
  'Uber Eats': [
    { rank: '#1', name: 'Barkingside Burgers', pins: '3/3 Pins', share: '97%', status: 'Dominant' },
    { rank: '#2', name: 'Smash Bros Ilford', pins: '3/3 Pins', share: '92%', status: 'High Threat' },
    { rank: '#3', name: 'Ilford Central Grill', pins: '3/3 Pins', share: '88%', status: 'High Threat' },
    { rank: '#4', name: 'Red Dog Saloon', pins: '3/3 Pins', share: '84%', status: 'Competitor' },
    { rank: '#5', name: 'Bun & Patty London', pins: '2/3 Pins', share: '77%', status: 'Competitor' },
    { rank: '#6', name: 'MeatLiquor East', pins: '2/3 Pins', share: '70%', status: 'Competitor' },
    { rank: '#7', name: 'Bleecker Burger Club', pins: '2/3 Pins', share: '64%', status: 'Moderate' },
    { rank: '#8', name: 'Fat Hippo Ilford', pins: '2/3 Pins', share: '58%', status: 'Moderate' },
    { rank: '#9', name: 'Burger & Beyond', pins: '1/3 Pins', share: '51%', status: 'Emerging' },
    { rank: '#10', name: 'Honest Burgers Hub', pins: '1/3 Pins', share: '44%', status: 'Emerging' }
  ],
  'Just Eat': [
    { rank: '#1', name: 'Shadwell Grill & Ribs', pins: '3/3 Pins', share: '96%', status: 'Dominant' },
    { rank: '#2', name: 'Canning Town Diner', pins: '3/3 Pins', share: '91%', status: 'High Threat' },
    { rank: '#3', name: 'Burger Shack E1', pins: '3/3 Pins', share: '86%', status: 'High Threat' },
    { rank: '#4', name: 'East End Burger Co', pins: '2/3 Pins', share: '80%', status: 'Competitor' },
    { rank: '#5', name: 'Mile End Burgers', pins: '2/3 Pins', share: '74%', status: 'Competitor' },
    { rank: '#6', name: 'Stratford Smokehouse', pins: '2/3 Pins', share: '68%', status: 'Competitor' },
    { rank: '#7', name: 'London Patty Works', pins: '2/3 Pins', share: '62%', status: 'Moderate' },
    { rank: '#8', name: 'Urban Burger Bar', pins: '1/3 Pins', share: '55%', status: 'Moderate' },
    { rank: '#9', name: 'Bow Road Bites', pins: '1/3 Pins', share: '49%', status: 'Emerging' },
    { rank: '#10', name: 'Docklands Kitchen', pins: '1/3 Pins', share: '42%', status: 'Emerging' }
  ]
};

// Map Controller for automatic zooming/panning
const MapController = ({ center, zoom, selectedPostcode, selectedKeyword, pins, onMapClick }) => {
  const map = useMap();
  
  useEffect(() => {
    if (selectedPostcode) {
      map.flyTo([selectedPostcode.lat, selectedPostcode.lng], 14.8, { duration: 0.8 });
    } else if (selectedKeyword) {
      // Slight smooth zoom in effect when keyword is active
      if (pins && pins.length > 0) {
        const avgLat = pins.reduce((sum, p) => sum + p.lat, 0) / pins.length;
        const avgLng = pins.reduce((sum, p) => sum + p.lng, 0) / pins.length;
        map.flyTo([avgLat, avgLng], 13.8, { duration: 0.8 });
      } else {
        map.flyTo(center, 13.8, { duration: 0.8 });
      }
    } else {
      // Zoom out to default overview when unclicked
      map.flyTo(center, zoom, { duration: 0.8 });
    }
  }, [center, zoom, selectedPostcode, selectedKeyword, pins, map]);

  useEffect(() => {
    if (onMapClick) {
      map.on('click', onMapClick);
      return () => {
        map.off('click', onMapClick);
      };
    }
  }, [map, onMapClick]);

  return null;
};

// ── Default fallback data (shown when Supabase has no data yet) ───────────────
const FALLBACK_DATA = {
  postcodes: [
    { id: 'IG2', name: 'Ilford North', lat: 51.5720, lng: 0.0800 },
    { id: 'IG1', name: 'Ilford South', lat: 51.5520, lng: 0.0750 },
    { id: 'IG11', name: 'Barking', lat: 51.5400, lng: 0.0800 },
    { id: 'IG3', name: 'Seven Kings', lat: 51.5650, lng: 0.1000 },
    { id: 'E12', name: 'Manor Park', lat: 51.5510, lng: 0.0500 },
  ],
  keywords: ['Pizza', 'Fried Chicken', 'Kebab', 'Burger', 'Desserts'],
  rankings: [],
  history: {},
  isLive: false,
};

// ── Area → approximate lat/lng lookup for map pins ───────────────────────────
const AREA_COORDS = {
  'Ilford (Redbridge)': { lat: 51.5585, lng: 0.0555 },
  'Seven Kings':        { lat: 51.5650, lng: 0.1000 },
  'Barking':            { lat: 51.5400, lng: 0.0800 },
  'Barking and Dagenham': { lat: 51.5350, lng: 0.1100 },
  'Stratford':          { lat: 51.5420, lng: 0.0050 },
  'East Ham':           { lat: 51.5365, lng: 0.0504 },
  'Manor Park':         { lat: 51.5510, lng: 0.0500 },
  'Forest Gate':        { lat: 51.5490, lng: 0.0320 },
  'Walthamstow':        { lat: 51.5820, lng: -0.0210 },
  'Whitechapel (Tower Hamlets)': { lat: 51.5154, lng: -0.0590 },
  'Hackney':            { lat: 51.5450, lng: -0.0553 },
  'Newham':             { lat: 51.5255, lng: 0.0352 },
};

const areaToPostcode = (area) => {
  const map = {
    'Ilford (Redbridge)': { id: 'IG1', name: 'Ilford' },
    'Seven Kings':        { id: 'IG3', name: 'Seven Kings' },
    'Barking':            { id: 'IG11', name: 'Barking' },
    'Stratford':          { id: 'E15', name: 'Stratford' },
    'East Ham':           { id: 'E6', name: 'East Ham' },
    'Manor Park':         { id: 'E12', name: 'Manor Park' },
    'Forest Gate':        { id: 'E7', name: 'Forest Gate' },
    'Walthamstow':        { id: 'E17', name: 'Walthamstow' },
    'Whitechapel (Tower Hamlets)': { id: 'E1', name: 'Whitechapel' },
    'Hackney':            { id: 'E8', name: 'Hackney' },
    'Newham':             { id: 'E13', name: 'Newham' },
    'Barking and Dagenham': { id: 'IG11', name: 'Barking' },
  };
  return map[area] || { id: area.replace(/\s+/g, '').toUpperCase().slice(0,4), name: area };
};

// ── Load real ranking data from Supabase ─────────────────────────────────────
const loadRankingsFromSupabase = async () => {
  try {
    // 1. Fetch ALL active master grid pins deployed across London
    const { data: gridPins, error: gridError } = await supabase
      .from('visibility_grid_pins')
      .select('id, area_group, postcode, latitude, longitude')
      .eq('is_active', true)
      .order('area_group', { ascending: true });

    // 2. Fetch global search rankings
    const { data: rankRows, error: rankError } = await supabase
      .from('global_search_rankings')
      .select(`
        id,
        platform,
        rank_position,
        restaurant_name,
        restaurant_slug,
        scraped_at,
        pin_id,
        keyword:keyword_id (id, keyword)
      `)
      .order('scraped_at', { ascending: false })
      .limit(5000);

    // 3. Fetch keywords
    const { data: keywordRows } = await supabase
      .from('visibility_keywords')
      .select('keyword')
      .eq('is_active', true);

    if (gridError && (!gridPins || gridPins.length === 0)) {
      console.warn('[VisibilityEngine] Failed to load grid pins:', gridError);
      return { ...FALLBACK_DATA };
    }

    const gridPinById = new Map((gridPins || []).map(p => [p.id, p]));

    // Extract unique postcodes from master grid pins
    const postcodes = (gridPins && gridPins.length > 0)
      ? gridPins.map(p => ({
          id: p.postcode.replace(/\s+/g, '').toUpperCase(),
          rawId: p.id,
          name: p.area_group ? `${p.area_group} (${p.postcode})` : p.postcode,
          lat: Number(p.latitude),
          lng: Number(p.longitude)
        }))
      : FALLBACK_DATA.postcodes;

    // Extract unique keywords
    const defaultKeywords = ['Pizza', 'Burger', 'Fried Chicken', 'Kebab', 'Desserts'];
    const dbKeywords = (keywordRows || []).map(k => k.keyword).filter(Boolean);
    const rankKeywords = (rankRows || []).map(r => r.keyword?.keyword).filter(Boolean);
    const keywords = Array.from(new Set([...dbKeywords, ...rankKeywords, ...defaultKeywords]));

    // Map into the unified rankings format expected by the frontend
    const rankings = (rankRows || []).map(r => {
      const pin = gridPinById.get(r.pin_id);
      return {
        postcodeId: pin ? pin.postcode.replace(/\s+/g, '').toUpperCase() : null,
        postcodeName: pin?.area_group,
        keyword: r.keyword?.keyword,
        platform: r.platform === 'ubereats' ? 'Uber Eats' : 
                  r.platform === 'justeat' ? 'Just Eat' : 
                  r.platform === 'deliveroo' ? 'Deliveroo' : r.platform,
        rank: r.rank_position,
        trend: 'flat',
        change: 0,
        restaurantId: r.restaurant_slug || r.restaurant_name,
        restaurantName: r.restaurant_name,
        scrapedAt: r.scraped_at,
      };
    }).filter(r => r.postcodeId);

    // Build simple history (repeated rank value for 7 days — real trend data
    // requires historical scrapes; this shows current rank across the week)
    const history = {};
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    keywords.forEach(kw => {
      const kwRankings = rankings.filter(r => r.keyword === kw);
      const avgRank = kwRankings.length
        ? Math.round(kwRankings.reduce((s, r) => s + r.rank, 0) / kwRankings.length)
        : 10;
      history[kw] = days.map(day => ({ day, rank: avgRank }));
    });

    return { postcodes, keywords, rankings, history, isLive: true };
  } catch (err) {
    console.warn('[VisibilityEngine] Supabase load failed, using fallback:', err);
    return { ...FALLBACK_DATA };
  }
};

// Mock data generator for specific competitor historical tracking
const generateCompetitorHistory = (keyword, platform, postcodeId) => {
  const competitors = [
    'MenuIQ Client', 'Urban Grill', 'The Food Hub', 'The Burger Joint', 
    'Green Eats', 'Spice Route', 'Golden Chopsticks', 'Pizza Express', 'Nandos'
  ];
  
  const historyData = [];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  competitors.forEach((comp, idx) => {
    // Generate a starting rank
    let currentRank = Math.floor(Math.random() * 20) + 1;
    if (comp === 'MenuIQ Client') currentRank = Math.floor(Math.random() * 10) + 1;
    
    const compHistory = [];
    // Work backwards from Sunday to Monday to build the history
    let tempRank = currentRank;
    for(let i = 6; i >= 0; i--) {
      compHistory.unshift({ day: days[i], rank: tempRank });
      // Fluctuate previous day
      tempRank = Math.max(1, tempRank + (Math.floor(Math.random() * 5) - 2));
    }
    
    historyData.push({
      name: comp,
      isUser: comp === 'MenuIQ Client',
      currentRank: currentRank,
      history: compHistory
    });
  });
  
  // Sort them by current rank and re-assign strict ranks 1-N
  historyData.sort((a,b) => a.currentRank - b.currentRank);
  return historyData.map((c, i) => {
    c.currentRank = i + 1;
    c.history[6].rank = i + 1;
    return c;
  });
};

const VisibilityEngineModal = ({ isOpen, onClose, initialPlatform = 'All', highlightPlatform, selectedRestaurant }) => {
  const [selectedPostcodeId, setSelectedPostcodeId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePlatform, setActivePlatform] = useState('Deliveroo'); // Single platform focus
  const [data, setData] = useState(FALLBACK_DATA);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isKeywordDropdownOpen, setIsKeywordDropdownOpen] = useState(false);
  const [isTrackingNodeOpen, setIsTrackingNodeOpen] = useState(false);
  const [trackingNodeMode, setTrackingNodeMode] = useState('area');
  const [areaInputMode, setAreaInputMode] = useState('postcode');
  const [postcodeValue, setPostcodeValue] = useState('');
  const [graphModalKeyword, setGraphModalKeyword] = useState(null);
  const [selectedHeatmapKeyword, setSelectedHeatmapKeyword] = useState(null);
  const [detailModalKeyword, setDetailModalKeyword] = useState(null);
  const [detailModalViewMode, setDetailModalViewMode] = useState('list');
  const [postcodeModalView, setPostcodeModalView] = useState('list'); // 'list' or 'graph'
  
  // New States for Ranking Drill-Down View
  const [rankingViewKeyword, setRankingViewKeyword] = useState(null);
  const [rankingViewPlatform, setRankingViewPlatform] = useState('Deliveroo');
  const [rankingViewPostcode, setRankingViewPostcode] = useState(data.postcodes[0]?.id);
  const [rankingViewSelectedRestaurant, setRankingViewSelectedRestaurant] = useState('MenuIQ Client');
  const [showCompetitorsView, setShowCompetitorsView] = useState(false);
  const [rankViewMode, setRankViewMode] = useState('current');
  const [showAreaBreakdown, setShowAreaBreakdown] = useState(false);
  const [trendChartPlatform, setTrendChartPlatform] = useState('Deliveroo');
  const [selectedCompetitorPlatformModal, setSelectedCompetitorPlatformModal] = useState(null);

  // States for Last Update and Manual Ping Sync
  const [lastUpdatedTime, setLastUpdatedTime] = useState('Today, 11:42 PM');
  const [isPinging, setIsPinging] = useState(false);
  const [pingSuccess, setPingSuccess] = useState(false);

  const handleManualPing = () => {
    if (isPinging) return;
    setIsPinging(true);
    setPingSuccess(false);
    setTimeout(() => {
      setIsPinging(false);
      setPingSuccess(true);
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      setLastUpdatedTime(`Today, ${formattedHours}:${minutes} ${ampm}`);
      setTimeout(() => {
        setPingSuccess(false);
      }, 2500);
    }, 1200);
  };

  // Reset state when modal opens or closes + load real data from Supabase
  useEffect(() => {
    if (isOpen) {
      setRankingViewKeyword(null);
      setSelectedHeatmapKeyword(null);
      setSelectedPostcodeId(null);
      setShowCompetitorsView(false);
      setShowAreaBreakdown(false);
      setTrendChartPlatform('Deliveroo');
      setSelectedCompetitorPlatformModal(null);
      setSearchQuery('');
      setGraphModalKeyword(null);
      setIsTrackingNodeOpen(false);
      if (initialPlatform && initialPlatform !== 'All') {
        setActivePlatform(initialPlatform);
      }
      // Load live data from Supabase
      setIsLoadingData(true);
      loadRankingsFromSupabase()
        .then(liveData => {
          setData(liveData);
          if (liveData.postcodes.length > 0) {
            setRankingViewPostcode(liveData.postcodes[0]?.id);
          }
        })
        .catch(() => setData(FALLBACK_DATA))
        .finally(() => setIsLoadingData(false));
    } else {
      setRankingViewKeyword(null);
      setSelectedHeatmapKeyword(null);
      setSelectedPostcodeId(null);
      setShowCompetitorsView(false);
      setShowAreaBreakdown(false);
      setSearchQuery('');
      setGraphModalKeyword(null);
      setIsTrackingNodeOpen(false);
    }
  }, [isOpen, initialPlatform]);
  const [showInfoTooltip, setShowInfoTooltip] = useState(false);
  
  // Mock history state for the drill down
  const [drillDownHistory, setDrillDownHistory] = useState([]);

  // When drill-down filters change, regenerate the mock history
  useEffect(() => {
    if (rankingViewKeyword && rankingViewPostcode) {
      const hist = generateCompetitorHistory(rankingViewKeyword, rankingViewPlatform, rankingViewPostcode);
      setDrillDownHistory(hist);
      // Try to keep the same restaurant selected if it exists, otherwise default to user
      if (!hist.find(h => h.name === rankingViewSelectedRestaurant)) {
        setRankingViewSelectedRestaurant('MenuIQ Client');
      }
    }
  }, [rankingViewKeyword, rankingViewPlatform, rankingViewPostcode]);
  
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [manageNodeFilter, setManageNodeFilter] = useState('');
  const [manageModalSelectedPostcode, setManageModalSelectedPostcode] = useState(null);
  const [isEditingNode, setIsEditingNode] = useState(false);
  const [isAddKeywordModalOpen, setIsAddKeywordModalOpen] = useState(false);
  const [addKeywordSearchQuery, setAddKeywordSearchQuery] = useState('');
  const [manageModalActivePlatform, setManageModalActivePlatform] = useState('Deliveroo');
  const [configMap, setConfigMap] = useState(null);
  const [disabledNodes, setDisabledNodes] = useState([]);

  // Selected Takeaway Location (fallback to Chesters Ilford if coordinates not yet populated)
  const takeawayLat = Number(selectedRestaurant?.lat) || 51.5588;
  const takeawayLng = Number(selectedRestaurant?.lng) || 0.0750;
  const takeawayName = selectedRestaurant?.name || 'Your Takeaway';

  // Center map on the selected takeaway with focused 2-mile zoom
  const mapCenter = [takeawayLat, takeawayLng];
  const mapZoom = 13.5;

  const togglePlatform = (p) => {
  };

  // ── 2-Mile Radius Grid Filter ──────────────────────────────────────────────
  // The selected takeaway can ONLY see nodes within a 2-mile delivery radius
  const visiblePostcodes = React.useMemo(() => {
    const filtered = (data.postcodes || [])
      .map(pc => {
        const dist = haversineDistanceMiles(takeawayLat, takeawayLng, pc.lat, pc.lng);
        return {
          ...pc,
          distance: dist,
          distanceFormatted: `${dist.toFixed(1)} mi`
        };
      })
      .filter(pc => pc.distance <= 2.0)
      .sort((a, b) => a.distance - b.distance);

    return filtered.length > 0 ? filtered : (data.postcodes || []).map(pc => ({ ...pc, distance: 0.5, distanceFormatted: '0.5 mi' }));
  }, [data.postcodes, takeawayLat, takeawayLng]);

  const visiblePostcodeIds = React.useMemo(() => {
    return new Set(visiblePostcodes.map(p => p.id));
  }, [visiblePostcodes]);

  // Keep rankingViewPostcode valid
  useEffect(() => {
    if (visiblePostcodes.length > 0 && (!rankingViewPostcode || !visiblePostcodeIds.has(rankingViewPostcode))) {
      setRankingViewPostcode(visiblePostcodes[0].id);
    }
  }, [visiblePostcodes, visiblePostcodeIds, rankingViewPostcode]);

  // Primary monitored benchmark postcodes for the main overview map
  const activePostcodes = React.useMemo(() => {
    const preferred = ['IG1 3BB', 'IG1 4EE', 'IG1 2RU'];
    const matched = [];
    preferred.forEach(pref => {
      const found = (visiblePostcodes || []).find(p => 
        p.id.includes(pref.replace(/\s+/g, '')) || 
        (p.name && p.name.includes(pref))
      );
      if (found) matched.push(found);
    });
    if (matched.length === 3) return matched;
    return (visiblePostcodes || []).slice(0, 3);
  }, [visiblePostcodes]);

  const selectedPostcode = (visiblePostcodes || []).find(p => p.id === selectedPostcodeId);

  // Filter rankings strictly by Platform, Postcode, and Search
  const activeRankings = React.useMemo(() => {
    return (data.rankings || []).filter(r => {
      const matchPlatform = r.platform === activePlatform;
      const matchPostcode = selectedPostcodeId ? r.postcodeId === selectedPostcodeId : true;
      const matchSearch = searchQuery.trim() === '' || (r.keyword || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchPlatform && matchPostcode && matchSearch;
    });
  }, [data.rankings, activePlatform, selectedPostcodeId, searchQuery]);

  // Aggregate by keyword for display
  const aggregatedData = activeRankings.reduce((acc, curr) => {
    if (!acc[curr.keyword]) acc[curr.keyword] = [];
    acc[curr.keyword].push(curr);
    return acc;
  }, {});

  const sortedKeywords = (data.keywords || []).filter(k => aggregatedData[k] !== undefined);

  const getRankColor = (rank) => {
    if (rank <= 5) return '#10B981'; // Green
    if (rank <= 15) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getRankBg = (rank) => {
    if (rank <= 5) return 'rgba(16, 185, 129, 0.1)';
    if (rank <= 15) return 'rgba(245, 158, 11, 0.1)';
    return 'rgba(239, 68, 68, 0.1)';
  };

  // Dashboard Widget Mock Data
  const widgetPlatforms = [
    { name: 'Deliveroo', score: 65, bg: '#00CCBC', barColor: '#00CCBC', textColor: '#00CCBC' },
    { name: 'Uber Eats', score: 20, bg: '#06C167', barColor: '#EF4444', textColor: '#EF4444' },
    { name: 'Just Eat', score: 14, bg: '#F36D00', barColor: '#EF4444', textColor: '#EF4444' }
  ];

  const handleCloseModal = () => {
    setSelectedHeatmapKeyword(null);
    setSelectedPostcodeId(null);
    setRankingViewKeyword(null);
    setShowCompetitorsView(false);
    setShowAreaBreakdown(false);
    setTrendChartPlatform('Deliveroo');
    setSelectedCompetitorPlatformModal(null);
    setSearchQuery('');
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <ErrorBoundary>
          <div 
      style={{ 
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', 
        zIndex: 100000, display: 'flex', alignItems: 'center', justifyContent: 'center', 
        background: 'rgba(17, 24, 39, 0.4)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)' 
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }}
    >
      <div style={{ 
        fontFamily: 'Inter, system-ui, sans-serif',
        width: '1240px', maxWidth: '96vw', height: '88vh', maxHeight: '880px', 
        background: '#FCFAF6', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', 
        display: 'flex', flexDirection: 'row', overflow: 'hidden', position: 'relative', border: '1px solid #E5E7EB'
      }}>
        
        {/* Close Button - absolute to modal */}
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 1000 }}>
          <button onClick={handleCloseModal} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#F3F4F6', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseEnter={(e) => { e.currentTarget.style.background = '#E5E7EB'; }} onMouseLeave={(e) => { e.currentTarget.style.background = '#F3F4F6'; }}>
            <X size={18} color="#4B5563" />
          </button>
        </div>

        {/* Graph Modal Overlay */}
        {graphModalKeyword && (
          <div 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}
            onClick={() => setGraphModalKeyword(null)}
          >
            <div 
              style={{ background: '#FFF', borderRadius: '24px', width: '600px', maxWidth: '90%', maxHeight: '90%', display: 'flex', flexDirection: 'column', padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600, color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, marginRight: '16px' }}>
                  {postcodeModalView === 'graph' ? 'Historical Ranking: ' : 'Top Competitors: '}
                  <span style={{ color: '#00CCBC' }}>{graphModalKeyword}</span>
                  {selectedPostcodeId && <span style={{ color: '#64748B', fontSize: '14px', marginLeft: '8px', fontWeight: 600 }}>in {(visiblePostcodes || []).find(p=>p.id===selectedPostcodeId)?.name}</span>}
                </h3>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  {/* Toggle Button */}
                  <div style={{ display: 'flex', background: '#F1F5F9', borderRadius: '8px', padding: '4px' }}>
                    <button 
                      onClick={() => setPostcodeModalView('list')}
                      style={{ background: postcodeModalView === 'list' ? '#FFF' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: postcodeModalView === 'list' ? '#0F172A' : '#64748B', cursor: 'pointer', boxShadow: postcodeModalView === 'list' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                    >
                      Top Competitors
                    </button>
                    <button 
                      onClick={() => setPostcodeModalView('graph')}
                      style={{ background: postcodeModalView === 'graph' ? '#FFF' : 'transparent', border: 'none', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: postcodeModalView === 'graph' ? '#0F172A' : '#64748B', cursor: 'pointer', boxShadow: postcodeModalView === 'graph' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                    >
                      Graph
                    </button>
                  </div>
                  <button onClick={() => setGraphModalKeyword(null)} style={{ background: '#F8FAFC', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer', color: '#9CA3AF' }} onMouseEnter={(e) => { e.currentTarget.style.color = '#4B5563'; e.currentTarget.style.background = '#F1F5F9'; }} onMouseLeave={(e) => { e.currentTarget.style.color = '#9CA3AF'; e.currentTarget.style.background = '#F8FAFC'; }}>
                    <X size={18} />
                  </button>
                </div>
              </div>

              {postcodeModalView === 'graph' ? (
                <div style={{ height: '300px', width: '100%' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.history[graphModalKeyword]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B', fontWeight: 600}} dy={10} />
                      <YAxis reversed axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748B', fontWeight: 600}} dx={-10} domain={[1, 'dataMax + 2']} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 700, fontSize: '12px', color: '#111827' }} 
                        formatter={(value) => [`#${value}`, 'Avg Rank']}
                      />
                      <Line type="monotone" dataKey="rank" stroke="#00CCBC" strokeWidth={3} dot={{r: 4, fill: '#FFFFFF', strokeWidth: 2, stroke: '#00CCBC'}} activeDot={{r: 6, fill: '#00CCBC', strokeWidth: 0}} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, overflowY: 'auto', paddingRight: '8px' }} className="invisible-scrollbar">
                  {(() => {
                    const pcData = (data.rankings || [])
                      .filter(r => r.postcodeId === selectedPostcodeId && r.keyword === graphModalKeyword && r.platform === rankingViewPlatform)
                      .sort((a, b) => a.rank - b.rank);
                    
                    // User rank
                    const userRankObj = pcData.find(r => r.restaurantName === rankingViewSelectedRestaurant) || { rank: '-' };
                    const rank = userRankObj.rank;
                    
                    // Take top 15 and user
                    const board = [...pcData.slice(0, 15)];
                    if (rank !== '-' && rank > 15) {
                       board.push(userRankObj);
                    }
                    if (board.length === 0) return <div style={{padding: '16px'}}>No data</div>;
                    
                    return board.map(item => {
                      const isUser = item.restaurantName === rankingViewSelectedRestaurant;
                      const seedHash = (item.restaurantName || '').length + (item.rank || 0);
const rowImg = getAvatar(seedHash);

                      return (
                        <div key={item.rank} style={{ display: 'flex', alignItems: 'center', padding: '10px 16px', background: isUser ? '#FFF1F2' : '#F8FAFC', border: isUser ? '1px solid #FECDD3' : '1px solid #F1F5F9', borderRadius: '12px', position: 'relative', overflow: 'hidden' }}>
                          {item.isUser && (
                            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: '#E11D48' }} />
                          )}
                          <div style={{ width: '40px', fontSize: '14px', fontWeight: 600, color: isUser ? '#E11D48' : '#94A3B8' }}>
                            #{item.rank}
                          </div>
                          
                          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E2E8F0', marginRight: '12px', overflow: 'hidden', flexShrink: 0 }}>
                            <img src={isUser ? 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=64&h=64&fit=crop' : rowImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Avatar" />
                          </div>

                          <div style={{ flex: 1, fontSize: '14px', fontWeight: isUser ? 800 : 600, color: isUser ? '#BE123C' : '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {item.restaurantName}
                          </div>
                          {item.isUser && (
                            <div style={{ fontSize: '10px', fontWeight: 600, color: '#F43F5E', background: '#FFE4E6', padding: '4px 8px', borderRadius: '6px', letterSpacing: '0.05em' }}>YOU</div>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Top 10 Competitors Modal Overlay */}
        {selectedCompetitorPlatformModal && (() => {
          const plat = selectedCompetitorPlatformModal;
          const pColor = plat === 'Deliveroo' ? '#00CCBC' : plat === 'Uber Eats' ? '#06C167' : '#FF8000';
          const top10List = platformTop10Competitors[plat] || platformTop10Competitors['Deliveroo'];
          
          return (
            <div 
              style={{ 
                position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.45)', 
                zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', 
                backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '24px' 
              }}
              onClick={() => setSelectedCompetitorPlatformModal(null)}
            >
              <div 
                style={{ 
                  width: '560px', maxWidth: '92vw', maxHeight: '82vh', 
                  background: '#FFFFFF', borderRadius: '24px', 
                  boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', 
                  display: 'flex', flexDirection: 'column', overflow: 'hidden' 
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div style={{ padding: '22px 24px 18px 24px', borderBottom: '1px solid #F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: pColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.12)' }}>
                      <PlatformIconOnly platform={plat} size={18} color="white" />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
                          Top 10 Competitors
                        </h3>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: pColor, background: `${pColor}15`, padding: '2px 8px', borderRadius: '10px' }}>
                          {plat}
                        </span>
                      </div>
                      <span style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500, marginTop: '2px' }}>
                        {rankingViewKeyword ? `Keyword: ${rankingViewKeyword.toUpperCase()}` : 'Live Market Ranking'} · Ranks 1 to 10
                      </span>
                    </div>
                  </div>

                  {/* Platform Switcher & Close */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {['Deliveroo', 'Uber Eats', 'Just Eat'].map(p => {
                        const isCur = plat === p;
                        const cColor = p === 'Deliveroo' ? '#00CCBC' : p === 'Uber Eats' ? '#06C167' : '#FF8000';
                        return (
                          <button
                            key={p}
                            onClick={() => setSelectedCompetitorPlatformModal(p)}
                            title={`Switch to ${p}`}
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: cColor,
                              border: 'none',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              opacity: isCur ? 1 : 0.4,
                              transform: isCur ? 'scale(1.08)' : 'scale(1)',
                              boxShadow: isCur ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${cColor}` : 'none',
                              transition: 'all 0.2s ease',
                              padding: 0
                            }}
                          >
                            <PlatformIconOnly platform={p} size={12} color="white" />
                          </button>
                        );
                      })}
                    </div>
                    <button 
                      onClick={() => setSelectedCompetitorPlatformModal(null)} 
                      style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#F8FAFC', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748B', transition: 'all 0.15s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.color = '#64748B'; }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {/* Subheader / Column Labels */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 24px', background: '#FAFAFA', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Rank & Restaurant
                  </span>
                  <span style={{ fontSize: '10.5px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Coverage & Threat
                  </span>
                </div>

                {/* 10 Competitors List */}
                <div className="invisible-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '6px 24px 18px 24px', display: 'flex', flexDirection: 'column' }}>
                  {top10List.map((c, idx) => {
                    const rankNum = idx + 1;
                    const rankColor = rankNum === 1 ? '#D97706' : rankNum === 2 ? '#64748B' : rankNum === 3 ? '#B45309' : '#94A3B8';
                    const statusColor = c.status === 'Dominant' ? '#EF4444' : c.status === 'High Threat' ? '#F59E0B' : c.status === 'Competitor' ? '#3B82F6' : '#10B981';
                    
                    return (
                      <div 
                        key={idx} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'space-between', 
                          padding: '12px 0', 
                          borderBottom: idx === top10List.length - 1 ? 'none' : '1px solid #F8FAFC',
                          transition: 'background 0.15s ease'
                        }}
                      >
                        {/* Left: Rank, Avatar, Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: rankColor, width: '28px', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                            {c.rank}
                          </span>
                          <img 
                            src={getAvatar((c.name || '').charCodeAt(0) + idx * 3)} 
                            alt={c.name} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} 
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                            <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#0F172A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {c.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                              {c.pins} Monitored
                            </span>
                          </div>
                        </div>

                        {/* Right: Score / Threat */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px', flexShrink: 0 }}>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                            {c.share}
                          </span>
                          <span style={{ fontSize: '10.5px', fontWeight: 600, color: statusColor }}>
                            {c.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer */}
                <div style={{ padding: '14px 24px', borderTop: '1px solid #F1F5F9', background: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                    Showing top 10 competitors across scanned pins
                  </span>
                  <button 
                    onClick={() => setSelectedCompetitorPlatformModal(null)}
                    style={{ padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#0F172A', color: '#FFFFFF', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Management Modal Overlay */}
        {isManageModalOpen && (
          <div 
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.85)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }}
            onClick={() => setIsManageModalOpen(false)}
          >
            <div 
              style={{ background: '#FFF', borderRadius: '24px', width: '100%', height: '100%', display: 'flex', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)', overflow: 'hidden', fontFamily: '"Outfit", "Inter", sans-serif' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* LEFT PANE - Node Management List */}
              <div style={{ width: '380px', background: '#FFFFFF', borderRight: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column' }}>
                <div style={{ padding: '24px 24px 16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 600, color: '#111' }}>Configure Tracking</h3>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444' }}></span>
                      2.0-Mile Territory: <strong style={{ color: '#0F172A' }}>{takeawayName}</strong>
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#EF4444', background: '#FEF2F2', padding: '4px 10px', borderRadius: '8px', border: '1px solid #FEE2E2' }}>
                    {visiblePostcodes.length} Nodes in 2.0 mi
                  </span>
                </div>

                {/* Node Search Bar */}
                <div style={{ padding: '0 24px 16px 24px' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} color="#94A3B8" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
                    <input 
                      type="text"
                      placeholder="Search 2-mile territory nodes..."
                      value={manageNodeFilter}
                      onChange={(e) => setManageNodeFilter(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '9px 12px 9px 34px',
                        borderRadius: '10px',
                        border: '1px solid #E2E8F0',
                        fontSize: '12.5px',
                        outline: 'none',
                        background: '#F8FAFC',
                        color: '#0F172A',
                        transition: 'all 0.2s ease'
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.background = '#FFFFFF'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#F8FAFC'; }}
                    />
                  </div>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px 24px' }} className="invisible-scrollbar">
                  <h4 style={{ margin: '0 0 16px 0', fontSize: '13px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nodes within 2.0 mi ({visiblePostcodes.length})</h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {visiblePostcodes
                      .filter(pc => !manageNodeFilter || pc.name.toLowerCase().includes(manageNodeFilter.toLowerCase()) || pc.id.toLowerCase().includes(manageNodeFilter.toLowerCase()))
                      .map(pc => {
                      const isSelected = manageModalSelectedPostcode === pc.id;
                      const isDisabled = disabledNodes.includes(pc.id);
                      
                      return (
                        <div key={pc.id} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <button 
                            onClick={() => {
                              setManageModalSelectedPostcode(pc.id);
                              setIsEditingNode(false);
                              if (configMap) {
                                const targetPoint = configMap.project(L.latLng(pc.lat, pc.lng), 15);
                                targetPoint.y += 60; 
                                configMap.flyTo(configMap.unproject(targetPoint, 15), 15, { animate: true, duration: 1.5 });
                              }
                            }}
                            style={{ width: '100%', padding: '12px 16px', background: isSelected ? '#FEF2F2' : '#F8FAFC', border: '2px solid transparent', boxShadow: isSelected ? '0 0 15px rgba(239, 68, 68, 0.4)' : 'none', borderRadius: '12px', textAlign: 'left', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', transition: 'all 0.2s', opacity: isDisabled ? 0.5 : 1 }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.border = '2px solid #E2E8F0'; }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.border = '2px solid transparent'; }}
                          >
                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: isSelected ? '#FEE2E2' : '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: isSelected ? 'none' : '0 1px 2px rgba(0,0,0,0.05)' }}>
                              <RedLocationPin size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: '13.5px', fontWeight: 700, color: isSelected ? '#991B1B' : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pc.name}</div>
                              <div style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600 }}>{pc.distanceFormatted} away</div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>


                </div>
              </div>

              {/* RIGHT PANE - Interactive Map */}
              <div style={{ flex: 1, position: 'relative', background: '#E5E7EB' }}>
                <button 
                  onClick={() => setIsManageModalOpen(false)} 
                  style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 1000, background: '#FFFFFF', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#475569', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)', transition: 'all 0.2s' }} 
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F8FAFC'} 
                  onMouseLeave={(e) => e.currentTarget.style.background = '#FFFFFF'}
                >
                  <X size={20} />
                </button>
                
                <MapContainer 
                  center={mapCenter}
                  zoom={13.5}
                  zoomControl={false}
                  scrollWheelZoom={true}
                  style={{ width: '100%', height: '100%' }}
                  ref={setConfigMap}
                >
                  <TileLayer url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png" />
                  <ZoomControl position="bottomright" />
                  
                  {/* 2-Mile Delivery Radius Perimeter Circle */}
                  <Circle 
                    center={[takeawayLat, takeawayLng]} 
                    radius={3218.69} 
                    pathOptions={{ 
                      color: '#EF4444', 
                      weight: 1.5, 
                      dashArray: '6, 6', 
                      fillColor: '#EF4444', 
                      fillOpacity: 0.04 
                    }} 
                  />

                  {/* Store Center Location Marker */}
                  <Marker 
                    position={[takeawayLat, takeawayLng]}
                    icon={createTakeawayCenterIcon(takeawayName)}
                  />

                  {visiblePostcodes.map(pc => {
                    const isSelected = manageModalSelectedPostcode === pc.id;
                    const isDisabled = disabledNodes.includes(pc.id);
                    
                    return (
                      <Marker 
                        key={pc.id} 
                        position={[pc.lat, pc.lng]}
                        icon={L.divIcon({
                          className: 'custom-icon',
                          html: `<div style="position: absolute; top: 0; left: 0; transform: translate(-50%, -100%); opacity: ${isDisabled ? 0.5 : 1}; line-height: 1;">${real3DPushpinSvgHtml('#EF4444', isSelected)}</div>`,
                          iconSize: [0, 0],
                          iconAnchor: [0, 0]
                        })}
                        eventHandlers={{
                          click: () => {
                            setManageModalSelectedPostcode(pc.id);
                            setIsEditingNode(false);
                            if (configMap) {
                                const targetPoint = configMap.project(L.latLng(pc.lat, pc.lng), 15);
                                targetPoint.y += 60; 
                                configMap.flyTo(configMap.unproject(targetPoint, 15), 15, { animate: true, duration: 1.5 });
                            }
                          }
                        }}
                      />
                    );
                  })}
                </MapContainer>

                {/* Node Detail Card Overlay (Positioned Absolute over Map) */}
                {manageModalSelectedPostcode && (
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -20px)', zIndex: 1000, 
                    background: '#FFFFFF', borderRadius: '16px', width: '360px',
                    padding: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25), 0 0 0 1px rgba(0,0,0,0.05)', 
                    display: 'flex', flexDirection: 'column', gap: '20px'
                  }}>
                    {(() => {
                      const node = (visiblePostcodes || []).find(p => p.id === manageModalSelectedPostcode);
                      const isDisabled = disabledNodes.includes(manageModalSelectedPostcode);
                      if (!node) return null;
                      
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Catchment Node</div>
                              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#334155' }}>{node.name}</h3>
                              <div style={{ fontSize: '12px', color: '#94A3B8', marginTop: '2px', fontWeight: 600 }}>{node.distanceFormatted} away from store</div>
                            </div>
                            <div style={{ padding: '4px 10px', background: isDisabled ? '#FEE2E2' : '#DCFCE7', color: isDisabled ? '#EF4444' : '#15803D', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                              {isDisabled ? 'Disabled' : 'Active Node'}
                            </div>
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', marginBottom: '8px' }}>Platforms Monitored</div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                {['Deliveroo', 'Uber Eats', 'Just Eat'].map(plat => (
                                  <div key={plat} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: '8px', background: plat === 'Deliveroo' ? '#00CCBC' : plat === 'Uber Eats' ? '#06C167' : '#FF8000' }}>
                                    <PlatformIconOnly platform={plat} size={16} color="white" />
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>
                                  Keywords Monitored
                                </div>
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {(data.keywords || []).map(kw => (
                                  <span key={kw} style={{ background: '#F1F5F9', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#334155' }}>
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          <button 
                            style={{
                              width: '100%', padding: '12px',
                              background: isDisabled ? '#10B981' : '#EF4444',
                              color: '#FFFFFF', border: 'none', borderRadius: '8px',
                              fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
                            }}
                            onClick={() => {
                              setDisabledNodes(prev => 
                                prev.includes(node.id) 
                                  ? prev.filter(id => id !== node.id) 
                                  : [...prev, node.id]
                              );
                            }}
                          >
                            {isDisabled ? 'Enable Node' : 'Disable Node'}
                          </button>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LEFT PANE (INTERFACE) - 60% */}
        <div style={{ width: rankingViewKeyword ? '100%' : '60%', height: '100%', background: '#FCFAF6', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 20, boxShadow: '4px 0 24px rgba(0,0,0,0.06)', transition: 'width 0.3s ease' }}>
          
          {!rankingViewKeyword && (
          <div style={{ padding: '24px 24px 16px 24px', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#111', margin: 0 }}>
                Ranking Intelligence
              </h3>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '12px' }}>
              <div>
                <button
                  onClick={() => { setShowCompetitorsView(!showCompetitorsView); setRankingViewKeyword(null); }}
                  style={{
                    padding: '8px 20px', borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    background: showCompetitorsView ? '#0F172A' : '#FFFFFF',
                    color: showCompetitorsView ? '#FFFFFF' : '#475569',
                    fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                    transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                  }}
                  onMouseEnter={(e) => { if (!showCompetitorsView) { e.currentTarget.style.borderColor = '#CBD5E1'; e.currentTarget.style.background = '#F8FAFC'; } }}
                  onMouseLeave={(e) => { if (!showCompetitorsView) { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.background = '#FFFFFF'; } }}
                >
                  Competitor View
                </button>
              </div>

              <div>
                <button 
                  onClick={() => {
                    setManageModalSelectedPostcode(visiblePostcodes[0]?.id || null);
                    setIsManageModalOpen(true);
                  }}
                  style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: 600, color: '#475569', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = '#F8FAFC'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
                >
                  Configure
                </button>
              </div>
            </div>
          </div>
          )}

          <div 
            className="invisible-scrollbar" 
            style={{ 
              flex: 1, 
              overflowY: rankingViewKeyword ? 'hidden' : 'auto', 
              overflowX: 'hidden', 
              padding: '24px',
              display: rankingViewKeyword ? 'flex' : 'block',
              flexDirection: 'column',
              minHeight: 0,
              height: '100%'
            }}
          >
            
{/* Centered Keywords / Competitors Header */}
            {!rankingViewKeyword && (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: '-12px', marginBottom: '20px', minHeight: '32px' }}>
               <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
                 <h4 style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                   {showCompetitorsView ? 'Market Competitors (30-Day Avg)' : 'Keywords'}
                 </h4>
               </div>
               
               <div style={{ display: 'flex', alignItems: 'center' }}>
                 <div style={{ display: 'flex', background: '#F1F5F9', padding: '3px', borderRadius: '6px', gap: '3px' }}>
                  <button 
                    onClick={() => setRankViewMode('current')}
                    style={{ padding: '3px 8px', fontSize: '9px', fontWeight: 700, borderRadius: '4px', border: 'none', cursor: 'pointer', background: rankViewMode === 'current' ? '#FFFFFF' : 'transparent', color: rankViewMode === 'current' ? '#0F172A' : '#64748B', boxShadow: rankViewMode === 'current' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
                  >
                    CURRENT
                  </button>
                  <button 
                    onClick={() => setRankViewMode('average')}
                    style={{ position: 'relative', padding: '3px 18px 3px 8px', fontSize: '9px', fontWeight: 700, borderRadius: '4px', border: 'none', cursor: 'pointer', background: rankViewMode === 'average' ? '#FFFFFF' : 'transparent', color: rankViewMode === 'average' ? '#0F172A' : '#64748B', boxShadow: rankViewMode === 'average' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center' }}
                  >
                    30-DAY AVG
                    <div 
                      onMouseEnter={(e) => { e.stopPropagation(); setShowInfoTooltip(true); }}
                      onMouseLeave={(e) => { e.stopPropagation(); setShowInfoTooltip(false); }}
                      style={{ position: 'absolute', right: '4px', top: '50%', transform: 'translateY(-50%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}
                    >
                      <Info size={10} />
                    </div>
                  </button>
                 </div>
                 
                 {showInfoTooltip && (
                   <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '8px', width: '220px', background: '#0F172A', color: '#FFFFFF', padding: '10px', borderRadius: '6px', fontSize: '10px', fontWeight: 500, lineHeight: 1.4, zIndex: 50, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                     Toggle between your live rankings for today vs your sustained 30-day average rank across all monitored keywords and locations.
                   </div>
                 )}
               </div>
            </div>
            )}

            {/* COMPETITORS VIEW */}
            {showCompetitorsView && !rankingViewKeyword && (() => {
              const allKeywords = Object.keys(aggregatedData);
              return (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {allKeywords.map(kw => {
                    const allSorted = [...aggregatedData[kw]].sort((a, b) => a.rank - b.rank);
                    const dominator = allSorted[0];
                    const second = allSorted[1] || dominator;
                    const third = allSorted[2] || dominator;
                    const getComp = (idx) => allSorted[idx] ? allSorted[idx].restaurantName : '-';
                    const imgUrl = kw.toLowerCase().includes('pizza') ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop' :
                                   kw.toLowerCase().includes('burger') ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=80&h=80&fit=crop' :
                                   kw.toLowerCase().includes('chicken') ? 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=80&h=80&fit=crop' :
                                   kw.toLowerCase().includes('dessert') ? 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=80&h=80&fit=crop' :
                                   'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=80&h=80&fit=crop';
                    return (
                      <div key={kw} style={{ background: '#FFFFFF', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '16px', padding: '14px 16px', boxShadow: '0 4px 12px -4px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {/* Keyword Thumb */}
                        <div style={{ width: '44px', height: '44px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={imgUrl} alt={kw} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        {/* Keyword Label */}
                        <div style={{ width: '90px', flexShrink: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>KEYWORD:</div>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '2px' }}>{kw}</div>
                        </div>
                        {/* Podium — Top 3 */}
                        <div style={{ flex: 1, display: 'flex', gap: '12px', minWidth: 0 }}>
                          {/* Gold */}
                          <div style={{ flex: 1, background: 'transparent', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#D97706', flexShrink: 0, width: '12px' }}>1</span>
                              <img src={getAvatar((kw || '').charCodeAt(0))} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} alt="Avatar" />
                              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getComp(0)}</span>
                          </div>
                          {/* Silver */}
                          <div style={{ flex: 1, background: 'transparent', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#64748B', flexShrink: 0, width: '12px' }}>2</span>
                              <img src={getAvatar((kw || '').charCodeAt(0) + 1)} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} alt="Avatar" />
                              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getComp(1)}</span>
                          </div>
                          {/* Bronze */}
                          <div style={{ flex: 1, background: 'transparent', borderRadius: '8px', padding: '6px 8px', display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                              <span style={{ fontSize: '12px', fontWeight: 800, color: '#B45309', flexShrink: 0, width: '12px' }}>3</span>
                              <img src={getAvatar((kw || '').charCodeAt(0) + 2)} style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} alt="Avatar" />
                              <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{getComp(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}

            
            {rankingViewKeyword ? (
              <div style={{ display: 'flex', flex: 1, minHeight: 0, height: '100%', overflow: 'hidden' }}>
                
                {/* Main Content Area */}
                {(() => {
                  const kw = rankingViewKeyword;
                  const allSorted = [...aggregatedData[kw]].sort((a,b) => a.rank - b.rank);
                  
                  // Calculate average of the MenuIQ Client across all postcodes in 2-mile radius
                  const userRanks = (visiblePostcodes || []).map(pc => {
                     const userObj = aggregatedData[kw].find(r => r.postcodeId === pc.id && r.restaurantName === rankingViewSelectedRestaurant);
                     return userObj ? userObj.rank : 0;
                  });
                  const validUserRanks = userRanks.filter(r => r > 0);
                  const globalAvg = validUserRanks.length ? validUserRanks.reduce((a,b)=>a+b, 0) / validUserRanks.length : 0;
                  
                  // Find the market leader (competitor with highest overall average)
                  // For mock data, we just take the #1 from the aggregated list
                  const dominator = allSorted[0];

                  const imgUrl = kw.toLowerCase().includes('pizza') ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=200&fit=crop' :
                                 kw.toLowerCase().includes('burger') ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop' :
                                 kw.toLowerCase().includes('chicken') ? 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=200&fit=crop' :
                                 kw.toLowerCase().includes('dessert') ? 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=200&fit=crop' :
                                 'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=200&fit=crop';

                  return (
                    <div style={{ display: 'flex', flex: 1, gap: '28px', minHeight: 0, height: '100%', overflow: 'hidden' }}>
                      
                      {/* LEFT COLUMN: Static, never moves when right column scrolls */}
                      <div className="invisible-scrollbar" style={{ width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', overflowY: 'auto' }}>
                        
                        {/* Keyword Hero */}
                        <div style={{ borderRadius: '20px', overflow: 'hidden', background: '#FFFFFF', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.08)', position: 'relative', height: '170px' }}>
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                          
                          {/* Back Button */}
                          <button 
                            onClick={() => { setRankingViewKeyword(null); setRankingViewSelectedRestaurant('MenuIQ Client'); setShowAreaBreakdown(false); }}
                            style={{ position: 'absolute', top: '14px', left: '14px', width: '34px', height: '34px', borderRadius: '50%', background: '#FFFFFF', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 10 }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
                            title="Back to All Keywords"
                          >
                            <ArrowLeft size={16} color="#0F172A" />
                          </button>
                          
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
                          <h3 style={{ position: 'absolute', bottom: '18px', left: '20px', right: '20px', margin: 0, fontSize: '24px', fontWeight: 800, color: '#FFFFFF', textShadow: '0 2px 4px rgba(0,0,0,0.3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textTransform: 'capitalize' }}>
                            {kw}
                          </h3>
                        </div>
                        
                        {/* Overall Visibility & Platform Breakdown Card */}
                        {(() => {
                          // Determine platform states for this keyword
                          const platformStates = {
                            Optimal: [{ name: 'Deliveroo', color: '#00CCBC' }, { name: 'Uber Eats', color: '#06C167' }],
                            Average: [{ name: 'Just Eat', color: '#FF8000' }],
                            Poor: []
                          };
                          const totalPinsCount = (visiblePostcodes || []).length || 3;

                          const metrics = [
                            {
                              label: 'Optimal',
                              range: 'Top 8 ranks',
                              color: '#10B981',
                              dotColor: '#10B981',
                              platforms: platformStates.Optimal
                            },
                            {
                              label: 'Average',
                              range: 'Ranks 9–15',
                              color: '#F59E0B',
                              dotColor: '#F59E0B',
                              platforms: platformStates.Average
                            },
                            {
                              label: 'Poor',
                              range: 'Rank 16+ or unranked',
                              color: '#94A3B8',
                              dotColor: '#CBD5E1',
                              platforms: platformStates.Poor
                            }
                          ];

                          return (
                            <div style={{ background: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)' }}>
                              
                              {/* Header: Title & Headline Status */}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  Keyword Platform Health
                                </span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }}></span>
                                  <span style={{ fontSize: '14.5px', fontWeight: 600, color: '#0F172A' }}>Optimal</span>
                                </div>
                              </div>

                              {/* Multi-Segment Distribution Bar */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ width: '100%', height: '6px', borderRadius: '999px', background: '#F1F5F9', overflow: 'hidden', display: 'flex', gap: '2px' }}>
                                  <div style={{ width: '66.6%', background: '#10B981', borderRadius: '999px' }} title="2 Optimal" />
                                  <div style={{ width: '33.4%', background: '#F59E0B', borderRadius: '999px' }} title="1 Average" />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                                  <span>2 of 3 platforms in Top 8</span>
                                  <span style={{ fontWeight: 600, color: '#10B981' }}>67% Optimal</span>
                                </div>
                              </div>

                              {/* Metric Rows */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid #F1F5F9', paddingTop: '14px' }}>
                                {metrics.map((m) => (
                                  <div
                                    key={m.label}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '2px 0',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    {/* Left: Indicator dot, Label, and Info icon with tooltip */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: m.dotColor, flexShrink: 0 }} />
                                      <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>
                                        {m.label}
                                      </span>
                                      <div 
                                        title={`Benchmark: ${m.range}`}
                                        style={{ 
                                          display: 'inline-flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center', 
                                          cursor: 'pointer',
                                          color: '#94A3B8',
                                          transition: 'color 0.15s ease',
                                          marginLeft: '2px'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#334155'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
                                      >
                                        <Info size={13} />
                                      </div>
                                    </div>

                                    {/* Right: Circular Platform Logos */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                      {m.platforms.length > 0 ? (
                                        m.platforms.map((p) => (
                                          <div
                                            key={p.name}
                                            title={p.name}
                                            style={{
                                              width: '26px',
                                              height: '26px',
                                              borderRadius: '50%',
                                              background: p.color,
                                              display: 'flex',
                                              alignItems: 'center',
                                              justifyContent: 'center',
                                              boxShadow: '0 0 0 2px #FFFFFF, 0 2px 4px rgba(0,0,0,0.1)'
                                            }}
                                          >
                                            <PlatformIconOnly platform={p.name} size={13} color="white" />
                                          </div>
                                        ))
                                      ) : (
                                        <div
                                          title="No platforms in this tier"
                                          style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: '1.5px dashed #CBD5E1',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#94A3B8',
                                            fontSize: '11px',
                                            fontWeight: 600
                                          }}
                                        >
                                          —
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* Rankings Toggle Button (Clean Light Styling - Never Black) */}
                              <button
                                onClick={() => setShowAreaBreakdown(!showAreaBreakdown)}
                                style={{
                                  width: '100%',
                                  padding: '11px 14px',
                                  borderRadius: '12px',
                                  border: '1px solid #E2E8F0',
                                  background: '#FFFFFF',
                                  color: '#0F172A',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  transition: 'all 0.15s ease',
                                  marginTop: '4px',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = '#F8FAFC';
                                  e.currentTarget.style.borderColor = '#CBD5E1';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = '#FFFFFF';
                                  e.currentTarget.style.borderColor = '#E2E8F0';
                                }}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <RedLocationPin size={14} />
                                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>
                                    {showAreaBreakdown ? 'Platform Summary' : 'Rankings'}
                                  </span>
                                </div>
                                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                                  {showAreaBreakdown ? '← Back' : `${visiblePostcodes.length} Pins →`}
                                </span>
                              </button>

                            </div>
                          );
                        })()}

                        {/* Separate Component: Last Update & Manual Refresh in MenuIQ Theme Red */}
                        <LastUpdateSyncWidget 
                          lastUpdatedTime={lastUpdatedTime}
                          isPinging={isPinging}
                          pingSuccess={pingSuccess}
                          onPing={handleManualPing}
                        />

                      </div>
                      
                      {/* RIGHT COLUMN: Main Content Area (Independently scrollable) */}
                      <div className="invisible-scrollbar" style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, height: '100%', overflowY: 'auto', paddingBottom: '32px', paddingRight: '8px' }}>
                        
                        {showAreaBreakdown ? (
                          /* Area Breakdown Table View */
                          <div style={{ display: 'flex', flexDirection: 'column', fontFamily: '"Outfit", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
                            {/* Header */}
                            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '16px', paddingRight: '48px' }}>
                              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                                <span style={{ fontSize: '18px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.02em' }}>Rankings</span>
                                <span style={{ fontSize: '12px', fontWeight: 500, color: '#94A3B8' }}>
                                  {visiblePostcodes.length} Tracked Pins
                                </span>
                              </div>
                            </div>

                            {/* Borderless White Card with Soft Elevation */}
                            <div style={{ background: '#FFFFFF', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)', border: '1px solid #F1F5F9' }}>
                              
                              {/* Table Header: Pure White, No Grey Box */}
                              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', background: '#FFFFFF', borderBottom: '1px solid #F1F5F9', padding: '16px 24px', alignItems: 'center' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                                  Pin Location
                                </span>
                                {['Deliveroo', 'Uber Eats', 'Just Eat'].map(p => (
                                  <div key={p} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px' }}>
                                    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: p==='Deliveroo'?'#00CCBC':p==='Uber Eats'?'#06C167':'#FF8000', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                      <PlatformIconOnly platform={p} size={11} color="white" />
                                    </div>
                                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>{p}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Rows */}
                              <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {visiblePostcodes.map((pc, idx) => (
                                  <div 
                                    key={pc.id} 
                                    style={{ 
                                      display: 'grid', 
                                      gridTemplateColumns: '2fr 1fr 1fr 1fr', 
                                      padding: '16px 24px', 
                                      borderBottom: idx === (visiblePostcodes || []).length - 1 ? 'none' : '1px solid #F8FAFC', 
                                      alignItems: 'center' 
                                    }}
                                  >
                                    {/* Location with Pin */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <RedLocationPin size={14} />
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>
                                          {pc.name ? pc.name.split('(')[0].trim() : pc.id}
                                        </span>
                                        <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                                          {pc.name && pc.name.includes('(') ? pc.name.match(/\((.*?)\)/)?.[1] || pc.id : pc.id} • {pc.distanceFormatted}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Platform values: Bold Rank on top, status text with dot below */}
                                    {['Deliveroo', 'Uber Eats', 'Just Eat'].map((p) => {
                                      const pinRanks = {
                                        'Deliveroo': [3, 4, 3],
                                        'Uber Eats': [5, 7, 11],
                                        'Just Eat': [11, 13, 18]
                                      };
                                      const rank = pinRanks[p][idx % pinRanks[p].length];
                                      const stateLabel = rank <= 8 ? 'Optimal' : rank <= 15 ? 'Average' : 'Poor';
                                      const color = rank <= 8 ? '#10B981' : rank <= 15 ? '#F59E0B' : '#EF4444';
                                      return (
                                        <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                                          <span style={{ color: '#0F172A', fontSize: '15px', fontWeight: 800, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
                                            #{rank}
                                          </span>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color }} />
                                            <span style={{ color: color, fontSize: '11px', fontWeight: 600 }}>
                                              {stateLabel}
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ))}

                                {/* Final State Footer Row: Pure White, No Grey Box */}
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '16px 24px', background: '#FFFFFF', borderTop: '1px solid #F1F5F9', alignItems: 'center' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <div style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }} />
                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                      <span style={{ fontSize: '12px', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Final State
                                      </span>
                                      <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 500 }}>
                                        Overall Platform Health
                                      </span>
                                    </div>
                                  </div>
                                  {[
                                    { platform: 'Deliveroo', state: 'Optimal', color: '#10B981' },
                                    { platform: 'Uber Eats', state: 'Optimal', color: '#10B981' },
                                    { platform: 'Just Eat', state: 'Average', color: '#F59E0B' }
                                  ].map(f => (
                                    <div key={f.platform} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: f.color }} />
                                      <span style={{ color: f.color, fontSize: '13px', fontWeight: 700 }}>
                                        {f.state}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Summary Overview (Platform Cards + 30-Day Trend + Competitors) */
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            
                            {/* Section 1: Platform Performance Rows */}
                            <div>
                              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>Platform Performance</span>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Live Coverage Breakdown</span>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {[
                                  { name: 'Deliveroo', state: 'Optimal', reason: 'Top 8 in 3 of 3 areas', rank: '#3', trend: '+2', comp: '#1 Cranbrook', color: '#00CCBC', stateColor: '#10B981' },
                                  { name: 'Uber Eats', state: 'Optimal', reason: 'Top 8 in 2 of 3 areas', rank: '#6', trend: '+1', comp: '#1 Barkingside', color: '#06C167', stateColor: '#10B981' },
                                  { name: 'Just Eat', state: 'Average', reason: 'Top 8 in 1 of 3 areas', rank: '#12', trend: '-2', comp: '#1 Shadwell', color: '#FF8000', stateColor: '#F59E0B' }
                                ].map((p) => (
                                  <div key={p.name} style={{ background: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '16px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                                    
                                    {/* Platform Identity */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '150px' }}>
                                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: p.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                        <PlatformIconOnly platform={p.name} size={16} color="white" />
                                      </div>
                                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{p.name}</span>
                                    </div>

                                    {/* State Indicator with Info Icon */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, paddingLeft: '12px' }}>
                                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.stateColor, flexShrink: 0 }} />
                                      <span style={{ color: p.stateColor, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                                        {p.state}
                                      </span>
                                      <div 
                                        title={p.reason}
                                        style={{ 
                                          display: 'inline-flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center', 
                                          cursor: 'pointer',
                                          color: '#94A3B8',
                                          transition: 'color 0.15s ease',
                                          marginLeft: '2px'
                                        }}
                                        onMouseEnter={(e) => { e.currentTarget.style.color = '#334155'; }}
                                        onMouseLeave={(e) => { e.currentTarget.style.color = '#94A3B8'; }}
                                      >
                                        <Info size={13} />
                                      </div>
                                    </div>

                                    {/* Avg Rank & Trend */}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid #F1F5F9', paddingLeft: '18px', paddingRight: '18px' }}>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Avg Rank</span>
                                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>{p.rank}</span>
                                      </div>
                                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Trend</span>
                                        <span style={{ fontSize: '12px', fontWeight: 800, color: p.trend.startsWith('+') ? '#10B981' : p.trend.startsWith('-') ? '#EF4444' : '#64748B' }}>
                                          {p.trend}
                                        </span>
                                      </div>
                                    </div>

                                    {/* Top Threat / Competitor */}
                                    <div style={{ width: '150px', borderLeft: '1px solid #F1F5F9', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                                      <span style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase' }}>Top Competitor</span>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <img 
                                          src={getAvatar((p.comp || '').charCodeAt(0) + 3)} 
                                          alt={p.comp} 
                                          style={{ width: '16px', height: '16px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }} 
                                        />
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.comp}</span>
                                      </div>
                                    </div>

                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 2: Top Competitors by Platform */}
                            <div>
                              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <span>Top Competitors by Platform</span>
                                <span style={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }}>Click platform to view 10 competitors</span>
                              </div>

                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                                {[
                                  { 
                                    platform: 'Deliveroo', 
                                    color: '#00CCBC', 
                                    rivals: [
                                      { name: 'Cranbrook', rank: '#1' }, 
                                      { name: 'Ilford Spice', rank: '#2' },
                                      { name: 'Gourmet Burger Co', rank: '#3' }
                                    ] 
                                  },
                                  { 
                                    platform: 'Uber Eats', 
                                    color: '#06C167', 
                                    rivals: [
                                      { name: 'Barkingside Burgers', rank: '#1' }, 
                                      { name: 'Smash Bros Ilford', rank: '#2' },
                                      { name: 'Ilford Central', rank: '#3' }
                                    ] 
                                  },
                                  { 
                                    platform: 'Just Eat', 
                                    color: '#FF8000', 
                                    rivals: [
                                      { name: 'Shadwell Grill', rank: '#1' }, 
                                      { name: 'Canning Town Diner', rank: '#2' },
                                      { name: 'Burger Shack E1', rank: '#3' }
                                    ] 
                                  }
                                ].map((col) => (
                                  <div 
                                    key={col.platform} 
                                    onClick={() => setSelectedCompetitorPlatformModal(col.platform)}
                                    title={`Click to view Top 10 ${col.platform} competitors`}
                                    style={{ 
                                      background: '#FFFFFF', 
                                      border: '1px solid #F1F5F9', 
                                      borderRadius: '16px', 
                                      padding: '16px 18px', 
                                      display: 'flex', 
                                      flexDirection: 'column', 
                                      gap: '12px', 
                                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                                      cursor: 'pointer',
                                      transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                      e.currentTarget.style.transform = 'translateY(-2px)';
                                      e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(15, 23, 42, 0.08)';
                                      e.currentTarget.style.borderColor = col.color;
                                    }}
                                    onMouseLeave={(e) => {
                                      e.currentTarget.style.transform = 'translateY(0)';
                                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.02)';
                                      e.currentTarget.style.borderColor = '#F1F5F9';
                                    }}
                                  >
                                    
                                    {/* Column Header */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', paddingBottom: '10px' }}>
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: col.color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                          <PlatformIconOnly platform={col.platform} size={12} color="white" />
                                        </div>
                                        <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A' }}>{col.platform}</span>
                                      </div>
                                      <span style={{ fontSize: '11px', fontWeight: 700, color: col.color, display: 'flex', alignItems: 'center', gap: '2px' }}>
                                        Top 10 →
                                      </span>
                                    </div>

                                    {/* Rivals List */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                      {col.rivals.map((r, rIdx) => (
                                        <div key={rIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 0' }}>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                                            <img 
                                              src={getAvatar((r.name || '').charCodeAt(0) + rIdx * 5)} 
                                              alt={r.name} 
                                              style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }} 
                                            />
                                            <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '125px' }}>
                                              {r.name}
                                            </span>
                                          </div>
                                          {/* Pure typography rank without background or border */}
                                          <span style={{ 
                                            fontSize: '12px', 
                                            fontWeight: 700, 
                                            color: r.rank === '#1' ? '#D97706' : '#64748B',
                                            flexShrink: 0,
                                            marginLeft: '6px'
                                          }}>
                                            {r.rank}
                                          </span>
                                        </div>
                                      ))}
                                    </div>

                                    {/* Clickable footer hint */}
                                    <div style={{ borderTop: '1px solid #F8FAFC', paddingTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                      <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#94A3B8' }}>
                                        Click to view 1–10 leaderboard
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Section 3: 30-Day Trend Chart */}
                            <div style={{ background: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '16px', padding: '18px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <Activity size={16} color="#64748B" />
                                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>30-Day Ranking History</span>
                                  {(() => {
                                    const pColor = trendChartPlatform === 'Deliveroo' ? '#00CCBC' : trendChartPlatform === 'Uber Eats' ? '#06C167' : '#FF8000';
                                    return (
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: pColor }} />
                                        <span style={{ fontSize: '12px', fontWeight: 700, color: pColor }}>
                                          {trendChartPlatform}
                                        </span>
                                      </div>
                                    );
                                  })()}
                                </div>
                                
                                {/* Clickable Circular Platform Logo Buttons */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  {[
                                    { label: 'Deliveroo', key: 'deliveroo', color: '#00CCBC' },
                                    { label: 'Uber Eats', key: 'ubereats', color: '#06C167' },
                                    { label: 'Just Eat', key: 'justeat', color: '#FF8000' }
                                  ].map(p => {
                                    const isSelected = trendChartPlatform === p.label;
                                    return (
                                      <button
                                        key={p.label}
                                        onClick={() => setTrendChartPlatform(p.label)}
                                        title={`Switch to ${p.label}`}
                                        style={{
                                          width: '28px',
                                          height: '28px',
                                          borderRadius: '50%',
                                          background: p.color,
                                          border: 'none',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          cursor: 'pointer',
                                          opacity: isSelected ? 1 : 0.45,
                                          transform: isSelected ? 'scale(1.08)' : 'scale(1)',
                                          boxShadow: isSelected 
                                            ? `0 0 0 2px #FFFFFF, 0 0 0 4px ${p.color}, 0 4px 10px rgba(0,0,0,0.15)` 
                                            : '0 0 0 2px #FFFFFF, 0 1px 3px rgba(0,0,0,0.1)',
                                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                          outline: 'none',
                                          padding: 0
                                        }}
                                        onMouseEnter={(e) => {
                                          if (!isSelected) {
                                            e.currentTarget.style.opacity = '0.85';
                                            e.currentTarget.style.transform = 'scale(1.04)';
                                          }
                                        }}
                                        onMouseLeave={(e) => {
                                          if (!isSelected) {
                                            e.currentTarget.style.opacity = '0.45';
                                            e.currentTarget.style.transform = 'scale(1)';
                                          }
                                        }}
                                      >
                                        <PlatformIconOnly platform={p.label} size={14} color="white" />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {(() => {
                                const platformMap = {
                                  'Deliveroo': { key: 'deliveroo', color: '#00CCBC' },
                                  'Uber Eats': { key: 'ubereats', color: '#06C167' },
                                  'Just Eat': { key: 'justeat', color: '#FF8000' }
                                };
                                const activePlat = platformMap[trendChartPlatform] || platformMap['Deliveroo'];

                                return (
                                  <div style={{ width: '100%', height: '220px' }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                      <LineChart data={[
                                        { day: 'Day 1', deliveroo: 6, ubereats: 8, justeat: 16 },
                                        { day: 'Day 5', deliveroo: 5, ubereats: 8, justeat: 15 },
                                        { day: 'Day 10', deliveroo: 4, ubereats: 7, justeat: 14 },
                                        { day: 'Day 15', deliveroo: 3, ubereats: 7, justeat: 15 },
                                        { day: 'Day 20', deliveroo: 3, ubereats: 6, justeat: 13 },
                                        { day: 'Day 25', deliveroo: 3, ubereats: 6, justeat: 14 },
                                        { day: 'Today', deliveroo: 3, ubereats: 6, justeat: 12 }
                                      ]}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dy={6} />
                                        <YAxis reversed domain={[1, 20]} tick={{ fontSize: 11, fill: '#94A3B8', fontWeight: 500 }} axisLine={false} tickLine={false} dx={-6} />
                                        <RechartsTooltip 
                                          formatter={(val) => [`#${val}`, `${trendChartPlatform} Rank`]} 
                                          contentStyle={{ borderRadius: '10px', fontSize: '12px', border: '1px solid #E2E8F0', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }} 
                                        />
                                        <Line 
                                          type="monotone" 
                                          dataKey={activePlat.key} 
                                          stroke={activePlat.color} 
                                          strokeWidth={3} 
                                          dot={{ r: 4, fill: activePlat.color, stroke: '#FFFFFF', strokeWidth: 2 }} 
                                          activeDot={{ r: 6, fill: activePlat.color, stroke: '#FFFFFF', strokeWidth: 2 }}
                                        />
                                      </LineChart>
                                    </ResponsiveContainer>
                                  </div>
                                );
                              })()}
                            </div>

                          </div>
                        )}

                      </div>
                    </div>
                  );
                })()}
              </div>
) : showCompetitorsView ? null : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                {sortedKeywords.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px 20px', color: '#9CA3AF', fontSize: '14px', fontWeight: 500 }}>
                    No ranking data found for the current filters.
                  </div>
                ) : (
                  sortedKeywords.map(kw => {

                    // Calculate true best and worst across all locations
                    const allSorted = [...aggregatedData[kw]].sort((a,b) => a.rank - b.rank);
                    const bestRank = allSorted[0];
                    const worstRank = allSorted[allSorted.length - 1];

                    // If a postcode is selected in the map, only show data for that postcode.
                    const items = selectedPostcodeId 
                      ? aggregatedData[kw].filter(r => r.postcodeId === selectedPostcodeId) 
                      : allSorted;

                    if (items.length === 0) return null;

                    // Calculate aggregate rank for this keyword across active selection
                    const avgRank = items.reduce((sum, item) => sum + item.rank, 0) / items.length;
                    const keyColor = getRankColor(avgRank);

                    const isHeatmapActive = selectedHeatmapKeyword === kw;

                    // Select a placeholder image based on keyword
                    const imgUrl = kw.toLowerCase().includes('pizza') ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=200&fit=crop' :
                                   kw.toLowerCase().includes('burger') ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop' :
                                   kw.toLowerCase().includes('chicken') ? 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=200&fit=crop' :
                                   kw.toLowerCase().includes('dessert') ? 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=200&fit=crop' :
                                   'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=200&fit=crop';

                    return (
                      <div key={kw} onClick={() => setSelectedHeatmapKeyword(isHeatmapActive ? null : kw)} style={{ height: '275px', background: isHeatmapActive ? '#FFF1F2' : '#FFFFFF', borderRadius: '16px', border: isHeatmapActive ? '1px solid #FECDD3' : '1px solid #E2E8F0', boxShadow: isHeatmapActive ? '0 0 16px rgba(232,106,88,0.15)' : '0 10px 30px -10px rgba(0,0,0,0.06)', overflow: 'hidden', transition: 'all 0.2s', cursor: 'pointer', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = isHeatmapActive ? '0 0 20px rgba(232,106,88,0.2)' : '0 20px 40px -10px rgba(0,0,0,0.1)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = isHeatmapActive ? '0 0 16px rgba(232,106,88,0.15)' : '0 10px 30px -10px rgba(0,0,0,0.06)'; }}>
                        
                        {/* Hero Image */}
                        <div style={{ position: 'relative', width: '100%', height: '135px' }}>
                          <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${imgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: isHeatmapActive ? 0.9 : 1, transition: 'all 0.2s' }} />
                        </div>
                        
                        {/* Card Interior */}
                        <div style={{ padding: '16px 14px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'transparent', flex: 1, justifyContent: 'center' }}>
                          
                          {/* Title & Subtext */}
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                            <h3 title={kw} style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {kw}
                            </h3>
                            <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              VISIBILITY
                            </span>
                          </div>
                          
                          {/* Platform Stats (Horizontal with States Below) */}
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px', padding: '4px 0' }}>
                            {['Deliveroo', 'Uber Eats', 'Just Eat'].map(p => {
                              const rs = (data.rankings || []).filter(r => 
                                 r.keyword === kw && 
                                 r.platform === p && 
                                 r.restaurantName === rankingViewSelectedRestaurant &&
                                 (selectedPostcodeId ? r.postcodeId === selectedPostcodeId : true)
                              );
                              const pAvg = rs.length > 0 ? Math.round(rs.reduce((a,b)=>a+b.rank, 0)/rs.length) : '-';
                              const pColor = p === 'Deliveroo' ? '#00CCBC' : p === 'Uber Eats' ? '#06C167' : '#FF8000';
                              
                              // Testing mock: set to Optimal to verify spacing and visual
                              const state = { label: 'Optimal', color: '#10B981', ringColor: '#10B981' };
                              
                              return (
                                <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }} title={`${p} - ${state.label}`}>
                                   <div style={{ 
                                     width: '28px', height: '28px', borderRadius: '50%', background: pColor, 
                                     display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                     boxShadow: `0 0 0 2px #FFFFFF, 0 0 0 3px ${state.ringColor}`,
                                     transition: 'all 0.2s'
                                   }}>
                                     <PlatformIconOnly platform={p} size={14} color="white" />
                                   </div>
                                   <span style={{ fontSize: '9px', fontWeight: 800, textTransform: 'uppercase', color: state.color, letterSpacing: '0.02em' }}>
                                     {state.label}
                                   </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Footer */}
                        <div style={{ display: 'flex', borderTop: '1px solid #F1F5F9' }}>

                          <div 
                            onClick={(e) => { e.stopPropagation(); setRankingViewKeyword(kw); }}
                            style={{ flex: 1, padding: '12px 14px', display: 'flex', justifyContent: 'center', alignItems: 'center', background: rankingViewKeyword === kw ? '#FFF1F2' : '#FFFFFF', cursor: 'pointer', transition: 'all 0.2s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF1F2'; e.currentTarget.querySelector('.ranking-text').style.color = '#E11D48'; }}
                            onMouseLeave={(e) => { if(rankingViewKeyword !== kw) { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.querySelector('.ranking-text').style.color = '#64748B'; } }}
                          >
                            <span className="ranking-text" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: rankingViewKeyword === kw ? '#E11D48' : '#64748B', transition: 'color 0.2s' }}>View Detail</span>
                          </div>
                        </div>

                      </div>
                    );

                  })
                )}
                
                {/* Ghost Card to Fill Slots */}
                <div 
                  onClick={() => setIsAddKeywordModalOpen(true)}
                  style={{ height: '275px', background: 'transparent', borderRadius: '12px', border: '2px dashed #CBD5E1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'sans-serif' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.4)'; e.currentTarget.style.borderColor = '#94A3B8'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#CBD5E1'; }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '20px', color: '#64748B', fontWeight: 500 }}>+</span>
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#64748B' }}>Add Keyword</span>
                </div>
              </div>
            )}
            </div>
          </div>

        {/* RIGHT PANE (WIDGET + MAP) - 40% */}
        {!rankingViewKeyword && (
        <div style={{ width: '40%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          
          {/* Top 31% - Widget Mirror */}
          <div style={{ height: '31%', background: '#FCFAF6', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 10, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
            
            <div style={{ position: 'absolute', top: '24px', left: '24px', right: '64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h4 style={{ margin: 0, fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Platform Score
              </h4>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Postcodes</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{activePostcodes.length}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase' }}>Keywords</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A' }}>{sortedKeywords.length || 2}</span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: '0', marginTop: '56px' }}>
              {widgetPlatforms.map((p, idx) => {
                const pId = p.name === 'Uber Eats' ? 'ubereats' : p.name === 'Deliveroo' ? 'deliveroo' : 'justeat';
                const isHighlighted = highlightPlatform === pId;

                return (
                <React.Fragment key={idx}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, position: 'relative' }} onClick={() => setHighlightPlatform(isHighlighted ? null : pId)}>
                    
                    {/* Optional subtle background glow behind the highlighted column */}
                    {isHighlighted && (
                      <div style={{ position: 'absolute', top: '-12px', bottom: '-12px', left: '12px', right: '12px', background: 'radial-gradient(ellipse at top, rgba(239,68,68,0.06), transparent)', borderRadius: '16px', zIndex: 0 }} />
                    )}

                    {/* Badge & Name Container */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '12px', zIndex: 1, cursor: 'pointer' }}>
                      <div style={{ 
                        width: '44px', height: '44px', borderRadius: '50%', backgroundColor: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, 
                        boxShadow: isHighlighted ? `0 0 0 3px #FFFFFF, 0 0 0 5px #EF4444, 0 8px 16px ${p.bg}40` : `0 8px 16px ${p.bg}40`,
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                      }}>
                        <PlatformIconOnly platform={p.name} size={22} color="white" />
                      </div>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: isHighlighted ? '#EF4444' : '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'color 0.3s' }}>
                        {p.name}
                      </span>
                    </div>

                    {/* State Indicator */}
                    {(() => {
                      let state = { label: 'Poor', color: '#EF4444' };
                      if (p.score >= 60) state = { label: 'Optimal', color: '#10B981' };
                      else if (p.score >= 20) state = { label: 'Average', color: '#F59E0B' };
                      
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: state.color }} />
                          <span style={{ color: state.color, fontSize: '12px', fontWeight: 700, textTransform: 'uppercase' }}>
                            {state.label}
                          </span>
                        </div>
                      );
                    })()}

                  </div>
                  {/* Division Line */}
                  {idx < widgetPlatforms.length - 1 && (
                    <div style={{ width: '1px', height: '80px', backgroundColor: '#E2E8F0', transform: 'translateY(-10px)' }} />
                  )}
                </React.Fragment>
                );
              })}
            </div>
            
          </div>

          {/* Bottom 69% - Map */}
          <div style={{ height: '69%', position: 'relative', background: '#E5E7EB' }}>
            
            {/* Competitor Leaderboard Overlay */}
            {selectedPostcodeId && selectedHeatmapKeyword && (
              (() => {
                const pc = (visiblePostcodes || []).find(p => p.id === selectedPostcodeId);
                const relatedRankings = (data.rankings || []).filter(r => r.postcodeId === selectedPostcodeId && r.keyword === selectedHeatmapKeyword && r.platform === activePlatform);
                const rank = relatedRankings.length > 0 ? Math.round(relatedRankings.reduce((sum, r) => sum + r.rank, 0) / relatedRankings.length) : null;
                
                if (!rank || !pc) return null;

                const pcData = relatedRankings.sort((a,b) => a.rank - b.rank);
                const board = [...pcData.slice(0, 15)];
                const userObj = pcData.find(r => r.restaurantName === rankingViewSelectedRestaurant);
                if (userObj && userObj.rank > 15) {
                  board.push(userObj);
                }

                let headerBgColor = rank <= 5 ? '#10B981' : rank <= 15 ? '#EAB308' : '#EF4444';

                return (
                  <div 
                    style={{ position: 'absolute', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.3)', backdropFilter: 'blur(4px)' }}
                    onClick={() => setSelectedPostcodeId(null)}
                  >
                    <div 
                      onClick={(e) => e.stopPropagation()}
                      style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderRadius: '16px', padding: '14px', width: '220px', maxHeight: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)', border: '1px solid rgba(255,255,255,0.8)', display: 'flex', flexDirection: 'column', gap: '12px', transform: 'translateY(-10px)' }}
                    >
                      
                    {/* Header - Styled like Map Banner */}
                    <div style={{ position: 'relative', backgroundColor: headerBgColor, color: 'white', padding: '10px 14px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)', lineHeight: 1.2 }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedPostcodeId(null); }}
                        style={{ position: 'absolute', top: '6px', right: '6px', background: 'rgba(0,0,0,0.1)', border: 'none', borderRadius: '50%', color: 'white', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
                      >
                        <X size={12} />
                      </button>
                      <span style={{ opacity: 0.9, fontWeight: 700, fontSize: '9px', letterSpacing: '0.04em', marginBottom: '2px', textTransform: 'uppercase' }}>
                        <span style={{ opacity: 0.7, fontWeight: 600 }}>Location: </span>{pc.name}
                      </span>
                      <span style={{ fontWeight: 600, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8 }}>Your Rank:</span>
                        #{rank}
                      </span>
                    </div>

                    {/* Leaderboard List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', maxHeight: '210px', paddingRight: '4px' }} className="invisible-scrollbar">
                      <div style={{ fontSize: '9px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '-2px', paddingLeft: '4px', flexShrink: 0 }}>
                        Competitors
                      </div>
                      {board.map(item => {
                        const isUser = item.isUser || item.restaurantName === rankingViewSelectedRestaurant;
                        const seedHash = (item.restaurantName || '').length + (item.rank || 0);
                        const rowImg = getAvatar(seedHash);
                        
                        return (
                          <div key={item.rank} style={{ display: 'flex', alignItems: 'center', padding: '6px 10px', background: isUser ? '#FFF1F0' : '#F8FAFC', border: isUser ? '1px solid #FCA5A5' : '1px solid #E2E8F0', borderRadius: '6px', position: 'relative', overflow: 'hidden' }}>
                            {item.isUser && (
                              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '3px', background: '#E86A58' }} />
                            )}
                            <div style={{ width: '28px', fontSize: '11px', fontWeight: 600, color: isUser ? '#E86A58' : '#94A3B8' }}>
                              #{item.rank}
                            </div>
                            
                            <div style={{ width: '18px', height: '18px', borderRadius: '50%', backgroundColor: '#E2E8F0', marginRight: '8px', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={isUser ? 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=64&h=64&fit=crop' : rowImg} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Restaurant" />
                            </div>

                            <div style={{ flex: 1, fontSize: '11px', fontWeight: isUser ? 700 : 500, color: isUser ? '#991B1B' : '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.restaurantName}
                            </div>
                            {item.isUser && (
                              <div style={{ fontSize: '8px', fontWeight: 600, color: '#334155', background: 'rgba(232,106,88,0.15)', padding: '2px 4px', borderRadius: '4px' }}>YOU</div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                </div>
                );
              })()
            )}

            <MapContainer 
              center={mapCenter}
              zoom={mapZoom}
              zoomControl={false}
              scrollWheelZoom={true}
              style={{ width: '100%', height: '100%' }}
            >
              <MapController 
                center={mapCenter} 
                zoom={mapZoom} 
                selectedPostcode={selectedPostcode} 
                selectedKeyword={selectedHeatmapKeyword}
                pins={activePostcodes}
                onMapClick={() => {
                  setIsTrackingNodeOpen(false);
                  setSelectedPostcodeId(null);
                }} 
              />
              <ZoomControl position="bottomright" />
              <TileLayer url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png" />

              {/* Postcode Markers */}
              {activePostcodes.map((pc, idx) => {
                const isSelected = selectedPostcodeId === pc.id;
                // Visual Mock Data for pins reflecting the 3 states
                const mockStates = [
                  { label: 'POOR', rank: '#21', color: '#EF4444', text: '#B91C1C' },
                  { label: 'AVERAGE', rank: '#11', color: '#F59E0B', text: '#B45309' },
                  { label: 'OPTIMAL', rank: '#3', color: '#10B981', text: '#15803D' }
                ];
                const mockData = mockStates[idx % mockStates.length];

                return (
                  <Marker 
                    key={pc.id} 
                    position={[pc.lat, pc.lng]}
                    icon={L.divIcon({
                      className: 'custom-icon',
                      html: `<div style="position: absolute; top: 0; left: 0;">
                              <div style="position: absolute; top: 0; left: 0; transform: translate(-50%, -100%) ${isSelected ? 'scale(1.15)' : 'scale(1)'}; cursor: pointer; transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1); z-index: 5;">
                                ${realLocationPinSvgHtml(mockData.color, isSelected)}
                              </div>

                              <div style="
                                position: absolute; top: 0; left: 0; transform: translate(-50%, -100%); margin-top: ${isSelected ? '-44px' : '-38px'}; 
                                background: #FFFFFF; border: 1px solid rgba(226, 232, 240, 0.9); border-radius: 10px; padding: 6px 12px; 
                                box-shadow: 0 6px 16px -2px rgba(15, 23, 42, 0.1), 0 2px 4px -1px rgba(15, 23, 42, 0.04); 
                                display: flex; flex-direction: column; align-items: center; gap: 3px; white-space: nowrap; z-index: 50; 
                                font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; pointer-events: none;
                                -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; text-rendering: optimizeLegibility;
                              ">
                                <span style="font-size: 11.5px; font-weight: 700; color: #334155; letter-spacing: -0.01em; line-height: 1.2;">
                                  ${pc.name.toUpperCase()}
                                </span>
                                
                                <div style="display: flex; align-items: center; justify-content: center; gap: 5px;">
                                  <span style="color: ${mockData.color}; font-size: 10.5px; font-weight: 700; letter-spacing: 0.03em; text-transform: uppercase;">
                                    ${mockData.label}
                                  </span>
                                  <span style="color: #CBD5E1; font-size: 8px; margin: 0 1px;">•</span>
                                  <span style="color: #475569; font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums;">
                                    ${mockData.rank}
                                  </span>
                                </div>
                                
                                <div style="position: absolute; bottom: -5px; left: 50%; transform: translateX(-50%) rotate(45deg); width: 8px; height: 8px; background: #FFFFFF; border-right: 1px solid rgba(226, 232, 240, 0.9); border-bottom: 1px solid rgba(226, 232, 240, 0.9);"></div>
                              </div>
                            </div>`,
                      iconSize: [0, 0],
                      iconAnchor: [0, 0]
                    })}
                    eventHandlers={{
                      click: () => {
                        setSelectedPostcodeId(isSelected ? null : pc.id);
                      }
                    }}
                  />
                );
              })}
            </MapContainer>


          </div>
        </div>
        )}
        
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          .modal-pulse-marker-active { animation: modal-pulse-active 1.5s infinite; }
          @keyframes modal-pulse-active {
            0% { filter: drop-shadow(0 0 0 rgba(17, 17, 17, 0.6)); }
            50% { filter: drop-shadow(0 0 12px rgba(17, 17, 17, 0.4)); }
            100% { filter: drop-shadow(0 0 0 rgba(17, 17, 17, 0)); }
          }
          .custom-map-tooltip {
            background: transparent !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
          }
          .custom-map-tooltip::before { display: none !important; }
          .invisible-scrollbar::-webkit-scrollbar { width: 6px; }
          .invisible-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .invisible-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
          .invisible-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
        `}</style>
      </div>

      {/* Keyword Detail Modal */}
      {detailModalKeyword && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '460px', maxWidth: '90%', maxHeight: '80%', background: '#FCFAF6', borderRadius: '24px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            
            {/* Hero Image Header */}
            <div style={{ position: 'relative', width: '100%', height: '240px', flexShrink: 0 }}>
              {(() => {
                const kw = detailModalKeyword || '';
                const modalImgUrl = kw.toLowerCase().includes('pizza') ? 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=200&fit=crop' :
                                    kw.toLowerCase().includes('burger') ? 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=200&fit=crop' :
                                    kw.toLowerCase().includes('chicken') ? 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=400&h=200&fit=crop' :
                                    kw.toLowerCase().includes('dessert') ? 'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=400&h=200&fit=crop' :
                                    'https://images.unsplash.com/photo-1493770348161-369560ae357d?w=400&h=200&fit=crop';
                return (
                  <>
                    <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${modalImgUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 40%)' }} />
                  </>
                );
              })()}
              

              {/* Close Button */}
              <button 
                onClick={() => setDetailModalKeyword(null)}
                style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }}
              >
                <X size={16} />
              </button>

              {/* Title Area */}
              <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px', fontFamily: '"Inter", sans-serif' }}>
                <h3 style={{ margin: 0, fontSize: '28px', fontWeight: 600, color: '#FFFFFF', textTransform: 'uppercase' }}>{detailModalKeyword}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '10px', color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Location breakdown</p>
              </div>
              

            </div>

            {/* Data Rows Stack (Card Interior) */}
            <div className="invisible-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: '#FFFFFF' }}>
              {(() => {
                const items = aggregatedData[detailModalKeyword];
                if (!items || items.length === 0) return null;
                
                const avgRank = items.reduce((sum, item) => sum + item.rank, 0) / items.length;
                const sortedItems = [...items].sort((a, b) => a.rank - b.rank);
                const activeColor = activePlatform === 'Deliveroo' ? '#00CCBC' : activePlatform === 'Uber Eats' ? '#06C167' : '#FF8000';

                return (
                  <>
                    {/* Average Ranking Summary Row */}
                    <div style={{ padding: '0 4px 16px 4px', display: 'flex', alignItems: 'center', fontFamily: '"Inter", sans-serif' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Average Ranking</span>
                      <span style={{ flex: 1 }}></span>
                      <span style={{ fontFamily: '"Outfit", "Inter", sans-serif', fontSize: '24px', fontWeight: 700, color: '#334155', textAlign: 'right', fontVariantNumeric: 'tabular-nums',  }}>#{avgRank.toFixed(0)}</span>
                    </div>

                    {/* Column Titles */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 4px', marginBottom: '4px', fontFamily: '"Inter", sans-serif' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Area/Postcode</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', paddingRight: '4px' }}>Ranking</span>
                    </div>

                    {sortedItems.map((item, idx) => (
                      <div key={idx} style={{ background: '#FFFFFF', border: '1px solid #F1F5F9', borderRadius: '12px', padding: '14px 16px', display: 'flex', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.02)', fontFamily: '"Inter", sans-serif' }}>
                        {/* Left: Location Name */}
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <RedLocationPin size={16} />
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#334155' }}>
                            {item.postcodeName}
                          </span>
                        </div>
                        
                        {/* Right: Trend & Rank */}
                        <div style={{ width: '80px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            {item.trend === 'up' && <TrendingUp size={14} color="#94A3B8" />}
                            {item.trend === 'down' && <TrendingDown size={14} color="#94A3B8" />}
                            {item.trend === 'flat' && <Minus size={14} color="#94A3B8" />}
                            {item.trend !== 'flat' && <span style={{ fontFamily: '"Outfit", "Inter", sans-serif', fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>{item.change}</span>}
                          </div>
                          <span style={{ fontFamily: '"Outfit", "Inter", sans-serif', fontSize: '16px', fontWeight: 700, color: '#334155', width: '40px', textAlign: 'right', fontVariantNumeric: 'tabular-nums',  }}>
                            #{item.rank}
                          </span>
                        </div>
                      </div>
                    ))}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
    </ErrorBoundary>,
    document.body
  );
};

export default VisibilityEngineModal;
