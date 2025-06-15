
import { serve } from "https://deno.land/std@0.177.0/http/server.ts"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShoePayload {
  brand?: string;
  model?: string | null;
  size?: string;
  sizeUnit?: string;
  condition?: string;
  rating?: number | null;
  photoUrl?: string | null;
  [key: string]: any;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  let body: ShoePayload;
  try {
    body = await req.json();
  } catch (e) {
    return new Response(
      JSON.stringify({error: "Invalid JSON"}),
      { status: 400, headers: corsHeaders }
    );
  }

  // Required fields
  const { brand, size, condition } = body;
  if (!brand || !size || !condition) {
    return new Response(
      JSON.stringify({error: "Missing required fields"}),
      { status: 400, headers: corsHeaders }
    );
  }

  // Set up Notion API request
  const notionSecret = Deno.env.get("NOTION_API_KEY");
  const notionDatabaseId = Deno.env.get("NOTION_DATABASE_ID");
  if (!notionSecret || !notionDatabaseId) {
    return new Response(
      JSON.stringify({error: "Missing Notion credentials"}),
      { status: 500, headers: corsHeaders }
    );
  }

  const properties: Record<string, any> = {
    Brand: { title: [{ text: { content: brand } }] },
    Size: { rich_text: [{ text: { content: size } }] },
    Condition: { rich_text: [{ text: { content: condition } }] },
  };
  if (body.model) properties.Model = { rich_text: [{ text: { content: body.model } }] };
  if (body.sizeUnit) properties["Size Unit"] = { rich_text: [{ text: { content: body.sizeUnit } }] };
  if (body.rating !== undefined && body.rating !== null) properties.Rating = { number: body.rating };
  if (body.photoUrl) properties.Photo = { url: body.photoUrl };

  const notionRes = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${notionSecret}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: notionDatabaseId },
      properties,
    }),
  });

  const notionData = await notionRes.json();

  if (!notionRes.ok) {
    return new Response(
      JSON.stringify({error: notionData}),
      { status: 500, headers: corsHeaders }
    );
  }

  return new Response(
    JSON.stringify({success: true, notionId: notionData.id}),
    { status: 200, headers: corsHeaders }
  );
});
