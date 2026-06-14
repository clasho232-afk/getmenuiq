import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const MOCK_PINS = Array.from({ length: 20 }).map((_, i) => {
  const angle = Math.random() * Math.PI * 2;
  const radiusMiles = 0.2 + Math.random() * 4.8; 
  const radiusDeg = radiusMiles / 69;
  return {
    id: i,
    lat: 51.5074 + radiusDeg * Math.cos(angle),
    lng: -0.1278 + (radiusDeg * Math.sin(angle)) / Math.cos(51.5074 * Math.PI / 180),
    name: `Competitor ${i + 1}`
  };
});

const CENTER = [51.5074, -0.1278]; // London
const MILE_IN_METERS = 1609.34;

const RadiusMapModal = ({ isOpen, onClose, initialRadiusStr, onApply }) => {
  const initialValue = initialRadiusStr ? parseFloat(initialRadiusStr.replace(/[^0-9.]/g, '')) || 3 : 3;
  const [radiusMiles, setRadiusMiles] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setRadiusMiles(initialValue);
    }
  }, [isOpen, initialValue]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(`Within ${radiusMiles.toFixed(1)} Miles`);
    onClose();
  };

  return (
    // Backdrop: fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Lufga', sans-serif"
    }}>
      {/* Modal Container: bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-2xl flex flex-col */}
      <div style={{
        backgroundColor: '#FFF',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '900px', // max-w-5xl equivalent
        display: 'flex',
        flexDirection: 'column',
        position: 'relative'
      }}>
        
        {/* Top Header inside Modal */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          padding: '1rem 1.5rem',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.9) 30%, rgba(255,255,255,0))',
          zIndex: 1000,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pointerEvents: 'none'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#111', pointerEvents: 'auto' }}>
            Adjust Search Radius
          </h2>
          <button 
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              backgroundColor: '#FFF', border: 'none',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', pointerEvents: 'auto'
            }}
          >
            <X size={16} color="#111" />
          </button>
        </div>

        {/* Modal Body: Map component (h-[500px] w-full) */}
        <div style={{ width: '100%', height: '500px', position: 'relative', backgroundColor: '#F3F4F6' }}>
          <MapContainer 
            center={CENTER} 
            zoom={12} 
            style={{ width: '100%', height: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
            
            <Circle 
              center={CENTER} 
              radius={radiusMiles * MILE_IN_METERS} 
              pathOptions={{ fillColor: '#E86A58', fillOpacity: 0.15, color: '#E86A58', weight: 2 }}
            />

            <CircleMarker 
              center={CENTER} 
              radius={8} 
              pathOptions={{ fillColor: '#111', fillOpacity: 1, color: '#FFF', weight: 3 }}
            >
              <Tooltip direction="top" offset={[0, -10]} opacity={1}>Your Location</Tooltip>
            </CircleMarker>

            {MOCK_PINS.map(pin => {
              const dLat = pin.lat - CENTER[0];
              const dLng = pin.lng - CENTER[1];
              const distanceDeg = Math.sqrt(dLat*dLat + Math.pow(dLng * Math.cos(51.5074 * Math.PI / 180), 2));
              const distanceMiles = distanceDeg * 69;
              const isInside = distanceMiles <= radiusMiles;

              return (
                <CircleMarker 
                  key={pin.id}
                  center={[pin.lat, pin.lng]} 
                  radius={isInside ? 6 : 4} 
                  pathOptions={{ 
                    fillColor: isInside ? '#F59E0B' : '#9CA3AF', 
                    fillOpacity: 0.8, 
                    color: '#FFF', 
                    weight: 2 
                  }}
                >
                  <Tooltip direction="top" offset={[0, -10]} opacity={1}>{pin.name}</Tooltip>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Modal Footer: p-6 flex items-center justify-between bg-gray-50 */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#F9FAFB', // Tailwind gray-50
          borderTop: '1px solid #E5E7EB'
        }}>
          {/* Left: Range Slider */}
          <div style={{ flex: 1, marginRight: '2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#4B5563' }}>Radius</span>
              <span style={{ fontSize: '1rem', fontWeight: 800, color: '#111' }}>{radiusMiles.toFixed(1)} Miles</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="5" 
              step="0.1" 
              value={radiusMiles} 
              onChange={(e) => setRadiusMiles(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: '#E86A58' }}
            />
          </div>
          
          {/* Right: Save Area Button bg-[#E86A58] text-white px-6 py-2 rounded-full font-bold hover:bg-[#D55A48] */}
          <button 
            onClick={handleApply}
            style={{
              backgroundColor: '#E86A58',
              color: '#FFF',
              padding: '0.5rem 1.5rem',
              borderRadius: '9999px',
              border: 'none',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#D55A48'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#E86A58'}
          >
            Save Area
          </button>
        </div>

      </div>
    </div>
  );
};

export default RadiusMapModal;
