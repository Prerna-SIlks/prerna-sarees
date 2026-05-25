const { createClient } = require('@supabase/supabase-js');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

async function run() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
    
    const { data: products, error } = await supabase
      .from('products')
      .select('id, name, price, category, fabric, color, description')
      .order('created_at', { ascending: false });

    if (error) {
       console.error("Supabase Error:", error);
       return;
    }

    const productsContext = products?.map(p => 
      `ID:${p.id} | ${p.name} | ₹${p.price} | ${p.category} | ${p.fabric} | Color:${p.color || 'Assorted'}`
    ).join('\n') || '';

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: 'You are Prerna...'
    });

    const chat = model.startChat({ history: [] });
    const result = await chat.sendMessage("I want a wedding saree");
    console.log("Response:", result.response.text());
  } catch (e) {
    console.error("ERROR:", e);
  }
}
run();
