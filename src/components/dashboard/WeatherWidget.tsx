import { useState, useEffect } from "react";
import { Cloud, Sun, CloudRain, Thermometer, Wind, Droplets } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

interface WeatherData {
  current: {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    pressure: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    temp: number;
    icon: string;
    description: string;
  }>;
  alerts: Array<{
    type: string;
    message: string;
    severity: string;
  }>;
}

export function WeatherWidget() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      // First get user's farm location from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('location')
        .eq('user_id', user?.id)
        .single();

      const location = profile?.location || 'Pune,IN'; // Default fallback

      const { data, error } = await supabase.functions.invoke('weather', {
        body: { location }
      });

      if (error) throw error;
      setWeatherData(data);
    } catch (error) {
      console.error('Error fetching weather:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !weatherData) {
    return (
      <Card className="p-6 shadow-soft">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-16 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case "sunny":
        return <Sun className="h-6 w-6 text-warning" />;
      case "rainy":
        return <CloudRain className="h-6 w-6 text-primary" />;
      default:
        return <Cloud className="h-6 w-6 text-muted-foreground" />;
    }
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">{t("weather.title")}</h3>
        {weatherData.alerts.length > 0 && (
          <Badge variant="outline" className="text-warning border-warning">
            {weatherData.alerts.length} {weatherData.alerts.length > 1 ? t("weather.alerts") : t("weather.alert")}
          </Badge>
        )}
      </div>

      {/* Weather Alerts */}
      {weatherData.alerts.length > 0 && (
        <div className="mb-4 space-y-2">
          {weatherData.alerts.slice(0, 2).map((alert, index) => (
            <div key={index} className={`p-2 rounded-lg text-xs ${
              alert.severity === 'high' ? 'bg-destructive/10 text-destructive' :
              alert.severity === 'warning' ? 'bg-warning/10 text-warning' :
              'bg-primary/10 text-primary'
            }`}>
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Current Weather */}
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 bg-gradient-sky rounded-lg flex items-center justify-center">
          {getWeatherIcon(weatherData.current.icon)}
        </div>
        <div>
          <p className="text-3xl font-bold text-foreground">{weatherData.current.temperature}°C</p>
          <p className="text-sm text-muted-foreground">{weatherData.current.condition}</p>
          <p className="text-xs text-muted-foreground">{weatherData.current.location}</p>
        </div>
      </div>

      {/* Weather Details */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <Droplets className="h-5 w-5 text-primary mx-auto mb-1" />
          <p className="text-sm font-medium text-foreground">{weatherData.current.humidity}%</p>
          <p className="text-xs text-muted-foreground">{t("weather.humidity")}</p>
        </div>
        <div className="text-center">
          <Wind className="h-5 w-5 text-accent mx-auto mb-1" />
          <p className="text-sm font-medium text-foreground">{weatherData.current.windSpeed} km/h</p>
          <p className="text-xs text-muted-foreground">{t("weather.wind")}</p>
        </div>
        <div className="text-center">
          <Thermometer className="h-5 w-5 text-success mx-auto mb-1" />
          <p className="text-sm font-medium text-foreground">{weatherData.current.pressure} hPa</p>
          <p className="text-xs text-muted-foreground">{t("weather.pressure")}</p>
        </div>
      </div>

      {/* 5-Day Forecast */}
      <div>
        <h4 className="text-sm font-medium text-foreground mb-3">{t("weather.forecast")}</h4>
        <div className="flex justify-between">
          {weatherData.forecast.map((day, index) => (
            <div key={index} className="text-center">
              <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
              {getWeatherIcon(day.icon)}
              <p className="text-sm font-medium text-foreground mt-2">{day.temp}°</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}