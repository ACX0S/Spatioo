import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) {
      throw new Error('Não autorizado')
    }

    const { bookingId } = await req.json()

    // Verificar se o usuário é dono do estacionamento
    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*, estacionamento:estacionamento_id(user_id, id)')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError
    if (booking.estacionamento.user_id !== user.id) {
      throw new Error('Você não tem permissão para aceitar esta reserva')
    }

    // Verificar se ainda está aguardando confirmação
    if (booking.status !== 'aguardando_confirmacao') {
      throw new Error('Esta reserva não está mais disponível')
    }

    // Verificar se não expirou
    if (booking.expires_at && new Date(booking.expires_at) < new Date()) {
      throw new Error('Esta solicitação expirou')
    }

    // Atualizar booking e vaga em transação
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        status: 'reservada',
        accepted_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) throw updateError

    // Atualizar status da vaga
    const { error: vagaError } = await supabaseClient
      .from('vagas')
      .update({ status: 'reservada' })
      .eq('numero_vaga', booking.spot_number)
      .eq('estacionamento_id', booking.estacionamento_id)

    if (vagaError) throw vagaError

    // Criar notificação para o usuário
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: booking.user_id,
        type: 'booking_accepted',
        title: 'Reserva confirmada!',
        message: 'Sua reserva foi aceita pelo estacionamento. Você pode visualizar a rota na página Explorar.',
        booking_id: bookingId,
        estacionamento_id: booking.estacionamento_id,
      })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in booking-accept:', error)
    return new Response(
      JSON.stringify({ error: (error instanceof Error) ? error.message : String(error) }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})