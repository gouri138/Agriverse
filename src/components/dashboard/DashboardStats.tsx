import { useState, useEffect } from "react";
import { TrendingUp, Droplets, DollarSign, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function DashboardStats() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stats, setStats] = useState({
    activeCrops: 0,
    irrigationStatus: 0,
    seasonRevenue: 0,
    activeAlerts: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      // Fetch active crops
      const { data: crops } = await supabase
        .from('crops')
        .select('id')
        .eq('user_id', user?.id)
        .eq('status', 'planted');

      // Fetch irrigation schedules
      const { data: irrigationSchedules } = await supabase
        .from('irrigation_schedules')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      // Fetch season revenue
      const { data: revenue } = await supabase
        .from('revenue_records')
        .select('total_amount')
        .eq('user_id', user?.id)
        .gte('sale_date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);

      // Fetch weather alerts
      const { data: alerts } = await supabase
        .from('weather_alerts')
        .select('id')
        .eq('user_id', user?.id)
        .eq('is_read', false);

      const totalRevenue = revenue?.reduce((sum, record) => sum + record.total_amount, 0) || 0;
      const irrigationPercentage = irrigationSchedules?.length ? Math.min(100, irrigationSchedules.length * 20) : 0;

      setStats({
        activeCrops: crops?.length || 0,
        irrigationStatus: irrigationPercentage,
        seasonRevenue: totalRevenue,
        activeAlerts: alerts?.length || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsData = [
    {
      title: t("dashboard.stats.activeCrops"),
      value: loading ? t("common.loading") : stats.activeCrops.toString(),
      change: t("dashboard.stats.thisSeason"),
      icon: TrendingUp,
      color: "success"
    },
    {
      title: t("dashboard.stats.irrigationStatus"), 
      value: loading ? t("common.loading") : `${stats.irrigationStatus}%`,
      change: t("dashboard.stats.optimalLevels"),
      icon: Droplets,
      color: "primary"
    },
    {
      title: t("dashboard.stats.seasonRevenue"),
      value: loading ? t("common.loading") : `₹${stats.seasonRevenue.toLocaleString()}`,
      change: t("dashboard.stats.vsLastSeason"),
      icon: DollarSign,
      color: "accent"
    },
    {
      title: t("dashboard.stats.activeAlerts"),
      value: loading ? t("common.loading") : stats.activeAlerts.toString(),
      change: t("dashboard.stats.weatherWarnings"),
      icon: AlertTriangle,
      color: "warning"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <Card key={index} className="p-6 shadow-soft hover:shadow-medium transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.change}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                stat.color === 'success' ? 'bg-success/10' :
                stat.color === 'primary' ? 'bg-primary/10' :
                stat.color === 'accent' ? 'bg-accent/10' :
                'bg-warning/10'
              }`}>
                <Icon className={`h-6 w-6 ${
                  stat.color === 'success' ? 'text-success' :
                  stat.color === 'primary' ? 'text-primary' :
                  stat.color === 'accent' ? 'text-accent' :
                  'text-warning'
                }`} />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}