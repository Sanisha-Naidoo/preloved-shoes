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
        
        // Direct database operation using service role permissions
        const { data: result, error } = await supabaseAdmin
          .schema('preloved')
          .from('shoes')
          .insert({
            brand,
            model: model || null,
            size,
            size_unit: sizeUnit,
            condition,
            rating: rating?.toString() || null,
            photo_url: photoUrl,
            sole_photo_url: photoUrl,
            user_id: userId || null
          })
          .select('id')
          .single()

        if (error) {
          console.error('Create shoe error:', error)
          throw error
        }
        
        console.log('Shoe created successfully:', result)
        return new Response(JSON.stringify({ shoeId: result.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_qr_code': {
        const { shoeId, qrCodeDataURL } = data
        
        const { data: result, error } = await supabaseAdmin
          .schema('preloved')
          .from('shoes')
          .update({ qr_code: qrCodeDataURL })
          .eq('id', shoeId)
          .select('id, qr_code')
          .single()

        if (error) {
          console.error('Update QR code error:', error)
          throw error
        }
        
        console.log('QR code updated successfully:', result)
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_shoe_count': {
        const { count, error } = await supabaseAdmin
          .schema('preloved')
          .from('shoes')
          .select('*', { count: 'exact', head: true })

        if (error) {
          console.error('Get shoe count error:', error)
          throw error
        }
        
        console.log('Shoe count retrieved:', count)
        return new Response(JSON.stringify({ count: count || 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'check_shoe_exists': {
        const { shoeId } = data
        
        const { data: result, error } = await supabaseAdmin
          .schema('preloved')
          .from('shoes')
          .select('id')
          .eq('id', shoeId)
          .maybeSingle()

        if (error) {
          console.error('Check shoe exists error:', error)
          throw error
        }
        
        const exists = !!result
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