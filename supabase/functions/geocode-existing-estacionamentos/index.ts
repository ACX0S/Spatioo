import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GeocodeResponse {
  lat: string;
  lon: string;
}

async function geocodeAddress(address: string): Promise<{latitude: number, longitude: number} | null> {
  try {
    const encodedAddress = encodeURIComponent(`${address}, Brasil`);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`
    );
    
    if (!response.ok) {
      throw new Error('Erro na requisição de geocodificação');
    }

    const data: GeocodeResponse[] = await response.json();
    
    if (data && data.length > 0) {
      return {
        latitude: parseFloat(data[0].lat),
        longitude: parseFloat(data[0].lon)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao geocodificar endereço:', error);
    return null;
  }
}

async function geocodeCep(cep: string): Promise<{latitude: number, longitude: number} | null> {
  try {
    // First get address from CEP using ViaCEP
    const cleanCep = cep.replace(/\D/g, '');
    const cepResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    const cepData = await cepResponse.json();

    if (cepData.erro) {
      console.error('CEP não encontrado:', cep);
      return null;
    }

    // Then geocode the address
    const fullAddress = `${cepData.logradouro}, ${cepData.bairro}, ${cepData.localidade}, ${cepData.uf}`;
    return await geocodeAddress(fullAddress);
  } catch (error) {
    console.error('Erro ao geocodificar CEP:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get all estacionamentos without coordinates
    const { data: estacionamentos, error: fetchError } = await supabaseClient
      .from('estacionamento')
      .select('*')
      .or('latitude.is.null,longitude.is.null')

    if (fetchError) {
      throw fetchError
    }

    console.log(`Found ${estacionamentos?.length || 0} estacionamentos to geocode`)

    let updatedCount = 0;
    let errorCount = 0;

    // Process each estacionamento
    for (const estacionamento of estacionamentos || []) {
      try {
        console.log(`Processing estacionamento: ${estacionamento.nome}`)
        
        // Try to geocode using CEP first, then fallback to address
        let coordinates = null;
        
        if (estacionamento.cep) {
          coordinates = await geocodeCep(estacionamento.cep);
        }
        
        if (!coordinates && estacionamento.endereco) {
          coordinates = await geocodeAddress(estacionamento.endereco);
        }

        if (coordinates) {
          const { error: updateError } = await supabaseClient
            .from('estacionamento')
            .update({
              latitude: coordinates.latitude,
              longitude: coordinates.longitude
            })
            .eq('id', estacionamento.id)

          if (updateError) {
            throw updateError
          }

          console.log(`Updated coordinates for: ${estacionamento.nome}`)
          updatedCount++
        } else {
          console.log(`Could not geocode: ${estacionamento.nome}`)
          errorCount++
        }

        // Add delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000))
        
      } catch (error) {
        console.error(`Error processing ${estacionamento.nome}:`, error)
        errorCount++
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Geocoding completed. Updated: ${updatedCount}, Errors: ${errorCount}`,
        updated: updatedCount,
        errors: errorCount
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})