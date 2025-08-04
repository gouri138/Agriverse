import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { state = 'Maharashtra', district = 'Pune' } = await req.json();

    // Mock mandi prices data (In real implementation, this would come from government APIs)
    const mandiPrices = [
      {
        commodity: 'Wheat',
        variety: 'HD-2967',
        market: 'Pune APMC',
        minPrice: 2150,
        maxPrice: 2280,
        modalPrice: 2215,
        unit: 'per quintal',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: '+2.5%'
      },
      {
        commodity: 'Rice',
        variety: 'Common',
        market: 'Mumbai APMC',
        minPrice: 3850,
        maxPrice: 4100,
        modalPrice: 3975,
        unit: 'per quintal',
        date: new Date().toISOString().split('T')[0],
        trend: 'stable',
        change: '0%'
      },
      {
        commodity: 'Onion',
        variety: 'Red',
        market: 'Nashik APMC',
        minPrice: 1200,
        maxPrice: 1450,
        modalPrice: 1325,
        unit: 'per quintal',
        date: new Date().toISOString().split('T')[0],
        trend: 'down',
        change: '-5.2%'
      },
      {
        commodity: 'Tomato',
        variety: 'Hybrid',
        market: 'Pune APMC',
        minPrice: 800,
        maxPrice: 1200,
        modalPrice: 1000,
        unit: 'per quintal',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: '+12.5%'
      },
      {
        commodity: 'Cotton',
        variety: 'Kapas',
        market: 'Akola APMC',
        minPrice: 6800,
        maxPrice: 7200,
        modalPrice: 7000,
        unit: 'per quintal',
        date: new Date().toISOString().split('T')[0],
        trend: 'up',
        change: '+3.8%'
      },
      {
        commodity: 'Sugarcane',
        variety: 'Common',
        market: 'Kolhapur Sugar Mill',
        minPrice: 320,
        maxPrice: 340,
        modalPrice: 330,
        unit: 'per quintal',
        date: new Date().toISOString().split('T')[0],
        trend: 'stable',
        change: '+0.5%'
      }
    ];

    // Add some market insights
    const marketInsights = {
      topGainers: mandiPrices
        .filter(p => p.trend === 'up')
        .sort((a, b) => parseFloat(b.change) - parseFloat(a.change))
        .slice(0, 3),
      topLosers: mandiPrices
        .filter(p => p.trend === 'down')
        .sort((a, b) => parseFloat(a.change) - parseFloat(b.change))
        .slice(0, 3),
      marketSummary: {
        totalCommodities: mandiPrices.length,
        trending: mandiPrices.filter(p => p.trend === 'up').length,
        declining: mandiPrices.filter(p => p.trend === 'down').length,
        stable: mandiPrices.filter(p => p.trend === 'stable').length
      }
    };

    return new Response(JSON.stringify({
      prices: mandiPrices,
      insights: marketInsights,
      lastUpdated: new Date().toISOString(),
      region: { state, district }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Mandi prices error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});