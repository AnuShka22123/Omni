import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
})

export async function POST(request: NextRequest) {
  try {
    const { amount, type, input } = await request.json()

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
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

