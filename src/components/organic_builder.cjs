const fs = require('fs');

// Approximate relative positions for East London
const centroids = {
  "E1":  {x: 40, y: 70, type: "secured"},
  "E2":  {x: 50, y: 40, type: "secured"},
  "E8":  {x: 45, y: 15, type: "secured"},
  "E9":  {x: 75, y: 25, type: "secured"},
  "E3":  {x: 80, y: 55, type: "secured"},
  "E14": {x: 80, y: 100, type: "secured"},
  "SE16":{x: 50, y: 110, type: "secured"},
  
  "E5":  {x: 65, y: -5, type: "threat"},
  "E10": {x: 100, y: 20, type: "threat"},
  "Stratford": {x: 110, y: 50, type: "secured"},
  "E13": {x: 130, y: 70, type: "threat"},
  "E6":  {x: 150, y: 80, type: "threat"},
  "IG1": {x: 140, y: 30, type: "threat"},
};

// Generate points on a grid, assign to nearest centroid
const width = 200;
const height = 150;
const grid = [];
const spacing = 2;

for (let y = -20; y < height + 20; y += spacing) {
  for (let x = -20; x < width + 20; x += spacing) {
    let minDist = Infinity;
    let closest = null;
    for (const [name, c] of Object.entries(centroids)) {
      // Add some natural distortion so borders aren't perfectly straight
      const dx = x - c.x;
      const dy = y - c.y;
      // Irregularity: stretch x and y slightly based on sine waves
      const distortedX = dx + Math.sin(y * 0.1) * 5;
      const distortedY = dy + Math.cos(x * 0.1) * 5;
      
      const dist = distortedX*distortedX + distortedY*distortedY;
      if (dist < minDist) {
        minDist = dist;
        closest = name;
      }
    }
    
    // Only add if within a "landmass" shape (an organic blob)
    // Center is around 90, 50
    const cx = x - 90;
    const cy = y - 50;
    const r = Math.sqrt(cx*cx + cy*cy);
    const angle = Math.atan2(cy, cx);
    const maxR = 75 + Math.sin(angle * 3) * 15 + Math.cos(angle * 5) * 10;
    
    // Special carve out for Thames River
    let isLand = r < maxR;
    if (y > 90 && y < 95 && x > 30 && x < 120) {
       // Thames river cut
       isLand = false;
    }
    
    if (isLand) {
      grid.push({x, y, region: closest});
    }
  }
}

// Extract boundaries (Marching squares or simple edge detection)
// For simplicity, we will output SVG cells as small rects and group them,
// OR trace the perimeter. Since tracing is hard in a short script, 
// let's just generate a high-res SVG using small paths.
// Actually, generating paths is much better.

let svg = `<svg viewBox="-20 -20 220 170" width="100%" height="100%">\n`;

const colors = {
  "secured": "#D5CAB4",
  "threat": "#BC472A"
};

const regionsMap = {};
for(let g of grid) {
  if(!regionsMap[g.region]) regionsMap[g.region] = [];
  regionsMap[g.region].push(g);
}

// Let's create an SVG that uses pixel-like polygons but slightly blurred/smoothed via SVG filters,
// or we can just draw them. Since spacing is 2, we can draw a 2.5x2.5 rect for each point.
// To make it look like solid regions, we just group the rects.
// Wait, stroke="white" on borders is required!
// If we use rects, we won't get stroke on the borders.

// Let's trace boundaries correctly.
// A horizontal edge exists if cell(x, y) != cell(x, y+spacing)
const edges = [];
const getRegion = (x, y) => {
  const p = grid.find(g => Math.abs(g.x - x) < 0.1 && Math.abs(g.y - y) < 0.1);
  return p ? p.region : null;
};

for (let y = -20; y < height + 20; y += spacing) {
  for (let x = -20; x < width + 20; x += spacing) {
    const r1 = getRegion(x, y);
    const rRight = getRegion(x + spacing, y);
    const rDown = getRegion(x, y + spacing);
    
    if (r1 !== rRight && (r1 || rRight)) {
      // vertical boundary
      edges.push({x1: x + spacing/2, y1: y - spacing/2, x2: x + spacing/2, y2: y + spacing/2, r1, r2: rRight});
    }
    if (r1 !== rDown && (r1 || rDown)) {
      // horizontal boundary
      edges.push({x1: x - spacing/2, y1: y + spacing/2, x2: x + spacing/2, y2: y + spacing/2, r1, r2: rDown});
    }
  }
}

// Now we can just draw the regions by drawing all points as overlapping rects,
// and then overlaying the edges as white lines! This is genius and easy.

let rects = "";
for (let g of grid) {
  const type = centroids[g.region].type;
  const color = colors[type];
  rects += `<rect x="${g.x - spacing/2}" y="${g.y - spacing/2}" width="${spacing*1.5}" height="${spacing*1.5}" fill="${color}" />\n`;
}

let lines = "";
for (let e of edges) {
  lines += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="#FAF8F4" stroke-width="1.5" stroke-linecap="round" />\n`;
}

let labels = "";
for (const [name, c] of Object.entries(centroids)) {
  const type = c.type;
  const fill = type === 'secured' ? '#4B5563' : '#FFF';
  labels += `<text x="${c.x}" y="${c.y + 4}" fill="${fill}" font-size="8" font-family="sans-serif" font-weight="600" text-anchor="middle" letter-spacing="-0.02em">${name}</text>\n`;
}

svg += rects + lines + labels;
svg += `</svg>`;

// Now write this to TerritoryAlertCard.jsx
let jsx = fs.readFileSync('c:/Users/rasib/Desktop/MenuIQ/sugar_crm_dashboard/src/components/TerritoryAlertCard.jsx', 'utf8');

// Replace the entire SVG tag
jsx = jsx.replace(/<svg viewBox=[\s\S]*?<\/svg>/, svg);

fs.writeFileSync('c:/Users/rasib/Desktop/MenuIQ/sugar_crm_dashboard/src/components/TerritoryAlertCard.jsx', jsx);
console.log("SVG injected");
