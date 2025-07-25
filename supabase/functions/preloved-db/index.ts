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

    switch (operation) {
      case 'create_shoe': {
        const { brand, model, size, sizeUnit, condition, rating, photoUrl, userId } = data
        
        const { data: result, error } = await supabaseAdmin
          .from('preloved.shoes')
          .insert({
            brand,
            model: model || null,
            size,
            size_unit: sizeUnit,
            condition,
            rating,
            photo_url: photoUrl,
            sole_photo_url: photoUrl,
            user_id: userId || null
          })
          .select('id')
          .single()

        if (error) throw error
        return new Response(JSON.stringify({ shoeId: result.id }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_qr_code': {
        const { shoeId, qrCodeDataURL } = data
        
        const { data: result, error } = await supabaseAdmin
          .from('preloved.shoes')
          .update({ qr_code: qrCodeDataURL })
          .eq('id', shoeId)
          .select('id, qr_code')
          .single()

        if (error) throw error
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_shoe_count': {
        const { count, error } = await supabaseAdmin
          .from('preloved.shoes')
          .select('*', { count: 'exact', head: true })

        if (error) throw error
        return new Response(JSON.stringify({ count: count || 0 }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'check_shoe_exists': {
        const { shoeId } = data
        
        const { data: result, error } = await supabaseAdmin
          .from('preloved.shoes')
          .select('id')
          .eq('id', shoeId)
          .maybeSingle()

        if (error) throw error
        return new Response(JSON.stringify({ exists: !!result }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})