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
          .rpc('preloved.create_shoe', {
            brand_param: brand,
            size_param: size,
            condition_param: condition,
            model_param: model || null,
            size_unit_param: sizeUnit,
            rating_param: rating,
            photo_url_param: photoUrl,
            user_id_param: userId || null
          })

        if (error) {
          console.error('Create shoe error:', error)
          throw error
        }
        
        const shoeId = result?.[0]?.shoe_id
        console.log('Shoe created successfully:', shoeId)
        return new Response(JSON.stringify({ shoeId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_qr_code': {
        const { shoeId, qrCodeDataURL } = data
        
        const { data: result, error } = await supabaseAdmin
          .rpc('preloved.update_qr_code', {
            shoe_id_param: shoeId,
            qr_code_data_url_param: qrCodeDataURL
          })

        if (error) {
          console.error('Update QR code error:', error)
          throw error
        }
        
        const qrCode = result?.[0]?.qr_code
        console.log('QR code updated successfully:', qrCode)
        return new Response(JSON.stringify({
          qr_code: qrCode
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_shoe_count': {
        const { data: result, error } = await supabaseAdmin
          .rpc('preloved.get_shoe_count')

        if (error) {
          console.error('Get shoe count error:', error)
          throw error
        }
        
        const count = result || 0
        console.log('Shoe count retrieved:', count)
        return new Response(JSON.stringify({ count }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'check_shoe_exists': {
        const { shoeId } = data
        
        const { data: result, error } = await supabaseAdmin
          .rpc('preloved.check_shoe_exists', {
            shoe_id_param: shoeId
          })

        if (error) {
          console.error('Check shoe exists error:', error)
          throw error
        }
        
        const exists = result?.[0]?.shoe_exists || false
        console.log('Shoe exists check:', exists)
        return new Response(JSON.stringify({ exists }), {
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