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

    const { location = 'Pune,IN' } = await req.json();
    const apiKey = Deno.env.get('OPENWEATHERMAP_API_KEY');

    if (!apiKey) {
      throw new Error('OpenWeatherMap API key not configured');
    }

    // Get current weather
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );
    const weatherData = await weatherResponse.json();

    // Get 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
    );
    const forecastData = await forecastResponse.json();

    // Process forecast data to get daily forecasts
    const dailyForecasts = [];
    const processedDates = new Set();
    
    for (const item of forecastData.list.slice(0, 40)) {
      const date = new Date(item.dt * 1000).toDateString();
      if (!processedDates.has(date) && dailyForecasts.length < 5) {
        dailyForecasts.push({
          day: dailyForecasts.length === 0 ? 'Today' : 
               dailyForecasts.length === 1 ? 'Tomorrow' : 
               new Date(item.dt * 1000).toLocaleDateString('en', { weekday: 'short' }),
          temp: Math.round(item.main.temp),
          icon: item.weather[0].main.toLowerCase(),
          description: item.weather[0].description
        });
        processedDates.add(date);
      }
    }

    // Check for weather alerts
    const alerts = [];
    const currentTemp = weatherData.main.temp;
    const humidity = weatherData.main.humidity;
    const windSpeed = weatherData.wind?.speed || 0;

    // Generate alerts based on conditions
    if (humidity > 80) {
      alerts.push({
        type: 'high_humidity',
        message: 'High humidity detected. Monitor crops for fungal diseases.',
        severity: 'warning'
      });
    }

    if (currentTemp > 35) {
      alerts.push({
        type: 'heat_wave',
        message: 'Extreme heat warning. Increase irrigation frequency.',
        severity: 'high'
      });
    }

    if (windSpeed > 15) {
      alerts.push({
        type: 'strong_wind',
        message: 'Strong winds expected. Secure crop supports.',
        severity: 'medium'
      });
    }

    // Check for rain in next 24 hours
    const rainAlert = forecastData.list.slice(0, 8).some(item => 
      item.weather[0].main.toLowerCase().includes('rain')
    );

    if (rainAlert) {
      alerts.push({
        type: 'rain_forecast',
        message: 'Rain expected in next 24 hours. Adjust irrigation schedule.',
        severity: 'info'
      });
    }

    const result = {
      current: {
        location: weatherData.name,
        temperature: Math.round(currentTemp),
        condition: weatherData.weather[0].description,
        humidity: humidity,
        windSpeed: Math.round(windSpeed * 3.6), // Convert m/s to km/h
        pressure: weatherData.main.pressure,
        icon: weatherData.weather[0].main.toLowerCase()
      },
      forecast: dailyForecasts,
      alerts: alerts
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Weather API error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});