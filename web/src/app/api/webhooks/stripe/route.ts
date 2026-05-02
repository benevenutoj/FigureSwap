import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' }) 
  : null

// Usamos a chave SERVICE_ROLE para poder atualizar o banco sem o token de sessão do usuário (já que é um webhook rodando em background)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(req: Request) {
  if (!stripe) return new NextResponse('Stripe disabled', { status: 200 })

  const body = await req.text()
  const sig = req.headers.get('stripe-signature') as string

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { userId, productId, productType, creditsAmount } = session.metadata || {}

    if (userId && productId) {
      // 1. Atualizar o status da compra no histórico
      await supabase
        .from('purchases')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('stripe_session_id', session.id)

      // 2. Entregar o produto
      if (productType === 'credits') {
        // Busca os créditos atuais e soma os novos
        const { data: profile } = await supabase.from('profiles').select('credits').eq('id', userId).single()
        const newCredits = (profile?.credits || 0) + parseInt(creditsAmount || '0')
        await supabase.from('profiles').update({ credits: newCredits }).eq('id', userId)
      } else if (productType === 'subscription') {
        // Ativa a flag de premium
        await supabase.from('profiles').update({ is_premium: true }).eq('id', userId)
      }
    }
  }

  return new NextResponse('OK', { status: 200 })
}
