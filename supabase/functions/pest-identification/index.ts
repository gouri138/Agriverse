import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const { imageBase64, description, cropId, userId } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Call OpenAI Vision API for pest/disease identification
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert agricultural AI assistant specializing in pest and disease identification. 
            Analyze the uploaded image and provide:
            1. Identification of the pest/disease (if any)
            2. Severity level (low/medium/high)
            3. Treatment recommendations
            4. Prevention measures
            
            Return response in JSON format:
            {
              "identified": true/false,
              "pest_name": "name of pest/disease",
              "severity": "low/medium/high",
              "confidence": 0.85,
              "treatment": "treatment recommendations",
              "prevention": "prevention measures",
              "crop_specific_advice": "specific advice for this crop"
            }`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Please analyze this crop image for pests or diseases. Additional description: ${description || 'No additional description provided'}`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      }),
    });

    const openaiData = await openaiResponse.json();
    
    if (!openaiData.choices?.[0]?.message?.content) {
      throw new Error('Failed to get AI analysis');
    }

    let aiIdentification;
    try {
      aiIdentification = JSON.parse(openaiData.choices[0].message.content);
    } catch {
      // Fallback if JSON parsing fails
      aiIdentification = {
        identified: false,
        pest_name: 'Analysis incomplete',
        severity: 'medium',
        confidence: 0.5,
        treatment: openaiData.choices[0].message.content,
        prevention: 'Regular monitoring recommended',
        crop_specific_advice: 'Consult local agricultural expert'
      };
    }

    // Upload image to Supabase storage
    const imageBuffer = Uint8Array.from(atob(imageBase64.split(',')[1]), c => c.charCodeAt(0));
    const fileName = `pest-report-${Date.now()}.jpg`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pest-images')
      .upload(fileName, imageBuffer, {
        contentType: 'image/jpeg'
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
    }

    const imageUrl = uploadData ? 
      `${Deno.env.get('SUPABASE_URL')}/storage/v1/object/public/pest-images/${fileName}` : 
      null;

    // Save pest report to database
    const { data: pestReport, error: dbError } = await supabase
      .from('pest_reports')
      .insert({
        user_id: userId,
        crop_id: cropId,
        user_description: description,
        image_url: imageUrl,
        ai_identification: aiIdentification,
        severity: aiIdentification.severity || 'medium',
        status: 'reported'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save pest report');
    }

    return new Response(JSON.stringify({
      pestReport,
      aiAnalysis: aiIdentification
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Pest identification error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});