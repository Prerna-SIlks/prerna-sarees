import { revalidatePath, } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    revalidatePath('/', 'layout')
    revalidatePath('/products', 'layout')
    revalidatePath('/products/[id]', 'page')
    return NextResponse.json({ 
      revalidated: true, 
      now: Date.now() 
    })
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error).message }, 
      { status: 500 }
    )
  }
}
