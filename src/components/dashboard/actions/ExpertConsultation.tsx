import { useState, useEffect } from "react";
import { ArrowLeft, MessageCircle, Send, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ExpertConsultationProps {
  onClose: () => void;
}

interface ExpertQuery {
  id: string;
  question: string;
  category: string;
  status: 'pending' | 'answered';
  expert_response: string | null;
  created_at: string;
  answered_at: string | null;
}

const categories = [
  'Crop Management',
  'Pest & Disease',
  'Soil & Fertilizer',
  'Irrigation',
  'Market & Pricing',
  'Weather Related',
  'Equipment',
  'General'
];

export function ExpertConsultation({ onClose }: ExpertConsultationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [queries, setQueries] = useState<ExpertQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    category: ''
  });

  useEffect(() => {
    if (user) {
      fetchQueries();
    }
  }, [user]);

  const fetchQueries = async () => {
    try {
      const { data, error } = await supabase
        .from('expert_queries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setQueries((data || []).map(query => ({
        ...query,
        status: query.status as 'pending' | 'answered'
      })));
    } catch (error) {
      console.error('Error fetching queries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expert queries",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.question.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke('expert-query', {
        body: {
          question: formData.question.trim(),
          category: formData.category,
          userId: user.id,
          autoAnswer: true // Enable AI auto-response
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Your question has been submitted and answered!"
      });

      setFormData({
        question: '',
        category: ''
      });

      // Refresh the queries to show the new answer
      fetchQueries();
    } catch (error) {
      console.error('Error submitting query:', error);
      toast({
        title: "Error",
        description: "Failed to submit your question",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'default';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Ask Expert</h3>
      </div>

      {/* Submit New Question */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium text-foreground">Ask a Question</h4>
        
        <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Textarea
          placeholder="Describe your farming question or concern in detail..."
          value={formData.question}
          onChange={(e) => setFormData({...formData, question: e.target.value})}
          rows={4}
          required
        />

        <Button 
          type="submit" 
          disabled={submitting || !formData.question.trim()}
          className="gap-2"
        >
          {submitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Submit Question
            </>
          )}
        </Button>
      </form>

      {/* Previous Queries */}
      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Your Questions</h4>
        
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : queries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No questions asked yet.</p>
            <p className="text-sm">Ask your first farming question above!</p>
          </div>
        ) : (
          queries.map((query) => (
            <div key={query.id} className="p-4 border rounded-lg space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(query.status)}
                    <Badge variant={getStatusColor(query.status)} className="text-xs">
                      {query.status}
                    </Badge>
                    {query.category && (
                      <Badge variant="outline" className="text-xs">
                        {query.category}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-foreground">{query.question}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Asked: {new Date(query.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {query.expert_response && (
                <div className="mt-3 p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span className="text-base font-semibold text-green-800">Expert Answer</span>
                    {query.answered_at && (
                      <span className="text-xs text-green-600 ml-auto">
                        {new Date(query.answered_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-green-900 leading-relaxed whitespace-pre-wrap bg-white p-3 rounded border border-green-100">
                    {query.expert_response}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Help Section */}
      <div className="mt-6 pt-4 border-t">
        <h5 className="font-medium text-foreground mb-2">Tips for Better Responses</h5>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Be specific about your crop, location, and problem</li>
          <li>• Include details about soil type, weather conditions</li>
          <li>• Mention any symptoms or changes you've observed</li>
          <li>• Ask one clear question at a time</li>
        </ul>
      </div>
    </Card>
  );
}