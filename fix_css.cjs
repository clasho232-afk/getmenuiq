const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');
const lines = css.split('\n');
const goodLines = lines.slice(0, 575);

const newCss = `
/* ========================================================
   COMPETITOR WORKSPACE PINS & ANIMATIONS
   ======================================================== */

/* Custom CSS Reset for Leaflet's HTML Icon Containers */
.custom-owner-banner-wrapper, 
.custom-leaflet-banner-container {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  padding: 0 !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* Elegant, Rounded Banner Structure */
.map-inline-banner {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 5px 10px 5px 8px;
  border-radius: 30px;
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  white-space: nowrap;
}

/* Branded Owner Pin Variant Styling */
.map-inline-banner.owner-pin-base {
  border: 1.5px solid #FE5000 !important;
  box-shadow: 0 4px 14px rgba(254, 80, 0, 0.15);
}

.owner-title-text {
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 11px;
  font-weight: 700;
  color: #FE5000;
  letter-spacing: -0.01em;
}

/* Concentric Orange Pulse Core Dot */
.owner-core-pulse {
  width: 6px;
  height: 6px;
  background-color: #FE5000;
  border-radius: 50%;
  position: relative;
}
.owner-core-pulse::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: #FE5000;
  border-radius: 50%;
  animation: coreTargetPulse 2s infinite ease-out;
}

@keyframes coreTargetPulse {
  0% { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(3.5); opacity: 0; }
}

/* ========================================================
   UNIFIED COMPETITOR WORKSPACE PROGRESSIVE DISCLOSURE
   ======================================================== */

/* SPECIFIC MACRO STATE: CONDENSE TEXT PILLS INTO ORANGE DOTS */
.macro-zoom-active .custom-leaflet-banner-container .map-inline-banner {
  width: 10px !important;
  height: 10px !important;
  min-width: 10px !important;
  max-width: 10px !important;
  padding: 0 !important;
  border-radius: 50% !important;
  background-color: #FE5000 !important; /* Uniform brand orange dot indicator */
  border: 1.5px solid #ffffff !important;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18) !important;
}

/* Hide avatars, names, and status dots globally when zoomed out out */
.macro-zoom-active .custom-leaflet-banner-container .banner-avatar,
.macro-zoom-active .custom-leaflet-banner-container .banner-name,
.macro-zoom-active .custom-leaflet-banner-container .banner-status-dot {
  display: none !important;
  opacity: 0 !important;
  width: 0 !important;
}

/* HOME BASE ALIGNMENT: SEPARATE THE PRIMARY SHOP PIN FROM TEXT NESTS */
.owner-pin-dot {
  width: 12px;
  height: 12px;
  background-color: #28a745; /* Clean green identifies home instantly on the macro view */
  border: 2px solid #ffffff;
  border-radius: 50%;
  box-shadow: 0 0 0 4px rgba(40, 167, 69, 0.25), 0 4px 10px rgba(0, 0, 0, 0.15);
  display: block;
}

/* Update home base pin back to a signature brand orange target ring when zoomed in tightly */
.leaflet-container:not(.macro-zoom-active) .custom-owner-banner-wrapper .owner-pin-dot {
  background-color: #FE5000;
  box-shadow: 0 0 0 4px rgba(254, 80, 0, 0.25), 0 4px 10px rgba(0, 0, 0, 0.15);
}
`;

fs.writeFileSync('src/index.css', goodLines.join('\n') + newCss, 'utf8');
