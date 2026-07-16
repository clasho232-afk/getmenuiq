import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env', 'utf-8');
let supabaseUrl, supabaseKey;
envFile.split('\n').forEach(line => {
  if (line.startsWith('VITE_SUPABASE_URL=')) supabaseUrl = line.split('=')[1].trim();
  if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) supabaseKey = line.split('=')[1].trim();
});

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data, error } = await supabase.from('restaurants').select('*').limit(5);
  console.log("restaurants:", error ? error.message : data.length + " rows");
  if (data && data[0]) console.log("restaurant keys:", Object.keys(data[0]));

  const { data: promos, error: errPromos } = await supabase.from('promos').select('*').limit(5);
  console.log("promos:", errPromos ? errPromos.message : (promos ? promos.length + " rows" : "null"));

  const { data: menu_items, error: errMenu } = await supabase.from('menu_items').select('*').limit(5);
  console.log("menu_items:", errMenu ? errMenu.message : (menu_items ? menu_items.length + " rows" : "null"));
}

checkTables();
