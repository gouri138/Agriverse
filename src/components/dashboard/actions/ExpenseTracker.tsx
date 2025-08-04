import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  expense_date: string;
  crop_id?: string;
}

interface ExpenseTrackerProps {
  onClose: () => void;
}

const expenseCategories = [
  'Seeds & Seedlings',
  'Fertilizers',
  'Pesticides',
  'Equipment',
  'Fuel',
  'Labor',
  'Irrigation',
  'Transportation',
  'Storage',
  'Other'
];

export function ExpenseTracker({ onClose }: ExpenseTrackerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: '',
    expense_date: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user?.id)
        .order('expense_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setExpenses(data || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: "Error",
        description: "Failed to fetch expenses",
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
        .from('expenses')
        .insert({
          user_id: user.id,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          expense_date: formData.expense_date
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense logged successfully"
      });

      setFormData({
        amount: '',
        category: '',
        description: '',
        expense_date: new Date().toISOString().split('T')[0]
      });
      setShowForm(false);
      fetchExpenses();
    } catch (error) {
      console.error('Error logging expense:', error);
      toast({
        title: "Error",
        description: "Failed to log expense",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Expense deleted successfully"
      });

      fetchExpenses();
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({
        title: "Error",
        description: "Failed to delete expense",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 shadow-soft">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-foreground">Expense Tracker</h3>
      </div>

      {showForm ? (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.01"
              placeholder="Amount (₹)"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              required
            />
            <Input
              type="date"
              value={formData.expense_date}
              onChange={(e) => setFormData({...formData, expense_date: e.target.value})}
              required
            />
          </div>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {expenseCategories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="Description (optional)"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Log Expense</Button>
            <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <div className="mb-6">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New Expense
          </Button>
        </div>
      )}

      <div className="space-y-3">
        <h4 className="font-medium text-foreground">Recent Expenses</h4>
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No expenses recorded yet.</p>
          </div>
        ) : (
          expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground">₹{expense.amount.toLocaleString()}</span>
                  <Badge variant="outline">{expense.category}</Badge>
                </div>
                {expense.description && (
                  <p className="text-sm text-muted-foreground mb-1">{expense.description}</p>
                )}
                <p className="text-xs text-muted-foreground">{expense.expense_date}</p>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleDelete(expense.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        
        {expenses.length > 0 && (
          <div className="pt-4 border-t">
            <div className="text-sm font-medium text-foreground">
              Total: ₹{expenses.reduce((sum, expense) => sum + expense.amount, 0).toLocaleString()}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}