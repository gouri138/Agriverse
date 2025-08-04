import { useState } from "react";
import { 
  Camera, 
  TrendingUp, 
  Droplets, 
  DollarSign, 
  BookOpen, 
  MessageCircle,
  MapPin,
  Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { ExpenseTracker } from "./actions/ExpenseTracker";
import { PestReporter } from "./actions/PestReporter";
import { MandiPrices } from "./actions/MandiPrices";
import { IrrigationTimer } from "./actions/IrrigationTimer";
import { GovernmentSchemes } from "./actions/GovernmentSchemes";
import { ExpertConsultation } from "./actions/ExpertConsultation";
import { VideoTutorials } from "./actions/VideoTutorials";
import { SettingsPanel } from "./actions/SettingsPanel";


export function QuickActionsManager() {
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const { t } = useLanguage();

  const quickActions = [
    {
      id: 'expense',
      title: t("quickActions.expenseTracker"),
      description: t("quickActions.expenseTrackerDesc"),
      icon: DollarSign,
      color: "bg-accent/10 text-accent"
    },
    {
      id: 'mandi',
      title: t("quickActions.mandiPrices"),
      description: t("quickActions.mandiPricesDesc"),
      icon: TrendingUp,
      color: "bg-success/10 text-success"
    },
    {
      id: 'irrigation',
      title: t("quickActions.irrigationTimer"),
      description: t("quickActions.irrigationTimerDesc"),
      icon: Droplets,
      color: "bg-primary/10 text-primary"
    },
    {
      id: 'schemes',
      title: t("quickActions.governmentSchemes"),
      description: t("quickActions.governmentSchemesDesc"),
      icon: MapPin,
      color: "bg-warning/10 text-warning"
    },
    {
      id: 'tutorials',
      title: t("quickActions.videoTutorials"),
      description: t("quickActions.videoTutorialsDesc"),
      icon: BookOpen,
      color: "bg-primary/10 text-primary"
    },
    {
      id: 'settings',
      title: t("quickActions.settings"),
      description: "Configure preferences",
      icon: Settings,
      color: "bg-muted text-muted-foreground"
    }
  ];

  const renderActionComponent = () => {
    switch (activeAction) {
      case 'expense':
        return <ExpenseTracker onClose={() => setActiveAction(null)} />;
      case 'mandi':
        return <MandiPrices onClose={() => setActiveAction(null)} />;
      case 'irrigation':
        return <IrrigationTimer onClose={() => setActiveAction(null)} />;
      case 'schemes':
        return <GovernmentSchemes onClose={() => setActiveAction(null)} />;
      case 'tutorials':
        return <VideoTutorials onClose={() => setActiveAction(null)} />;
      case 'settings':
        return <SettingsPanel onClose={() => setActiveAction(null)} />;
      default:
        return null;
    }
  };

  if (activeAction) {
    return renderActionComponent();
  }

  return (
    <Card className="p-6 shadow-soft">
      <h3 className="text-lg font-semibold text-foreground mb-4">{t("quickActions.title")}</h3>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action) => {
          const Icon = action.icon;
          
          return (
            <Button
              key={action.id}
              variant="ghost"
              className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-muted/50 hover:shadow-soft transition-all duration-200"
              onClick={() => setActiveAction(action.id)}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="text-center">
                <p className="font-medium text-foreground text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground mt-1">{action.description}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
}