'use client'
// Wait, actions must be 'use server' if they are server actions.

'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Stripe from 'stripe'

// We initialize Stripe here. In production, NEXT_PUBLIC_STRIPE_SECRET_KEY should exist.
// We use a fallback so it doesn't crash if the user hasn't set it yet.
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' }) 
  : null

export async function createCheckoutSession(formData: FormData) {
  const productId = formData.get('productId') as string
  if (!productId) throw new Error('Product not found')

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: product } = await supabase
    .from('store_products')
    .select('*')
    .eq('id', productId)
    .single()

  if (!product) throw new Error('Product not found in database')

  if (!stripe) {
    console.warn("Stripe Secret Key not configured. Creating dummy pending purchase for testing.")
    // If no stripe, just create a dummy purchase and redirect to success
    await supabase.from('purchases').insert({
      user_id: user.id,
      product_id: product.id,
      stripe_session_id: 'dummy_sess_' + Math.random().toString(36).substring(7),
      status: 'completed', // auto complete for local testing if no stripe
      amount_total: product.price_brl
    })

    // Auto fulfill for dummy
    if (product.product_type === 'credits') {
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
      await supabase.from('profiles').update({ credits: (profile?.credits || 0) + product.credits_amount }).eq('id', user.id)
    } else {
      await supabase.from('profiles').update({ is_premium: true }).eq('id', user.id)
    }
    
    redirect('/store?success=true')
  }

  // Create Stripe Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'pix'], // Stripe BR allows Pix
    mode: product.product_type === 'subscription' ? 'subscription' : 'payment',
    line_items: [
      {
        price: product.stripe_price_id,
        quantity: 1,
      },
    ],
    client_reference_id: user.id,
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/store?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/store?canceled=true`,
    metadata: {
      productId: product.id,
      userId: user.id,
      productType: product.product_type,
      creditsAmount: product.credits_amount
    }
  })

  // Insert pending purchase
  await supabase.from('purchases').insert({
    user_id: user.id,
    product_id: product.id,
    stripe_session_id: session.id,
    status: 'pending',
    amount_total: product.price_brl
  })

  // Redirect to Stripe
  if (session.url) {
    redirect(session.url)
  } else {
    throw new Error('Failed to create Stripe session')
  }
}
