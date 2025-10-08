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

    const { bookingId, confirmedBy } = await req.json()

    const { data: booking, error: bookingError } = await supabaseClient
      .from('bookings')
      .select('*, estacionamento:estacionamento_id(user_id)')
      .eq('id', bookingId)
      .single()

    if (bookingError) throw bookingError

    const isOwner = booking.estacionamento.user_id === user.id
    const isUser = booking.user_id === user.id

    if (confirmedBy === 'owner' && !isOwner) {
      throw new Error('Apenas o dono pode confirmar')
    }
    if (confirmedBy === 'user' && !isUser) {
      throw new Error('Apenas o usuário pode confirmar')
    }

    const updateData: any = {}
    const now = new Date().toISOString()

    if (confirmedBy === 'owner') {
      updateData.departure_confirmed_by_owner_at = now
      
      // Criar notificação para o usuário
      await supabaseClient
        .from('notifications')
        .insert({
          user_id: booking.user_id,
          type: 'departure_confirmation',
          title: 'Confirme sua saída',
          message: 'O estacionamento confirmou sua saída. Por favor, confirme.',
          booking_id: bookingId,
        })
    } else {
      updateData.departure_confirmed_by_user_at = now
    }

    // Atualizar booking
    const { error: updateError } = await supabaseClient
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)

    if (updateError) throw updateError

    // Se ambos confirmaram, finalizar reserva
    const { data: updatedBooking } = await supabaseClient
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (updatedBooking?.departure_confirmed_by_owner_at && updatedBooking?.departure_confirmed_by_user_at) {
      await supabaseClient
        .from('bookings')
        .update({ 
          status: 'concluida',
          completed_at: now 
        })
        .eq('id', bookingId)

      await supabaseClient
        .from('vagas')
        .update({ 
          status: 'disponivel',
          booking_id: null,
          user_id: null
        })
        .eq('numero_vaga', booking.spot_number)
        .eq('estacionamento_id', booking.estacionamento_id)

      // Notificar ambos que a reserva foi concluída
      await supabaseClient
        .from('notifications')
        .insert([
          {
            user_id: booking.user_id,
            type: 'booking_completed',
            title: 'Reserva concluída',
            message: 'Sua reserva foi finalizada com sucesso. Obrigado por usar o Spatioo!',
            booking_id: bookingId,
          },
          {
            user_id: booking.estacionamento.user_id,
            type: 'booking_completed',
            title: 'Reserva concluída',
            message: 'A reserva foi finalizada com sucesso.',
            booking_id: bookingId,
          }
        ])
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error in booking-confirm-departure:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})