import { useState, useEffect } from "react";
import { ArrowLeft, Play, Search, BookOpen, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface VideoTutorialsProps {
  onClose: () => void;
}

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  channel: string;
  publishedAt: string;
  url: string;
}

interface VideoCategories {
  [category: string]: Video[];
}

export function VideoTutorials({ onClose }: VideoTutorialsProps) {
  const { toast } = useToast();
  const [videos, setVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<VideoCategories>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (query = 'farming techniques') => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('youtube-videos', {
        body: { query, maxResults: 16 }
      });

      if (error) throw error;

      setVideos(data.videos || []);
      setCategories(data.categories || {});
    } catch (error) {
      console.error('Error fetching videos:', error);
      toast({
        title: "Error",
        description: "Failed to fetch video tutorials",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      fetchVideos(searchTerm.trim());
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank');
  };

  const VideoCard = ({ video }: { video: Video }) => (
    <div className="group cursor-pointer" onClick={() => openVideo(video.url)}>
      <div className="relative overflow-hidden rounded-lg mb-3">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <Play className="h-8 w-8 text-white" />
        </div>
        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          <ExternalLink className="h-3 w-3" />
        </div>
      </div>
      <h4 className="font-medium text-foreground text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
        {video.title}
      </h4>
      <p className="text-xs text-muted-foreground mb-1">{video.channel}</p>
      <p className="text-xs text-muted-foreground">
        {new Date(video.publishedAt).toLocaleDateString()}
      </p>
    </div>
  );

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Video Tutorials</h3>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search farming videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </form>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="space-y-2">
              <div className="h-32 bg-muted rounded-lg animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
            </div>
          ))}
        </div>
      ) : (
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All Videos</TabsTrigger>
            <TabsTrigger value="crop">Crop Mgmt</TabsTrigger>
            <TabsTrigger value="irrigation">Irrigation</TabsTrigger>
            <TabsTrigger value="pest">Pest Control</TabsTrigger>
            <TabsTrigger value="general">General</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            {videos.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No videos found.</p>
                <p className="text-sm">Try a different search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {videos.map((video) => (
                  <VideoCard key={video.id} video={video} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="crop" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(categories['Crop Management'] || []).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="irrigation" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(categories['Irrigation & Water'] || []).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pest" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(categories['Pest Control'] || []).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="general" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {(categories['General Farming'] || []).map((video) => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Quick Search Suggestions */}
      <div className="mt-6 pt-4 border-t">
        <h5 className="font-medium text-foreground mb-3">Popular Topics</h5>
        <div className="flex flex-wrap gap-2">
          {[
            'organic farming',
            'drip irrigation',
            'pest management',
            'soil testing',
            'crop rotation',
            'greenhouse farming',
            'composting',
            'seed selection'
          ].map((topic) => (
            <Button
              key={topic}
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchTerm(topic);
                fetchVideos(topic);
              }}
              className="text-xs"
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
}