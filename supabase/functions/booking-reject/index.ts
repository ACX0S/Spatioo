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
      .select('*, estacionamento:estacionamento_id(user_id)')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError
    if (booking.estacionamento.user_id !== user.id) {
      throw new Error('Você não tem permissão para rejeitar esta reserva')
    }

    // Atualizar booking
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update({
        status: 'rejeitada',
        rejected_at: new Date().toISOString(),
      })
      .eq('id', bookingId)

    if (updateError) throw updateError

    // Liberar vaga
    const { error: vagaError } = await supabaseClient
      .from('vagas')
      .update({ 
        status: 'disponivel',
        booking_id: null,
        user_id: null 
      })
      .eq('numero_vaga', booking.spot_number)
      .eq('estacionamento_id', booking.estacionamento_id)

    if (vagaError) throw vagaError

    // Criar notificação para o usuário
    await supabaseClient
      .from('notifications')
      .insert({
        user_id: booking.user_id,
        type: 'booking_rejected',
        title: 'Reserva não aceita',
        message: 'Infelizmente sua solicitação de reserva não foi aceita pelo estacionamento.',
        booking_id: bookingId,
        estacionamento_id: booking.estacionamento_id,
      })

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in booking-reject:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})