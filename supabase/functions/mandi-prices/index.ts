import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std/http/mod.ts";
// No additional code is needed here. 
// The imports for "xhr" and "serve" are sufficient for this file.
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

    // Generate location-specific prices (In real implementation, this would come from government APIs)
    const getLocationSpecificPrices = (state: string, district: string) => {
      // Base price multipliers by state (simulating regional variations)
      const stateMultipliers: { [key: string]: number } = {
        'Maharashtra': 1.0,
        'Punjab': 1.15,
        'Haryana': 1.12,
        'Uttar Pradesh': 0.95,
        'Rajasthan': 0.98,
        'Karnataka': 1.05,
        'Tamil Nadu': 1.08,
        'Andhra Pradesh': 1.03
      };

      // District variations within states
      const districtVariations: { [key: string]: number } = {
        'Mumbai': 1.2, 'Pune': 1.0, 'Nashik': 0.9, 'Kolhapur': 0.85, 'Akola': 0.8,
        'Ludhiana': 1.1, 'Amritsar': 1.0, 'Jalandhar': 0.95, 'Patiala': 0.9,
        'Gurugram': 1.15, 'Faridabad': 1.1, 'Karnal': 0.9, 'Hisar': 0.85,
        'Lucknow': 1.0, 'Kanpur': 0.95, 'Agra': 0.9, 'Meerut': 0.92,
        'Jaipur': 1.0, 'Jodhpur': 0.9, 'Kota': 0.85, 'Udaipur': 0.88,
        'Bangalore': 1.1, 'Mysore': 0.95, 'Hubli': 0.9, 'Mangalore': 1.05,
        'Chennai': 1.1, 'Coimbatore': 1.0, 'Madurai': 0.9, 'Salem': 0.85,
        'Visakhapatnam': 1.05, 'Vijayawada': 1.0, 'Guntur': 0.95, 'Tirupati': 0.9
      };

      const stateMultiplier = stateMultipliers[state] || 1.0;
      const districtMultiplier = districtVariations[district] || 1.0;
      const totalMultiplier = stateMultiplier * districtMultiplier;

      // Base commodities with regional variations
      const baseCommodities = [
        { name: 'Wheat', variety: 'HD-2967', basePrice: 2215, unit: 'per quintal', trend: 'up', change: '+2.5%' },
        { name: 'Rice', variety: 'Common', basePrice: 3975, unit: 'per quintal', trend: 'stable', change: '0%' },
        { name: 'Onion', variety: 'Red', basePrice: 1325, unit: 'per quintal', trend: 'down', change: '-5.2%' },
        { name: 'Tomato', variety: 'Hybrid', basePrice: 1000, unit: 'per quintal', trend: 'up', change: '+12.5%' },
        { name: 'Cotton', variety: 'Kapas', basePrice: 7000, unit: 'per quintal', trend: 'up', change: '+3.8%' },
        { name: 'Sugarcane', variety: 'Common', basePrice: 330, unit: 'per quintal', trend: 'stable', change: '+0.5%' }
      ];

      // Add state-specific crops
      const stateSpecificCrops: { [key: string]: any[] } = {
        'Punjab': [
          { name: 'Basmati Rice', variety: 'Pusa-1121', basePrice: 4500, unit: 'per quintal', trend: 'up', change: '+5.2%' }
        ],
        'Maharashtra': [
          { name: 'Grapes', variety: 'Thompson Seedless', basePrice: 8000, unit: 'per quintal', trend: 'up', change: '+8.5%' }
        ],
        'Karnataka': [
          { name: 'Coffee', variety: 'Arabica', basePrice: 12000, unit: 'per quintal', trend: 'stable', change: '+1.2%' }
        ],
        'Tamil Nadu': [
          { name: 'Coconut', variety: 'Hybrid', basePrice: 2500, unit: 'per 1000 nuts', trend: 'up', change: '+6.8%' }
        ]
      };

      const allCommodities = [...baseCommodities, ...(stateSpecificCrops[state] || [])];

      return allCommodities.map(commodity => {
        const adjustedPrice = Math.round(commodity.basePrice * totalMultiplier);
        const minPrice = Math.round(adjustedPrice * 0.85);
        const maxPrice = Math.round(adjustedPrice * 1.15);
        
        return {
          commodity: commodity.name,
          variety: commodity.variety,
          market: `${district} APMC`,
          minPrice,
          maxPrice,
          modalPrice: adjustedPrice,
          unit: commodity.unit,
          date: new Date().toISOString().split('T')[0],
          trend: commodity.trend,
          change: commodity.change
        };
      });
    };

    const mandiPrices = getLocationSpecificPrices(state, district);
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