import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { imageBase64, mimeType } = await req.json()
    
    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY!
    )
    
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite'
    })
    
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType: mimeType || 'image/jpeg'
      }
    }
    
    const prompt = `This is a daily bill report 
from Prerna Sarees shop in Hubli, Karnataka.
Called "BILLWISE SALE REPORT".

Table columns:
BILNO | UDF | ITM | TAX | DISC | AMOUNT

Return ONLY this JSON, no explanation,
no markdown, no code blocks, just raw JSON:

{
  "date": "DD/MM/YY from bill",
  "time": "HH:MM from bill",
  "entries": [
    {
      "bill_no": "bill number as string",
      "tax": tax as number,
      "discount": 0,
      "amount": sale amount as number
    }
  ],
  "total_bills": count as integer,
  "total_tax": total tax as number,
  "total_amount": total amount as number
}

Rules:
- DISC "--" means 0
- Extract EVERY bill entry row
- Spaces in numbers like "1904. 77" = 1904.77
- Bill numbers are 4-5 digits
- ONLY return JSON nothing else`
    
    const result = await model.generateContent([
      prompt,
      imagePart
    ])
    
    const response = await result.response
    const text = response.text().trim()
    
    console.log('Gemini response:', text)
    
    const cleaned = text
      .replace(/```json/gi, '')
      .replace(/```/gi, '')
      .trim()
    
    const data = JSON.parse(cleaned)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fixNum = (n: any): number => {
      if (typeof n === 'string') {
        return parseFloat(
          n.toString().replace(/\s+/g, '')
        )
      }
      return Number(n) || 0
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.entries = (data.entries || []).map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (e: any) => ({
        bill_no: String(e.bill_no),
        tax: fixNum(e.tax),
        discount: fixNum(e.discount) || 0,
        amount: fixNum(e.amount)
      })
    )
    
    data.total_bills = data.entries.length
    data.total_tax = Math.round(
      data.entries.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, e: any) => sum + e.tax, 0
      ) * 100
    ) / 100
    data.total_amount = Math.round(
      data.entries.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, e: any) => sum + e.amount, 0
      ) * 100
    ) / 100
    
    return NextResponse.json({ 
      success: true, 
      data 
    })
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch(err: any) {
    console.error('Gemini extraction error:', err)
    
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Could not read bill. ' +
            'Please try with clearer photo.' 
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    )
  }
}
