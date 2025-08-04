import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Heart, MapPin, Phone, Mail, Filter, Star } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MarketplaceListing {
  id: string;
  title: string;
  description: string;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  region: string;
  image_url: string;
  contact_phone: string;
  contact_email: string;
  crop_type: string;
  created_at: string;
  user_id: string;
  profiles?: {
    full_name: string;
  } | null;
}

interface MarketplaceFavorite {
  id: string;
  listing_id: string;
}

const categories = [
  { value: "crops", label: "🌾 Crops", icon: "🌾" },
  { value: "seeds", label: "🌱 Seeds", icon: "🌱" },
  { value: "fertilizers", label: "🧪 Fertilizers", icon: "🧪" },
  { value: "tools", label: "🛠️ Tools", icon: "🛠️" },
  { value: "livestock", label: "🐄 Livestock", icon: "🐄" }
];

export function Marketplace() {
  const { user } = useAuth();
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [favorites, setFavorites] = useState<MarketplaceFavorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [activeTab, setActiveTab] = useState("browse");

  // New listing form state
  const [newListing, setNewListing] = useState({
    title: "",
    description: "",
    category: "",
    price: "",
    quantity: "",
    unit: "kg",
    location: "",
    region: "",
    contact_phone: "",
    contact_email: "",
    crop_type: ""
  });

  useEffect(() => {
    fetchListings();
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_listings')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
      toast({
        title: "Error",
        description: "Failed to load marketplace listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('marketplace_favorites')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const handleCreateListing = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('marketplace_listings')
        .insert([{
          ...newListing,
          price: parseFloat(newListing.price),
          quantity: parseFloat(newListing.quantity),
          user_id: user.id
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Listing created successfully!",
        variant: "default"
      });

      setNewListing({
        title: "",
        description: "",
        category: "",
        price: "",
        quantity: "",
        unit: "kg",
        location: "",
        region: "",
        contact_phone: "",
        contact_email: "",
        crop_type: ""
      });
      
      fetchListings();
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: "Error",
        description: "Failed to create listing",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async (listingId: string) => {
    if (!user) return;

    const isFavorited = favorites.some(fav => fav.listing_id === listingId);

    try {
      if (isFavorited) {
        const { error } = await supabase
          .from('marketplace_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('marketplace_favorites')
          .insert([{
            user_id: user.id,
            listing_id: listingId
          }]);

        if (error) throw error;
      }

      fetchFavorites();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    }
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.crop_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || listing.category === selectedCategory;
    const matchesRegion = selectedRegion === "all" || listing.region === selectedRegion;

    return matchesSearch && matchesCategory && matchesRegion;
  }).sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price;
      case "price-high":
        return b.price - a.price;
      case "newest":
      default:
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    }
  });

  const favoriteListings = listings.filter(listing => 
    favorites.some(fav => fav.listing_id === listing.id)
  );

  const regions = [...new Set(listings.map(listing => listing.region).filter(Boolean))];

  if (loading) {
    return <div className="flex justify-center p-8">Loading marketplace...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">🛒 Market & Tools</h1>
          <p className="text-muted-foreground">Buy and sell farming products in your local area</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Post Listing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Listing</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newListing.title}
                  onChange={(e) => setNewListing({...newListing, title: e.target.value})}
                  placeholder="Fresh Organic Tomatoes"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={newListing.category} onValueChange={(value) => setNewListing({...newListing, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Crop Type (if applicable)</label>
                <Input
                  value={newListing.crop_type}
                  onChange={(e) => setNewListing({...newListing, crop_type: e.target.value})}
                  placeholder="Tomatoes, Wheat, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Price (₹)</label>
                <Input
                  type="number"
                  value={newListing.price}
                  onChange={(e) => setNewListing({...newListing, price: e.target.value})}
                  placeholder="100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Quantity & Unit</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={newListing.quantity}
                    onChange={(e) => setNewListing({...newListing, quantity: e.target.value})}
                    placeholder="50"
                    className="flex-1"
                  />
                  <Select value={newListing.unit} onValueChange={(value) => setNewListing({...newListing, unit: value})}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="tons">tons</SelectItem>
                      <SelectItem value="pieces">pcs</SelectItem>
                      <SelectItem value="boxes">boxes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={newListing.location}
                  onChange={(e) => setNewListing({...newListing, location: e.target.value})}
                  placeholder="Village/City name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Region/State</label>
                <Input
                  value={newListing.region}
                  onChange={(e) => setNewListing({...newListing, region: e.target.value})}
                  placeholder="State name"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact Phone</label>
                <Input
                  value={newListing.contact_phone}
                  onChange={(e) => setNewListing({...newListing, contact_phone: e.target.value})}
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact Email</label>
                <Input
                  type="email"
                  value={newListing.contact_email}
                  onChange={(e) => setNewListing({...newListing, contact_email: e.target.value})}
                  placeholder="email@example.com"
                />
              </div>

              <div className="col-span-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newListing.description}
                  onChange={(e) => setNewListing({...newListing, description: e.target.value})}
                  placeholder="Describe your product, quality, harvesting details..."
                  rows={3}
                />
              </div>

              <div className="col-span-2">
                <Button onClick={handleCreateListing} className="w-full">
                  Create Listing
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="browse">Browse Listings</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
          <TabsTrigger value="favorites">My Favorites ({favoriteListings.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 p-4 bg-card rounded-lg border">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listings Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => (
              <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{listing.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">
                          {categories.find(c => c.value === listing.category)?.icon} {listing.category}
                        </Badge>
                        {listing.crop_type && (
                          <Badge variant="outline">{listing.crop_type}</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavorite(listing.id)}
                      className="p-1"
                    >
                      <Heart 
                        className={`h-4 w-4 ${favorites.some(fav => fav.listing_id === listing.id) 
                          ? 'fill-red-500 text-red-500' 
                          : 'text-muted-foreground'}`}
                      />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-2xl font-bold text-primary">
                    ₹{listing.price.toLocaleString()} 
                    <span className="text-sm font-normal text-muted-foreground">
                      /{listing.unit}
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Available: {listing.quantity} {listing.unit}
                  </div>

                  {listing.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {listing.description}
                    </p>
                  )}

                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {listing.location}, {listing.region}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    Posted by: Anonymous Farmer
                  </div>

                  <div className="flex gap-2 pt-2">
                    {listing.contact_phone && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Phone className="h-4 w-4 mr-1" />
                        Call
                      </Button>
                    )}
                    {listing.contact_email && (
                      <Button variant="outline" size="sm" className="flex-1">
                        <Mail className="h-4 w-4 mr-1" />
                        Email
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredListings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No listings found matching your criteria.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => {
              const categoryListings = listings.filter(l => l.category === category.value);
              return (
                <Card key={category.value} className="cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => {
                        setSelectedCategory(category.value);
                        setActiveTab("browse");
                      }}>
                  <CardHeader className="text-center">
                    <div className="text-4xl mb-2">{category.icon}</div>
                    <CardTitle>{category.label}</CardTitle>
                    <p className="text-muted-foreground">
                      {categoryListings.length} items available
                    </p>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          {favoriteListings.length === 0 ? (
            <div className="text-center py-12">
              <Star className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">You haven't favorited any listings yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteListings.map((listing) => (
                <Card key={listing.id} className="hover:shadow-lg transition-shadow">
                  {/* Same card content as browse tab */}
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{listing.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">
                            {categories.find(c => c.value === listing.category)?.icon} {listing.category}
                          </Badge>
                          {listing.crop_type && (
                            <Badge variant="outline">{listing.crop_type}</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleFavorite(listing.id)}
                        className="p-1"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="text-2xl font-bold text-primary">
                      ₹{listing.price.toLocaleString()} 
                      <span className="text-sm font-normal text-muted-foreground">
                        /{listing.unit}
                      </span>
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      Available: {listing.quantity} {listing.unit}
                    </div>

                    {listing.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {listing.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {listing.location}, {listing.region}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      Posted by: Anonymous Farmer
                    </div>

                    <div className="flex gap-2 pt-2">
                      {listing.contact_phone && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Phone className="h-4 w-4 mr-1" />
                          Call
                        </Button>
                      )}
                      {listing.contact_email && (
                        <Button variant="outline" size="sm" className="flex-1">
                          <Mail className="h-4 w-4 mr-1" />
                          Email
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}