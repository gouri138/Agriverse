import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/ui/navigation";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { WeatherWidget } from "@/components/dashboard/WeatherWidget";
import { TaskManager } from "@/components/dashboard/TaskManager";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { CropManagement } from "@/components/dashboard/CropManagement";
import { Marketplace } from "@/components/marketplace/Marketplace";
import { Toaster } from "@/components/ui/toaster";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Leaf, ArrowRight, Users, TrendingUp, Shield, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import heroImage from "@/assets/hero-agriculture.jpg";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const { user, loading, signOut } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return t("greetings.morning");
    } else if (hour < 17) {
      return t("greetings.afternoon");
    } else {
      return t("greetings.evening");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      // Don't redirect immediately, let them see the landing page
    }
  }, [user, loading]);

  const handleEnterDashboard = () => {
    if (user) {
      // User is authenticated, show dashboard
      return;
    } else {
      // User not authenticated, redirect to auth page
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  if (user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="lg:ml-72 p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {getGreeting()}, {user?.user_metadata?.full_name || t("greetings.farmer")} 🌅
                </h1>
                <p className="text-muted-foreground">
                  {t("dashboard.greeting")}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Badge className="bg-gradient-nature text-primary-foreground">
                  🌱 {t("dashboard.growingSeason")}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {t("dashboard.signOut")}
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          {activeTab === "crop-management" ? (
            <CropManagement onClose={() => setActiveTab("dashboard")} />
          ) : activeTab === "market" ? (
            <Marketplace />
          ) : (
            <div className="space-y-8">
              {/* Stats Overview */}
              <DashboardStats />

              {/* Main Dashboard Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Weather & Tasks */}
                <div className="lg:col-span-2 space-y-8">
                  <TaskManager />
                  <QuickActions />
                </div>

                {/* Right Column - Weather */}
                <div>
                  <WeatherWidget />
                </div>
              </div>
            </div>
          )}
        </div>
        <Toaster />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        >
          <div className="absolute inset-0 bg-black/40" />
        </div>
        
        <div className="relative z-10 flex items-center justify-center h-full px-6">
          <div className="text-center max-w-4xl">
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center">
                <Leaf className="h-8 w-8 text-primary-foreground" />
              </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6">
              {t("hero.title")}
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
              {t("hero.subtitle")}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-primary hover:bg-primary-hover text-primary-foreground shadow-strong px-8 py-4 text-lg"
                onClick={handleEnterDashboard}
              >
                {user ? t("hero.enterDashboard") : t("hero.getStarted")}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 px-8 py-4 text-lg"
              >
                {t("hero.learnMore")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Preview */}
      <div className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              {t("hero.featuresTitle")}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {t("hero.featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Smart Crop Management */}
            <Card className="p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-6">
                <Leaf className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{t("hero.smartCropManagement")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("hero.smartCropDesc")}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t("hero.features.taskPlanner")}</li>
                <li>• {t("hero.features.expenseTracking")}</li>
                <li>• {t("hero.features.pestDetection")}</li>
                <li>• {t("hero.features.cropRotation")}</li>
              </ul>
            </Card>

            {/* Weather & Soil */}
            <Card className="p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-sky rounded-lg flex items-center justify-center mb-6">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{t("hero.weatherIntelligence")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("hero.weatherDesc")}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t("hero.features.liveWeather")}</li>
                <li>• {t("hero.features.weatherAlerts")}</li>
                <li>• {t("hero.features.soilAnalysis")}</li>
                <li>• {t("hero.features.fertilizerSuggestions")}</li>
              </ul>
            </Card>

            {/* Market Access */}
            <Card className="p-8 shadow-soft hover:shadow-medium transition-shadow duration-300">
              <div className="w-12 h-12 bg-gradient-nature rounded-lg flex items-center justify-center mb-6">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-4">{t("hero.marketCommunity")}</h3>
              <p className="text-muted-foreground mb-4">
                {t("hero.marketDesc")}
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>• {t("hero.features.mandiPrices")}</li>
                <li>• {t("hero.features.marketplace")}</li>
                <li>• {t("hero.features.governmentSchemes")}</li>
                <li>• {t("hero.features.learningHub")}</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-primary py-20">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-primary-foreground mb-6">
            {t("hero.ctaTitle")}
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            {t("hero.ctaSubtitle")}
          </p>
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 shadow-strong px-8 py-4 text-lg"
            onClick={handleEnterDashboard}
          >
            {user ? t("hero.enterDashboard") : t("hero.startJourney")}
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
