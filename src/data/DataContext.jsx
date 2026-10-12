import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabase';

const DataContext = createContext();

export function DataProvider({ children }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        // Fetch restaurants and menu items
        const { data: restaurantsData, error: restsError } = await supabase
          .from('restaurants')
          .select('*');
        
        if (restsError) throw restsError;

        const { data: menuItemsData, error: itemsError } = await supabase
          .from('menu_items')
          .select('*');

        if (itemsError) throw itemsError;

        // Group platforms for the same restaurant name
        const restaurantMap = new Map();

        restaurantsData.forEach(r => {
          const normName = r.name.toLowerCase().trim();
          if (!restaurantMap.has(normName)) {
            restaurantMap.set(normName, {
              id: r.id || normName,
              name: r.name,
              category: 'Restaurant',
              cuisine: (r.cuisines && r.cuisines.length > 0) ? r.cuisines[0] : 'Restaurant',
              location: r.city || 'London',
              postcodes: r.areas || [],
              image: r.hero_image_url || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
              deliveryPlatforms: new Set(),
              _restaurantIds: new Set(), // store all IDs related to this name to map menu items
              topDishes: [],
              promos: []
            });
          }
          const merged = restaurantMap.get(normName);
          if (r.platform) merged.deliveryPlatforms.add(r.platform.toLowerCase() === 'ubereats' ? 'UberEats' : r.platform.toLowerCase() === 'deliveroo' ? 'Deliveroo' : 'JustEat');
          merged._restaurantIds.add(r.id);
        });

        // Map menu items
        const menuItemsByRestId = new Map();
        menuItemsData.forEach(item => {
          if (!menuItemsByRestId.has(item.restaurant_id)) {
            menuItemsByRestId.set(item.restaurant_id, []);
          }
          menuItemsByRestId.get(item.restaurant_id).push(item);
        });

        const transformedData = Array.from(restaurantMap.values()).map((rest, index) => {
          rest.deliveryPlatforms = Array.from(rest.deliveryPlatforms);
          if (rest.deliveryPlatforms.length === 0) rest.deliveryPlatforms = ['UberEats'];
          
          let allDishes = [];
          rest._restaurantIds.forEach(id => {
            if (menuItemsByRestId.has(id)) {
              allDishes = allDishes.concat(menuItemsByRestId.get(id));
            }
          });

          const uniqueDishes = [];
          const dishNames = new Set();
          for (const d of allDishes) {
            if (!dishNames.has(d.name)) {
              dishNames.add(d.name);
              uniqueDishes.push({
                id: d.uuid || String(Math.random()),
                name: d.name,
                price: d.currency === 'GBP' ? `£${d.price}` : `$${d.price}`,
                image: d.image_url || 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=200&q=80',
                description: d.description,
                section_name: d.section_name
              });
            }
          }

          rest.topDishes = uniqueDishes.slice(0, 15);
          rest.allDishes = uniqueDishes;
          
          if (index % 3 === 0) {
            rest.promos = [
              { id: 201 + index, title: 'Buy 1 Get 1 Free', type: 'Offer', description: 'Selected items', image: rest.image }
            ];
          }

          delete rest._restaurantIds;
          return rest;
        });

        setData(transformedData);
        setError(null);
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return (
    <DataContext.Provider value={{ data, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  return useContext(DataContext);
}
