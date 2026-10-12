import { supabase } from '../supabase';
import { getRankedCompetitors } from '../utils/competitorEngine';
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { MapContainer, TileLayer, Circle, useMap, Marker, Tooltip, Popup } from 'react-leaflet';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';

// ─── Cache to prevent Leaflet from destroying DOM nodes on every render ──────
export const iconCache = {};

export const createClusterCustomIcon = (cluster) => {
  return L.divIcon({
    html: `<div style="background-color:rgba(255,255,255,0.95); backdrop-filter:blur(8px); width:36px; height:36px; border-radius:50%; border:2.5px solid #1E293B; display:flex; align-items:center; justify-content:center; font-family:'Inter', system-ui, sans-serif; font-weight:800; color:#1E293B; font-size:13px; box-shadow:0 6px 16px rgba(0,0,0,0.15);">
             ${cluster.getChildCount()}
           </div>`,
    className: 'custom-marker-cluster',
    iconSize: L.point(36, 36, true)
  });
};

export const getRestaurantImageURL = (competitorId) => {
  return `https://loremflickr.com/100/100/takeaway,food?lock=${competitorId}`;
};

export const createCustomIcon = (competitor, zoom, promoCount = 0) => {
  const showText = zoom >= 14;
  const size = showText ? 36 : 28;
  const key = `${competitor.id}-${showText}-promo${promoCount}`;
  if (iconCache[key]) return iconCache[key];

  const imgUrl = competitor.hero_image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop';
  const badgeHTML = promoCount > 0 ? `<div style="position:absolute; top:-4px; right:-4px; background:#E05046; color:#fff; font-size:9px; font-weight:800; padding:2px 5px; border-radius:10px; border:1.5px solid #fff; box-shadow:0 2px 4px rgba(0,0,0,0.2); z-index:10; line-height:1;">${promoCount}</div>` : '';

  const icon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; gap:3px;">
             <div style="position:relative; width:${size}px; height:${size}px; border-radius:50%; background-color:#fff; border:1.5px solid #E86A58; display:flex; align-items:center; justify-content:center; box-shadow:0 3px 8px rgba(0,0,0,0.15);">
               ${badgeHTML}
               <div style="width:100%; height:100%; border-radius:50%; overflow:hidden;">
                 <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" />
               </div>
             </div>
             ${showText ? `<div style="background:rgba(255,255,255,0.95); backdrop-filter:blur(8px); padding:4px 10px; border-radius:999px; font-family:'Inter', system-ui, sans-serif; font-size:11.5px; font-weight:600; letter-spacing:-0.3px; color:#1E293B; white-space:nowrap; box-shadow:0 4px 16px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.08); border:1px solid rgba(0,0,0,0.06); max-width:110px; overflow:hidden; text-overflow:ellipsis; margin-top:2px;">${competitor.name}</div>` : ''}
           </div>`,
    iconSize: [size, size],
    iconAnchor: [size/2, size],
    popupAnchor: [0, -size],
    tooltipAnchor: [0, -size]
  });
  iconCache[key] = icon;
  return icon;
};

export const createMyRestaurantIcon = () => {
  if (iconCache['my-resto']) return iconCache['my-resto'];
  
  const imgUrl = `https://loremflickr.com/100/100/takeaway,food?lock=999`;

  const icon = L.divIcon({
    className: 'my-restaurant-icon',
    html: `<div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
             <div style="background:linear-gradient(135deg, #E86A58 0%, #D45544 100%); padding:5px 12px; border-radius:999px; font-family:'Inter', system-ui, sans-serif; font-size:12px; font-weight:700; letter-spacing:-0.2px; color:#fff; white-space:nowrap; box-shadow:0 6px 16px rgba(232,106,88,0.35), 0 2px 4px rgba(232,106,88,0.2); border:1px solid rgba(255,255,255,0.25); text-shadow:0 1px 2px rgba(0,0,0,0.1); margin-bottom:2px;">
               Our Restaurant
             </div>
             <div style="width:48px;height:48px;border-radius:50%;background-color:#fff;border:3px solid #E86A58;display:flex;align-items:center;justify-content:center;box-shadow:0 0 24px rgba(232,106,88,0.6);overflow:hidden;">
               <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;" />
             </div>
           </div>`,
    iconSize: [140, 90],
    iconAnchor: [70, 60],
  });
  iconCache['my-resto'] = icon;
  return icon;
};
import {
  ShieldAlert, Crosshair, Search, MapPin, Zap, Star, Tag,
  ChevronRight, ChevronDown, ChevronUp, Check, X, Target, UtensilsCrossed, Store,
  SlidersHorizontal, RefreshCw, Clock
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// ─── Haversine distance formula (miles) ──────────────────────────────────────
const haversine = (lat1, lng1, lat2, lng2) => {
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// ─── Dynamic zoom based on radius ────────────────────────────────────────────
const getZoom = (r) => {
  if (r <= 0.5) return 14.8;
  if (r <= 1.0) return 14.0;
  if (r <= 1.5) return 13.4;
  if (r <= 2.0) return 13.0;
  if (r <= 2.5) return 12.6;
  if (r <= 3.0) return 12.2;
  if (r <= 4.0) return 11.7;
  return 11.2;
};

const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      // Offset center slightly south so tooltip above marker stays fully visible
      
      map.flyTo(center, zoom, { duration: 1.2 });
    }
  }, [center, zoom, map]);
  return null;
};

const MapZoomListener = ({ onZoomChange }) => {
  const map = useMap();
  useEffect(() => {
    const handleZoom = () => onZoomChange(map.getZoom());
    map.on('zoomend', handleZoom);
    onZoomChange(map.getZoom());
    return () => map.off('zoomend', handleZoom);
  }, [map, onZoomChange]);
  return null;
};

// ─── Custom zoom slider (rendered inside MapContainer via useMap) ────────────
const ZoomControls = () => {
  const map = useMap();
  const [zoomLevel, setZoomLevel] = useState(map.getZoom());
  const controlRef = useRef(null);

  useEffect(() => {
    const handleZoomEnd = () => setZoomLevel(map.getZoom());
    map.on('zoomend', handleZoomEnd);
    if (controlRef.current) {
      L.DomEvent.disableClickPropagation(controlRef.current);
      L.DomEvent.disableScrollPropagation(controlRef.current);
    }
    return () => map.off('zoomend', handleZoomEnd);
  }, [map]);

  return (
    <div ref={controlRef} style={{
      position: 'absolute', bottom: '14px', left: '14px', zIndex: 1000,
      display: 'flex', alignItems: 'center', gap: '10px',
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '8px 14px',
      boxShadow: '0 4px 14px rgba(0,0,0,0.12)',
      border: '1px solid rgba(0,0,0,0.08)',
    }}>
      <button onClick={() => map.zoomOut()} style={{ background:'none', border:'none', fontSize:'16px', color:'#6B7280', cursor:'pointer', padding:0, display:'flex', userSelect:'none' }} title="Zoom Out">−</button>
      <input
        type="range" min="10" max="18" step="0.1"
        value={zoomLevel}
        onChange={e => setZoomLevel(parseFloat(e.target.value))}
        onPointerUp={e => map.setZoom(parseFloat(e.target.value), { animate: true })}
        className="sleek-slider"
        title="Adjust Zoom"
      />
      <button onClick={() => map.zoomIn()} style={{ background:'none', border:'none', fontSize:'16px', color:'#6B7280', cursor:'pointer', padding:0, display:'flex', userSelect:'none' }} title="Zoom In">+</button>
    </div>
  );
};

// ─── Circular progress ring overlay shown on the map after Apply Radius ────────
const MapLoadingOverlay = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);  // 0 → 1
  const [done,     setDone]     = useState(false);
  const rafRef   = useRef(null);
  const startRef = useRef(null);
  const DURATION = 3500; // ms to fill the ring

  useEffect(() => {
    const animate = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const p = Math.min((ts - startRef.current) / DURATION, 1);
      setProgress(p);
      if (p < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDone(true);
        // Hold the tick for 1.2 s then fire onComplete
        setTimeout(() => onComplete(), 1200);
      }
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [onComplete]);

  // SVG ring geometry
  const R = 46;
  const circumference = 2 * Math.PI * R;
  const offset = circumference * (1 - progress);

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 1002,
      backgroundColor: 'rgba(15,23,42,0.58)',
      backdropFilter: 'blur(3px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: '18px',
    }}>

      {/* Ring + centre content */}
      <div style={{ position: 'relative', width: '112px', height: '112px' }}>
        <svg width="112" height="112" viewBox="0 0 112 112" style={{ display: 'block' }}>
          {/* Track */}
          <circle cx="56" cy="56" r={R}
            fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
          {/* Progress arc */}
          <circle cx="56" cy="56" r={R}
            fill="none"
            stroke={done ? '#10B981' : '#E86A58'}
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={done ? 0 : offset}
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '56px 56px',
              transition: done ? 'stroke 0.4s ease, stroke-dashoffset 0.2s ease' : 'none',
            }}
          />
        </svg>

        {/* Centre: percentage → tick */}
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {!done ? (
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.03em' }}>
              {Math.round(progress * 100)}%
            </span>
          ) : (
            <svg
              width="32" height="32" viewBox="0 0 32 32" fill="none"
              style={{ animation: 'tickDraw 0.45s ease forwards' }}
            >
              <path
                d="M6 16L13 23L26 9"
                stroke="#10B981" strokeWidth="3.5"
                strokeLinecap="round" strokeLinejoin="round"
                pathLength="1"
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: 1,
                  animation: 'tickDraw 0.5s ease forwards',
                }}
              />
            </svg>
          )}
        </div>
      </div>

      {/* Label */}
      {!done ? (
        <p style={{
          margin: 0, fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.85)',
          letterSpacing: '-0.01em',
        }}>
          Updating Market Area…
        </p>
      ) : (
        <div style={{ textAlign: 'center', animation: 'fadeInUp 0.4s ease' }}>
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#10B981' }}>
            Market Area has been changed
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 500 }}>
            Analytics refresh in ~1 min
          </p>
        </div>
      )}
    </div>
  );
};


// ─── Platform config ──────────────────────────────────────────────────────────
const PLATFORMS = [

  { id: 'All',       label: 'All',       color: '#111827', icon: null },
  { id: 'Deliveroo', label: 'Deliveroo', color: '#00CCBC', icon: 'https://cdn.simpleicons.org/deliveroo/00CCBC' },
  { id: 'Uber Eats', label: 'UberEats',  color: '#06C167', icon: 'https://cdn.simpleicons.org/ubereats/06C167' },
  { id: 'Just Eat',  label: 'Just Eat',  color: '#FF8000', icon: 'https://cdn.simpleicons.org/justeat/FF8000' },
];

// ─── Cuisine colours ─────────────────────────────────────────────────────────
const CUISINE_COLORS = {
  Burger:'#F59E0B', Pizza:'#EF4444', Chicken:'#F97316', Kebab:'#8B5CF6',
  Indian:'#10B981', Chinese:'#3B82F6', Japanese:'#EC4899', Turkish:'#6366F1',
  Lebanese:'#14B8A6', Grill:'#84CC16', Sandwich:'#0EA5E9', Bakery:'#A78BFA',
  Thai:'#22D3EE', Noodles:'#FB923C', Wings:'#F43F5E', Sushi:'#D946EF',
  Breakfast:'#F59E0B', Salad:'#22C55E', Shake:'#A855F7', Sides:'#94A3B8',
};
const getCuisineColor = (c) => CUISINE_COLORS[c] || '#9CA3AF';
const getInitials     = (n) => n.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
const getAvatarColor  = (id) => ['#E86A58','#6366F1','#10B981','#F59E0B','#3B82F6','#EC4899','#14B8A6','#8B5CF6'][id % 8];

// ─── Competitor pool ─────────────────────────────────────────────────────────
export const COMPETITOR_POOL = [
  { id:1,  name:'Burger King Ilford',      lat:51.5601,lng:0.0729,  platforms:['Deliveroo','Uber Eats'],         cuisines:['Burger','Chicken'],            hasPromo:true,  promo:'20% Off £15+',       rating:4.2 },
  { id:2,  name:'Spice Villa',             lat:51.5575,lng:0.0695,  platforms:['Just Eat','Uber Eats'],          cuisines:['Indian','Curry'],               hasPromo:false, promo:null,                  rating:4.5 },
  { id:3,  name:'Pizza Hut Ilford',        lat:51.5580,lng:0.0722,  platforms:['Deliveroo','Just Eat'],          cuisines:['Pizza','Sides'],                hasPromo:true,  promo:'Free Delivery',       rating:3.9 },
  { id:4,  name:'KFC Cranbrook',           lat:51.5550,lng:0.0665,  platforms:['Uber Eats','Just Eat'],          cuisines:['Chicken','Burger'],             hasPromo:true,  promo:'BOGO Zinger',         rating:3.8 },
  { id:5,  name:"McDonald's Seven Kings",  lat:51.5622,lng:0.0758,  platforms:['Deliveroo','Uber Eats'],         cuisines:['Burger','Breakfast'],           hasPromo:false, promo:null,                  rating:4.0 },
  { id:6,  name:'Dixy Chicken Ilford',     lat:51.5617,lng:0.0682,  platforms:['Just Eat'],                      cuisines:['Chicken','Burger','Pizza'],     hasPromo:true,  promo:'15% Off',             rating:4.3 },
  { id:7,  name:'Subway Gants Hill',       lat:51.5645,lng:0.0681,  platforms:['Uber Eats','Deliveroo'],         cuisines:['Sandwich','Salad'],             hasPromo:false, promo:null,                  rating:4.1 },
  { id:8,  name:'Five Guys Ilford',        lat:51.5607,lng:0.0638,  platforms:['Deliveroo'],                     cuisines:['Burger','Hot Dog'],             hasPromo:false, promo:null,                  rating:4.6 },
  { id:9,  name:'Chicken Cottage',         lat:51.5531,lng:0.0752,  platforms:['Just Eat','Deliveroo'],          cuisines:['Chicken','Burger'],             hasPromo:true,  promo:'Buy 1 Get 1 Free',    rating:4.0 },
  { id:10, name:"Nando's Ilford",          lat:51.5594,lng:0.0638,  platforms:['Deliveroo','Uber Eats'],         cuisines:['Chicken','Grill'],              hasPromo:false, promo:null,                  rating:4.4 },
  { id:11, name:'Al-Amin Grill',           lat:51.5518,lng:0.0813,  platforms:['Uber Eats','Just Eat'],          cuisines:['Kebab','Burger'],               hasPromo:false, promo:null,                  rating:4.2 },
  { id:12, name:'Wagamama Ilford',         lat:51.5598,lng:0.0683,  platforms:['Deliveroo','Uber Eats'],         cuisines:['Japanese','Noodles'],           hasPromo:false, promo:null,                  rating:4.5 },
  { id:13, name:"Domino's Chadwell Heath", lat:51.5661,lng:0.0822,  platforms:['Deliveroo','Uber Eats'],         cuisines:['Pizza'],                        hasPromo:true,  promo:'50% Off 2nd Pizza',   rating:3.9 },
  { id:14, name:'Greggs Romford Road',     lat:51.5510,lng:0.0600,  platforms:['Just Eat'],                      cuisines:['Bakery','Sandwich','Breakfast'],hasPromo:false, promo:null,                  rating:4.1 },
  { id:15, name:'Pizza Palace Barking',    lat:51.5488,lng:0.0653,  platforms:['Just Eat'],                      cuisines:['Pizza','Kebab'],                hasPromo:true,  promo:'£5 Off £20+',         rating:3.7 },
  { id:16, name:'Wings & Things',          lat:51.5641,lng:0.0853,  platforms:['Deliveroo','Just Eat'],          cuisines:['Chicken','Wings','Burger'],     hasPromo:true,  promo:'BOGO Wings',          rating:4.2 },
  { id:17, name:'Zing Zing East',          lat:51.5519,lng:0.0551,  platforms:['Uber Eats'],                     cuisines:['Chinese','Noodles'],            hasPromo:false, promo:null,                  rating:4.4 },
  { id:18, name:'Chicken King Dagenham',   lat:51.5444,lng:0.0701,  platforms:['Just Eat'],                      cuisines:['Chicken','Pizza'],              hasPromo:true,  promo:'Free Delivery',       rating:3.6 },
  { id:19, name:'The Burger Joint',        lat:51.5671,lng:0.0598,  platforms:['Deliveroo'],                     cuisines:['Burger','Wings'],               hasPromo:true,  promo:'10% Off',             rating:4.3 },
  { id:20, name:'Istanbul Kebab',          lat:51.5489,lng:0.0802,  platforms:['Uber Eats','Just Eat'],          cuisines:['Kebab','Turkish'],              hasPromo:false, promo:null,                  rating:4.0 },
  { id:21, name:'Fire Crust Pizza',        lat:51.5701,lng:0.0498,  platforms:['Deliveroo','Uber Eats'],         cuisines:['Pizza','Burger'],               hasPromo:true,  promo:'New Store: 25% Off',  rating:4.1 },
  { id:22, name:'Lebanese Palace',         lat:51.5451,lng:0.0832,  platforms:['Uber Eats','Deliveroo'],         cuisines:['Lebanese','Kebab'],             hasPromo:true,  promo:'£3 Off £15+',         rating:4.3 },
  { id:23, name:'Punjabi Junction',        lat:51.5430,lng:0.0619,  platforms:['Just Eat'],                      cuisines:['Indian','Curry'],               hasPromo:false, promo:null,                  rating:4.6 },
  { id:24, name:'Shake Shack East',        lat:51.5681,lng:0.0913,  platforms:['Deliveroo'],                     cuisines:['Burger','Shake'],               hasPromo:false, promo:null,                  rating:4.5 },
  { id:25, name:'Harold Wood Chicken',     lat:51.5761,lng:0.0448,  platforms:['Just Eat'],                      cuisines:['Chicken','Burger'],             hasPromo:true,  promo:'15% Off All Orders',  rating:3.9 },
  { id:26, name:'Sushi Circle',            lat:51.5399,lng:0.0559,  platforms:['Uber Eats','Deliveroo'],         cuisines:['Japanese','Sushi'],             hasPromo:false, promo:null,                  rating:4.7 },
  { id:27, name:"Papa John's Stratford",   lat:51.5430,lng:0.0901,  platforms:['Deliveroo','Just Eat'],          cuisines:['Pizza'],                        hasPromo:true,  promo:'2 for 1 Tuesdays',    rating:3.8 },
  { id:28, name:'Spicy Village',           lat:51.5721,lng:0.0961,  platforms:['Just Eat'],                      cuisines:['Chinese','Curry'],              hasPromo:false, promo:null,                  rating:4.2 },
  { id:29, name:'Doner King Forest Gate',  lat:51.5531,lng:0.0349,  platforms:['Uber Eats'],                     cuisines:['Kebab','Burger'],               hasPromo:true,  promo:'Free Fries',          rating:4.1 },
  { id:30, name:'Grill House Walthamstow', lat:51.5801,lng:0.0198,  platforms:['Deliveroo','Uber Eats'],         cuisines:['Grill','Burger','Chicken'],     hasPromo:false, promo:null,                  rating:4.4 },
  { id:31, name:'BFC Romford',             lat:51.5752,lng:0.1051,  platforms:['Just Eat','Deliveroo'],          cuisines:['Chicken','Burger'],             hasPromo:true,  promo:'20% Off £20+',        rating:3.7 },
  { id:32, name:'Thai Garden Stratford',   lat:51.5381,lng:0.0399,  platforms:['Uber Eats'],                     cuisines:['Thai','Noodles'],               hasPromo:false, promo:null,                  rating:4.5 },
];

// ─── Menu items pool ──────────────────────────────────────────────────────────
export const MENU_ITEMS_POOL = [
  // Burger King (id:1) - Demonstrating Platform Splitting
  {id:'m_bk1_uber', restaurantId:1,  name:'Whopper Meal',           category:'Burger',  price:8.99,  platform:'Uber Eats', hasPromo:true,  promo:'20% Off £15+'},
  {id:'m_bk1_del',  restaurantId:1,  name:'WHOPPER® Meal (Large)',  category:'Burger',  price:9.50,  platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m_bk2_uber', restaurantId:1,  name:'Bacon Double XL',        category:'Burger',  price:7.49,  platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m_bk3_uber', restaurantId:1,  name:'Chicken Royale',         category:'Burger',  price:6.99,  platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m_bk3_del',  restaurantId:1,  name:'Chicken Royale Meal',    category:'Burger',  price:8.49,  platform:'Deliveroo', hasPromo:false, promo:null},
  
  // KFC (id:4)
  {id:'m_kfc1', restaurantId:4, name:'Zinger Burger',          category:'Burger',  price:5.99,  platform:'Uber Eats', hasPromo:true,  promo:'BOGO Zinger'},
  {id:'m_kfc2', restaurantId:4, name:'Fillet Tower Burger',    category:'Burger',  price:6.49,  platform:'Just Eat',  hasPromo:false, promo:null},
  
  // Five Guys (id:8)
  {id:'m_fg1', restaurantId:8,  name:'Cheeseburger',           category:'Burger',  price:9.95,  platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m_fg2', restaurantId:8,  name:'Bacon Cheeseburger',     category:'Burger',  price:11.25, platform:'Deliveroo', hasPromo:false, promo:null},
  
  // Chicken Cottage (id:9)
  {id:'m_cc1', restaurantId:9,  name:'Classic Chicken Burger', category:'Burger',  price:4.50,  platform:'Just Eat',  hasPromo:true,  promo:'Buy 1 Get 1 Free'},
  
  // Pizza Hut (id:3)
  {id:'m1', restaurantId:3,  name:'Margherita Classic',       category:'Pizza',   price:9.99,  platform:'Deliveroo', hasPromo:true,  promo:'Free Delivery'},
  {id:'m2', restaurantId:3,  name:'Pepperoni Feast',          category:'Pizza',   price:12.99, platform:'Deliveroo', hasPromo:true,  promo:'Free Delivery'},
  {id:'m3', restaurantId:3,  name:'BBQ Chicken Supreme',      category:'Pizza',   price:13.49, platform:'Just Eat',  hasPromo:false, promo:null},
  {id:'m4', restaurantId:3,  name:'Veggie Sizzler',           category:'Pizza',   price:10.99, platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m5', restaurantId:3,  name:'Stuffed Crust Cheese',     category:'Pizza',   price:14.49, platform:'Just Eat',  hasPromo:true,  promo:'Free Delivery'},
  {id:'m6', restaurantId:3,  name:'Spicy Peri-Peri',          category:'Pizza',   price:12.49, platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m7', restaurantId:3,  name:'Chicken Tikka Sizzler',    category:'Pizza',   price:13.99, platform:'Deliveroo', hasPromo:false, promo:null},
  // Domino's (id:13)
  {id:'m8', restaurantId:13, name:'Pepperoni Passion',        category:'Pizza',   price:13.99, platform:'Uber Eats', hasPromo:true,  promo:'50% Off 2nd Pizza'},
  {id:'m9', restaurantId:13, name:'Texas BBQ',                category:'Pizza',   price:12.99, platform:'Uber Eats', hasPromo:true,  promo:'50% Off 2nd Pizza'},
  {id:'m10',restaurantId:13, name:'Chicken Supreme',          category:'Pizza',   price:14.49, platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m11',restaurantId:13, name:'Vegi Supreme',             category:'Pizza',   price:11.99, platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m12',restaurantId:13, name:'Meateor',                  category:'Pizza',   price:15.49, platform:'Deliveroo', hasPromo:true,  promo:'50% Off 2nd Pizza'},
  {id:'m13',restaurantId:13, name:'Garlic Bread',             category:'Sides',   price:3.99,  platform:'Uber Eats', hasPromo:false, promo:null},
  // Pizza Palace (id:15)
  {id:'m14',restaurantId:15, name:'Large Margh',              category:'Pizza',   price:7.99,  platform:'Deliveroo', hasPromo:true,  promo:'£5 Off £20+'},
  {id:'m15',restaurantId:15, name:'Kebab Pizza',              category:'Pizza',   price:9.99,  platform:'Just Eat',  hasPromo:false, promo:null},
  {id:'m16',restaurantId:15, name:'Mixed Grill Pizza',        category:'Pizza',   price:10.49, platform:'Deliveroo', hasPromo:false, promo:null},
  // Fire Crust (id:21)
  {id:'m17',restaurantId:21, name:'Classic Margh',            category:'Pizza',   price:8.99,  platform:'Uber Eats', hasPromo:true,  promo:'New Store: 25% Off'},
  {id:'m18',restaurantId:21, name:'Buffalo Chicken Pizza',    category:'Pizza',   price:11.99, platform:'Uber Eats', hasPromo:true,  promo:'New Store: 25% Off'},
  {id:'m19',restaurantId:21, name:'Meat Lovers',              category:'Pizza',   price:12.99, platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m20',restaurantId:21, name:'Fire Special',             category:'Pizza',   price:13.49, platform:'Uber Eats', hasPromo:true,  promo:'New Store: 25% Off'},
  {id:'m21',restaurantId:21, name:'Veggie Inferno',           category:'Pizza',   price:9.99,  platform:'Uber Eats', hasPromo:false, promo:null},
  // Papa John's (id:27)
  {id:'m22',restaurantId:27, name:'Garden Fresh',             category:'Pizza',   price:10.99, platform:'Deliveroo', hasPromo:true,  promo:'2 for 1 Tuesdays'},
  {id:'m23',restaurantId:27, name:'The Works',                category:'Pizza',   price:14.49, platform:'Deliveroo', hasPromo:true,  promo:'2 for 1 Tuesdays'},
  {id:'m24',restaurantId:27, name:'BBQ Chicken Bacon',        category:'Pizza',   price:13.99, platform:'Deliveroo', hasPromo:false, promo:null},
  // Dixy Chicken (id:6)
  {id:'m25',restaurantId:6,  name:'Dixy Pizza 9"',            category:'Pizza',   price:6.99,  platform:'Just Eat',  hasPromo:true,  promo:'15% Off'},
  {id:'m26',restaurantId:6,  name:'Dixy Spicy Pizza',         category:'Pizza',   price:7.99,  platform:'Just Eat',  hasPromo:false, promo:null},
  // Burger King (id:1)
  {id:'m27',restaurantId:1,  name:'Whopper',                  category:'Burger',  price:7.99,  platform:'Deliveroo', hasPromo:true,  promo:'20% Off £15+'},
  {id:'m28',restaurantId:1,  name:'Double Whopper',           category:'Burger',  price:9.99,  platform:'Deliveroo', hasPromo:true,  promo:'20% Off £15+'},
  {id:'m29',restaurantId:1,  name:'Chicken Royal',            category:'Burger',  price:6.49,  platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m30',restaurantId:1,  name:'Bacon Double Cheeseburger',category:'Burger',  price:8.49,  platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m31',restaurantId:1,  name:'Crispy Chicken Burger',    category:'Burger',  price:6.99,  platform:'Uber Eats', hasPromo:true,  promo:'20% Off £15+'},
  // McDonald's (id:5)
  {id:'m32',restaurantId:5,  name:'Big Mac',                  category:'Burger',  price:5.49,  platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m33',restaurantId:5,  name:'Quarter Pounder Cheese',   category:'Burger',  price:5.99,  platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m34',restaurantId:5,  name:'McChicken Sandwich',       category:'Burger',  price:4.99,  platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m35',restaurantId:5,  name:'Spicy Chicken Deluxe',     category:'Burger',  price:6.49,  platform:'Deliveroo', hasPromo:false, promo:null},
  // Five Guys (id:8)
  {id:'m36',restaurantId:8,  name:'Hamburger',                category:'Burger',  price:9.50,  platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m37',restaurantId:8,  name:'Cheeseburger',             category:'Burger',  price:10.00, platform:'Deliveroo', hasPromo:false, promo:null},
  {id:'m38',restaurantId:8,  name:'Bacon Burger',             category:'Burger',  price:10.50, platform:'Uber Eats', hasPromo:false, promo:null},
  {id:'m39',restaurantId:8,  name:'Veggie Sandwich',          category:'Burger',  price:8.50,  platform:'Uber Eats', hasPromo:false, promo:null},
  // The Burger Joint (id:19)
  {id:'m40',restaurantId:19, name:'Classic Smash',            category:'Burger',  price:8.50,  hasPromo:true,  promo:'10% Off'},
  {id:'m41',restaurantId:19, name:'Double Smash',             category:'Burger',  price:11.00, hasPromo:true,  promo:'10% Off'},
  {id:'m42',restaurantId:19, name:'Crispy Chicken Deluxe',    category:'Burger',  price:9.00,  hasPromo:false, promo:null},
  // KFC (id:4)
  {id:'m43',restaurantId:4,  name:'Zinger Burger',            category:'Chicken', price:6.49,  hasPromo:true,  promo:'BOGO Zinger'},
  {id:'m44',restaurantId:4,  name:'Mighty Bucket for One',    category:'Chicken', price:8.99,  hasPromo:false, promo:null},
  {id:'m45',restaurantId:4,  name:'Fillet Tower',             category:'Chicken', price:7.49,  hasPromo:false, promo:null},
  {id:'m46',restaurantId:4,  name:'Original Recipe Strips',   category:'Chicken', price:6.99,  hasPromo:true,  promo:'BOGO Zinger'},
  // Nando's (id:10)
  {id:'m47',restaurantId:10, name:"Peri-Peri Chicken (Half)", category:'Chicken', price:9.75,  hasPromo:false, promo:null},
  {id:'m48',restaurantId:10, name:'Butterfly Chicken Breast', category:'Chicken', price:12.50, hasPromo:false, promo:null},
  {id:'m49',restaurantId:10, name:'Chicken Thighs (3pc)',     category:'Chicken', price:10.25, hasPromo:false, promo:null},
  // Al-Amin Grill (id:11)
  {id:'m50',restaurantId:11, name:'Doner Kebab',              category:'Kebab',   price:6.99,  hasPromo:false, promo:null},
  {id:'m51',restaurantId:11, name:'Mixed Grill Wrap',         category:'Kebab',   price:8.49,  hasPromo:false, promo:null},
  {id:'m52',restaurantId:11, name:'Shish Kebab',              category:'Kebab',   price:7.99,  hasPromo:false, promo:null},
  // Istanbul Kebab (id:20)
  {id:'m53',restaurantId:20, name:'Large Doner',              category:'Kebab',   price:7.99,  hasPromo:false, promo:null},
  {id:'m54',restaurantId:20, name:'Adana Kebab',              category:'Kebab',   price:9.99,  hasPromo:false, promo:null},
  {id:'m55',restaurantId:20, name:'Lahmacun',                 category:'Kebab',   price:4.99,  hasPromo:false, promo:null},
  {id:'m56',restaurantId:20, name:'Iskender Kebab',           category:'Kebab',   price:11.99, hasPromo:false, promo:null},
  // Spice Villa (id:2)
  {id:'m57',restaurantId:2,  name:'Chicken Tikka Masala',     category:'Indian',  price:10.99, hasPromo:false, promo:null},
  {id:'m58',restaurantId:2,  name:'Lamb Rogan Josh',          category:'Indian',  price:11.99, hasPromo:false, promo:null},
  {id:'m59',restaurantId:2,  name:'Vegetable Biryani',        category:'Indian',  price:9.49,  hasPromo:false, promo:null},
  {id:'m60',restaurantId:2,  name:'Garlic Naan',              category:'Indian',  price:2.99,  hasPromo:false, promo:null},
  // Wings & Things (id:16)
  {id:'m61',restaurantId:16, name:'Classic Wings (6pc)',      category:'Chicken', price:7.99,  hasPromo:true,  promo:'BOGO Wings'},
  {id:'m62',restaurantId:16, name:'Boneless Wings (10pc)',    category:'Chicken', price:9.99,  hasPromo:true,  promo:'BOGO Wings'},
  {id:'m63',restaurantId:16, name:'Loaded Fries',             category:'Sides',   price:4.99,  hasPromo:false, promo:null},
  {id:'m64',restaurantId:16, name:'Buffalo Wings (12pc)',     category:'Chicken', price:11.99, hasPromo:false, promo:null},
];

// ─── Promo Feed (Merged from PromoTrackerModal) ─────────────────────────────
export const PROMO_FEED = [
  { id: 1, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: '25% off selected pizzas', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo' },
  { id: 2, lat: 51.520, lng: 0.060, restaurant: 'Pizza Palace Barking', promo: 'Buy 1 Get 1 Free', type: 'BOGO', active: 'Active', image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo' },
  { id: 3, lat: 51.550, lng: 0.088, restaurant: 'Al-Amin Pizza', promo: 'Free Delivery', type: 'Delivery', active: 'Active', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=90', platform: 'justeats' },
  { id: 4, lat: 51.554, lng: 0.076, restaurant: 'Fire Crust', promo: 'Spend £20 Save £5', type: 'Threshold', active: 'Active', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo' },
  { id: 5, lat: 51.558, lng: 0.072, restaurant: 'Burger Boss Ilford', promo: '20% off entire menu', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=90', platform: 'ubereats' },
  { id: 6, lat: 51.562, lng: 0.085, restaurant: 'Wok Master', promo: 'Free Spring Rolls', type: 'Free Item', active: 'Active', image: 'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=600&q=90', platform: 'justeats' },
  { id: 7, lat: 51.530, lng: 0.070, restaurant: 'Gourmet Burger Kitchen', promo: '20% off over £20', type: 'Threshold', active: 'Active', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=90', platform: 'ubereats' },
  { id: 8, lat: 51.535, lng: 0.075, restaurant: 'Chicken Stop Barking', promo: 'Free Fries with Meal', type: 'Free Item', active: 'Active', image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=90', platform: 'justeats' },
  { id: 9, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Free Garlic Bread', type: 'Free Item', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'ubereats' },
  { id: 10, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Spend £30 get £10 off', type: 'Threshold', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'justeats' },
  { id: 11, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Free Delivery over £15', type: 'Delivery', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo' },
  { id: 12, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Buy 1 Get 1 Free Large Pizza', type: 'BOGO', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'ubereats' },
  { id: 13, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: '15% off Pick-up', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'justeats' },
  { id: 14, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'Free drink with meal', type: 'Free Item', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo' },
  { id: 15, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: '£5 off your first order', type: 'Threshold', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'ubereats' },
  { id: 16, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: 'BOGO Medium Pizzas', type: 'BOGO', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'justeats' },
  { id: 17, lat: 51.560, lng: 0.081, restaurant: "Domino's Ilford", promo: '10% off Student Discount', type: 'Discount', active: 'Active', image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=90', platform: 'deliveroo' },
];

// ─── Small helpers ────────────────────────────────────────────────────────────
const PlatformBadge = ({ platform }) => {
  const cfg = PLATFORMS.find(p => p.id === platform);
  if (!cfg || cfg.id === 'All' || !cfg.icon) return null;
  return (
    <img
      src={cfg.icon}
      alt={cfg.label}
      title={cfg.label}
      style={{ width:'13px', height:'13px', flexShrink:0, display:'block' }}
    />
  );
};

// ─── Threat Score engine ──────────────────────────────────────────────────
const computeThreatScore = (competitor, menuOverlap) => {
  // Each component normalised 0–1, then weighted
  const proximityScore  = Math.max(0, 1 - competitor.distance / 2.5);   // closer = higher
  const ratingScore     = (competitor.rating - 3) / 2;                   // 3–5 → 0–1
  const platformScore   = Math.min(competitor.platforms.length / 3, 1);  // up to 3 platforms
  const overlapScore    = Math.min(menuOverlap / 8, 1);                  // up to 8 overlapping items
  const promoBoost      = competitor.hasPromo ? 0.08 : 0;

  const raw = (
    proximityScore * 0.30 +
    ratingScore    * 0.25 +
    platformScore  * 0.25 +
    overlapScore   * 0.20
  ) + promoBoost;

  const score = Math.round(Math.min(raw, 1) * 100);
  const level = score >= 70 ? 'High' : score >= 40 ? 'Fair' : 'Low';
  const color = score >= 70 ? '#EF4444' : score >= 40 ? '#F59E0B' : '#10B981';
  const bg    = score >= 70 ? 'rgba(239,68,68,0.08)' : score >= 40 ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)';
  const border= score >= 70 ? 'rgba(239,68,68,0.25)' : score >= 40 ? 'rgba(245,158,11,0.25)' : 'rgba(16,185,129,0.25)';
  return { score, level, color, bg, border, proximityScore, ratingScore, platformScore, overlapScore };
};

const scoreColor = (v) => v >= 0.65 ? '#EF4444' : v >= 0.35 ? '#F59E0B' : '#10B981';

const ThreatBadge = ({ threat, competitor, menuOverlap }) => {
  const [hov, setHov] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
      style={{
        display:'flex', alignItems:'center', gap:'5px',
        cursor:'default', userSelect:'none', flexShrink:0,
      }}
    >
      <span style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:threat.color, display:'inline-block', flexShrink:0, boxShadow:`0 0 4px ${threat.color}` }} />
      <span style={{ fontSize:'10px', fontWeight:800, color:threat.color, letterSpacing:'-0.1px' }}>
        {threat.level}
      </span>
      {hov && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          left: Math.min(pos.x - 105, window.innerWidth - 225),
          top: pos.y + 18,
          width: '210px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '13px 15px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.16), 0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.07)',
          zIndex: 999999,
          fontFamily: "'Inter', system-ui, sans-serif",
          pointerEvents: 'none',
        }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'10px' }}>
            <span style={{ fontSize:'12px', fontWeight:700, color:'#1E293B', letterSpacing:'-0.2px' }}>Threat Analysis</span>
            <div style={{ display:'flex', alignItems:'center', gap:'3px', padding:'2px 7px', borderRadius:'5px', backgroundColor:threat.bg }}>
              <span style={{ fontSize:'12px', fontWeight:800, color:threat.color }}>{threat.score}</span>
              <span style={{ fontSize:'9px', color:threat.color, opacity:0.7 }}>/100</span>
            </div>
          </div>
          {[
            { label:'Menu Overlap', value:`${menuOverlap} shared items`, raw: threat.overlapScore },
            { label:'Rating',       value:`${competitor.rating}★`,        raw: threat.ratingScore },
            { label:'Platforms',    value:`${competitor.platforms.length} app${competitor.platforms.length!==1?'s':''}`, raw: threat.platformScore },
            { label:'Proximity',    value:`${competitor.distance < 0.1 ? '<0.1' : competitor.distance.toFixed(1)}mi away`, raw: threat.proximityScore },
          ].map(({ label, value, raw }) => (
            <div key={label} style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'7px' }}>
              <span style={{ width:'7px', height:'7px', borderRadius:'50%', backgroundColor:scoreColor(raw), display:'inline-block', flexShrink:0 }} />
              <span style={{ fontSize:'11px', color:'#64748B', flex:1 }}>{label}</span>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#1E293B' }}>{value}</span>
            </div>
          ))}
          {competitor.hasPromo && (
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginTop:'6px', paddingTop:'8px', borderTop:'1px solid #F1F5F9' }}>
              <span style={{ fontSize:'11px' }}>⚡</span>
              <span style={{ fontSize:'11px', color:'#F59E0B', fontWeight:600 }}>Running active promo</span>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
};


const WatchlistStar = ({ id, style = {} }) => {
  const [starred, setStarred] = useState(() => {
    try { return JSON.parse(localStorage.getItem('menuiq_watchlist') || '[]').includes(id); } catch { return false; }
  });

  const toggleStar = (e) => {
    e.stopPropagation();
    try {
      const wl = JSON.parse(localStorage.getItem('menuiq_watchlist') || '[]');
      const newWl = starred ? wl.filter(x => x !== id) : [...wl, id];
      localStorage.setItem('menuiq_watchlist', JSON.stringify(newWl));
      setStarred(!starred);
    } catch {}
  };

  return (
    <button
      onClick={toggleStar}
      title={starred ? 'Remove from watchlist' : 'Add to watchlist'}
      style={{ background:'none', border:'none', padding:'5px', cursor:'pointer', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'6px', ...style }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor='rgba(0,0,0,0.05)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor='transparent'}
    >
      <Star size={15} fill={starred ? '#F59E0B' : 'none'} color={starred ? '#F59E0B' : '#CBD5E1'} strokeWidth={2} style={{ transition:'all 0.2s' }} />
    </button>
  );
};

// ─── Restaurants mode row ───────────────────────────────────────────────────
const CompetitorRow = ({ competitor, isLast, isActive, onClick }) => {
  const [hov, setHov] = useState(false);
  const menuOverlap = useMemo(
    () => MENU_ITEMS_POOL.filter(i => i.restaurantId === competitor.id).length,
    [competitor.id]
  );
  const threat = useMemo(() => computeThreatScore(competitor, menuOverlap), [competitor, menuOverlap]);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', minHeight:'64px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', backgroundColor: isActive ? 'rgba(232, 106, 88, 0.06)' : (hov ? '#FAFAF9' : 'transparent'), borderLeft: isActive ? '4px solid #E86A58' : '4px solid transparent', transition:'all 0.15s', cursor:'pointer' }}
    >
      {/* Avatar */}
      <div style={{ width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, backgroundColor:'#f3f4f6', overflow:'hidden', border:'1px solid rgba(0,0,0,0.08)' }}>
        <img src={competitor.hero_image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop'} alt={competitor.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      {/* Centre content: Name and platforms stacked */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:'3px' }}>
        <span style={{ fontSize:'12px', fontWeight:600, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {competitor.name}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:'4px', overflow:'hidden' }}>
          {competitor.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
        </div>
      </div>

      {/* Threat Level - fixed width for perfect vertical alignment */}
      <div style={{ display:'flex', alignItems:'center', gap:'4px', width:'115px', flexShrink:0 }}>
        <span style={{ fontSize:'9px', fontWeight:600, color:'#94A3B8', whiteSpace:'nowrap', letterSpacing:'0.01em' }}>Threat Level:</span>
        <ThreatBadge threat={threat} competitor={competitor} menuOverlap={menuOverlap} />
      </div>

      {/* Rating - fixed width for perfect vertical alignment */}
      <div style={{ display:'flex', alignItems:'center', gap:'1px', padding:'2px 5px', borderRadius:'5px', backgroundColor:'#FEF9C3', color:'#CA8A04', border:'1px solid rgba(202,138,4,0.2)', justifyContent:'center', width:'38px', flexShrink:0 }}>
        <span style={{ fontSize:'10px', fontWeight:800 }}>{competitor.rating}</span>
        <span style={{ fontSize:'9px' }}>★</span>
      </div>

      {/* Watchlist star — fixed far right */}
      <WatchlistStar id={competitor.id} />
    </div>
  );
};

// ─── Menu Items mode — flat row ────────────────────────────────────────────────
const MenuItemRow = ({ item, searchQuery, isLast, isActive, onClick }) => {
  const [hov, setHov] = useState(false);
  const { competitor } = item;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:'12px', padding:'12px 16px', minHeight:'64px', borderBottom: isLast ? 'none' : '1px solid #F3F4F6', backgroundColor: isActive ? '#FFF1F0' : hov ? '#FAFAF9' : 'transparent', transition:'background-color 0.15s', cursor:'pointer' }}
    >
      {/* Item Image (Food Specific) */}
      <div style={{ width:'34px', height:'34px', borderRadius:'50%', flexShrink:0, backgroundColor:'#f3f4f6', overflow:'hidden', border:'1px solid rgba(0,0,0,0.08)' }}>
        <img src={item.hero_image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop'} alt={item.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
      </div>

      {/* Item & Competitor Info */}
      <div style={{ flex:1, minWidth:0, display:'flex', flexDirection:'column', justifyContent:'center', gap:'3px', paddingRight:'8px' }}>
        <span style={{ fontSize:'12px', fontWeight:600, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
          {item.name}
        </span>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          {(searchQuery && searchQuery.toLowerCase() !== item.category.toLowerCase()) && (
            <span style={{ fontSize:'10px', fontWeight:800, color:getCuisineColor(item.category), textTransform:'uppercase', letterSpacing:'0.3px' }}>
              {item.category}
            </span>
          )}
          <span style={{ fontSize:'11px', fontWeight:500, color:'#9CA3AF', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {competitor.name}
          </span>
        </div>
      </div>

      {/* Platform Badge — fixed centered column */}
      <div style={{ flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', width:'80px' }}>
        {(() => {
           const PLAT_OPTIONS = [
             { id:'Deliveroo', icon:'https://cdn.simpleicons.org/deliveroo/00CCBC', color:'#00CCBC' },
             { id:'Uber Eats', icon:'https://cdn.simpleicons.org/ubereats/06C167', color:'#06C167' },
             { id:'Just Eat',  icon:'https://cdn.simpleicons.org/justeat/FF8000', color:'#FF8000' }
           ];
           const opt = PLAT_OPTIONS.find(o => o.id === item.platform);
           if (!opt) return null;
           return (
             <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
               <img src={opt.icon} alt={opt.id} style={{ width:'12px', height:'12px', display:'block' }} />
               <span style={{ fontSize:'10px', fontWeight:700, color:opt.color, lineHeight:1 }}>{opt.id}</span>
             </div>
           );
        })()}
      </div>

      {/* Price & Promos */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'2px', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          <span style={{ fontSize:'10px', fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Price</span>
          <span style={{ fontSize:'14px', fontWeight:900, color:'#111' }}>
            £{item.price.toFixed(2)}
          </span>
        </div>
        {item.hasPromo && (
          <span style={{ fontSize:'9px', fontWeight:800, color:'#E86A58', backgroundColor:'rgba(232,106,88,0.1)', padding:'1px 5px', borderRadius:'4px' }}>
            {item.promo}
          </span>
        )}
      </div>

      <WatchlistStar id={`menu_item_${item.id}`} />
    </div>
  );
};

// ─── Promo Feed Item ──────────────────────────────────────────────────────────
const PromoFeedItem = ({ group, onClick }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Group promos by platform
  const byPlatform = {};
  group.promos.forEach(p => {
    let platId = p.platform;
    if (platId === 'deliveroo') platId = 'Deliveroo';
    if (platId === 'ubereats') platId = 'Uber Eats';
    if (platId === 'justeats' || platId === 'justeat') platId = 'Just Eat';

    if (!byPlatform[platId]) byPlatform[platId] = [];
    byPlatform[platId].push(p);
  });
  
  const PLAT_OPTIONS = [
    { id:'Deliveroo', label:'Deliveroo', color:'#00CCBC', icon:'https://cdn.simpleicons.org/deliveroo/00CCBC' },
    { id:'Uber Eats', label:'UberEats',  color:'#06C167', icon:'https://cdn.simpleicons.org/ubereats/06C167' },
    { id:'Just Eat',  label:'Just Eat',  color:'#FF8000', icon:'https://cdn.simpleicons.org/justeat/FF8000' },
  ];

  return (
    <div style={{ borderBottom: '1px solid #F3F4F6' }}>
      {/* Header */}
      <div 
        onClick={(e) => {
          // If they click on the row, let's fly to the marker but NOT toggle expand if we want.
          // Or we can just expand AND fly to marker. Let's do both.
          setExpanded(!expanded);
          if (onClick) onClick();
        }}
        style={{ display:'flex', alignItems:'center', gap:'10px', padding:'14px 16px', backgroundColor: expanded ? 'rgba(232,106,88,0.03)' : 'transparent', cursor:'pointer', transition:'background 0.15s' }}
        onMouseEnter={e => { if (!expanded) e.currentTarget.style.backgroundColor='#FAFAF9'; }}
        onMouseLeave={e => { if (!expanded) e.currentTarget.style.backgroundColor='transparent'; }}
      >
        <div style={{ width:'36px', height:'36px', borderRadius:'50%', flexShrink:0, backgroundColor:'#f3f4f6', overflow:'hidden', border:'1px solid rgba(0,0,0,0.08)' }}>
          <img src={group.hero_image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop'} alt={group.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
        </div>
        
        <div style={{ flex:1, minWidth:0, display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'12px', fontWeight:700, color:'#111', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>
            {group.name}
          </span>
          
          <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            <span style={{ fontSize:'9px', fontWeight:600, color:'#94A3B8', letterSpacing:'0.01em', marginLeft:'4px', marginRight:'2px' }}>Active Promotions:</span>
            
            {Object.keys(byPlatform).map(plat => {
              const opt = PLAT_OPTIONS.find(o => o.id === plat);
              if (!opt) return null;
              return (
                <div key={plat} style={{ display:'flex', alignItems:'center', gap:'3px', padding:'2px 5px', borderRadius:'4px', border:`1px solid ${opt.color}40`, backgroundColor:`${opt.color}15` }}>
                  <img src={opt.icon} alt={plat} style={{ width:'10px', height:'10px' }} />
                  <span style={{ fontSize:'9px', fontWeight:800, color:opt.color }}>{byPlatform[plat].length}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ color:'#9CA3AF', flexShrink:0, width:'20px', display:'flex', justifyContent:'flex-end' }}>
          {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </div>

      {/* Expanded items */}
      {expanded && (
        <div style={{ backgroundColor:'rgba(249,250,251,0.8)', borderTop:'1px solid #F3F4F6', paddingBottom:'6px' }}>
          {Object.keys(byPlatform).map(plat => {
             const opt = PLAT_OPTIONS.find(o => o.id === plat);
             return (
               <div key={plat} style={{ display:'flex', flexDirection:'column' }}>
                 <div style={{ padding:'8px 16px 4px 56px', fontSize:'10px', fontWeight:800, color:opt?.color || '#111', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                   {plat}
                 </div>
                 {byPlatform[plat].map((p, idx) => (
                   <div
                     key={p.id}
                     style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'6px 16px 6px 56px', borderBottom: idx !== byPlatform[plat].length - 1 ? '1px solid rgba(0,0,0,0.03)' : 'none' }}
                   >
                     <span style={{ fontSize:'12px', fontWeight:600, color:'#374151' }}>{p.promo}</span>
                     <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                       <span style={{ background:'rgba(224, 80, 70, 0.08)', color:'#E05046', border:'1px solid rgba(224, 80, 70, 0.2)', fontSize:'9px', fontWeight:700, padding:'2px 6px', borderRadius:'4px' }}>
                         {p.type}
                       </span>
                       <WatchlistStar id={`promo_${p.id}`} style={{ padding:'2px' }} />
                     </div>
                   </div>
                 ))}
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
};

// ─── EmptyState ───────────────────────────────────────────────────────────────
const EmptyState = ({ radius, mode }) => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', gap:'10px', padding:'2.5rem', textAlign:'center' }}>
    <Target size={32} color="#E5E7EB" />
    <p style={{ fontSize:'13px', color:'#9CA3AF', margin:0, fontWeight:500 }}>
      {mode === 'items' ? `No menu items match within ${radius.toFixed(1)} miles.` : 
       mode === 'promos' ? `No promotions match within ${radius.toFixed(1)} miles.` :
       `No competitors match within ${radius.toFixed(1)} miles.`}
    </p>
    <p style={{ fontSize:'11px', color:'#D1D5DB', margin:0 }}>Try increasing the radius or clearing filters.</p>
  </div>
);

// ─── MAIN MODAL ───────────────────────────────────────────────────────────────
const MarketZoneModal = ({ isOpen, onClose, center = [51.5588, 0.0711], ownerRestaurant }) => {
  const MAP_CENTER = center;

  const [dynamicCompetitors, setDynamicCompetitors] = useState([]);
  useEffect(() => {
    if (isOpen && ownerRestaurant) {
      // Direct simple radius query to avoid cache/tier logic issues
      const fetchRadius = async () => {
        const oLat = parseFloat(ownerRestaurant.lat || MAP_CENTER[0]);
        const oLng = parseFloat(ownerRestaurant.lng || MAP_CENTER[1]);
        const maxRadiusMiles = 5.0; // We fetch up to 5 miles max, filter in UI
        const latDelta = (maxRadiusMiles / 69.0);
        const lngDelta = (maxRadiusMiles / 43.0);
        
        const { data } = await supabase
          .from('restaurants')
          .select('id, name, hero_image_url, address, cuisines, rating, rating_count, delivery_fee, lat, lng')
          .neq('id', ownerRestaurant.id)
          .gte('lat', oLat - latDelta).lte('lat', oLat + latDelta)
          .gte('lng', oLng - lngDelta).lte('lng', oLng + lngDelta)
          .limit(200);
          
        setDynamicCompetitors(data || []);
      };
      fetchRadius();
    }
  }, [isOpen, ownerRestaurant]);

  const [radius,          setRadius]          = useState(() => {
    try { return JSON.parse(localStorage.getItem('menu_iq_market_zone') || '{}').radius || 2.0; } catch { return 2.0; }
  });

  const [activeCenter, setActiveCenter] = useState(center);
  const [activeZoom, setActiveZoom]   = useState(null);
  const [activeItemId, setActiveItemId] = useState(null);
  
  const markerRefs = useRef({});
  useEffect(() => {
    if (activeItemId) {
      setTimeout(() => {
        if (markerRefs.current[activeItemId]) {
          markerRefs.current[activeItemId].openPopup();
        }
      }, 1300); // Wait for Map flyTo (1.2s) and Marker un-clustering
    }
  }, [activeItemId]);

  useEffect(() => {
    setActiveCenter(center);
    setActiveZoom(null);
    setActiveItemId(null);
  }, [center, radius]);
  const [activePlatform,   setActivePlatform]  = useState('All');
  const [selectedPlatforms, setSelectedPlatforms] = useState([]);   // [] = All
  const [platformOpen,      setPlatformOpen]     = useState(false);
  const platformRef = useRef(null);
  const [appliedRadius,   setAppliedRadius]   = useState(radius);
  // Radius editing overlay state
  const [isEditingRadius, setIsEditingRadius] = useState(false);
  const [draftRadius,     setDraftRadius]     = useState(radius);
  const [searchQueryInput, setSearchQueryInput] = useState('');
  const [isSearchFocused,  setIsSearchFocused]  = useState(false);
  const [isSearching,      setIsSearching]      = useState(false);
  const [searchQuery,     setSearchQuery]     = useState('');
  const [promoOnly,       setPromoOnly]       = useState(false);
  const [listMode,        setListMode]        = useState('Restaurants');
  const [mapZoom,         setMapZoom]         = useState(13);
  const [sortBy,          setSortBy]          = useState('Threat Level');
  const [selectedCuisine, setSelectedCuisine] = useState('All');
  // Map loading animation
  const [showMapLoading,  setShowMapLoading]  = useState(false);



  // Close platform dropdown on outside click
  useEffect(() => {
    if (!platformOpen) return;
    const handler = (e) => {
      if (platformRef.current && !platformRef.current.contains(e.target)) setPlatformOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [platformOpen]);

  const radiusInMeters = radius * 1609.34;
  const zoom           = getZoom(radius);
  const currentZoom    = activeZoom !== null ? activeZoom : zoom;

  // Enriched pool with distances
  const enrichedPool = useMemo(() =>
    (dynamicCompetitors || []).map(d => {
      if (!d) return null;
      const c = d.restaurant || d;
      if (!c) return null;
      
      // Mock platforms if database is missing them
      let plats = c.platforms || [];
      if (plats.length === 0) {
        const pCount = ((c.name || '').length % 3) + 1; // 1 to 3 platforms
        const available = ['Deliveroo', 'Uber Eats', 'Just Eat'];
        const shift = ((c.id || '').charCodeAt(0) || 0) % 3;
        plats = [...available.slice(shift), ...available.slice(0, shift)].slice(0, pCount);
      }
      
      return {
        id: c.id,
        name: c.name,
        hero_image_url: c.hero_image_url,
        lat: parseFloat(c.lat) || center[0],
        lng: parseFloat(c.lng) || center[1],
        platforms: plats,
        cuisines: c.cuisines || [],
        hasPromo: c.promo_count > 0,
        promo: c.promo_count > 0 ? 'Active Promos' : null,
        rating: c.rating || 0,
        distance: haversine(MAP_CENTER[0], MAP_CENTER[1], parseFloat(c.lat), parseFloat(c.lng))
      };
    }).filter(Boolean),
  [dynamicCompetitors, MAP_CENTER, center]);

  // Helper: does a competitor pass the platform filter?
  const passedPlatform = (platforms) =>
    selectedPlatforms.length === 0 || platforms.some(p => selectedPlatforms.includes(p));

  // RESTAURANTS mode
  const filteredRestaurants = useMemo(() => {
    return enrichedPool.filter(c => {
      if (c.distance > radius) return false;
      if (!passedPlatform(c.platforms)) return false;
      if (promoOnly && !c.hasPromo) return false;
      if (selectedCuisine !== 'All' && !c.cuisines.includes(selectedCuisine)) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!(c.name || '').toLowerCase().includes(q) && !c.cuisines.some(cu => (cu || '').toLowerCase().includes(q))) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'Rating') return b.rating - a.rating;
      const overlapA = MENU_ITEMS_POOL.filter(i => i.restaurantId === a.id).length;
      const threatA = computeThreatScore(a, overlapA).score;
      const overlapB = MENU_ITEMS_POOL.filter(i => i.restaurantId === b.id).length;
      const threatB = computeThreatScore(b, overlapB).score;
      return threatB - threatA;
    });
  }, [enrichedPool, radius, selectedPlatforms, promoOnly, selectedCuisine, sortBy, searchQuery]);

  // MENU ITEMS mode — flat list
  const flatMenuItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const items = [];
    MENU_ITEMS_POOL.forEach(item => {
      const comp = enrichedPool.find(c => c.id === item.restaurantId);
      if (!comp || comp.distance > radius) return;
      // Filter by the item's specific platform, NOT the competitor's overall platforms
      if (item.platform && !passedPlatform([item.platform])) return;
      if (promoOnly && !item.hasPromo) return;
      if (selectedCuisine !== 'All' && !comp.cuisines.includes(selectedCuisine)) return;
      if (q) {
        const words = q.split(' ').filter(w => w.length > 0);
        const match = words.every(w =>
          item.name.toLowerCase().includes(w) ||
          item.category.toLowerCase().includes(w) ||
          comp.name.toLowerCase().includes(w) ||
          comp.cuisines.some(cu => cu.toLowerCase().includes(w))
        );
        if (!match) return;
      }
      
      items.push({ ...item, competitor: comp });
    });

    return items.sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Rating') return b.competitor.rating - a.competitor.rating;
      
      // Default: Threat Level
      const overlapA = MENU_ITEMS_POOL.filter(i => i.restaurantId === a.competitor.id).length;
      const threatA = computeThreatScore(a.competitor, overlapA).score;
      const overlapB = MENU_ITEMS_POOL.filter(i => i.restaurantId === b.competitor.id).length;
      const threatB = computeThreatScore(b.competitor, overlapB).score;
      return threatB - threatA;
    });
  }, [enrichedPool, radius, selectedPlatforms, promoOnly, selectedCuisine, sortBy, searchQuery]);

  const totalItemCount = flatMenuItems.length;
  const inZoneTotal    = enrichedPool.filter(c => c.distance <= radius).length;

  // PROMOTIONS mode — group by restaurant
  const groupedPromos = useMemo(() => {
    const groups = {};
    PROMO_FEED.forEach(p => {
      const dist = haversine(MAP_CENTER[0], MAP_CENTER[1], p.lat, p.lng);
      if (dist > radius) return;
      if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(p.platform)) return;
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        if (!p.restaurant.toLowerCase().includes(q) && !p.promo.toLowerCase().includes(q)) return;
      }
      if (!groups[p.restaurant]) {
        groups[p.restaurant] = { 
          id: p.id, 
          name: p.restaurant, lat: p.lat, lng: p.lng,
          promos: [] 
        };
      }
      groups[p.restaurant].promos.push(p);
    });
    return Object.values(groups);
  }, [radius, selectedPlatforms, searchQuery]);

  // Step 1 — close slider panel, update state, start the map loading animation
  const handleApplyRadius = useCallback(() => {
    const config = { radius: draftRadius, platforms: selectedPlatforms, promoOnly, listMode };
    localStorage.setItem('menu_iq_market_zone', JSON.stringify(config));
    window.dispatchEvent(new CustomEvent('market-zone-updated', { detail: config }));
    setRadius(draftRadius);
    setAppliedRadius(draftRadius);
    setIsEditingRadius(false);
    setShowMapLoading(true);
  }, [draftRadius, selectedPlatforms, promoOnly, listMode]);

  // Step 2 — called by MapLoadingOverlay when the animation finishes
  const handleLoadingComplete = useCallback(() => {
    setShowMapLoading(false);
  }, []);

  const radiusChanged = draftRadius !== appliedRadius;

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.45)' }} />
      <style>{`
        .modern-leaflet-tooltip {
          background: rgba(255,255,255,0.98);
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
          padding: 6px 10px;
          font-family: 'Inter', system-ui, sans-serif;
        }
        .modern-leaflet-tooltip::before, .modern-leaflet-tooltip::after { 
          display: none !important; 
        }

        /* Custom sleek slider */
        input[type=range].sleek-slider {
          -webkit-appearance: none;
          width: 80px;
          background: transparent;
        }
        input[type=range].sleek-slider::-webkit-slider-runnable-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #E5E7EB;
          border-radius: 999px;
        }
        input[type=range].sleek-slider::-webkit-slider-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #E86A58;
          cursor: pointer;
          -webkit-appearance: none;
          margin-top: -6px;
          box-shadow: 0 2px 6px rgba(232,106,88,0.5);
          transition: transform 0.1s;
        }
        input[type=range].sleek-slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        input[type=range].sleek-slider::-moz-range-track {
          width: 100%;
          height: 4px;
          cursor: pointer;
          background: #E5E7EB;
          border-radius: 999px;
        }
        input[type=range].sleek-slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #E86A58;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 6px rgba(232,106,88,0.5);
        }
      `}</style>

      {/* Modal shell */}
      <div style={{
        position:'relative', zIndex:1,
        width:'min(95vw, 1200px)', height:'min(90vh, 760px)',
        backgroundColor:'#fff',
        borderRadius:'20px',
        boxShadow:'0 24px 80px rgba(0,0,0,0.2)',
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>

        {/* ── UNIFIED HEADER & CONTROL BAR ──────────────────────────────── */}
        <div style={{ display:'flex', width:'100%', borderBottom:'1px solid #F3F4F6', flexShrink:0, backgroundColor:'#fff' }}>
          
          {/* Left section: Title & Metrics (60%) */}
          <div style={{ width:'60%', display:'flex', alignItems:'center', gap:'20px', padding:'14px 16px 14px 22px', borderRight:'1px solid rgba(0,0,0,0.06)', boxSizing:'border-box' }}>
            <h2 style={{ margin:0, fontSize:'1.2rem', fontWeight:800, color:'#0F172A', letterSpacing:'-0.02em', display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
              Market Explorer
            </h2>
            
            <div style={{ width:'1px', height:'28px', backgroundColor:'#E5E7EB', flexShrink:0 }} />
            
            <div style={{ display:'flex', alignItems:'center', gap:'16px', flexWrap:'nowrap', flex:1 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                <span style={{ fontSize:'12px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>Market Radius:</span>
                <span style={{ fontSize:'14.5px', fontWeight:800, color:'#E86A58' }}>{(isEditingRadius ? draftRadius : radius).toFixed(1)}mi</span>
              </div>
              {(listMode === 'Competitors' || listMode === 'Restaurants' || listMode === 'Menu Items') && (
                <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>Competitors:</span>
                  <span style={{ fontSize:'14.5px', fontWeight:800, color:'#111827', display:'inline-block', minWidth:'20px' }}>
                    {inZoneTotal}
                  </span>
                </div>
              )}
              {listMode === 'Promotions' && (
                <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                  <span style={{ fontSize:'12px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.06em', whiteSpace:'nowrap' }}>Active Promos:</span>
                  <span style={{ fontSize:'14.5px', fontWeight:800, color:'#111827', display:'inline-block', minWidth:'20px' }}>
                    14
                  </span>
                </div>
              )}
              {!isEditingRadius && (
                <button
                  onClick={() => { setDraftRadius(radius); setIsEditingRadius(true); }}
                  style={{
                    display:'flex', alignItems:'center', gap:'5px',
                    padding:'6px 12px', borderRadius:'6px', cursor:'pointer',
                    border:'none', fontFamily:'inherit', fontWeight:700, fontSize:'12px',
                    backgroundColor:'#E86A58', color:'#fff',
                    transition:'opacity 0.2s', whiteSpace:'nowrap',
                    marginLeft:'auto', flexShrink:0
                  }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 0.8}
                  onMouseLeave={e => e.currentTarget.style.opacity = 1}
                >
                  <SlidersHorizontal size={11} color="#fff" />
                  Change Radius
                </button>
              )}
            </div>
          </div>

          {/* Right section: Tabs, Close (40%) */}
          <div style={{ width:'40%', display:'flex', alignItems:'center', justifyContent:'flex-end', gap:'10px', padding:'14px 16px', borderLeft:'1px solid rgba(0,0,0,0.06)', boxSizing:'border-box' }}>

            {/* Mode tabs */}
            <div style={{ display:'flex', flex:1, backgroundColor:'#F3F4F6', borderRadius:'8px', padding:'4px', gap:'4px' }}>
              {[
                { id:'Competitors', Icon:Store },
                { id:'Promotions', Icon:Tag },
                { id:'Menu Items',  Icon:UtensilsCrossed },
              ].map(({ id, Icon }) => (
                <button key={id} onClick={() => { setListMode(id); setSearchQuery(''); }}
                  style={{ flex:1, display:'flex', justifyContent:'center', alignItems:'center', gap:'6px', padding:'8px 12px', borderRadius:'6px', cursor:'pointer', border:'none', fontFamily:'inherit', fontSize:'12px', fontWeight:700, transition:'all 0.18s', backgroundColor: (listMode === id || (listMode === 'Restaurants' && id === 'Competitors')) ? '#fff' : 'transparent', color: (listMode === id || (listMode === 'Restaurants' && id === 'Competitors')) ? '#111' : '#9CA3AF', boxShadow: (listMode === id || (listMode === 'Restaurants' && id === 'Competitors')) ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', whiteSpace:'nowrap' }}
                >
                  <Icon size={12} />{id}
                </button>
              ))}
            </div>

            <div style={{ width:'1px', height:'28px', backgroundColor:'#E5E7EB' }} />

            {/* Close */}
            <button
              onClick={onClose}
              style={{ width:'36px', height:'36px', borderRadius:'50%', border:'1px solid #E5E7EB', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'background 0.2s', flexShrink:0 }}
              onMouseEnter={e => e.currentTarget.style.background='#F3F4F6'}
              onMouseLeave={e => e.currentTarget.style.background='transparent'}
            >
              <X size={18} color="#6B7280" />
            </button>
          </div>
        </div>

        {/* ── MAIN 60/40 BODY ───────────────────────────────────────────── */}
        <div style={{ display:'flex', flex:1, minHeight:0, overflow:'hidden' }}>

          {/* LEFT: MAP 60% */}
          <div style={{ width:'60%', flexShrink:0, display:'flex', flexDirection:'column', borderRight:'1px solid rgba(0,0,0,0.06)' }}>

            {/* Map Area */}
            <style>{`
              .custom-popup .leaflet-popup-content-wrapper { padding: 0; overflow: hidden; border-radius: 12px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
              .custom-popup .leaflet-popup-content { margin: 0; width: 304px !important; }
              .custom-popup .leaflet-popup-tip-container { margin-top: -1px; }
            `}</style>
            <div style={{ flex:1, position:'relative' }}>
              <MapContainer center={activeCenter} zoom={currentZoom} zoomControl={false} dragging={true} doubleClickZoom={false} scrollWheelZoom={true} touchZoom={true} attributionControl={false} style={{ width:'100%', height:'100%', cursor: showMapLoading ? 'default' : 'grab', touchAction: 'none' }}>
              <MapUpdater center={activeCenter} zoom={currentZoom} />
              <MapZoomListener onZoomChange={setMapZoom} />
              <ZoomControls />
              <TileLayer url="https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png" detectRetina={true} />
              {/* Live draft circle while editing */}
              <Circle
                center={MAP_CENTER}
                radius={(isEditingRadius ? draftRadius : radius) * 1609.34}
                pathOptions={{ color:'#E86A58', fillColor:'#E86A58', fillOpacity:0.08, weight:2, dashArray:'6 4' }}
              />
              {/* Applied radius ghost ring — only when editing & differs */}
              {isEditingRadius && draftRadius !== appliedRadius && (
                <Circle center={MAP_CENTER} radius={appliedRadius * 1609.34} pathOptions={{ color:'#10B981', fillColor:'transparent', weight:1.5, dashArray:'3 6', opacity:0.5 }} />
              )}
              
              <Marker position={MAP_CENTER} icon={createMyRestaurantIcon()} />

              {/* Markers */}
              {listMode === 'Restaurants' || listMode === 'Competitors' ? (
                <>
                  <MarkerClusterGroup iconCreateFunction={createClusterCustomIcon} maxClusterRadius={40} showCoverageOnHover={false}>
                    {filteredRestaurants.filter(c => c.id !== activeItemId).map(c => {
                      const overlap = MENU_ITEMS_POOL.filter(i => i.restaurantId === c.id).length;
                      const threatObj = computeThreatScore(c, overlap);
                      return (
                      <Marker key={c.id} position={[c.lat, c.lng]} icon={createCustomIcon(c, mapZoom)}>
                        <Popup offset={[0, 0]} className="custom-popup" closeButton={false} autoPan={false}>
                          <div style={{ width: '280px', padding: '12px', display: 'flex', flexDirection: 'row', gap: '12px', backgroundColor: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
                             <img src={c.hero_image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop'} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
                             <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                                 <div style={{ fontWeight: 700, fontSize: '13px', color: '#1E293B', lineHeight: '1.2', letterSpacing: '-0.2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                   {c.name}
                                 </div>
                                 <div style={{ display:'flex', alignItems:'center', gap:'2px', padding:'2px 5px', borderRadius:'5px', backgroundColor:'#FEF9C3', color:'#CA8A04', border:'1px solid rgba(202,138,4,0.3)', flexShrink: 0 }}>
                                   <span style={{ fontSize:'10px', fontWeight:800 }}>{c.rating}</span><span style={{ fontSize:'9px' }}>★</span>
                                 </div>
                               </div>

                               <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                 <span style={{ fontSize:'10px', fontWeight:600, color:'#64748B' }}>Platform Coverage:</span>
                                 <div style={{ display: 'flex', gap: '4px' }}>
                                    {c.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
                                 </div>
                               </div>

                               <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                 <span style={{ fontSize:'10px', fontWeight:600, color:'#64748B' }}>Threat Level:</span>
                                 <ThreatBadge threat={threatObj} competitor={c} menuOverlap={overlap} />
                               </div>
                             </div>
                          </div>
                        </Popup>
                      </Marker>
                      );
                    })}
                  </MarkerClusterGroup>
                  
                  {/* Render active marker completely OUTSIDE the cluster group so it is never hidden */}
                  {filteredRestaurants.filter(c => c.id === activeItemId).map(c => {
                    const overlap = MENU_ITEMS_POOL.filter(i => i.restaurantId === c.id).length;
                    const threatObj = computeThreatScore(c, overlap);
                    return (
                    <Marker key={c.id + '-active'} ref={(r) => markerRefs.current[c.id] = r} position={[c.lat, c.lng]} icon={createCustomIcon(c, mapZoom)} zIndexOffset={9999}>
                      <Popup offset={[0, 0]} className="custom-popup" closeButton={false} autoPan={false}>
                        <div style={{ width: '280px', padding: '12px', display: 'flex', flexDirection: 'row', gap: '12px', backgroundColor: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
                           <img src={c.hero_image_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=200&h=200&fit=crop'} style={{ width: '64px', height: '64px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(0,0,0,0.08)' }} />
                           <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, justifyContent: 'center' }}>
                             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '8px' }}>
                               <div style={{ fontWeight: 700, fontSize: '13px', color: '#1E293B', lineHeight: '1.2', letterSpacing: '-0.2px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                 {c.name}
                               </div>
                               <div style={{ display:'flex', alignItems:'center', gap:'2px', padding:'2px 5px', borderRadius:'5px', backgroundColor:'#FEF9C3', color:'#CA8A04', border:'1px solid rgba(202,138,4,0.3)', flexShrink: 0 }}>
                                 <span style={{ fontSize:'10px', fontWeight:800 }}>{c.rating}</span><span style={{ fontSize:'9px' }}>★</span>
                               </div>
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                               <span style={{ fontSize:'10px', fontWeight:600, color:'#64748B' }}>Platform Coverage:</span>
                               <div style={{ display: 'flex', gap: '4px' }}>
                                  {c.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
                               </div>
                             </div>
                             <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                               <span style={{ fontSize:'10px', fontWeight:600, color:'#64748B' }}>Threat Level:</span>
                               <ThreatBadge threat={threatObj} competitor={c} menuOverlap={overlap} />
                             </div>
                           </div>
                        </div>
                      </Popup>
                    </Marker>
                    );
                  })}
                </>
              ) : listMode === 'Promotions' ? groupedPromos.map(g => (
                  <Marker key={g.id} position={[g.lat, g.lng]} icon={createCustomIcon({ id: g.id, name: g.name }, mapZoom, g.promos.length)}>
                    <Tooltip direction="top" offset={mapZoom >= 14 ? [0, -60] : [0, -25]} opacity={1} className="modern-leaflet-tooltip">
                      <div style={{ fontWeight:600, fontSize:'12px', letterSpacing:'-0.2px', color:'#1E293B', fontFamily:'Inter, system-ui, sans-serif' }}>{g.name}</div>
                      <div style={{ color:'#E05046', fontWeight:700, fontSize:'11px', letterSpacing:'-0.1px' }}>{g.promos.length} active promo{g.promos.length !== 1 ? 's' : ''}</div>
                    </Tooltip>
                  </Marker>
                )) : (() => {
                  const groups = {};
                  flatMenuItems.forEach(item => {
                    if (!groups[item.competitor.id]) groups[item.competitor.id] = { competitor: item.competitor, items: [] };
                    groups[item.competitor.id].items.push(item);
                  });
                  return Object.values(groups).map(g => {
                    const hasActive = g.items.some(i => i.id === activeItemId);
                    const sortedItems = [...g.items].sort((a, b) => {
                      if (a.id === activeItemId) return -1;
                      if (b.id === activeItemId) return 1;
                      return 0;
                    });

                    return (
                    <Marker key={g.competitor.id} position={[g.competitor.lat, g.competitor.lng]} icon={createCustomIcon(g.competitor, mapZoom)}>
                      <Tooltip key={`tooltip-${g.competitor.id}-${hasActive}`} permanent={hasActive} direction="top" offset={[0, -72]} opacity={1} className="modern-leaflet-tooltip">
                        <div style={{ fontWeight:600, fontSize:'13px', letterSpacing:'-0.2px', color:'#1E293B', fontFamily:'Inter, system-ui, sans-serif', borderBottom:'1px solid #E5E7EB', paddingBottom:'4px', marginBottom:'4px' }}>{g.competitor.name}</div>
                        <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                          {sortedItems.slice(0, 5).map((item, idx) => {
                            const PLAT_COLORS = { 'Uber Eats': '#06C167', 'Deliveroo': '#00CCBC', 'Just Eat': '#FF8000' };
                            const pColor = PLAT_COLORS[item.platform] || '#6B7280';
                            const isItemActive = item.id === activeItemId;
                            return (
                              <div key={`${item.id}-${idx}`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', padding: isItemActive ? '2px 4px' : '0', backgroundColor: isItemActive ? '#FFF1F0' : 'transparent', borderRadius:'4px' }}>
                                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:pColor }} />
                                  <span style={{ fontSize:'10px', color: isItemActive ? '#DC2626' : '#4B5563', fontWeight: isItemActive ? 800 : 500, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'120px' }}>
                                    {item.name}
                                  </span>
                                </div>
                                <span style={{ fontSize:'11px', fontWeight: isItemActive ? 800 : 700, color: isItemActive ? '#DC2626' : '#111' }}>
                                  £{item.price.toFixed(2)}
                                </span>
                              </div>
                            );
                          })}
                          {sortedItems.length > 5 && (
                            <div style={{ fontSize:'9px', color:'#9CA3AF', textAlign:'center', marginTop:'2px', fontWeight:600 }}>
                              + {g.items.length - 5} more variations
                            </div>
                          )}
                        </div>
                      </Tooltip>
                    </Marker>
                    );
                  });
                })()}
            </MapContainer>

            {/* ── Map loading overlay (circular progress ring) ────────────── */}
            {showMapLoading && (
              <MapLoadingOverlay onComplete={handleLoadingComplete} />
            )}



            {/* ── Applied legend (when editing) ─────────────────────────── */}
            {isEditingRadius && draftRadius !== appliedRadius && (
              <div style={{ position:'absolute', bottom:'14px', left:'14px', zIndex:1000, backgroundColor:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:'8px', padding:'5px 10px', display:'flex', alignItems:'center', gap:'5px' }}>
                <div style={{ width:'14px', height:'1.5px', backgroundColor:'#10B981', opacity:0.7 }} />
                <span style={{ fontSize:'9px', fontWeight:700, color:'#065F46' }}>Current: {appliedRadius.toFixed(1)}mi</span>
              </div>
            )}

            {/* ── Floating Radius Editor Panel ──────────────────────────── */}
            {isEditingRadius && (
              <div style={{
                position:'absolute', bottom:'14px', left:'50%',
                transform:'translateX(-50%)',
                zIndex:1001,
                width:'min(380px, 90%)',
                backgroundColor:'rgba(255,255,255,0.98)',
                backdropFilter:'blur(12px)',
                borderRadius:'16px',
                padding:'16px 18px',
                boxShadow:'0 16px 48px rgba(0,0,0,0.22)',
                border:'1px solid rgba(0,0,0,0.08)',
                display:'flex', flexDirection:'column', gap:'12px',
                animation:'slideUp 0.3s ease',
              }}>
                {/* Panel header */}
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                    <SlidersHorizontal size={14} color="#E86A58" />
                    <span style={{ fontSize:'12px', fontWeight:800, color:'#0F172A' }}>Adjust Market Radius</span>
                  </div>
                  <button
                    onClick={() => setIsEditingRadius(false)}
                    style={{ background:'none', border:'none', cursor:'pointer', color:'#9CA3AF', display:'flex', padding:'2px' }}
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Draft value display */}
                <div style={{ display:'flex', alignItems:'baseline', justifyContent:'center', gap:'4px' }}>
                  <span style={{ fontSize:'2.8rem', fontWeight:900, color:'#E86A58', lineHeight:1, letterSpacing:'-0.05em' }}>
                    {draftRadius.toFixed(1)}
                  </span>
                  <span style={{ fontSize:'1.1rem', fontWeight:700, color:'#9CA3AF' }}>miles</span>
                </div>

                {/* Slider */}
                <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
                  <input
                    type="range" min="0.5" max="5.0" step="0.1"
                    value={draftRadius}
                    onChange={e => setDraftRadius(parseFloat(e.target.value))}
                    style={{ width:'100%', accentColor:'#E86A58', cursor:'pointer' }}
                  />
                  <div style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:'9px', fontWeight:600, color:'#9CA3AF' }}>0.5mi · Hyper-local</span>
                    <span style={{ fontSize:'9px', fontWeight:600, color:'#9CA3AF' }}>5.0mi · Max reach</span>
                  </div>
                </div>

                {/* Warning + buttons */}
                <div style={{ display:'flex', alignItems:'center', gap:'5px', padding:'8px 10px', backgroundColor:'rgba(245,158,11,0.06)', borderRadius:'8px', border:'1px solid rgba(245,158,11,0.15)' }}>
                  <ShieldAlert size={12} color="#F59E0B" style={{ flexShrink:0 }} />
                  <span style={{ fontSize:'10px', color:'#92400E', fontWeight:600, lineHeight:1.4 }}>
                    Changing your radius will re-scope all MenuIQ market insights.
                  </span>
                </div>

                <div style={{ display:'flex', gap:'8px' }}>
                  <button
                    onClick={() => setIsEditingRadius(false)}
                    style={{ flex:1, padding:'8px', borderRadius:'8px', border:'1px solid #E5E7EB', background:'transparent', cursor:'pointer', fontFamily:'inherit', fontSize:'12px', fontWeight:700, color:'#6B7280', transition:'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApplyRadius}
                    style={{
                      flex:2, padding:'8px', borderRadius:'8px', border:'none',
                      backgroundColor: radiusChanged ? '#E86A58' : '#111827',
                      color:'#fff', cursor:'pointer', fontFamily:'inherit',
                      fontSize:'12px', fontWeight:800,
                      display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                      boxShadow: radiusChanged ? '0 4px 12px rgba(232,106,88,0.4)' : '0 2px 8px rgba(0,0,0,0.15)',
                      transition:'all 0.2s',
                    }}
                  >
                    <Check size={13} />
                    Apply Radius
                  </button>
                </div>
              </div>
            )}
            </div>
          </div>

          {/* RIGHT: LIST 40% */}
          <div style={{ width:'40%', display:'flex', flexDirection:'column', overflow:'hidden', borderLeft:'1px solid rgba(0,0,0,0.06)' }}>
            
            {/* ── List Controls ──────────────────────────────────────────────── */}
            <div style={{ padding:'10px 14px', borderBottom:'1px solid #F3F4F6', flexShrink:0 }}>
              {/* Platform & Promo */}
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', width:'100%' }}>
                
                {/* Search Bar (Moved from Header) */}
                <div style={{ display:'flex', alignItems:'center', gap:'6px', padding:'6px 12px', borderRadius:'8px', border:'1px solid #E5E7EB', backgroundColor:'#fff', flex:1, minWidth:0, position:'relative' }}>
                  <Search size={14} color="#9CA3AF" style={{ flexShrink:0 }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQueryInput}
                    onChange={e => setSearchQueryInput(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        setIsSearching(true);
                        setIsSearchFocused(false);
                        setTimeout(() => {
                          setSearchQuery(searchQueryInput);
                          setIsSearching(false);
                        }, 800);
                      }
                    }}
                    style={{ border:'none', outline:'none', background:'transparent', fontSize:'12px', fontWeight:500, color:'#111', width:'100%', minWidth:0, fontFamily:'inherit' }}
                  />
                  {(searchQueryInput || searchQuery) && (
                    <button onClick={() => { 
                      setIsSearching(true);
                      setTimeout(() => {
                        setSearchQuery(''); 
                        setSearchQueryInput(''); 
                        setIsSearching(false);
                      }, 400);
                    }} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#9CA3AF', display:'flex', flexShrink:0 }}><X size={12} /></button>
                  )}

                  {/* Pre-defined Keywords Dropdown */}
                  {isSearchFocused && listMode === 'Menu Items' && (
                    <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, width:'100%', backgroundColor:'#fff', border:'1px solid #E5E7EB', borderRadius:'8px', boxShadow:'0 4px 12px rgba(0,0,0,0.05)', zIndex:999, overflow:'hidden', display:'flex', flexDirection:'column' }}>
                      <div style={{ padding:'8px 12px', fontSize:'10px', fontWeight:700, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid #F3F4F6' }}>Quick Searches</div>
                      {['Burger', 'Pizza', 'Chicken', 'Vegan', 'Kebab', 'Dessert'].map(kw => (
                        <button
                          key={kw}
                          onClick={() => {
                            setSearchQueryInput(kw);
                            setIsSearching(true);
                            setIsSearchFocused(false);
                            setTimeout(() => {
                              setSearchQuery(kw);
                              setIsSearching(false);
                            }, 800);
                          }}
                          onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F9FAFB'}
                          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                          style={{ padding:'8px 12px', border:'none', backgroundColor:'transparent', textAlign:'left', fontSize:'12px', fontWeight:600, color:'#374151', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}
                        >
                          <Search size={12} color="#9CA3AF" />
                          {kw}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Filters - Right Side */}
                <div style={{ display:'flex', alignItems:'center', gap:'6px', flexShrink:0 }}>
                  {listMode !== 'Promotions' && (
                    <>
                      {/* Sort By Dropdown */}
                      <div style={{ position:'relative' }}>
                        <select
                          value={sortBy} onChange={e => setSortBy(e.target.value)}
                          style={{ appearance:'none', outline:'none', display:'flex', alignItems:'center', gap:'4px', padding:'4px 22px 4px 9px', borderRadius:'6px', cursor:'pointer', border:'1px solid #E5E7EB', backgroundColor:'#fff', color: (sortBy !== 'Threat Level' && sortBy !== 'Price: Low to High') ? '#E86A58' : '#6B7280', fontWeight:700, fontSize:'10px', fontFamily:'inherit', transition:'all 0.2s' }}
                        >
                          <option value="Threat Level">Sort: Threat</option>
                          {listMode === 'Menu Items' ? (
                            <>
                              <option value="Price: Low to High">Price: Low to High</option>
                              <option value="Price: High to Low">Price: High to Low</option>
                            </>
                          ) : (
                            <option value="Rating">Sort: Rating</option>
                          )}
                        </select>
                        <ChevronDown size={10} color={(sortBy !== 'Threat Level' && sortBy !== 'Price: Low to High') ? '#E86A58' : '#6B7280'} style={{ position:'absolute', right:'7px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                      </div>

                      {/* Cuisine Dropdown */}
                      {listMode !== 'Menu Items' && (
                        <div style={{ position:'relative' }}>
                          <select
                            value={selectedCuisine} onChange={e => setSelectedCuisine(e.target.value)}
                            style={{ appearance:'none', outline:'none', display:'flex', alignItems:'center', gap:'4px', padding:'4px 22px 4px 9px', borderRadius:'6px', cursor:'pointer', border: selectedCuisine !== 'All' ? '1px solid rgba(232,106,88,0.3)' : '1px solid #E5E7EB', backgroundColor: selectedCuisine !== 'All' ? '#FFF8F6' : '#fff', color: selectedCuisine !== 'All' ? '#E86A58' : '#6B7280', fontWeight:700, fontSize:'10px', fontFamily:'inherit', transition:'all 0.2s' }}
                          >
                            <option value="All">Cuisine: All</option>
                            {Object.keys(CUISINE_COLORS).map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                          <ChevronDown size={10} color={selectedCuisine !== 'All' ? '#E86A58' : '#9CA3AF'} style={{ position:'absolute', right:'7px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
                        </div>
                      )}
                    </>
                  )}

                  {/* Platform dropdown */}
                  {(() => {
                    const PLAT_OPTIONS = [
                      { id:'deliveroo', label:'Deliveroo', color:'#00CCBC', icon:'https://cdn.simpleicons.org/deliveroo/00CCBC' },
                      { id:'ubereats', label:'UberEats',  color:'#06C167', icon:'https://cdn.simpleicons.org/ubereats/06C167' },
                      { id:'justeats',  label:'Just Eat',  color:'#FF8000', icon:'https://cdn.simpleicons.org/justeat/FF8000' },
                    ];
                    const pillLabel = selectedPlatforms.length === 0 ? 'Platform' : null;
                    const isActive = selectedPlatforms.length > 0;
                    const togglePlatform = (id) => setSelectedPlatforms(prev =>
                      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
                    );
                    return (
                      <div ref={platformRef} style={{ position:'relative' }}>
                        <button
                          onClick={() => setPlatformOpen(o => !o)}
                          style={{ display:'flex', alignItems:'center', gap:'4px', padding:'4px 9px', borderRadius:'6px', cursor:'pointer', border: isActive ? '1px solid rgba(232,106,88,0.3)' : '1px solid #E5E7EB', backgroundColor: isActive ? '#FFF8F6' : '#fff', color: isActive ? '#E86A58' : '#6B7280', fontWeight:700, fontSize:'10px', fontFamily:'inherit', transition:'all 0.2s', boxShadow: 'none', whiteSpace:'nowrap' }}
                        >
                          {isActive && (
                            <div style={{ display:'flex', alignItems:'center', gap:'3px' }}>
                              {selectedPlatforms.map(p => { const opt = PLAT_OPTIONS.find(o => o.id === p); return opt ? <img key={p} src={opt.icon} alt={p} style={{ width:'12px', height:'12px', objectFit:'contain' }} /> : null; })}
                            </div>
                          )}
                          {pillLabel}
                          <ChevronDown size={10} style={{ transition:'transform 0.2s', transform: platformOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>
                        {platformOpen && (
                          <div style={{ position:'absolute', top:'calc(100% + 5px)', right:0, backgroundColor:'#fff', borderRadius:'10px', boxShadow:'0 8px 28px rgba(0,0,0,0.14)', border:'1px solid rgba(0,0,0,0.08)', padding:'6px', zIndex:9999, minWidth:'170px', display:'flex', flexDirection:'column', gap:'2px' }}>
                            {selectedPlatforms.length > 0 && (
                              <button onClick={() => setSelectedPlatforms([])} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'4px', padding:'5px 8px', borderRadius:'6px', border:'none', background:'rgba(239,68,68,0.06)', cursor:'pointer', fontFamily:'inherit', fontSize:'10px', fontWeight:700, color:'#EF4444', marginBottom:'2px' }}>
                                <X size={9} />Clear
                              </button>
                            )}
                            {PLAT_OPTIONS.map(opt => {
                              const checked = selectedPlatforms.includes(opt.id);
                              return (
                                <button key={opt.id} onClick={() => togglePlatform(opt.id)}
                                  style={{ display:'flex', alignItems:'center', gap:'8px', padding:'7px 10px', borderRadius:'7px', cursor:'pointer', border:'none', fontFamily:'inherit', textAlign:'left', backgroundColor: checked ? `${opt.color}12` : 'transparent', transition:'background 0.15s', width:'100%' }}
                                  onMouseEnter={e => { if (!checked) e.currentTarget.style.backgroundColor='#F9FAFB'; }}
                                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = checked ? `${opt.color}12` : 'transparent'; }}
                                >
                                  <div style={{ width:'15px', height:'15px', borderRadius:'4px', flexShrink:0, border: checked ? 'none' : '1.5px solid #D1D5DB', backgroundColor: checked ? opt.color : 'transparent', display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s' }}>
                                    {checked && <Check size={9} color="#fff" strokeWidth={3} />}
                                  </div>
                                  <img src={opt.icon} alt="" style={{ width:'13px', height:'13px' }} />
                                  <span style={{ fontSize:'12px', fontWeight:600, color:'#111', flex:1 }}>{opt.label}</span>
                                  {checked && <div style={{ width:'6px', height:'6px', borderRadius:'50%', backgroundColor:opt.color, flexShrink:0 }} />}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

            </div>

            {/* Scrollable list */}
            <div style={{ flex:1, overflowY:'auto', overscrollBehavior:'contain', transform:'translateZ(0)', display:'flex', flexDirection:'column' }}>
              {isSearching ? (
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flex:1, gap:'12px', padding:'3rem 0' }}>
                  <div style={{ width:'24px', height:'24px', border:'3px solid #E5E7EB', borderTop:'3px solid #E86A58', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
                  <span style={{ fontSize:'12px', color:'#9CA3AF', fontWeight:500 }}>Scanning market data...</span>
                  <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                </div>
              ) : (
                <>
                  {/* Menu Items Average Stats Banner */}
                  {listMode === 'Menu Items' && flatMenuItems.length > 0 && searchQuery.trim() !== '' && (() => {
                let total = 0;
                const platTotals = { 'Uber Eats': { sum: 0, count: 0 }, 'Deliveroo': { sum: 0, count: 0 }, 'Just Eat': { sum: 0, count: 0 } };
                flatMenuItems.forEach(item => {
                  total += item.price;
                  if (platTotals[item.platform]) {
                    platTotals[item.platform].sum += item.price;
                    platTotals[item.platform].count += 1;
                  }
                });
                const overallAvg = total / flatMenuItems.length;
                const platformsAvg = Object.entries(platTotals).map(([p, data]) => ({
                  platform: p,
                  avg: data.count > 0 ? data.sum / data.count : null
                })).filter(p => p.avg !== null);

                return (
                  <div style={{ padding:'12px 16px', backgroundColor:'#F8FAFC', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'12px', flexShrink:0 }}>
                    <div style={{ display:'flex', flexDirection:'column' }}>
                      <span style={{ fontSize:'13px', fontWeight:700, color:'#334155' }}>
                        <span style={{ color:'#9CA3AF', fontWeight:600, marginRight:'4px' }}>Keyword:</span>
                        {searchQuery}
                      </span>
                    </div>
                    
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'6px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <span style={{ fontSize:'10px', fontWeight:600, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.5px' }}>Average Price:</span>
                        <span style={{ fontSize:'15px', fontWeight:800, color:'#0F172A' }}>£{overallAvg.toFixed(2)}</span>
                      </div>
                      
                      <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap', justifyContent:'flex-end' }}>
                        {platformsAvg.map(p => {
                          if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(p.platform)) return null;
                          const PLAT_ICONS = { 
                            'Uber Eats': 'https://cdn.simpleicons.org/ubereats/06C167', 
                            'Deliveroo': 'https://cdn.simpleicons.org/deliveroo/00CCBC', 
                            'Just Eat': 'https://cdn.simpleicons.org/justeat/FF8000' 
                          };
                          return (
                            <div key={p.platform} style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                              <img src={PLAT_ICONS[p.platform]} alt={p.platform} style={{ width:'12px', height:'12px', border:'none' }} />
                              <span style={{ fontSize:'11px', fontWeight:600, color:'#64748B' }}>£{p.avg.toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {(listMode === 'Restaurants' || listMode === 'Competitors') ? (
                filteredRestaurants.length === 0
                  ? <EmptyState radius={radius} mode="restaurants" />
                  : filteredRestaurants.map((c, i) => <CompetitorRow key={c.id} competitor={c} isActive={activeItemId === c.id} isLast={i === filteredRestaurants.length - 1} onClick={() => { setActiveCenter([c.lat, c.lng]); setActiveZoom(16); setActiveItemId(c.id); }} />)
              ) : listMode === 'Promotions' ? (
                groupedPromos.length === 0
                  ? <EmptyState radius={radius} mode="promos" />
                  : groupedPromos.map(g => <PromoFeedItem key={g.name} group={g} onClick={() => { setActiveCenter([g.lat, g.lng]); setActiveZoom(16); }} />)
              ) : (
                flatMenuItems.length === 0
                  ? <EmptyState radius={radius} mode="items" />
                  : flatMenuItems.map((item, i) => <MenuItemRow key={item.id} item={item} searchQuery={searchQuery} isLast={i === flatMenuItems.length - 1} isActive={activeItemId === item.id} onClick={() => { setActiveCenter([item.competitor.lat, item.competitor.lng]); setActiveZoom(16); setActiveItemId(item.id); }} />)
              )}
                </>
              )}
            </div>
          </div>
        </div>


        {/* Bottom bar removed — radius control is now in the map overlay panel */}
      </div>
    </div>,
    document.body
  );
};

export default MarketZoneModal;
