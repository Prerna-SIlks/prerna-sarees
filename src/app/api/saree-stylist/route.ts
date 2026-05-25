import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const { message, conversationHistory } = await req.json()
    
    // Fetch products from database
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const { data: products } = await supabase
      .from('products')
      .select('id, title, price, category_id, fabric, color, description')
      .order('created_at', { ascending: false })
    
    // Build products context
    const productsContext = products?.map(p => 
      `ID:${p.id} | ${p.title} | ₹${p.price} | Category:${p.category_id} | ${p.fabric} | Color:${p.color || 'Assorted'}`
    ).join('\n') || ''
    
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    )
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      systemInstruction: `You are "Prerna", 
an expert AI Saree Stylist for Prerna Silks, 
a premium saree store in Hubli, Karnataka, India.

Your personality:
- Warm, helpful, knowledgeable about sarees
- Speak in a friendly, professional tone
- Use Indian cultural context naturally
- Address customer as "ji" occasionally
- Keep responses concise (max 3-4 lines)

Your job:
- Help customers find perfect sarees
- Suggest products based on their needs
- Answer questions about fabrics, occasions, care
- Guide them through the collection

Available Products in our store:
${productsContext}

When suggesting products:
- Suggest 2-3 most relevant products MAX
- Format EXACTLY like this for each product:
  🛍️ [Product Name] - ₹[Price]
  PRODUCT_LINK:/products/[ID]
- Always explain WHY you're suggesting it
- If budget mentioned, stay within budget

Rules:
- Only suggest products from the list above
- Never make up products
- If nothing matches, say so honestly
- Stay on topic (sarees, fashion, styling)
- If asked about delivery/orders, 
  direct to contact: +91 8660087544
- Shop location: Javali Sal, Hubli, Karnataka`
    })
    
    // Build conversation history for context
    const history = (conversationHistory || [])
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .slice(-6) // last 6 messages for context
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((msg: any) => ({
        role: msg.role,
        parts: [{ text: msg.content }]
      }))
    
    const chat = model.startChat({ history })
    
    const result = await chat.sendMessage(message)
    const response = await result.response
    const text = response.text()
    
    return NextResponse.json({ 
      success: true, 
      message: text 
    })
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch(err: any) {
    console.error('Chatbot error:', err)
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
