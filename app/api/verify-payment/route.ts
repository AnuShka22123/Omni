import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json()

    const secret = process.env.RAZORPAY_KEY_SECRET || ''
    const text = `${razorpay_order_id}|${razorpay_payment_id}`
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(text)
      .digest('hex')

    if (generated_signature === razorpay_signature) {
      return NextResponse.json({ verified: true })
    } else {
      return NextResponse.json({ verified: false }, { status: 400 })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    )
  }
}

