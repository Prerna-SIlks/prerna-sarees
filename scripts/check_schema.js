import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const checkSchema = async () => {
  // Query 1 row to see fields, or just use PostgREST schema endpoint
  const { data, error } = await supabase.from('reviews').select('*').limit(1);
  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Columns:", Object.keys(data[0] || {}));
  }
};
checkSchema();
