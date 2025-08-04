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
    const { query = 'farming techniques', maxResults = 12 } = await req.json();
    const youtubeApiKey = Deno.env.get('YOUTUBE_API_KEY');

    if (!youtubeApiKey) {
      throw new Error('YouTube API key not configured');
    }

    // Search for farming-related videos
    const searchQuery = `${query} farming agriculture tutorial`;
    const youtubeResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=${maxResults}&q=${encodeURIComponent(searchQuery)}&type=video&key=${youtubeApiKey}`
    );

    const youtubeData = await youtubeResponse.json();

    if (!youtubeData.items) {
      throw new Error('No videos found');
    }

    // Format video data
    const videos = youtubeData.items.map((item: any) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    }));

    // Categorize videos
    const categories = {
      'Crop Management': videos.filter((v: any) => 
        v.title.toLowerCase().includes('crop') || 
        v.title.toLowerCase().includes('planting') ||
        v.title.toLowerCase().includes('harvest')
      ).slice(0, 4),
      'Irrigation & Water': videos.filter((v: any) => 
        v.title.toLowerCase().includes('irrigation') || 
        v.title.toLowerCase().includes('water') ||
        v.title.toLowerCase().includes('drip')
      ).slice(0, 4),
      'Pest Control': videos.filter((v: any) => 
        v.title.toLowerCase().includes('pest') || 
        v.title.toLowerCase().includes('disease') ||
        v.title.toLowerCase().includes('organic')
      ).slice(0, 4),
      'General Farming': videos.slice(0, 4)
    };

    return new Response(JSON.stringify({
      videos,
      categories,
      totalResults: youtubeData.pageInfo?.totalResults || 0
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('YouTube API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});