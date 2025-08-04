import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Clock, Droplets, Play, Pause, Trash2, Timer } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface IrrigationSchedule {
  id: string;
  field_name: string;
  schedule_time: string;
  duration_minutes: number;
  frequency: string;
  is_active: boolean;
  last_irrigated: string | null;
}

interface IrrigationTimerProps {
  onClose: () => void;
}

export function IrrigationTimer({ onClose }: IrrigationTimerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [formData, setFormData] = useState({
    field_name: '',
    schedule_time: '',
    duration_minutes: '',
    frequency: 'daily'
  });

  useEffect(() => {
    if (user) {
      fetchSchedules();
    }
  }, [user]);

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const fetchSchedules = async () => {
    try {
      const { data, error } = await supabase
        .from('irrigation_schedules')
        .select('*')
        .eq('user_id', user?.id)
        .order('schedule_time', { ascending: true });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      toast({
        title: "Error",
        description: "Failed to fetch irrigation schedules",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .insert({
          user_id: user.id,
          field_name: formData.field_name,
          schedule_time: formData.schedule_time,
          duration_minutes: parseInt(formData.duration_minutes),
          frequency: formData.frequency,
          is_active: true
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Irrigation schedule created successfully"
      });

      setFormData({
        field_name: '',
        schedule_time: '',
        duration_minutes: '',
        frequency: 'daily'
      });
      setIsDialogOpen(false);
      fetchSchedules();
    } catch (error) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Error",
        description: "Failed to create irrigation schedule",
        variant: "destructive"
      });
    }
  };

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .update({ 
          is_active: !isActive,
          last_irrigated: !isActive ? new Date().toISOString() : null
        })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Irrigation schedule ${!isActive ? 'activated' : 'paused'}`
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive"
      });
    }
  };

  const deleteSchedule = async (scheduleId: string) => {
    try {
      const { error } = await supabase
        .from('irrigation_schedules')
        .delete()
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Irrigation schedule deleted successfully"
      });

      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive"
      });
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return 'default';
      case 'weekly': return 'secondary';
      case 'monthly': return 'secondary';
      default: return 'secondary';
    }
  };

  const getTimeRemaining = (schedule: IrrigationSchedule) => {
    if (!schedule.is_active || !schedule.last_irrigated) return null;
    
    const startTime = new Date(schedule.last_irrigated);
    const endTime = new Date(startTime.getTime() + schedule.duration_minutes * 60 * 1000);
    const remaining = endTime.getTime() - currentTime.getTime();
    
    if (remaining <= 0) return null;
    
    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    const progress = ((schedule.duration_minutes * 60 * 1000 - remaining) / (schedule.duration_minutes * 60 * 1000)) * 100;
    
    return {
      minutes,
      seconds,
      progress: Math.min(progress, 100),
      timeString: `${minutes}:${seconds.toString().padStart(2, '0')}`
    };
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-foreground">Irrigation Timer</h3>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Irrigation Schedule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Field name (e.g., Tomato Field A)"
                value={formData.field_name}
                onChange={(e) => setFormData({...formData, field_name: e.target.value})}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="time"
                  value={formData.schedule_time}
                  onChange={(e) => setFormData({...formData, schedule_time: e.target.value})}
                  required
                />
                <Input
                  type="number"
                  placeholder="Duration (minutes)"
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                  required
                />
              </div>
              <Select value={formData.frequency} onValueChange={(value) => setFormData({...formData, frequency: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">Create Schedule</Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
          ))}
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Droplets className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No irrigation schedules yet.</p>
          <p className="text-sm">Create your first schedule to automate watering!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {schedules.map((schedule) => (
            <div key={schedule.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Droplets className="h-4 w-4 text-primary" />
                  <h4 className="font-medium text-foreground">{schedule.field_name}</h4>
                  <Badge variant={getFrequencyColor(schedule.frequency)} className="text-xs">
                    {schedule.frequency}
                  </Badge>
                  {schedule.is_active && (
                    <Badge variant="default" className="text-xs">Active</Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {schedule.schedule_time}
                  </span>
                  <span>{schedule.duration_minutes} minutes</span>
                  {schedule.last_irrigated && !getTimeRemaining(schedule) && (
                    <span>Last: {new Date(schedule.last_irrigated).toLocaleDateString()}</span>
                  )}
                </div>
                
                {/* Time Remaining Display */}
                {getTimeRemaining(schedule) && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Timer className="h-3 w-3 text-primary" />
                      <span className="font-medium text-primary">
                        Time remaining: {getTimeRemaining(schedule)?.timeString}
                      </span>
                    </div>
                    <Progress 
                      value={getTimeRemaining(schedule)?.progress} 
                      className="h-2"
                    />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={schedule.is_active ? "outline" : "default"}
                  onClick={() => toggleSchedule(schedule.id, schedule.is_active)}
                  className="gap-1"
                >
                  {schedule.is_active ? (
                    <>
                      <Pause className="h-3 w-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3" />
                      Start
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => deleteSchedule(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Active Schedule Summary */}
      {schedules.length > 0 && (
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Active Schedules: </span>
              <span className="font-medium text-foreground">
                {schedules.filter(s => s.is_active).length}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Total Fields: </span>
              <span className="font-medium text-foreground">
                {schedules.length}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}