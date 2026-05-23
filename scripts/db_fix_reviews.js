import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load env from project root
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Service Role Key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const runMigration = async () => {
  try {
    console.log("Deleting all existing reviews...");
    
    // We can delete all rows using REST API by specifying a condition that is always true or just not equal to a dummy value
    const { data, error } = await supabase
      .from('reviews')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // delete everything

    if (error) {
      console.error("Error deleting reviews:", error);
    } else {
      console.log("Successfully cleared reviews table.");
    }

    console.log(`
======================================================
IMPORTANT: You MUST run the following SQL in your 
Supabase Dashboard SQL Editor to complete the setup:
======================================================

-- Add unique constraint
ALTER TABLE public.reviews
  DROP CONSTRAINT IF EXISTS reviews_user_product_unique;
ALTER TABLE public.reviews
  ADD CONSTRAINT reviews_user_product_unique
  UNIQUE (user_id, product_id);

-- Disable RLS on reviews
ALTER TABLE public.reviews 
  DISABLE ROW LEVEL SECURITY;
======================================================
    `);
  } catch(e) {
    console.error(e);
  }
};

runMigration();
