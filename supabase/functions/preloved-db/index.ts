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
        
        // Use direct SQL query to preloved.shoes table
        const { data: result, error } = await supabaseAdmin.rpc('exec_sql', {
          query: `
            INSERT INTO preloved.shoes (brand, model, size, size_unit, condition, rating, photo_url, sole_photo_url, user_id)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING id
          `,
          params: [
            brand,
            model || null,
            size,
            sizeUnit,
            condition,
            rating?.toString() || null,
            photoUrl,
            photoUrl,
            userId || null
          ]
        })

        if (error) {
          console.error('Create shoe error:', error)
          throw error
        }
        
        const shoeId = result?.[0]?.id
        if (!shoeId) {
          throw new Error('Failed to create shoe record')
        }
        
        console.log('Shoe created successfully:', shoeId)
        return new Response(JSON.stringify({ shoeId }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'update_qr_code': {
        const { shoeId, qrCodeDataURL } = data
        
        const { data: result, error } = await supabaseAdmin.rpc('exec_sql', {
          query: `
            UPDATE preloved.shoes 
            SET qr_code = $1 
            WHERE id = $2
            RETURNING id, qr_code
          `,
          params: [qrCodeDataURL, shoeId]
        })

        if (error) {
          console.error('Update QR code error:', error)
          throw error
        }
        
        if (!result || result.length === 0) {
          throw new Error('No shoe found with the given ID')
        }
        
        console.log('QR code updated successfully:', result[0])
        return new Response(JSON.stringify(result[0]), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      case 'get_shoe_count': {
        const { data: result, error } = await supabaseAdmin.rpc('exec_sql', {
          query: 'SELECT COUNT(*) as count FROM preloved.shoes',
          params: []
        })

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
        
        const { data: result, error } = await supabaseAdmin.rpc('exec_sql', {
          query: 'SELECT EXISTS(SELECT 1 FROM preloved.shoes WHERE id = $1) as exists',
          params: [shoeId]
        })

        if (error) {
          console.error('Check shoe exists error:', error)
          throw error
        }
        
        const exists = result?.[0]?.exists || false
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