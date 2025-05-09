import { useState } from "react";
import { TaskFilter } from "@shared/schema";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

interface TaskFiltersProps {
  onFilterChange: (filters: TaskFilter) => void;
}

export function TaskFilters({ onFilterChange }: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskFilter>({
    status: "all",
    tag: "all",
    search: "",
  });

  const handleFilterChange = (key: keyof TaskFilter, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="bg-white shadow rounded-lg mb-6">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
          <div className="sm:col-span-2">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <Select
              value={filters.status}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="tag-filter" className="block text-sm font-medium text-gray-700">
              Tag
            </label>
            <Select
              value={filters.tag}
              onValueChange={(value) => handleFilterChange("tag", value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Work">Work</SelectItem>
                <SelectItem value="Personal">Personal</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Shopping">Shopping</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">
              Search
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <Input
                id="search"
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pr-10"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
