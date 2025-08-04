import { useState, useEffect } from "react";
import { ArrowLeft, Leaf, Calendar, Droplets, Thermometer, Sun, CloudRain, Info, Clock, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface CropManagementProps {
  onClose: () => void;
}

interface CropInfo {
  name: string;
  seasons: string[];
  plantingTime: string;
  harvestTime: string;
  waterRequirement: string;
  soilType: string[];
  temperature: string;
  spacing: string;
  fertilizer: string[];
  diseases: string[];
  pests: string[];
  bestPractices: string[];
  yield: string;
  marketPrice: string;
  irrigationFrequency: string;
  irrigationMethod: string[];
}

const cropDatabase: Record<string, CropInfo> = {
  'Wheat': {
    name: 'Wheat',
    seasons: ['Rabi (October-April)', 'Winter'],
    plantingTime: 'October-December',
    harvestTime: 'March-April',
    waterRequirement: 'Medium (450-650mm)',
    soilType: ['Loamy', 'Clay Loam', 'Sandy Loam'],
    temperature: '15-25°C during growth, 21-26°C during grain filling',
    spacing: '20-22.5 cm between rows',
    fertilizer: ['NPK 120:60:40 kg/ha', 'Urea', 'DAP', 'Muriate of Potash'],
    diseases: ['Rust', 'Smut', 'Bunt', 'Powdery Mildew'],
    pests: ['Aphids', 'Termites', 'Army Worm'],
    bestPractices: [
      'Use certified seeds for better yield',
      'Ensure proper field preparation with deep plowing',
      'Maintain optimal soil moisture during grain filling',
      'Apply fertilizers in split doses',
      'Practice crop rotation with legumes',
      'Monitor for pest and disease outbreaks regularly'
    ],
    yield: '25-30 quintals per hectare',
    marketPrice: '₹2000-2200 per quintal',
    irrigationFrequency: 'Every 15-20 days',
    irrigationMethod: ['Furrow irrigation', 'Sprinkler', 'Drip (advanced)']
  },
  'Rice': {
    name: 'Rice',
    seasons: ['Kharif (June-November)', 'Monsoon'],
    plantingTime: 'June-July',
    harvestTime: 'October-November',
    waterRequirement: 'High (1200-1300mm)',
    soilType: ['Clay', 'Clay Loam', 'Silty Clay'],
    temperature: '25-35°C during growth',
    spacing: '20x15 cm for transplanting',
    fertilizer: ['NPK 100:50:50 kg/ha', 'Urea', 'Single Super Phosphate'],
    diseases: ['Blast', 'Bacterial Leaf Blight', 'Sheath Blight'],
    pests: ['Brown Plant Hopper', 'Stem Borer', 'Leaf Folder'],
    bestPractices: [
      'Prepare nursery 25-30 days before transplanting',
      'Maintain 2-3 cm standing water in field',
      'Transplant 25-30 day old seedlings',
      'Apply organic matter to improve soil health',
      'Practice SRI (System of Rice Intensification) for better yield',
      'Ensure proper drainage during harvest'
    ],
    yield: '40-50 quintals per hectare',
    marketPrice: '₹2100-2300 per quintal',
    irrigationFrequency: 'Continuous flooding (2-3 cm water)',
    irrigationMethod: ['Flood irrigation', 'Controlled flooding', 'AWD (Alternate Wetting and Drying)']
  },
  'Cotton': {
    name: 'Cotton',
    seasons: ['Kharif (April-October)', 'Summer'],
    plantingTime: 'April-May',
    harvestTime: 'October-February (multiple picks)',
    waterRequirement: 'Medium (600-800mm)',
    soilType: ['Black Cotton Soil', 'Alluvial', 'Sandy Loam'],
    temperature: '21-30°C optimal',
    spacing: '90x45 cm or 67.5x30 cm',
    fertilizer: ['NPK 80:40:40 kg/ha', 'Urea', 'DAP', 'MOP'],
    diseases: ['Wilt', 'Leaf Curl Virus', 'Boll Rot'],
    pests: ['Bollworm', 'Aphids', 'Thrips', 'White Fly'],
    bestPractices: [
      'Use Bt cotton varieties for bollworm resistance',
      'Practice deep summer plowing',
      'Maintain proper plant population',
      'Regular monitoring for pink bollworm',
      'Use pheromone traps for pest management',
      'Ensure proper picking schedule for quality'
    ],
    yield: '15-20 quintals per hectare',
    marketPrice: '₹5500-6500 per quintal',
    irrigationFrequency: 'Every 10-15 days',
    irrigationMethod: ['Drip irrigation', 'Furrow irrigation', 'Sprinkler']
  },
  'Tomato': {
    name: 'Tomato',
    seasons: ['Rabi (October-March)', 'Summer (February-June)'],
    plantingTime: 'Nursery: August-September (Rabi), January (Summer)',
    harvestTime: '90-120 days after transplanting',
    waterRequirement: 'Medium-High (600-800mm)',
    soilType: ['Well-drained Loamy', 'Sandy Loam'],
    temperature: '20-25°C optimal, max 32°C',
    spacing: '60x45 cm or 75x45 cm',
    fertilizer: ['NPK 150:100:100 kg/ha', 'Compost', 'Calcium'],
    diseases: ['Early Blight', 'Late Blight', 'Leaf Curl Virus', 'Wilt'],
    pests: ['Fruit Borer', 'Aphids', 'Whitefly', 'Thrips'],
    bestPractices: [
      'Use disease-resistant varieties',
      'Ensure proper staking and support',
      'Maintain consistent soil moisture',
      'Apply mulching to conserve moisture',
      'Regular pruning of suckers',
      'Harvest at proper maturity stage'
    ],
    yield: '250-400 quintals per hectare',
    marketPrice: '₹800-1500 per quintal',
    irrigationFrequency: 'Every 3-5 days',
    irrigationMethod: ['Drip irrigation', 'Sprinkler', 'Basin irrigation']
  },
  'Onion': {
    name: 'Onion',
    seasons: ['Rabi (November-April)', 'Kharif (June-November)'],
    plantingTime: 'October-November (Rabi), June-July (Kharif)',
    harvestTime: '120-150 days after transplanting',
    waterRequirement: 'Medium (500-700mm)',
    soilType: ['Well-drained Loamy', 'Sandy Loam', 'Alluvial'],
    temperature: '15-25°C for bulb development',
    spacing: '15x10 cm',
    fertilizer: ['NPK 100:50:50 kg/ha', 'FYM', 'Sulphur'],
    diseases: ['Purple Blotch', 'Downy Mildew', 'Neck Rot'],
    pests: ['Thrips', 'Cutworm', 'Onion Fly'],
    bestPractices: [
      'Use quality transplants (6-8 weeks old)',
      'Ensure proper field drainage',
      'Apply sulphur for better bulb quality',
      'Stop irrigation 15-20 days before harvest',
      'Proper curing after harvest',
      'Grade according to size for better price'
    ],
    yield: '200-300 quintals per hectare',
    marketPrice: '₹1000-2000 per quintal',
    irrigationFrequency: 'Every 7-10 days',
    irrigationMethod: ['Furrow irrigation', 'Drip irrigation', 'Sprinkler']
  },
  'Potato': {
    name: 'Potato',
    seasons: ['Rabi (October-March)', 'Winter'],
    plantingTime: 'October-November',
    harvestTime: 'January-March',
    waterRequirement: 'Medium (500-700mm)',
    soilType: ['Sandy Loam', 'Loamy', 'Well-drained'],
    temperature: '15-20°C optimal',
    spacing: '60x20 cm',
    fertilizer: ['NPK 180:120:100 kg/ha', 'FYM', 'Potash'],
    diseases: ['Late Blight', 'Early Blight', 'Black Scurf'],
    pests: ['Aphids', 'Cut Worm', 'Potato Tuber Moth'],
    bestPractices: [
      'Use certified disease-free seed tubers',
      'Ensure proper earthing up',
      'Maintain ridge and furrow system',
      'Regular monitoring for late blight',
      'Harvest when skin is firm',
      'Proper storage to prevent greening'
    ],
    yield: '200-250 quintals per hectare',
    marketPrice: '₹800-1200 per quintal',
    irrigationFrequency: 'Every 7-10 days',
    irrigationMethod: ['Furrow irrigation', 'Sprinkler', 'Drip irrigation']
  }
};

export function CropManagement({ onClose }: CropManagementProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userCrops, setUserCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  useEffect(() => {
    fetchUserCrops();
  }, [user]);

  const fetchUserCrops = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('primary_crops')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data?.primary_crops) {
        setUserCrops(data.primary_crops);
        if (data.primary_crops.length > 0) {
          setSelectedCrop(data.primary_crops[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching user crops:', error);
      toast({
        title: "Error",
        description: "Could not load your crop preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1; // 1-12
    if (month >= 4 && month <= 9) {
      return 'Kharif (Monsoon Season)';
    } else {
      return 'Rabi (Winter Season)';
    }
  };

  const getSeasonRecommendation = (cropInfo: CropInfo) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentSeason = getCurrentSeason();
    
    const isOptimalSeason = cropInfo.seasons.some(season => 
      currentSeason.includes('Kharif') ? season.includes('Kharif') : season.includes('Rabi')
    );

    return {
      isOptimal: isOptimalSeason,
      message: isOptimalSeason 
        ? "✅ Optimal time for this crop!" 
        : "⚠️ Consider planting during recommended season"
    };
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (userCrops.length === 0) {
    return (
      <Card className="p-6 shadow-soft">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-foreground">Crop Management</h3>
        </div>

        <div className="text-center py-8">
          <Leaf className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h4 className="text-lg font-medium text-foreground mb-2">No Crops Selected</h4>
          <p className="text-muted-foreground mb-4">
            Please select your primary crops in Settings to view detailed management information.
          </p>
          <Button onClick={onClose} variant="outline">
            Go to Settings
          </Button>
        </div>
      </Card>
    );
  }

  const selectedCropInfo = selectedCrop ? cropDatabase[selectedCrop] : null;

  return (
    <Card className="p-6 shadow-soft max-h-[90vh] overflow-y-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Crop Management</h3>
        <Badge variant="secondary" className="ml-auto">
          {getCurrentSeason()}
        </Badge>
      </div>

      {/* Crop Selection */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-muted-foreground mb-3">Your Crops</h4>
        <div className="flex gap-2 flex-wrap">
          {userCrops.map((crop) => (
            <Button
              key={crop}
              variant={selectedCrop === crop ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCrop(crop)}
              className="gap-2"
            >
              <Leaf className="h-4 w-4" />
              {crop}
            </Button>
          ))}
        </div>
      </div>

      {selectedCropInfo && (
        <div className="space-y-6">
          {/* Crop Header */}
          <div className="bg-gradient-primary/10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-foreground">{selectedCropInfo.name}</h2>
              <Badge 
                variant={getSeasonRecommendation(selectedCropInfo).isOptimal ? "default" : "secondary"}
                className="text-xs"
              >
                {getSeasonRecommendation(selectedCropInfo).message}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Yield: </span>
                <span className="font-medium">{selectedCropInfo.yield}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Market Price: </span>
                <span className="font-medium text-green-600">{selectedCropInfo.marketPrice}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Season: </span>
                <span className="font-medium">{selectedCropInfo.seasons[0]}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Water Req: </span>
                <span className="font-medium">{selectedCropInfo.waterRequirement}</span>
              </div>
            </div>
          </div>

          {/* Detailed Information Tabs */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
              <TabsTrigger value="practices">Best Practices</TabsTrigger>
              <TabsTrigger value="protection">Protection</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Planting & Harvest</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Planting Time: </span>
                      <span className="font-medium">{selectedCropInfo.plantingTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Harvest Time: </span>
                      <span className="font-medium">{selectedCropInfo.harvestTime}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Spacing: </span>
                      <span className="font-medium">{selectedCropInfo.spacing}</span>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Thermometer className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Growing Conditions</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Temperature: </span>
                      <span className="font-medium">{selectedCropInfo.temperature}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Soil Types: </span>
                      <div className="flex gap-1 flex-wrap mt-1">
                        {selectedCropInfo.soilType.map((soil, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {soil}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Fertilizers</h4>
                  </div>
                  <div className="space-y-1">
                    {selectedCropInfo.fertilizer.map((fert, index) => (
                      <Badge key={index} variant="secondary" className="text-xs mr-1 mb-1">
                        {fert}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sun className="h-4 w-4 text-primary" />
                    <h4 className="font-medium">Seasons</h4>
                  </div>
                  <div className="space-y-1">
                    {selectedCropInfo.seasons.map((season, index) => (
                      <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                        {season}
                      </Badge>
                    ))}
                  </div>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="irrigation" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Droplets className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Irrigation Guidelines</h4>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Water Requirements</h5>
                    <p className="text-sm mb-3">{selectedCropInfo.waterRequirement}</p>
                    
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Irrigation Frequency</h5>
                    <p className="text-sm font-medium text-blue-600">{selectedCropInfo.irrigationFrequency}</p>
                  </div>
                  
                  <div>
                    <h5 className="text-sm font-medium text-muted-foreground mb-2">Recommended Methods</h5>
                    <div className="space-y-1">
                      {selectedCropInfo.irrigationMethod.map((method, index) => (
                        <Badge key={index} variant="outline" className="text-xs mr-1 mb-1">
                          {method}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Irrigation Tips</span>
                  </div>
                  <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                    <li>• Monitor soil moisture before irrigation</li>
                    <li>• Irrigate early morning or evening to reduce evaporation</li>
                    <li>• Adjust frequency based on weather conditions</li>
                    <li>• Ensure proper drainage to prevent waterlogging</li>
                  </ul>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="practices" className="space-y-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Leaf className="h-4 w-4 text-green-500" />
                  <h4 className="font-medium">Best Practices for {selectedCropInfo.name}</h4>
                </div>
                
                <div className="space-y-3">
                  {selectedCropInfo.bestPractices.map((practice, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-sm text-green-700 dark:text-green-300">{practice}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="protection" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <h4 className="font-medium">Common Diseases</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCropInfo.diseases.map((disease, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                        <span className="text-sm">{disease}</span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                    <h4 className="font-medium">Common Pests</h4>
                  </div>
                  <div className="space-y-2">
                    {selectedCropInfo.pests.map((pest, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        <span className="text-sm">{pest}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info className="h-4 w-4 text-blue-500" />
                  <h4 className="font-medium">Protection Strategies</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <h5 className="font-medium text-muted-foreground mb-2">Disease Prevention</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Use disease-resistant varieties</li>
                      <li>• Ensure proper field sanitation</li>
                      <li>• Follow crop rotation practices</li>
                      <li>• Monitor weather conditions</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-muted-foreground mb-2">Pest Management</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Regular field monitoring</li>
                      <li>• Use pheromone traps</li>
                      <li>• Encourage beneficial insects</li>
                      <li>• Apply IPM practices</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </Card>
  );
}