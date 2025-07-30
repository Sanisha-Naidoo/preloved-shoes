import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    console.log('Fetching shoes from preloved.shoes table');

    // Fetch shoes using RPC call to preloved schema function
    const { data: shoes, error } = await supabaseAdmin
      .rpc('preloved.get_shoes_for_notion');

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log(`Successfully fetched ${shoes?.length || 0} shoes`);

    // Transform data to match NotionShoe interface
    const transformedShoes = shoes?.map(shoe => ({
      id: shoe.id,
      Brand: shoe.brand,
      Model: shoe.model,
      Size: shoe.size,
      Condition: shoe.condition
    })) || [];

    return new Response(
      JSON.stringify(transformedShoes),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch shoes',
        details: error.message 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});