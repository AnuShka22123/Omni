# Micro Decision - ₹5 Verdict App

A minimal, production-ready web application that helps users make small personal decisions by providing a clear, confident verdict for ₹5.

## Features

- **Dark, minimal UI** - Mystical, calming interface
- **Three decision types**: YES/NO, THIS/THAT, NOW/LATER
- **Razorpay integration** - UPI-focused micro-payments
- **Mobile-first design** - Optimized for all devices
- **No authentication** - Simple, frictionless flow

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Fill in your credentials:
- `RAZORPAY_KEY_ID` - Your Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Your Razorpay Key Secret
- `NEXT_PUBLIC_RAZORPAY_KEY_ID` - Same as RAZORPAY_KEY_ID (for client-side)
- `OPENAI_API_KEY` - Your OpenAI API key for AI-generated verdicts

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The app is ready for production deployment.

## User Flow

1. **Homepage** - Simple CTA to get started
2. **Select Type** - Choose decision type (YES/NO, THIS/THAT, NOW/LATER)
3. **Input** - Describe situation and accept outcome
4. **Payment** - Pay ₹5 via Razorpay
5. **Loading** - Ritual screen with sequential messages
6. **Verdict** - Receive clear, confident verdict

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Razorpay** - Payment gateway
- **OpenAI** - AI-powered verdict generation
- **Vercel** - Deployment platform

## Notes

- No user authentication or accounts
- No data persistence (stateless)
- AI-powered verdicts using OpenAI GPT-4o-mini
- Fallback to deterministic logic if AI is unavailable
- Mobile-first, responsive design

