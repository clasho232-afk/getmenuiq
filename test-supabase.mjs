import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rzcogmvdnqbcoxxsikuf.supabase.co';
const supabaseKey = 'sb_publishable_MHsBtDEyQnUu4aml-nxvWQ_1YmCDY7m';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: menuData, error: menuErr } = await supabase.from('menu_items').select('*').limit(1);
  console.log("menu_items:", Object.keys(menuData?.[0] || {}));
  
  const { data: restData, error: restErr } = await supabase.from('restaurants').select('*').limit(1);
  console.log("restaurants:", Object.keys(restData?.[0] || {}));
}

test();
