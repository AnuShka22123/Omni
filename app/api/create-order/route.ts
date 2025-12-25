import { NextRequest, NextResponse } from 'next/server'

// Force dynamic rendering to prevent build-time evaluation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const { amount, type, input } = await request.json()

    // Dynamic import only at runtime - never during build
    const { createRazorpayInstance } = await import('@/lib/razorpay')
    const razorpay = await createRazorpayInstance()

    const options = {
      amount: amount, // amount in paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        type,
        input: input.substring(0, 100), // Store first 100 chars
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      orderId: order.id,
    })
  } catch (error: any) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create order' },
      { status: 500 }
    )
  }
}

