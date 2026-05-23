const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const defaultCategories = [
  { key: "silk-sarees", value: "Silk Sarees", image_url: "/images/products/saree-2.jpg", sort_order: 1 },
  { key: "banarasi-sarees", value: "Banarasi Sarees", image_url: "/images/products/saree-3.jpg", sort_order: 2 },
  { key: "cotton-sarees", value: "Cotton Sarees", image_url: "/images/products/saree-4.jpg", sort_order: 3 },
  { key: "designer-sarees", value: "Designer Sarees", image_url: "/images/products/saree-5.jpg", sort_order: 4 },
  { key: "bridal-sarees", value: "Bridal Sarees", image_url: "/images/products/saree-6.jpg", sort_order: 5 },
  { key: "casual-wear", value: "Casual Wear", image_url: "/images/products/saree-7.jpg", sort_order: 6 },
];

async function run() {
  console.log("Attempting to upsert categories...");
  for (const cat of defaultCategories) {
    const { data, error } = await supabase.from("homepage_content").upsert(
      { section: "category", key: cat.key, value: cat.value, image_url: cat.image_url, sort_order: cat.sort_order },
      { onConflict: "section,key" }
    ).select();

    if (error) {
      console.error(`Error upserting ${cat.key}:`, error);
    } else {
      console.log(`Success upserting ${cat.key}:`, data);
    }
  }
}
run();
