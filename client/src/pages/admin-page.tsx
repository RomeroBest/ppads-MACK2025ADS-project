import { useEffect } from "react";
import { useLocation } from "wouter";
import { AdminUserManagement } from "@/components/admin-user-management";
import { useAuth } from "@/context/auth-context";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield } from "lucide-react";

export default function AdminPage() {
  const [, setLocation] = useLocation();
  const { user, isAdmin } = useAuth();

  // Redirect non-admin users
  useEffect(() => {
    if (!user) {
      setLocation("/");
    } else if (!isAdmin) {
      setLocation("/dashboard");
    }
  }, [user, isAdmin, setLocation]);

  if (!user || !isAdmin) {
    return null; // Will redirect due to useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b">
        <div className="flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        </div>
        <button
          className="text-sm text-gray-600 hover:text-gray-900"
          onClick={() => setLocation("/dashboard")}
        >
          Back to Dashboard
        </button>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
        </TabsList>
        <TabsContent value="users">
          <AdminUserManagement />
        </TabsContent>
        <TabsContent value="settings">
          <div className="p-4 text-center">
            <p className="text-lg">System settings will be implemented in a future update.</p>
          </div>
        </TabsContent>
        <TabsContent value="logs">
          <div className="p-4 text-center">
            <p className="text-lg">Activity logs will be implemented in a future update.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}