import { useState } from "react";
import { Task, TaskFormValues } from "@shared/schema";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { TaskForm } from "@/components/task-form";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, MoreVertical, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskListProps {
  tasks: Task[];
  isLoading: boolean;
}

export function TaskList({ tasks, isLoading }: TaskListProps) {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const handleOpenTaskModal = () => {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  };

  const handleCloseTaskModal = () => {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (taskData: TaskFormValues) => {
    try {
      if (editingTask) {
        // Update existing task
        await apiRequest("PUT", `/api/tasks/${editingTask.id}`, taskData);
        toast({
          title: "Task updated",
          description: "Your task has been updated successfully.",
        });
      } else {
        // Create new task
        await apiRequest("POST", "/api/tasks", taskData);
        toast({
          title: "Task created",
          description: "Your new task has been created.",
        });
      }
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      handleCloseTaskModal();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Something went wrong",
        description: "There was a problem with your request. Please try again.",
      });
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await apiRequest("DELETE", `/api/tasks/${taskId}`, undefined);
      toast({
        title: "Task deleted",
        description: "The task has been removed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete",
        description: "There was a problem deleting the task. Please try again.",
      });
    }
  };

  const toggleTaskCompletion = async (task: Task) => {
    try {
      await apiRequest("PATCH", `/api/tasks/${task.id}/toggle`, undefined);
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update task status.",
      });
    }
  };

  const formatDateString = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <>
      <div className="bg-white shadow rounded-lg">
        <div className="p-4 sm:p-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
              <div className="mt-6">
                <Button onClick={handleOpenTaskModal}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  New Task
                </Button>
              </div>
            </div>
          ) : (
            <ul role="list" className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id} className="py-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 pt-1">
                      <Checkbox 
                        id={`task-${task.id}`}
                        checked={task.completed}
                        onCheckedChange={() => toggleTaskCompletion(task)}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 
                          className={cn(
                            "text-sm font-medium", 
                            task.completed ? "line-through text-gray-500" : "text-gray-900"
                          )}
                        >
                          {task.title}
                        </h3>
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          getPriorityClass(task.priority)
                        )}>
                          {task.priority}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {task.tag}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{task.description}</p>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                        <span>{formatDateString(task.dueDate)}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 self-center">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="-m-2 p-2 rounded-full">
                            <span className="sr-only">Open menu</span>
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditTask(task)}>
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Task form modal */}
      <TaskForm 
        isOpen={isTaskModalOpen}
        onClose={handleCloseTaskModal}
        onSave={handleSaveTask}
        editingTask={editingTask}
      />
    </>
  );
}

function ClipboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}
