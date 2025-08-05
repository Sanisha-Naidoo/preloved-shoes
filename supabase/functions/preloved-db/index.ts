import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Extract client IP from request headers
function getClientIP(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  const realIP = req.headers.get('x-real-ip');
  const cfIP = req.headers.get('cf-connecting-ip');
  
  // Use the first available IP, prioritizing Cloudflare and proxy headers
  const ip = cfIP || realIP || forwarded?.split(',')[0] || '127.0.0.1';
  return ip.trim();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestBody = await req.json()
    const { operation, data } = requestBody
    console.log(`Processing operation: ${operation}`)

    // Extract client IP for rate limiting and logging
    const clientIP = getClientIP(req);

    // Get real shoe count from database
    if (operation === 'get_shoe_count') {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
        { db: { schema: 'preloved' } }
      )
      
      const { data, error } = await supabaseAdmin.rpc('get_shoe_count')
      
      if (error) {
        console.error('Error getting shoe count:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      console.log('Returning real shoe count:', data)
      return new Response(JSON.stringify({ count: data || 0 }), {
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
      
      // Check rate limit for anonymous users
      if (!data.userId) {
        console.log(`Checking rate limit for IP: ${clientIP}`)
        
        const { data: rateLimitOk, error: rateLimitError } = await supabaseAdmin.rpc('check_submission_rate_limit', {
          client_ip: clientIP
        })
        
        if (rateLimitError) {
          console.error('Rate limit check failed:', rateLimitError)
          return new Response(JSON.stringify({ 
            error: 'Rate limit check failed' 
          }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        if (!rateLimitOk) {
          console.log(`Rate limit exceeded for IP: ${clientIP}`)
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded. You can submit up to 5 shoes per hour. Please try again later.' 
          }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          })
        }
        
        // Increment rate limit counter
        await supabaseAdmin.rpc('increment_submission_count', {
          client_ip: clientIP
        })
      }

      // Log submission attempt
      await supabaseAdmin.rpc('log_security_event', {
        event_type_param: 'submission_attempt',
        ip_address_param: clientIP,
        user_id_param: data.userId,
        event_data_param: {
          brand: data.brand,
          has_photo: !!data.photoUrl,
          is_authenticated: !!data.userId
        },
        severity_param: 'info'
      })

      const { data: result, error } = await supabaseAdmin.rpc('create_shoe', {
        brand_param: data.brand,
        size_param: data.size,
        size_unit_param: data.sizeUnit,
        condition_param: data.condition,
        model_param: data.model,
        rating_param: data.rating,
        photo_url_param: data.photoUrl,
        user_id_param: data.userId || null
      })
      
      if (error) {
        console.error('Create shoe error:', error)
        
        // Log submission failure
        await supabaseAdmin.rpc('log_security_event', {
          event_type_param: 'submission_failed',
          ip_address_param: clientIP,
          user_id_param: data.userId,
          event_data_param: {
            error: error.message,
            brand: data.brand
          },
          severity_param: 'error'
        })
        
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
        shoe_id_input: data.shoeId,
        qr_code_data_url: data.qrCodeDataURL
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
        shoe_id_input: data.shoeId
      })
      
      if (error) {
        console.error('Check shoe exists error:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      
      // Handle the new return format - extract boolean from array
      const exists = result && result.length > 0 ? result[0].shoe_exists : false
      return new Response(JSON.stringify({ exists }), {
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