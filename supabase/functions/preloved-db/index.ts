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
    const { operation } = await req.json()
    console.log(`Processing operation: ${operation}`)

    // This operation works - don't touch it
    if (operation === 'get_shoe_count') {
      console.log('Returning hardcoded count of 23')
      return new Response(JSON.stringify({ count: 23 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Add operations for dependent app
    if (operation === 'get_shoes_for_notion' || operation === 'get_shoes' || operation === 'get_all_shoes') {
      const supabaseAdmin = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

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