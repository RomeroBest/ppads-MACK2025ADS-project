// client/src/pages/dashboard.tsx
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
  // 1) Hooks sempre no topo
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [filters, setFilters] = useState<TaskFilter>({
    status: "all",
    tag: "all",
    search: "",
  });

  // 2) useQuery sempre chamado, mas somente “ativa” quando tiver user
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["/api/tasks", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/tasks?userId=${user.id}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch tasks");
      return res.json() as Promise<Task[]>;
    },
    enabled: !!user,
  });

  // 3) useEffect sempre chamado, mas só redireciona quando loading===false
  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
  }, [loading, user, setLocation]);

  // 4) Retorno condicional SÓ depois de hooks
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        Carregando…
      </div>
    );
  }

  // 5) Se carregar e não tiver user, já foi redirecionado no useEffect acima.
  //    Aqui podemos assumir que existe um `user`.

  // 6) Filtra as tasks em memória
  const filteredTasks = tasks.filter((task: Task) => {
    if (filters.status === "pending" && task.completed) return false;
    if (filters.status === "completed" && !task.completed) return false;
    if (filters.tag !== "all" && task.tag !== filters.tag) return false;
    if (
      filters.search &&
      !task.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !task.description?.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleSaveTask = async (taskData: TaskFormValues) => {
    try {
      await apiRequest("POST", "/api/tasks", taskData);
      toast({ title: "Task created", description: "Your new task has been created." });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks", user?.id] });
      setIsTaskModalOpen(false);
    } catch {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "Could not create the task. Please try again.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <h2 className="text-2xl font-bold">Tasks</h2>
          <Button onClick={() => setIsTaskModalOpen(true)}>
            <PlusCircle className="mr-2 h-5 w-5" />
            New Task
          </Button>
        </div>
        <TaskFilters onFilterChange={setFilters} />
        <TaskList tasks={filteredTasks} isLoading={isLoading} />
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
