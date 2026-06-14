const https = require('https');
const fs = require('fs');

const areas = [
  'Whitechapel, London',
  'Bethnal Green, London',
  'Bow, London',
  'Stratford, London',
  'Hackney, London',
  'Poplar, London',
  'Ilford, London',
  'East Ham, London',
  'Barking, London',
  'Walthamstow, London'
];

const results = [];
let completed = 0;

areas.forEach((area, index) => {
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(area)}&format=json&polygon_geojson=1&limit=1`;
  
  const options = {
    headers: {
      'User-Agent': 'MenuIQ-Dashboard-App/1.0 (contact@menuiq.com)'
    }
  };

  setTimeout(() => {
    https.get(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json && json.length > 0 && json[0].geojson) {
            let geojson = json[0].geojson;
            
            // Convert to Leaflet polygon format (array of [lat, lng])
            let coords = [];
            if (geojson.type === 'Polygon') {
               coords = geojson.coordinates[0].map(c => [c[1], c[0]]);
            } else if (geojson.type === 'MultiPolygon') {
               coords = geojson.coordinates[0][0].map(c => [c[1], c[0]]);
            }
            
            const name = area.split(',')[0];
            results.push({
              name: name,
              bounds: coords,
              // mock delivers vs not delivers
              delivers: index % 2 === 0
            });
            console.log(`Fetched ${name}`);
          } else {
            console.log(`No polygon found for ${area}`);
          }
        } catch (e) {
          console.error(`Error parsing ${area}`, e);
        }
        
        completed++;
        if (completed === areas.length) {
          fs.writeFileSync('c:/Users/rasib/Desktop/MenuIQ/sugar_crm_dashboard/src/components/east_london_areas.json', JSON.stringify(results, null, 2));
          console.log('Saved to east_london_areas.json');
        }
      });
    }).on('error', e => {
      console.error(e);
      completed++;
    });
  }, index * 1200); // 1.2s delay to respect Nominatim limits
});
