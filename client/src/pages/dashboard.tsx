import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth-context";
import { Navbar } from "@/components/navbar";
import { TaskList } from "@/components/task-list";
import { TaskFilters } from "@/components/task-filters";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";
import { TaskFilter, Task, TaskFormValues } from "@shared/schema";
import { PlusCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilter>({
    status: "all",
    tag: "all",
    search: "",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/tasks?userId=${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json();
    },
    enabled: !!user,
  });

  // Filter tasks
  const filteredTasks = tasks.filter((task: Task) => {
    // Filter by status
    if (filters.status === "pending" && task.completed) return false;
    if (filters.status === "completed" && !task.completed) return false;
    
    // Filter by tag
    if (filters.tag !== "all" && task.tag !== filters.tag) return false;
    
    // Filter by search text
    if (filters.search && 
        !task.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !task.description?.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  const handleSaveTask = async (taskData: TaskFormValues) => {
    try {
      await apiRequest("POST", "/api/tasks", taskData);
      toast({
        title: "Task created",
        description: "Your new task has been created.",
      });
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      setIsTaskModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "There was a problem with your request. Please try again.",
      });
    }
  };

  if (!user) return null; // Don't render until auth check completes

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Task Header */}
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="flex-1 min-w-0">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">Tasks</h2>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4">
            <Button onClick={() => setIsTaskModalOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              New Task
            </Button>
          </div>
        </div>
        
        {/* Filters */}
        <TaskFilters onFilterChange={setFilters} />
        
        {/* Task List */}
        <TaskList 
          tasks={filteredTasks} 
          isLoading={isLoading} 
        />
        
        {/* New Task Modal */}
        <TaskForm 
          isOpen={isTaskModalOpen}
          onClose={() => setIsTaskModalOpen(false)}
          onSave={handleSaveTask}
          editingTask={null}
        />
      </main>
    </div>
  );
}
