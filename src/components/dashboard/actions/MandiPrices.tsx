import { useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, RefreshCw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MandiPricesProps {
  onClose: () => void;
}

interface PriceData {
  commodity: string;
  variety: string;
  market: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  date: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

export function MandiPrices({ onClose }: MandiPricesProps) {
  const { toast } = useToast();
  const [prices, setPrices] = useState<PriceData[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  useEffect(() => {
    fetchPrices();
  }, []);

  const fetchPrices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('mandi-prices', {
        body: { state: 'Maharashtra', district: 'Pune' }
      });

      if (error) throw error;

      setPrices(data.prices || []);
      setInsights(data.insights || null);
      setLastUpdated(data.lastUpdated || '');
    } catch (error) {
      console.error('Error fetching mandi prices:', error);
      toast({
        title: "Error",
        description: "Failed to fetch mandi prices",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'default';
      case 'down': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-foreground">Mandi Prices</h3>
        </div>
        <Button variant="outline" size="sm" onClick={fetchPrices} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          {/* Market Summary */}
          {insights && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{insights.marketSummary.totalCommodities}</p>
                <p className="text-xs text-muted-foreground">Total Items</p>
              </div>
              <div className="text-center p-3 bg-success/10 rounded-lg">
                <p className="text-2xl font-bold text-success">{insights.marketSummary.trending}</p>
                <p className="text-xs text-muted-foreground">Trending Up</p>
              </div>
              <div className="text-center p-3 bg-destructive/10 rounded-lg">
                <p className="text-2xl font-bold text-destructive">{insights.marketSummary.declining}</p>
                <p className="text-xs text-muted-foreground">Declining</p>
              </div>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <p className="text-2xl font-bold text-foreground">{insights.marketSummary.stable}</p>
                <p className="text-xs text-muted-foreground">Stable</p>
              </div>
            </div>
          )}

          {/* Price List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-foreground">Current Prices</h4>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Updated: {new Date(lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>

            {prices.map((price, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h5 className="font-medium text-foreground">{price.commodity}</h5>
                    <Badge variant="outline" className="text-xs">{price.variety}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{price.market}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Min: ₹{price.minPrice}</span>
                    <span>Max: ₹{price.maxPrice}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-foreground">₹{price.modalPrice}</span>
                    {getTrendIcon(price.trend)}
                  </div>
                  <p className="text-xs text-muted-foreground">{price.unit}</p>
                  <Badge variant={getTrendColor(price.trend)} className="text-xs mt-1">
                    {price.change}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Top Gainers & Losers */}
          {insights && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t">
              {insights.topGainers.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-3">Top Gainers</h5>
                  <div className="space-y-2">
                    {insights.topGainers.slice(0, 3).map((item: PriceData, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-success/10 rounded">
                        <span className="text-sm font-medium">{item.commodity}</span>
                        <Badge variant="default" className="text-xs">{item.change}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {insights.topLosers.length > 0 && (
                <div>
                  <h5 className="font-medium text-foreground mb-3">Top Decliners</h5>
                  <div className="space-y-2">
                    {insights.topLosers.slice(0, 3).map((item: PriceData, index: number) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-destructive/10 rounded">
                        <span className="text-sm font-medium">{item.commodity}</span>
                        <Badge variant="destructive" className="text-xs">{item.change}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </Card>
  );
}