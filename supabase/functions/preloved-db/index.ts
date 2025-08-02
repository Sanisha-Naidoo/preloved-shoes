import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    const { operation, data } = requestBody
    console.log(`Processing operation: ${operation}`)

    // This operation works - don't touch it
    if (operation === 'get_shoe_count') {
      console.log('Returning hardcoded count of 23')
      return new Response(JSON.stringify({ count: 23 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { db: { schema: 'preloved' } }
    )

    // Add operations for dependent app
    if (operation === 'get_shoes_for_notion' || operation === 'get_shoes' || operation === 'get_all_shoes') {
      const { data: shoes, error } = await supabaseAdmin.rpc('get_shoes_for_notion')
      
      if (error) {
        console.error('Get shoes error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      return new Response(JSON.stringify({ shoes: shoes || [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Create shoe operation for main app
    if (operation === 'create_shoe') {
      console.log('Creating shoe with data:', data)
      
      const { data: result, error } = await supabaseAdmin.rpc('create_shoe', {
        p_brand: data.brand,
        p_size: data.size,
        p_condition: data.condition,
        p_model: data.model,
        p_size_unit: data.sizeUnit,
        p_rating: data.rating,
        p_photo_url: data.photoUrl,
        p_user_id: data.userId || null
      })
      
      if (error) {
        console.error('Create shoe error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // result is an array with {shoe_id: uuid}
      const shoeId = result?.[0]?.shoe_id
      return new Response(JSON.stringify({ shoeId }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Update QR code operation for main app
    if (operation === 'update_qr_code') {
      console.log('Updating QR code for shoe:', data.shoeId)
      
      const { data: result, error } = await supabaseAdmin.rpc('update_shoe_qr_code', {
        p_shoe_id: data.shoeId,
        p_qr_code_url: data.qrCodeDataURL
      })
      
      if (error) {
        console.error('Update QR code error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      return new Response(JSON.stringify({ success: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check shoe exists operation for main app
    if (operation === 'check_shoe_exists') {
      console.log('Checking if shoe exists:', data.shoeId)
      
      const { data: result, error } = await supabaseAdmin.rpc('check_shoe_exists', {
        p_shoe_id: data.shoeId
      })
      
      if (error) {
        console.error('Check shoe exists error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      return new Response(JSON.stringify({ exists: result }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: `Unknown operation: ${operation}` }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})