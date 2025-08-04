import { useState, useEffect } from "react";
import { ArrowLeft, MapPin, ExternalLink, Filter, Search, Settings, FileText, DollarSign, Shield, Lightbulb, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

interface GovernmentSchemesProps {
  onClose: () => void;
}

interface Scheme {
  id: string;
  name: string;
  description: string;
  category: string;
  eligibility: string;
  benefits: string;
  applicationProcess: string;
  deadline: string;
  authority: string;
  status: 'active' | 'upcoming' | 'expired';
  link: string;
}

// Mock data for government schemes
const schemes: Scheme[] = [
  {
    id: '1',
    name: 'PM-KISAN Samman Nidhi',
    description: 'Direct income support to small and marginal farmers',
    category: 'Financial Support',
    eligibility: 'Small and marginal farmers with cultivable land',
    benefits: '₹6,000 per year in three installments',
    applicationProcess: 'Online application through PM-KISAN portal',
    deadline: 'Ongoing',
    authority: 'Ministry of Agriculture & Farmers Welfare',
    status: 'active',
    link: 'https://pmkisan.gov.in'
  },
  {
    id: '2',
    name: 'Crop Insurance Scheme (PMFBY)',
    description: 'Comprehensive insurance coverage for crops',
    category: 'Insurance',
    eligibility: 'All farmers (loanee and non-loanee)',
    benefits: 'Premium subsidy up to 90% for small farmers',
    applicationProcess: 'Through banks or CSCs',
    deadline: 'Before sowing season',
    authority: 'Ministry of Agriculture & Farmers Welfare',
    status: 'active',
    link: 'https://pmfby.gov.in'
  },
  {
    id: '3',
    name: 'Soil Health Card Scheme',
    description: 'Free soil testing and nutrient management advice',
    category: 'Soil Management',
    eligibility: 'All farmers',
    benefits: 'Free soil testing and fertilizer recommendations',
    applicationProcess: 'Contact local agriculture office',
    deadline: 'Ongoing',
    authority: 'State Agriculture Department',
    status: 'active',
    link: 'https://soilhealth.dac.gov.in'
  },
  {
    id: '4',
    name: 'MGNREGA',
    description: 'Rural employment guarantee scheme',
    category: 'Employment',
    eligibility: 'Rural households willing to do manual work',
    benefits: '100 days guaranteed employment per year',
    applicationProcess: 'Apply at Gram Panchayat',
    deadline: 'Ongoing',
    authority: 'Ministry of Rural Development',
    status: 'active',
    link: 'https://nrega.nic.in'
  },
  {
    id: '5',
    name: 'Kisan Credit Card',
    description: 'Easy access to credit for farming needs',
    category: 'Credit',
    eligibility: 'Farmers with land records',
    benefits: 'Flexible credit up to ₹3 lakhs at 4% interest',
    applicationProcess: 'Apply at any bank branch',
    deadline: 'Ongoing',
    authority: 'Banking System',
    status: 'active',
    link: 'https://www.india.gov.in/spotlight/kisan-credit-card-kcc'
  },
  {
    id: '6',
    name: 'National Agriculture Market (e-NAM)',
    description: 'Online trading platform for agricultural commodities',
    category: 'Marketing',
    eligibility: 'All farmers and traders',
    benefits: 'Better price discovery and transparent trading',
    applicationProcess: 'Online registration on e-NAM portal',
    deadline: 'Ongoing',
    authority: 'Ministry of Agriculture & Farmers Welfare',
    status: 'active',
    link: 'https://enam.gov.in'
  }
];

const categories = ['All', 'Financial Support', 'Insurance', 'Credit', 'Soil Management', 'Employment', 'Marketing'];

export function GovernmentSchemes({ onClose }: GovernmentSchemesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredSchemes, setFilteredSchemes] = useState(schemes);
  const [activeTab, setActiveTab] = useState('browse');

  useEffect(() => {
    handleSearch();
  }, [searchTerm, selectedCategory]);

  const handleSearch = () => {
    let filtered = schemes;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(scheme => scheme.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(scheme =>
        scheme.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        scheme.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredSchemes(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'upcoming': return 'secondary';
      case 'expired': return 'destructive';
      default: return 'secondary';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Financial Support': return DollarSign;
      case 'Insurance': return Shield;
      case 'Credit': return FileText;
      case 'Soil Management': return Lightbulb;
      case 'Employment': return Users;
      case 'Marketing': return MapPin;
      default: return Settings;
    }
  };

  const categoryStats = categories.slice(1).map(category => ({
    name: category,
    count: schemes.filter(s => s.category === category).length,
    icon: getCategoryIcon(category)
  }));

  return (
    <div className="max-h-[90vh] overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-4 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6" />
            <h2 className="text-xl font-bold">Government Schemes</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{schemes.length}</div>
            <div className="text-sm opacity-90">Total Schemes</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{schemes.filter(s => s.status === 'active').length}</div>
            <div className="text-sm opacity-90">Active</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{categories.length - 1}</div>
            <div className="text-sm opacity-90">Categories</div>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">24/7</div>
            <div className="text-sm opacity-90">Support</div>
          </div>
        </div>
      </div>

      {/* Content */}
      <Card className="rounded-t-none border-t-0 shadow-soft">
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="browse">Browse Schemes</TabsTrigger>
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="space-y-6">
              {/* Search and Filter */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search schemes by name, description, or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Results Summary */}
              {(searchTerm || selectedCategory !== 'All') && (
                <div className="flex items-center justify-between py-2 px-4 bg-muted/30 rounded-lg">
                  <span className="text-sm text-muted-foreground">
                    Found {filteredSchemes.length} scheme{filteredSchemes.length !== 1 ? 's' : ''}
                    {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                    {searchTerm && ` matching "${searchTerm}"`}
                  </span>
                  {(searchTerm || selectedCategory !== 'All') && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('All');
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}

              {/* Schemes Grid */}
              <div className="grid gap-6">
                {filteredSchemes.map((scheme) => {
                  const CategoryIcon = getCategoryIcon(scheme.category);
                  return (
                    <Card key={scheme.id} className="overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                              <CategoryIcon className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-semibold text-foreground">{scheme.name}</h3>
                                <Badge variant={getStatusColor(scheme.status)} className="text-xs">
                                  {scheme.status.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-3">{scheme.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {scheme.category}
                              </Badge>
                            </div>
                          </div>
                          <Button
                            onClick={() => window.open(scheme.link, '_blank')}
                            className="bg-green-600 hover:bg-green-700 gap-2"
                          >
                            <ExternalLink className="h-4 w-4" />
                            Apply Now
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Eligibility</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">{scheme.eligibility}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Benefits</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">{scheme.benefits}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Application Process</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">{scheme.applicationProcess}</p>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm font-medium">Deadline</span>
                            </div>
                            <p className="text-sm text-muted-foreground pl-6">{scheme.deadline}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Settings className="h-4 w-4" />
                            <span>{scheme.authority}</span>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(scheme.link, '_blank')}>
                            View Details
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                {filteredSchemes.length === 0 && (
                  <Card className="p-8">
                    <div className="text-center text-muted-foreground">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No schemes found</h3>
                      <p className="text-sm">Try adjusting your search terms or filters to find relevant schemes.</p>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((category) => {
                  const Icon = category.icon;
                  return (
                    <Card 
                      key={category.name} 
                      className="p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setActiveTab('browse');
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Icon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{category.name}</h3>
                          <p className="text-sm text-muted-foreground">{category.count} schemes</p>
                        </div>
                      </div>
                      <Progress value={(category.count / schemes.length) * 100} className="h-2" />
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Official Portals</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'PM-KISAN Portal', url: 'https://pmkisan.gov.in' },
                      { name: 'PMFBY Portal', url: 'https://pmfby.gov.in' },
                      { name: 'Farmer Portal', url: 'https://farmer.gov.in' },
                      { name: 'e-NAM Portal', url: 'https://enam.gov.in' }
                    ].map((portal) => (
                      <Button
                        key={portal.name}
                        variant="outline"
                        className="w-full justify-between"
                        onClick={() => window.open(portal.url, '_blank')}
                      >
                        {portal.name}
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="font-semibold mb-4">Help & Support</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-sm">Toll Free Number</div>
                      <div className="text-sm text-muted-foreground">1800-180-1551</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-sm">Email Support</div>
                      <div className="text-sm text-muted-foreground">pmkisan-ict@gov.in</div>
                    </div>
                    <div className="p-3 bg-muted/30 rounded-lg">
                      <div className="font-medium text-sm">Office Hours</div>
                      <div className="text-sm text-muted-foreground">Monday - Friday, 9 AM - 6 PM</div>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}