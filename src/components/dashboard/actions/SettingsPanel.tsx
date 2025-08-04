import { useState, useEffect } from "react";
import { ArrowLeft, User, Bell, MapPin, Smartphone, Mail, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface SettingsPanelProps {
  onClose: () => void;
}

interface Profile {
  full_name: string;
  farm_name: string;
  phone: string;
  location: string;
  farm_size: number;
  primary_crops: string[];
}

const cropOptions = [
  'Wheat', 'Rice', 'Cotton', 'Sugarcane', 'Maize', 'Soybean',
  'Tomato', 'Onion', 'Potato', 'Chili', 'Groundnut', 'Sunflower'
];

export function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    farm_name: '',
    phone: '',
    location: '',
    farm_size: 0,
    primary_crops: []
  });

  const [notifications, setNotifications] = useState({
    weather_alerts: true,
    task_reminders: true,
    market_updates: true,
    expert_responses: true,
    irrigation_alerts: true
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          farm_name: data.farm_name || '',
          phone: data.phone || '',
          location: data.location || '',
          farm_size: data.farm_size || 0,
          primary_crops: data.primary_crops || []
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: t("common.error"),
        description: t("settings.failedToLoad"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      // Check if profile exists first
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      let result;
      if (existingProfile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            farm_name: profile.farm_name,
            phone: profile.phone,
            location: profile.location,
            farm_size: profile.farm_size,
            primary_crops: profile.primary_crops
          })
          .eq('user_id', user.id);
      } else {
        // Insert new profile
        result = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            full_name: profile.full_name,
            farm_name: profile.farm_name,
            phone: profile.phone,
            location: profile.location,
            farm_size: profile.farm_size,
            primary_crops: profile.primary_crops
          });
      }

      if (result.error) throw result.error;

      toast({
        title: t("common.success"),
        description: t("settings.profileSaved")
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: t("common.error"),
        description: t("settings.failedToSave"),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCropToggle = (crop: string) => {
    setProfile(prev => ({
      ...prev,
      primary_crops: prev.primary_crops.includes(crop)
        ? prev.primary_crops.filter(c => c !== crop)
        : [...prev.primary_crops, crop]
    }));
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-10 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">{t("settings.title")}</h3>
      </div>

      <div className="space-y-8">
        {/* Profile Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h4 className="font-medium text-foreground">{t("settings.profile")}</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">{t("auth.fullName")}</Label>
              <Input
                id="full_name"
                value={profile.full_name}
                onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                placeholder={t("auth.enterFullName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm_name">Farm Name</Label>
              <Input
                id="farm_name"
                value={profile.farm_name}
                onChange={(e) => setProfile({...profile, farm_name: e.target.value})}
                placeholder="Your farm name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={profile.phone}
                onChange={(e) => setProfile({...profile, phone: e.target.value})}
                placeholder="+91 9876543210"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">{t("settings.farmLocation")}</Label>
              <Input
                id="location"
                value={profile.location}
                onChange={(e) => setProfile({...profile, location: e.target.value})}
                placeholder={t("settings.enterLocation")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="farm_size">Farm Size (acres)</Label>
              <Input
                id="farm_size"
                type="number"
                value={profile.farm_size}
                onChange={(e) => setProfile({...profile, farm_size: parseFloat(e.target.value) || 0})}
                placeholder="0"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("settings.primaryCrops")}</Label>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {cropOptions.map(crop => (
                <Button
                  key={crop}
                  variant={profile.primary_crops.includes(crop) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCropToggle(crop)}
                  className="justify-start"
                >
                  {crop}
                </Button>
              ))}
            </div>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            {saving ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
                {t("settings.saving")}
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {t("settings.saveProfile")}
              </>
            )}
          </Button>
        </div>

        <Separator />

        {/* Notification Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h4 className="font-medium text-foreground">{t("settings.notifications")}</h4>
          </div>

          <div className="space-y-4">
            {Object.entries(notifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <Label htmlFor={key} className="text-sm font-medium">
                    {key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {key === 'weather_alerts' && 'Get notified about weather conditions'}
                    {key === 'task_reminders' && 'Reminders for scheduled tasks'}
                    {key === 'market_updates' && 'Updates on crop prices and market trends'}
                    {key === 'expert_responses' && 'Notifications when experts respond'}
                    {key === 'irrigation_alerts' && 'Irrigation schedule reminders'}
                  </p>
                </div>
                <Switch
                  id={key}
                  checked={value}
                  onCheckedChange={(checked) => 
                    setNotifications({...notifications, [key]: checked})
                  }
                />
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Language Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">{t("settings.language")}</h4>
          
          <div className="space-y-2">
            <Label>{t("settings.selectLanguage")}</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t("settings.languages.en")}</SelectItem>
                <SelectItem value="hi">{t("settings.languages.hi")}</SelectItem>
                <SelectItem value="pu">{t("settings.languages.pu")}</SelectItem>
                <SelectItem value="mr">{t("settings.languages.mr")}</SelectItem>
                <SelectItem value="ta">{t("settings.languages.ta")}</SelectItem>
                <SelectItem value="te">{t("settings.languages.te")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* App Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">{t("settings.appInfo")}</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <p className="text-muted-foreground">Account Email:</p>
              <p className="font-medium">{user?.email}</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">Account Created:</p>
              <p className="font-medium">
                {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">{t("settings.version")}:</p>
              <p className="font-medium">1.0.0</p>
            </div>
            <div className="space-y-2">
              <p className="text-muted-foreground">Database Status:</p>
              <p className="font-medium text-success">Connected</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}