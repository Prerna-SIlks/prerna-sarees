require('dotenv').config({ path: '.env.local' });
require('ts-node').register({
  compilerOptions: {
    module: 'CommonJS'
  }
});
const { createClient } = require('@supabase/supabase-js');
const { MOCK_PRODUCTS } = require('../src/lib/data/mock-products');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function seed() {
  try {
    const mockProducts = MOCK_PRODUCTS;

    console.log(`Found ${mockProducts.length} mock products.`);

    // Fetch categories to map category_id
    const { data: categories, error: catError } = await supabase.from('categories').select('id, slug');
    if (catError) throw catError;
    
    const categoryMap = {};
    if (categories && categories.length > 0) {
      categories.forEach(c => {
        categoryMap[c.slug] = c.id;
      });
    }

    let insertedCount = 0;

    for (const product of mockProducts) {
      // Map category to category_id
      const categorySlug = product.category;
      let categoryId = categoryMap[categorySlug];
      
      if (!categoryId) {
        console.warn(`Category ${categorySlug} not found for product ${product.id}. Using default or skipping.`);
        const { data: newCat } = await supabase.from('categories').insert({
          name: product.category.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          slug: product.category,
        }).select('id').single();
        
        if (newCat) {
          categoryId = newCat.id;
          categoryMap[categorySlug] = categoryId;
        }
      }

      // Check if product exists
      const { data: existing } = await supabase.from('products').select('id').eq('title', product.title).maybeSingle();
      
      if (!existing) {
        const { error } = await supabase.from('products').insert({
          title: product.title,
          description: product.description,
          price: product.price,
          category_id: categoryId,
          type: product.type,
          occasion: product.occasion,
          fabric: product.fabric,
          image_urls: product.image_urls,
          stock: product.stock
        });

        if (error) {
          console.error(`Error inserting ${product.title}:`, error);
        } else {
          insertedCount++;
        }
      }
    }

    console.log(`Seeding complete. Inserted ${insertedCount} new products.`);
  } catch (err) {
    console.error("Seeding failed:", err);
  }
}

seed();
