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
        
        // Use direct SQL query to insert into preloved.shoes table
        const { data: result, error } = await supabaseAdmin
          .from('preloved.shoes')
          .insert({
            brand: brand,
            model: model || null,
            size: size,
            size_unit: sizeUnit,
            condition: condition,
            rating: rating,
            photo_url: photoUrl,
            user_id: userId || null
          })
          .select('id')

        if (error) {
          console.error('Create shoe error:', error)
          throw error
        }
        
        const shoeId = result?.[0]?.id
        console.log('Shoe created successfully:', shoeId)
        return new Response(JSON.stringify({ shoeId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_qr_code': {
        const { shoeId, qrCodeDataURL } = data
        
        const { data: result, error } = await supabaseAdmin
          .from('preloved.shoes')
          .update({ qr_code: qrCodeDataURL })
          .eq('id', shoeId)
          .select('qr_code')

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
        // Use direct SQL query to access preloved schema
        const { data: result, error } = await supabaseAdmin
          .rpc('', { query: 'SELECT COUNT(*) as count FROM preloved.shoes' })

        if (error) {
          console.error('Get shoe count error:', error)
          throw error
        }
        
        const count = result?.[0]?.count || 0
        console.log('Shoe count retrieved:', count)
        return new Response(JSON.stringify({ count }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'check_shoe_exists': {
        const { shoeId } = data
        
        const { data: result, error } = await supabaseAdmin
          .from('preloved.shoes')
          .select('id')
          .eq('id', shoeId)
          .limit(1)

        if (error) {
          console.error('Check shoe exists error:', error)
          throw error
        }
        
        const exists = result && result.length > 0
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