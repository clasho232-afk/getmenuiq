import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus } from 'lucide-react';
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import * as turf from '@turf/turf';

import eastLondonAreas from './east_london_areas.json';

// Sleek minimal red-orange concentric dot for the restaurant
const homeMarkerIcon = L.divIcon({
  html: `
    <div style="
      width: 24px; height: 24px; 
      background: rgba(184, 74, 57, 0.2); 
      border-radius: 50%; 
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 0 0 4px rgba(184, 74, 57, 0.1);
    ">
      <div style="
        width: 12px; height: 12px; 
        background: #B84A39; 
        border-radius: 50%; 
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    </div>
  `,
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12]
});

const HOME_COORDS = [51.5582, 0.0711]; // Ilford central coords

// Path B: Universal Dynamic Topological Calculation
const computeAdjacencyGraph = (homeSectorName, allSectors) => {
  const currentSector = allSectors.find(s => s.name.includes(homeSectorName));
  if (!currentSector) return [];

  const createPolygon = (bounds) => {
    // Turf strictly expects [longitude, latitude] matching first and last coordinates
    const coords = bounds.map(c => [c[1], c[0]]); 
    if (coords[0][0] !== coords[coords.length - 1][0] || coords[0][1] !== coords[coords.length - 1][1]) {
      coords.push([...coords[0]]);
    }
    return turf.polygon([coords]);
  };

  const homePoly = createPolygon(currentSector.bounds);
  
  const validNeighbors = [];
  allSectors.forEach(potentialNeighbor => {
    if (potentialNeighbor.name === currentSector.name) return;
    const neighborPoly = createPolygon(potentialNeighbor.bounds);
    
    // Core Boolean Spatial Test
    if (turf.booleanIntersects(homePoly, neighborPoly)) {
      validNeighbors.push(potentialNeighbor.name);
    }
  });

  return validNeighbors;
};

// Automate calculation on initialization
const DYNAMIC_NEIGHBORS = computeAdjacencyGraph('Ilford', eastLondonAreas);

// Extracted filtering function
function filterTrueNeighboringCompetitors(allCompetitors, currentHomeSector) {
  const validNeighborNames = DYNAMIC_NEIGHBORS;
  
  return allCompetitors.filter(competitor => {
    if (competitor.areaName === currentHomeSector) return true; // Always include home
    // Drop the competitor instantly if their assigned area is not a direct border neighbor
    return validNeighborNames.some(neighborName => neighborName.includes(competitor.areaName) || competitor.areaName.includes(neighborName));
  });
}

const MOCK_PINS = [
  // ILFORD PINS (14)
  { id: 1, areaName: 'Ilford', isLocal: true, name: "King Pizza & Grill", coords: [51.559, 0.072], mainImg: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Deliveroo", "Uber Eats"], promoDetails: { "Deliveroo": { text: "Free Delivery over £15", img: "https://images.unsplash.com/photo-1604381536121-18f6e451b8bc?w=32&h=32&fit=crop" }, "Uber Eats": { text: "Spend £20, Save Real £5", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=32&h=32&fit=crop" } } },
  { id: 2, areaName: 'Ilford', isLocal: true, name: "Ilford Fried Chicken", coords: [51.562, 0.076], mainImg: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Just Eat"], promoDetails: {} },
  { id: 3, areaName: 'Ilford', isLocal: true, name: "Taste of India", coords: [51.555, 0.068], mainImg: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Uber Eats", "Just Eat"], promoDetails: { "Uber Eats": { text: "20% off selected items", img: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=32&h=32&fit=crop" }, "Just Eat": { text: "Free Drink with Meal", img: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=32&h=32&fit=crop" } } },
  { id: 4, areaName: 'Ilford', isLocal: true, name: "Burger Hub", coords: [51.560, 0.065], mainImg: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo"], promoDetails: {} },
  { id: 5, areaName: 'Ilford', isLocal: true, name: "Sushi Daily", coords: [51.552, 0.075], mainImg: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Deliveroo", "Just Eat"], promoDetails: { "Deliveroo": { text: "Free Delivery", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=32&h=32&fit=crop" }, "Just Eat": { text: "10% off over £30", img: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=32&h=32&fit=crop" } } },
  { id: 6, areaName: 'Ilford', isLocal: true, name: "The Kebab Shop", coords: [51.565, 0.070], mainImg: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Uber Eats"], promoDetails: {} },
  { 
    id: 7, areaName: 'Ilford', isLocal: true, name: "Pizza Express (Ilford)", coords: [51.558, 0.080], 
    mainImg: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&auto=format&fit=crop&q=60", 
    hasPromo: true, platforms: ["Deliveroo", "Uber Eats", "Just Eat"], 
    promotions: [
      { platform: "Deliveroo", type: "Free Delivery", desc: "Free delivery on all orders over £15", productImageUrl: "https://images.unsplash.com/photo-1526367790999-0150786686a2?w=64&h=64&fit=crop" },
      { platform: "Deliveroo", type: "Bundle Deal", desc: "2 Mid pizzas + 1 Side for £24.99", productImageUrl: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=64&h=64&fit=crop" },
      { platform: "Deliveroo", type: "Item Discount", desc: "20% off selected vegan starters", productImageUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=64&h=64&fit=crop" },
      { platform: "Uber Eats", type: "Tiered Discount", desc: "Spend £25, Save £5 instantly", productImageUrl: "https://images.unsplash.com/photo-1590947132387-155cc02f3212?w=64&h=64&fit=crop" },
      { platform: "Uber Eats", type: "BOGO", desc: "Buy 1 Get 1 Free on Margherita Pizzas", productImageUrl: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=64&h=64&fit=crop" },
      { platform: "Just Eat", type: "Flat Discount", desc: "15% off your entire basket matrix", productImageUrl: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=64&h=64&fit=crop" },
      { platform: "Just Eat", type: "Loyalty Perk", desc: "Earn double points on weekend orders", productImageUrl: "https://images.unsplash.com/photo-1529042410759-befb1204b468?w=64&h=64&fit=crop" }
    ] 
  },
  { id: 8, areaName: 'Ilford', isLocal: true, name: "Wok & Roll", coords: [51.554, 0.062], mainImg: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Just Eat"], promoDetails: {} },
  { id: 9, areaName: 'Ilford', isLocal: true, name: "Greggs Bakery", coords: [51.561, 0.071], mainImg: 'https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Just Eat"], promoDetails: { "Just Eat": { text: "Free Sausage Roll with orders over £10", img: "https://images.unsplash.com/photo-1509315811345-672d83ef2fbc?w=32&h=32&fit=crop" } } },
  { id: 10, areaName: 'Ilford', isLocal: true, name: "Salad Station", coords: [51.557, 0.069], mainImg: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo"], promoDetails: {} },
  { id: 11, areaName: 'Ilford', isLocal: true, name: "Spice Route", coords: [51.563, 0.082], mainImg: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Uber Eats"], promoDetails: { "Uber Eats": { text: "15% off entirely", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=32&h=32&fit=crop" } } },
  { id: 12, areaName: 'Ilford', isLocal: true, name: "Noodle Bar", coords: [51.550, 0.078], mainImg: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo", "Just Eat"], promoDetails: {} },
  { id: 13, areaName: 'Ilford', isLocal: true, name: "Fish & Chips Central", coords: [51.566, 0.074], mainImg: 'https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Deliveroo"], promoDetails: { "Deliveroo": { text: "Free Delivery on Friday", img: "https://images.unsplash.com/photo-1576458088443-04a19bb13da6?w=32&h=32&fit=crop" } } },
  { id: 14, areaName: 'Ilford', isLocal: true, name: "Vegan Bites", coords: [51.551, 0.066], mainImg: 'https://images.unsplash.com/photo-1511690656952-34342bb7c2f2?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Uber Eats", "Just Eat"], promoDetails: {} },
  
  // NEIGHBORING SECTOR PINS (True neighbors)
  { id: 15, areaName: 'Barking and Dagenham', isLocal: false, name: "Barking Bites", coords: [51.540, 0.085], mainImg: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo"], promoDetails: {} },
  { id: 16, areaName: 'Waltham Forest', isLocal: false, name: "Waltham Grill", coords: [51.585, -0.010], mainImg: 'https://images.unsplash.com/photo-1544025162-811114e1a0b3?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Uber Eats"], promoDetails: { "Uber Eats": { text: "10% off orders over £20", img: "https://images.unsplash.com/photo-1544025162-811114e1a0b3?w=32&h=32&fit=crop" } } },
  { id: 17, areaName: 'Ilford', isLocal: false, name: "Seven Kings Cafe", coords: [51.565, 0.095], mainImg: 'https://images.unsplash.com/photo-1498837167922-41c53bbfed9e?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Just Eat"], promoDetails: { "Just Eat": { text: "Free Coffee", img: "https://images.unsplash.com/photo-1498837167922-41c53bbfed9e?w=32&h=32&fit=crop" } } },
  { id: 18, areaName: 'Ilford', isLocal: false, name: "Redbridge Roast", coords: [51.575, 0.055], mainImg: 'https://images.unsplash.com/photo-1560614382-3317769415c8?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo", "Uber Eats"], promoDetails: {} },
  { id: 19, areaName: 'Newham', isLocal: false, name: "East Ham Eatery", coords: [51.532, 0.055], mainImg: 'https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Uber Eats"], promoDetails: { "Uber Eats": { text: "Spend £15, Save £3", img: "https://images.unsplash.com/photo-1525648199074-cee30ba79a4a?w=32&h=32&fit=crop" } } },
  { id: 20, areaName: 'Waltham Forest', isLocal: false, name: "Leytonstone Lounge", coords: [51.568, 0.008], mainImg: 'https://images.unsplash.com/photo-1466978913421-bac2e5e4d6ce?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Just Eat"], promoDetails: {} },
  { id: 21, areaName: 'Waltham Forest', isLocal: false, name: "Wanstead Wok", coords: [51.575, 0.025], mainImg: 'https://images.unsplash.com/photo-1555126634-323283e090f6?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Deliveroo"], promoDetails: { "Deliveroo": { text: "Free spring rolls", img: "https://images.unsplash.com/photo-1555126634-323283e090f6?w=32&h=32&fit=crop" } } },
  { id: 22, areaName: 'Newham', isLocal: false, name: "Newham Noodles", coords: [51.528, 0.028], mainImg: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cb438?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Uber Eats"], promoDetails: {} },
  
  // NON-NEIGHBORING PINS (Will be filtered out to show effectiveness of geography contiguity)
  { id: 23, areaName: 'Hackney', isLocal: false, name: "Stratford Steakhouse", coords: [51.542, -0.002], mainImg: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Just Eat"], promoDetails: { "Just Eat": { text: "20% off all steaks", img: "https://images.unsplash.com/photo-1600891964092-4316c288032e?w=32&h=32&fit=crop" } } },
  { id: 24, areaName: 'Hackney', isLocal: false, name: "Forest Gate Fried", coords: [51.548, 0.025], mainImg: 'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo"], promoDetails: {} },
  { id: 25, areaName: 'Whitechapel', isLocal: false, name: "Plaistow Pizza", coords: [51.530, 0.015], mainImg: 'https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Uber Eats", "Just Eat"], promoDetails: { "Uber Eats": { text: "Free garlic bread", img: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?w=32&h=32&fit=crop" } } },
  { id: 26, areaName: 'Whitechapel', isLocal: false, name: "Manor Park Meals", coords: [51.552, 0.045], mainImg: 'https://images.unsplash.com/photo-1505253716362-afaea1d3d1af?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo", "Uber Eats"], promoDetails: {} },
  { id: 27, areaName: 'Greenwich', isLocal: false, name: "Goodmayes Grill", coords: [51.565, 0.112], mainImg: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Just Eat"], promoDetails: { "Just Eat": { text: "£5 off orders over £30", img: "https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=32&h=32&fit=crop" } } },
  { id: 28, areaName: 'Greenwich', isLocal: false, name: "Chadwell Heath Cafe", coords: [51.575, 0.135], mainImg: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Deliveroo"], promoDetails: {} },
  { id: 29, areaName: 'Greenwich', isLocal: false, name: "Upney Udon", coords: [51.538, 0.100], mainImg: 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Uber Eats"], promoDetails: { "Uber Eats": { text: "Free gyoza with mains", img: "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=32&h=32&fit=crop" } } },
  { id: 30, areaName: 'Hackney', isLocal: false, name: "Becontree Burgers", coords: [51.552, 0.125], mainImg: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Just Eat"], promoDetails: {} },
  { id: 31, areaName: 'Whitechapel', isLocal: false, name: "Dagenham Deli", coords: [51.542, 0.145], mainImg: 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=64&h=64&fit=crop', hasPromo: true, platforms: ["Deliveroo"], promoDetails: { "Deliveroo": { text: "15% off lunch menu", img: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=32&h=32&fit=crop" } } },
  { id: 32, areaName: 'Hackney', isLocal: false, name: "Woodford Wraps", coords: [51.605, 0.035], mainImg: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=64&h=64&fit=crop', hasPromo: false, platforms: ["Uber Eats"], promoDetails: {} }
];

const CustomZoomControl = () => {
  const map = useMap();
  return (
    <div style={{
      position: 'absolute', bottom: '2rem', right: '2rem', zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: '0.5rem',
    }}>
      <button 
        onClick={(e) => { e.stopPropagation(); map.zoomIn(); }}
        style={{
          width: '36px', height: '36px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#374151', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#FFFFFF'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'}
      >
        <Plus size={18} strokeWidth={1.5} />
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); map.zoomOut(); }}
        style={{
          width: '36px', height: '36px', background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#374151', boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
        }}
        onMouseEnter={e => e.currentTarget.style.background = '#FFFFFF'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.85)'}
      >
        <Minus size={18} strokeWidth={1.5} />
      </button>
    </div>
  );
};

const MapController = ({ viewState, targetLocation, markerRefs, setTargetLocation }) => {
  const map = useMap();
  
  // Cinematic camera glide when sidebar list is clicked
  useEffect(() => {
    if (targetLocation) {
      const { lat, lng, id: shopId } = targetLocation;
      
      // Calculate latitude offset so map flies higher, pushing pin lower in screen
      const visualLatitudeOffset = 0.0022;
      const adjustedTargetLat = lat + visualLatitudeOffset;

      map.flyTo([adjustedTargetLat, lng], 16, { animate: true, duration: 1.2 });
      
      map.once('moveend', () => {
        const marker = markerRefs.current[shopId];
        if (marker) {
          marker.openPopup();
        }
      });
      setTargetLocation(null);
    }
  }, [targetLocation, map, setTargetLocation, markerRefs]);

  useEffect(() => {
    if (viewState === 'local') {
      const activeSector = eastLondonAreas.find(s => s.name.includes('Ilford'));
      if (activeSector && activeSector.bounds.length > 0) {
        const bounds = L.polygon(activeSector.bounds).getBounds();
        map.flyToBounds(bounds, { padding: [20, 20], duration: 1.5 });
      } else {
        map.flyTo(HOME_COORDS, 13, { duration: 1.5 });
      }
    } else {
      let allLatLngs = [];
      eastLondonAreas.forEach(area => {
        area.bounds.forEach(coord => {
          allLatLngs.push(coord);
        });
      });
      if (allLatLngs.length > 0) {
        const bounds = L.polygon(allLatLngs).getBounds();
        map.flyToBounds(bounds, { padding: [50, 50], duration: 1.5 });
      }
    }
  }, [viewState, map]);
  return null;
};

// Competitor dot/pill icon generator
const getCompetitorIcon = (pin, isZoomedIn) => {
  if (isZoomedIn) {
    const isPromoActive = pin.hasPromo;
    const customHtml = `
      <div class="map-inline-banner">
        <img class="banner-avatar" src="${pin.mainImg}" alt="${pin.name}" />
        <span class="banner-name">${pin.name}</span>
        <span class="banner-status-dot ${isPromoActive ? 'active-promo' : 'standard'}"></span>
      </div>
    `;

    return L.divIcon({
      html: customHtml,
      className: 'custom-leaflet-banner-container',
      iconSize: null, // Allows dimensions to scale dynamically via content padding
      iconAnchor: [50, 15],
      popupAnchor: [0, -15]
    });
  }

  return L.divIcon({
    html: `
      <div style="
        width: 14px; height: 14px; 
        background: ${pin.hasPromo ? '#FE5000' : '#a1a19f'}; 
        border-radius: 50%; 
        border: 2px solid #FFFFFF;
        box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      "></div>
    `,
    className: '',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -10]
  });
};

const STREET_DETAIL_ZOOM_THRESHOLD = 15; // Set to 15 to match the progressive disclosure behavior

const CompetitorMapLayer = ({ displayedPins, markerRefs }) => {
  const [zoomLevel, setZoomLevel] = useState(13);
  
  const map = useMapEvents({
    zoomend: () => {
      const currentZoomLevel = map.getZoom();
      setZoomLevel(currentZoomLevel);

      // Trigger only if a user pinches/scrolls out past the localized data threshold
      if (currentZoomLevel < STREET_DETAIL_ZOOM_THRESHOLD) {
        const openPopupNode = document.querySelector('.leaflet-popup');

        if (openPopupNode) {
          // Inject the tracking class to fire off the CSS opacity melt animation
          openPopupNode.classList.add('fade-out-active');

          // Allow the 250ms CSS animation frame curve to clear before wiping the instance from the DOM tree
          setTimeout(() => {
            map.closePopup();
          }, 250);
        }
      }
    }
  });

  // Threshold for showing the pill instead of the dot
  const isZoomedIn = zoomLevel >= STREET_DETAIL_ZOOM_THRESHOLD;

  return (
    <>
      {displayedPins.map(pin => (
        <Marker 
          key={pin.id} 
          position={pin.coords} 
          icon={getCompetitorIcon(pin, isZoomedIn)}
          ref={(r) => { if(r) markerRefs.current[pin.id] = r; }}
        >
          <Popup 
            className={`custom-premium-popup ${pin.hasPromo ? 'promo-active' : ''}`}
            autoPanPaddingTopLeft={[20, 160]}
            autoPanPaddingBottomRight={[20, 20]}
            minWidth={280}
          >
            <div className="premium-popup-inner" style={{ padding: '0.25rem', fontFamily: 'system-ui, sans-serif' }}>
              
              <div className="popup-profile-row" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                <img src={pin.mainImg} className="popup-profile-avatar" style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} />
                <div className="popup-profile-text">
                  <h4 className="popup-restaurant-title" style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#111', lineHeight: 1.2 }}>{pin.name}</h4>
                  <p className="popup-platform-availability" style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', fontWeight: 600, color: '#9CA3AF' }}>
                    Platforms: {pin.platforms.join(', ')}
                  </p>
                </div>
              </div>

              {pin.hasPromo && (
                <>
                  <div className="popup-section-divider" style={{ height: '1px', background: 'rgba(0,0,0,0.06)', margin: '1rem 0' }}></div>
                  
                  <span className="popup-section-subtitle" style={{ fontSize: '0.7rem', fontWeight: 800, color: '#6B7280', letterSpacing: '0.05em' }}>
                    ACTIVE PROMOTIONS ({pin.promotions ? pin.promotions.length : Object.keys(pin.promoDetails || {}).length})
                  </span>
                  
                  <div className="popup-promotions-scroll-track" style={{ marginTop: '0.5rem' }}>
                    {(() => {
                      // Normalize promos array
                      const promos = pin.promotions || Object.keys(pin.promoDetails || {}).map(platform => ({
                        platform, type: "Offer", desc: pin.promoDetails[platform].text, productImageUrl: pin.promoDetails[platform].img
                      }));
                      
                      return promos.map((p, idx) => {
                        const platformClass = p.platform.toLowerCase().replace(' ', '-');
                        return (
                          <div key={idx} className="popup-single-promo-line">
                            <div className="popup-promo-left-block">
                              <img className="popup-promo-micro-img-container" src={p.productImageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=64&h=64&fit=crop'} alt="Promo Item" />
                              <div className="popup-promo-text-block">
                                <span className="popup-promo-type">{p.type}</span>
                                <span className="popup-promo-desc">{p.desc}</span>
                              </div>
                            </div>
                            <span className={`popup-platform-badge ${platformClass}`}>{p.platform}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </>
  );
};

const LeftPlatformFilters = ({ activeFilter, setActiveFilter }) => {
  const filters = [
    { id: 'all', label: 'All Platforms', color: '#1F2937' },
    { id: 'deliveroo', label: 'Deliveroo', color: '#00CDBC' },
    { id: 'ubereats', label: 'Uber Eats', color: '#06C167' },
    { id: 'justeat', label: 'Just Eat', color: '#FE5000' }
  ];

  return (
    <div style={{
      position: 'absolute', top: '7.5rem', left: '3rem', zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: '0.5rem'
    }}>
      {filters.map(f => {
        const isActive = activeFilter === f.id;
        return (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            style={{
              padding: '0.6rem 1.25rem', borderRadius: '9999px',
              background: isActive ? '#FFFFFF' : 'rgba(250, 249, 246, 0.85)',
              border: isActive ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
              color: isActive ? f.color : '#6B7280',
              fontSize: '0.85rem', fontWeight: isActive ? 800 : 600,
              cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
              boxShadow: isActive ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
            }}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
};

const RightPromoFilters = ({ promoFilter, setPromoFilter }) => {
  return (
    <div style={{
      position: 'absolute', top: '6.5rem', right: '2rem', zIndex: 1000,
      display: 'flex', flexDirection: 'column', gap: '0.5rem'
    }}>
      <button
        onClick={() => setPromoFilter(promoFilter === 'promos' ? 'all' : 'promos')}
        style={{
          padding: '0.6rem 1.25rem', borderRadius: '9999px',
          background: promoFilter === 'promos' ? '#FFFFFF' : 'rgba(250, 249, 246, 0.85)',
          border: promoFilter === 'promos' ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
          color: promoFilter === 'promos' ? '#B84A39' : '#4B5563',
          fontSize: '0.85rem', fontWeight: promoFilter === 'promos' ? 800 : 600,
          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
          boxShadow: promoFilter === 'promos' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        🏷️ Promos
      </button>
      <button
        onClick={() => setPromoFilter(promoFilter === 'standard' ? 'all' : 'standard')}
        style={{
          padding: '0.6rem 1.25rem', borderRadius: '9999px',
          background: promoFilter === 'standard' ? '#FFFFFF' : 'rgba(250, 249, 246, 0.85)',
          border: promoFilter === 'standard' ? '1px solid rgba(0,0,0,0.1)' : '1px solid transparent',
          color: promoFilter === 'standard' ? '#6B7280' : '#4B5563',
          fontSize: '0.85rem', fontWeight: promoFilter === 'standard' ? 800 : 600,
          cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left',
          boxShadow: promoFilter === 'standard' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)'
        }}
      >
        ⚪ Standard
      </button>
    </div>
  );
};

const SegmentedToggle = ({ viewState, setViewState }) => {
  return (
    <div style={{
      display: 'flex', background: '#EAE5DC', borderRadius: '9999px', padding: '0.35rem',
      position: 'relative', width: 'fit-content'
    }}>
      <div style={{
        position: 'absolute', top: '0.35rem', bottom: '0.35rem',
        left: viewState === 'local' ? '0.35rem' : '50%',
        width: 'calc(50% - 0.35rem)', background: '#FFFFFF', borderRadius: '9999px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
      }} />
      <button
        onClick={() => setViewState('local')}
        style={{
          width: '140px', padding: '0.6rem 0', background: 'transparent', border: 'none',
          color: viewState === 'local' ? '#111' : '#6B7280', fontSize: '0.85rem', fontWeight: 700,
          position: 'relative', zIndex: 2, cursor: 'pointer', transition: 'color 0.3s'
        }}
      >
        Ilford
      </button>
      <button
        onClick={() => setViewState('macro')}
        style={{
          width: '140px', padding: '0.6rem 0', background: 'transparent', border: 'none',
          color: viewState === 'macro' ? '#111' : '#6B7280', fontSize: '0.85rem', fontWeight: 700,
          position: 'relative', zIndex: 2, cursor: 'pointer', transition: 'color 0.3s'
        }}
      >
        Neighboring Area
      </button>
    </div>
  );
};

const DeliveryShadowModal = ({ onClose }) => {
  const [viewState, setViewState] = useState('local'); // 'local' | 'macro'
  const [activeFilter, setActiveFilter] = useState('all');
  const [promoFilter, setPromoFilter] = useState('all');
  
  // New Interactive States for the Sidebar
  const [openSegment, setOpenSegment] = useState(null); // 'promos' | 'standard' | null
  const [targetLocation, setTargetLocation] = useState(null); // { id, lat, lng }
  const markerRefs = useRef({});

  // When switching views, reset target
  useEffect(() => {
    setTargetLocation(null);
  }, [viewState]);

  // First apply the strict contiguity constraint to drop noise
  const tightlyFilteredPins = viewState === 'macro' ? filterTrueNeighboringCompetitors(MOCK_PINS, 'Ilford') : MOCK_PINS;

  const displayedPins = tightlyFilteredPins.filter(pin => {
    if (viewState === 'local' && !pin.isLocal) return false;
    
    if (promoFilter === 'promos' && !pin.hasPromo) return false;
    if (promoFilter === 'standard' && pin.hasPromo) return false;
    if (activeFilter === 'deliveroo' && !pin.platforms.includes('Deliveroo')) return false;
    if (activeFilter === 'ubereats' && !pin.platforms.includes('Uber Eats')) return false;
    if (activeFilter === 'justeat' && !pin.platforms.includes('Just Eat')) return false;
    return true;
  });

  // Calculate stats for sidebar dynamically based on displayed pins
  const promosArray = displayedPins.filter(p => p.hasPromo);
  const standardArray = displayedPins.filter(p => !p.hasPromo);

  const getSectorStyle = (sectorName) => {
    const isHomeSector = sectorName.includes('Ilford');
    return {
      color: isHomeSector ? '#1e7e34' : '#FE5000',
      weight: isHomeSector ? 1.5 : 1,
      fillColor: isHomeSector ? '#28a745' : '#FE5000',
      fillOpacity: isHomeSector ? 0.05 : 0.03,
      className: isHomeSector ? 'home-zone-poly' : 'neighbor-zone-poly'
    };
  };

  const handleToggleSegment = (segmentType) => {
    setOpenSegment(openSegment === segmentType ? null : segmentType);
  };

  const focusMapOnRestaurant = (shopId, lat, lng) => {
    setTargetLocation({ id: shopId, lat, lng });
  };

  // Helper to get platform brand colors for tags
  const getPlatformTag = (platform) => {
    switch (platform) {
      case 'Deliveroo': return <span style={{ fontSize: '10px', fontWeight: 800, color: '#00CDBC', background: 'rgba(0,205,188,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Dl</span>;
      case 'Uber Eats': return <span style={{ fontSize: '10px', fontWeight: 800, color: '#06C167', background: 'rgba(6,193,103,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Ue</span>;
      case 'Just Eat': return <span style={{ fontSize: '10px', fontWeight: 800, color: '#FE5000', background: 'rgba(254,80,0,0.1)', padding: '2px 6px', borderRadius: '4px' }}>Je</span>;
      default: return null;
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, background: 'rgba(0, 0, 0, 0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      padding: '2rem'
    }}>
      <div style={{
        width: '90vw', maxWidth: '1360px', height: '90vh', background: '#FAFAFA', borderRadius: '1.5rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', display: 'flex', fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden', position: 'relative'
      }}>
        
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 100, width: '40px', height: '40px', borderRadius: '50%',
            border: '1px solid rgba(0,0,0,0.05)', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <X size={20} color="#111" />
        </button>

        {/* Left Pane: Map (65%) */}
        <div style={{ width: '65%', position: 'relative', background: '#EAE5DC' }}>
          
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '180px',
            background: 'linear-gradient(to bottom, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 900, pointerEvents: 'none'
          }} />

          <div style={{ position: 'absolute', top: '2.5rem', left: '3rem', zIndex: 1000, pointerEvents: 'none' }}>
            <h2 style={{ margin: 0, fontSize: '3rem', fontWeight: 900, color: '#B84A39', letterSpacing: '-0.04em' }}>Area Map</h2>
          </div>

          <div style={{ position: 'absolute', top: '2.5rem', right: '2rem', zIndex: 1000 }}>
            <SegmentedToggle viewState={viewState} setViewState={setViewState} />
          </div>

          <LeftPlatformFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />
          
          {viewState === 'local' && (
            <RightPromoFilters promoFilter={promoFilter} setPromoFilter={setPromoFilter} />
          )}

          <MapContainer 
            center={HOME_COORDS} 
            zoom={13} 
            zoomControl={false}
            style={{ width: '100%', height: '100%', background: '#F8F9FA' }}
          >
            {/* Base Map: Light Monochrome with Labels (CartoDB Positron) */}
            <TileLayer 
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            
            {/* Unified Polygon Layer (Always visible, styles dynamically adjust) */}
            {eastLondonAreas.map(sector => {
              const isHomeSector = sector.name.includes('Ilford');
              
              // Only render home sector in local view
              if (viewState === 'local' && !isHomeSector) return null;
              
              // Path B Logic: Universal Adjacency Filtering in Macro View
              if (viewState === 'macro' && !isHomeSector) {
                const validNeighbors = DYNAMIC_NEIGHBORS;
                const isTrueNeighbor = validNeighbors.some(neighborName => sector.name.includes(neighborName) || neighborName.includes(sector.name));
                if (!isTrueNeighbor) return null; // Exclude non-adjacent geometry (e.g. Hackney, Greenwich)
              }

              return (
                <Polygon 
                  key={sector.name} positions={sector.bounds}
                  pathOptions={getSectorStyle(sector.name)}
                >
                  <Tooltip permanent direction="center" className="custom-leaflet-tooltip">{sector.name}</Tooltip>
                </Polygon>
              );
            })}

            {/* Competitor Pins */}
            <CompetitorMapLayer displayedPins={displayedPins} markerRefs={markerRefs} />

            <Marker position={HOME_COORDS} icon={homeMarkerIcon} />
            
            <MapController viewState={viewState} targetLocation={targetLocation} markerRefs={markerRefs} setTargetLocation={setTargetLocation} />
            <CustomZoomControl />
          </MapContainer>
        </div>

        {/* Right Pane: Context Toggles & Metrics (35%) */}
        <div style={{ 
          width: '35%', background: '#FAFAFA', borderLeft: '1px solid rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
          
          {/* Static Header Section */}
          <div style={{ padding: '3rem 3rem 1.5rem 3rem', flexShrink: 0 }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 600, color: '#B84A39', marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
              {viewState === 'local' ? 'Primary Area:' : 'Neighboring Area:'} <span style={{ fontWeight: 800 }}>{viewState === 'local' ? 'Ilford' : 'Macro View'}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '4.5rem', fontWeight: 900, color: '#B84A39', lineHeight: 1, letterSpacing: '-0.05em' }}>{displayedPins.length}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#9CA3AF', marginTop: '0.25rem', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {viewState === 'local' ? 'TOTAL LOCAL COMPETITORS' : 'TOTAL COMPETITORS'}
              </span>
            </div>
          </div>

          {/* Scrollable Target Lists */}
          <div className="market-segment-container" style={{ 
            flex: 1, overflowY: 'auto', padding: '0 3rem 3rem 3rem', borderTop: '1px solid rgba(0,0,0,0.05)', paddingTop: '1rem' 
          }}>
                
                {/* Promos Segment */}
                <div className="segment-trigger" onClick={() => handleToggleSegment('promos')}>
                  <div className="segment-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#D65A31' }}>{promosArray.length}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#6B7280' }}>Competitors running promos</span>
                  </div>
                  <span className="segment-chevron" style={{ color: '#9CA3AF', transform: openSegment === 'promos' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </div>
                <div className={`segment-list ${openSegment === 'promos' ? 'expanded' : 'collapsed'}`}>
                  {promosArray.map(shop => (
                    <div key={shop.id} className="competitor-list-item" onClick={() => focusMapOnRestaurant(shop.id, shop.coords[0], shop.coords[1])}>
                      <img src={shop.mainImg} className="banner-avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span className="banner-name" style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', flexGrow: 1 }}>{shop.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {shop.platforms.map(p => getPlatformTag(p))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="segment-divider" style={{ height: '1px', background: 'rgba(0,0,0,0.03)', margin: '8px 0' }}></div>

                {/* Standard Segment */}
                <div className="segment-trigger" onClick={() => handleToggleSegment('standard')}>
                  <div className="segment-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#9CA3AF' }}>{standardArray.length}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 600, color: '#9CA3AF' }}>Competitors with no promos</span>
                  </div>
                  <span className="segment-chevron" style={{ color: '#9CA3AF', transform: openSegment === 'standard' ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>▼</span>
                </div>
                <div className={`segment-list ${openSegment === 'standard' ? 'expanded' : 'collapsed'}`}>
                  {standardArray.map(shop => (
                    <div key={shop.id} className="competitor-list-item" onClick={() => focusMapOnRestaurant(shop.id, shop.coords[0], shop.coords[1])}>
                      <img src={shop.mainImg} className="banner-avatar" style={{ width: '24px', height: '24px', borderRadius: '50%', objectFit: 'cover' }} />
                      <span className="banner-name" style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', flexGrow: 1 }}>{shop.name}</span>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {shop.platforms.map(p => getPlatformTag(p))}
                      </div>
                    </div>
                  ))}
                </div>

          </div>
        </div>

      </div>
      <style>{`
        /* Custom Popup styling */
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .custom-popup .leaflet-popup-tip {
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        /* High-End Popup Animation Overrides */
        .leaflet-popup {
          transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1), transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 1;
          transform: scale(1) translateY(0);
        }

        .leaflet-popup.fade-out-active {
          opacity: 0 !important;
          transform: scale(0.95) translateY(4px) !important;
        }

        /* Inline Restaurant Banner Pill */
        .map-inline-banner {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          padding: 4px 10px 4px 6px;
          border-radius: 30px;
          border: 1px solid rgba(255, 255, 255, 0.6);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          white-space: nowrap;
          pointer-events: auto;
        }

        .banner-avatar {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          object-fit: cover;
          background-color: #f4f4f0;
        }

        .banner-name {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 11px;
          font-weight: 600;
          color: #1a1a1a;
          letter-spacing: -0.01em;
        }

        .banner-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-left: 2px;
        }
        .banner-status-dot.active-promo {
          background-color: #FE5000;
        }
        .banner-status-dot.standard {
          background-color: #a1a19f;
        }

        .custom-leaflet-banner-container {
          background: transparent;
          border: none;
        }

        /* Sidebar Interactive List CSS */
        .segment-trigger {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          cursor: pointer;
          user-select: none;
        }
        .segment-list {
          max-height: 2000px; /* Large enough to allow expansion */
          overflow: hidden; /* Prevents nested scrollbars */
          transition: max-height 0.4s ease-in-out, opacity 0.4s ease-in-out;
          padding-left: 8px;
        }
        .segment-list.collapsed {
          max-height: 0;
          opacity: 0;
        }
        .segment-list.expanded {
          opacity: 1;
        }
        .competitor-list-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          cursor: pointer;
          border-radius: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.03);
          transition: background-color 0.15s;
        }
        .competitor-list-item:hover {
          background-color: rgba(254, 80, 0, 0.04);
        }
        
        /* Custom scrollbar for segment list container */
        .market-segment-container::-webkit-scrollbar {
          width: 4px;
        }
        .market-segment-container::-webkit-scrollbar-track {
          background: transparent;
        }
        .market-segment-container::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 4px;
        }

        /* Fixed Height Constraint for the Promo Tray */
        .popup-promotions-scroll-track {
          max-height: 180px; 
          overflow-y: auto;  
          padding-right: 4px;
        }

        /* Custom Minimalist Scrollbar to preserve premium look */
        .popup-promotions-scroll-track::-webkit-scrollbar {
          width: 4px;
        }
        .popup-promotions-scroll-track::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.02);
        }
        .popup-promotions-scroll-track::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.1);
          border-radius: 10px;
        }

        /* Core Popup Card Overrides */
        .premium-popup-inner {
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }

        .popup-restaurant-title {
          font-size: 14px;
          font-weight: 700;
          color: #1a1a1a;
          margin: 0 0 2px 0;
        }

        .popup-section-subtitle {
          font-size: 10px;
          font-weight: 700;
          color: #8c8c8c;
          letter-spacing: 0.05em;
          display: block;
          margin-bottom: 8px;
        }

        /* Consolidated Streamlined Promo Line */
        .popup-single-promo-line {
          display: flex;
          align-items: center;         /* Perfectly vertical-centers items on the axis */
          justify-content: space-between; 
          gap: 16px;                   /* Ensures a safe gap between text and platform badge */
          padding: 10px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.04);
        }

        .popup-promo-left-block {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;                /* Allows text truncate rules to safety-lock layout width */
        }

        /* Premium Micro Image Token */
        .popup-promo-micro-img-container {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          object-fit: cover;
          background-color: #f5f5f3;
        }

        .popup-promo-text-block {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }

        .popup-promo-type {
          font-size: 11px;
          font-weight: 600;
          color: #262626;
          margin-bottom: 1px;
        }

        .popup-promo-desc {
          font-size: 10.5px;
          color: #666666;
          line-height: 1.3;
        }

        /* Premium Seamless Platform Badges */
        .popup-platform-badge {
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          
          /* CRITICAL: Layout Lock Guardrails */
          white-space: nowrap;         /* Guarantees text never breaks into two lines */
          flex-shrink: 0;              /* Prevents the left side text from crushing the badge */
          
          /* Blending & Geometry */
          padding: 4px 8px;
          border-radius: 4px;
          border: none !important;     /* Erases any legacy outline/border strokes */
          box-shadow: none !important;
        }

        /* Color Palette Refinement: Matte Tones instead of Loud Highlights */
        .popup-platform-badge.deliveroo { 
          background: rgba(0, 205, 188, 0.04) !important; 
          color: #008A7E !important; 
        }

        .popup-platform-badge.uber-eats { 
          background: rgba(6, 193, 103, 0.04) !important; 
          color: #04783F !important; 
        }

        .popup-platform-badge.just-eat { 
          background: rgba(254, 80, 0, 0.04) !important; 
          color: #C73E00 !important; 
        }
      `}</style>
    </div>
  );
};

export default DeliveryShadowModal;
