import { useState, useRef } from "react";
import { ArrowLeft, Camera, Upload, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface PestReporterProps {
  onClose: () => void;
}

export function PestReporter({ onClose }: PestReporterProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const handleImageCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!image || !user) {
      toast({
        title: "Error",
        description: "Please capture an image first",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('pest-identification', {
        body: {
          imageBase64: image,
          description,
          userId: user.id
        }
      });

      if (error) throw error;

      setAnalysis(data.aiAnalysis);
      toast({
        title: "Success",
        description: "Pest report submitted successfully"
      });
    } catch (error) {
      console.error('Error submitting pest report:', error);
      toast({
        title: "Error",
        description: "Failed to submit pest report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Report Pest/Disease</h3>
      </div>

      <div className="space-y-6">
        {/* Image Capture */}
        <div className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            {image ? (
              <div className="space-y-4">
                <img 
                  src={image} 
                  alt="Captured pest/disease" 
                  className="max-w-full h-48 mx-auto rounded-lg object-cover"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setImage(null)}
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <p className="font-medium text-foreground">Capture or Upload Image</p>
                  <p className="text-sm text-muted-foreground">Take a clear photo of the affected crop</p>
                </div>
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="gap-2"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Image
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageCapture}
            className="hidden"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Description (Optional)
          </label>
          <Textarea
            placeholder="Describe what you've observed (symptoms, affected area, etc.)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={loading || !image}
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Analyzing...
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4" />
              Submit Report
            </>
          )}
        </Button>

        {/* AI Analysis Results */}
        {analysis && (
          <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
            <h4 className="font-medium text-foreground">AI Analysis Results</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Identified:</p>
                <p className="font-medium text-foreground">
                  {analysis.identified ? analysis.pest_name : 'Not identified'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Severity:</p>
                <Badge variant={getSeverityColor(analysis.severity)}>
                  {analysis.severity}
                </Badge>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Confidence:</p>
              <p className="font-medium text-foreground">
                {Math.round((analysis.confidence || 0) * 100)}%
              </p>
            </div>

            {analysis.treatment && (
              <div>
                <p className="text-sm text-muted-foreground">Treatment Recommendations:</p>
                <p className="text-sm text-foreground">{analysis.treatment}</p>
              </div>
            )}

            {analysis.prevention && (
              <div>
                <p className="text-sm text-muted-foreground">Prevention Measures:</p>
                <p className="text-sm text-foreground">{analysis.prevention}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}