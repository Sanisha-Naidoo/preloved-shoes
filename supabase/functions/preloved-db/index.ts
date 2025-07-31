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
    const { operation, data } = await req.json()
    
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log(`Processing operation: ${operation}`, data)

    switch (operation) {
      case 'create_shoe': {
        const { brand, model, size, sizeUnit, condition, rating, photoUrl, userId } = data
        
        // Use RPC call to preloved schema function
        const { data: result, error } = await supabaseAdmin
          .rpc('create_shoe', {
            p_brand: brand,
            p_model: model || null,
            p_size: size,
            p_size_unit: sizeUnit,
            p_condition: condition,
            p_rating: rating,
            p_photo_url: photoUrl,
            p_user_id: userId || null
          })

        if (error) {
          console.error('Create shoe error:', error)
          throw error
        }
        
        const shoeId = result
        console.log('Shoe created successfully:', shoeId)
        return new Response(JSON.stringify({ shoeId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_qr_code': {
        const { shoeId, qrCodeDataURL } = data
        
        const { data: result, error } = await supabaseAdmin
          .rpc('update_qr_code', {
            p_shoe_id: shoeId,
            p_qr_code: qrCodeDataURL
          })

        if (error) {
          console.error('Update QR code error:', error)
          throw error
        }
        
        const qrCode = result
        console.log('QR code updated successfully:', qrCode)
        return new Response(JSON.stringify({
          qr_code: qrCode
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_shoe_count': {
        console.log('Starting get_shoe_count operation...')
        
        // TEMPORARY: Test if the edge function itself works
        try {
          console.log('Testing hardcoded response first...')
          const response = { count: 23 }
          console.log('Sending hardcoded response:', response)
          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        } catch (err) {
          console.error('Even hardcoded response failed:', err)
          throw err
        }
        
        // TODO: Uncomment this once we confirm edge function works
        /*
        console.log('Calling get_shoe_count RPC function...')
        const { data: count, error } = await supabaseAdmin
          .rpc('get_shoe_count')

        console.log('RPC response:', { count, error })

        if (error) {
          console.error('Get shoe count error:', error)
          console.error('Error details:', JSON.stringify(error, null, 2))
          throw error
        }
        
        console.log('Shoe count retrieved successfully:', count)
        const response = { count: count || 0 }
        console.log('Sending response:', response)
        return new Response(JSON.stringify(response), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
        */
      }

      case 'check_shoe_exists': {
        const { shoeId } = data
        
        const { data: exists, error } = await supabaseAdmin
          .rpc('check_shoe_exists', {
            p_shoe_id: shoeId
          })

        if (error) {
          console.error('Check shoe exists error:', error)
          throw error
        }
        
        console.log('Shoe exists check:', exists)
        return new Response(JSON.stringify({ exists: exists || false }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})