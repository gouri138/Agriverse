import { useState, useEffect } from "react";
import { Plus, Clock, CheckCircle, AlertCircle, Trash2, Edit } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";

interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string;
  due_time: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  crop_name: string;
}

export function TaskManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    due_time: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    crop_name: ''
  });

  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user?.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks((data || []) as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: t("common.error"),
        description: t("tasks.failedToFetch"),
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
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update(formData)
          .eq('id', editingTask.id);

        if (error) throw error;
        toast({ title: t("common.success"), description: t("tasks.taskUpdated") });
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert({
            ...formData,
            user_id: user.id
          });

        if (error) throw error;
        toast({ title: t("common.success"), description: t("tasks.taskCreated") });
      }

      fetchTasks();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving task:', error);
      toast({
        title: t("common.error"),
        description: t("tasks.failedToSave"),
        variant: "destructive"
      });
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: Task['status']) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
      toast({ title: t("common.success"), description: t("tasks.statusUpdated") });
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: t("common.error"),
        description: t("tasks.failedToUpdate"),
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
      toast({ title: t("common.success"), description: t("tasks.taskDeleted") });
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: t("common.error"),
        description: t("tasks.failedToDelete"),
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      due_date: '',
      due_time: '',
      priority: 'medium',
      crop_name: ''
    });
    setEditingTask(null);
  };

  const openEditDialog = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      due_date: task.due_date || '',
      due_time: task.due_time || '',
      priority: task.priority,
      crop_name: task.crop_name || ''
    });
    setIsDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-warning" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-soft">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-1/4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-foreground">{t("tasks.title")}</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              size="sm" 
              className="gap-2"
              onClick={() => { resetForm(); setIsDialogOpen(true); }}
            >
              <Plus className="h-4 w-4" />
              {t("tasks.addTask")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTask ? t("tasks.editTask") : t("tasks.createNewTask")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder={t("tasks.taskTitle")}
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <Textarea
                placeholder={t("tasks.description")}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
              <Input
                placeholder={t("tasks.cropName")}
                value={formData.crop_name}
                onChange={(e) => setFormData({...formData, crop_name: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
                <Input
                  type="time"
                  value={formData.due_time}
                  onChange={(e) => setFormData({...formData, due_time: e.target.value})}
                />
              </div>
              <Select value={formData.priority} onValueChange={(value: any) => setFormData({...formData, priority: value})}>
                <SelectTrigger>
                  <SelectValue placeholder={t("tasks.priority")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("tasks.lowPriority")}</SelectItem>
                  <SelectItem value="medium">{t("tasks.mediumPriority")}</SelectItem>
                  <SelectItem value="high">{t("tasks.highPriority")}</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingTask ? t("tasks.updateTask") : t("tasks.createTask")}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {t("common.cancel")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{t("tasks.noTasks")}</p>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {getStatusIcon(task.status)}
                  <h4 className="font-medium text-foreground">{task.title}</h4>
                  <Badge variant={getPriorityColor(task.priority)}>
                    {t(`tasks.${task.priority}`)}
                  </Badge>
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mb-1">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {task.crop_name && <span>🌱 {task.crop_name}</span>}
                  {task.due_date && <span>📅 {task.due_date}</span>}
                  {task.due_time && <span>⏰ {task.due_time}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={task.status}
                  onValueChange={(value: Task['status']) => handleStatusUpdate(task.id, value)}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">{t("tasks.pending")}</SelectItem>
                    <SelectItem value="in_progress">{t("tasks.inProgress")}</SelectItem>
                    <SelectItem value="completed">{t("tasks.completed")}</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => openEditDialog(task)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(task.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}