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
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: authHeader ? { Authorization: authHeader } : {}
        }
      }
    );

    // Create service role client for system operations
    const serviceRoleSupabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { question, category, images, userId, autoAnswer = false } = await req.json();
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    // Save expert query to database
    const { data: expertQuery, error: dbError } = await supabase
      .from('expert_queries')
      .insert({
        user_id: userId,
        question,
        category: category || 'general',
        images: images || [],
        status: autoAnswer ? 'answered' : 'pending'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error('Failed to save expert query');
    }

    let aiResponse = null;

    // If auto-answer is enabled and we have OpenAI key, provide immediate AI response
    if (autoAnswer && openaiApiKey) {
      try {
        console.log('Starting AI response generation...');
        
        const messages = [
          {
            role: 'system',
            content: `You are an expert agricultural consultant with years of experience helping farmers. 
            Provide practical, actionable advice for farming questions. Be specific about:
            - Crop varieties and growing conditions
            - Pest and disease management
            - Irrigation and soil management
            - Market and business advice
            - Government schemes and subsidies
            
            Keep responses helpful but concise (under 500 words).`
          },
          {
            role: 'user',
            content: `Category: ${category || 'general'}\nQuestion: ${question}`
          }
        ];

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4.1-2025-04-14', // Use latest model
            messages,
            max_tokens: 800,
            temperature: 0.7
          }),
        });

        if (!openaiResponse.ok) {
          const errorText = await openaiResponse.text();
          console.error('OpenAI API error:', openaiResponse.status, errorText);
          
          if (openaiResponse.status === 429) {
            console.log('Rate limit hit, marking as pending for manual review');
            // Don't throw error, just mark as pending
            await serviceRoleSupabase
              .from('expert_queries')
              .update({ status: 'pending' })
              .eq('id', expertQuery.id);
            
            return new Response(JSON.stringify({
              expertQuery: { ...expertQuery, status: 'pending' },
              message: 'Question submitted successfully. Due to high demand, it will be reviewed manually.'
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
          
          throw new Error(`OpenAI API error: ${openaiResponse.status}`);
        }

        const openaiData = await openaiResponse.json();
        console.log('OpenAI response received:', !!openaiData.choices?.[0]?.message?.content);
        
        if (openaiData.choices?.[0]?.message?.content) {
          aiResponse = openaiData.choices[0].message.content;
          console.log('AI Response length:', aiResponse.length);

          // Update the query with AI response using service role
          const { error: updateError } = await serviceRoleSupabase
            .from('expert_queries')
            .update({
              expert_response: aiResponse,
              answered_at: new Date().toISOString(),
              status: 'answered'
            })
            .eq('id', expertQuery.id);

          if (updateError) {
            console.error('Update error:', updateError);
          } else {
            console.log('Successfully updated expert query with AI response');
          }
        } else {
          console.error('No content in OpenAI response:', openaiData);
        }
      } catch (aiError) {
        console.error('AI response error:', aiError);
        // Continue without AI response
      }
    } else {
      console.log('Auto-answer disabled or no OpenAI key available');
    }

    return new Response(JSON.stringify({
      expertQuery: {
        ...expertQuery,
        expert_response: aiResponse
      },
      aiResponse
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Expert query error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});