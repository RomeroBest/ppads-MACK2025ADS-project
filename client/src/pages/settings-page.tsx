import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

// Notification settings schema
const notificationSchema = z.object({
  emailNotifications: z.boolean().default(true),
  taskReminders: z.boolean().default(true),
  systemUpdates: z.boolean().default(false),
});

type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [_, setLocation] = useLocation();

  // Password change form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notification settings form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      taskReminders: true,
      systemUpdates: false,
    },
  });

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: PasswordFormValues) => {
      const response = await apiRequest("POST", `/api/users/change-password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Password changed",
        description: "Your password has been changed successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error changing password",
        description: error.message || "There was an error changing your password. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (notificationData: NotificationFormValues) => {
      const response = await apiRequest("PUT", `/api/users/notifications`, notificationData);
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Notification settings updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error updating settings",
        description: "There was an error updating your notification settings. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: PasswordFormValues) => {
    changePasswordMutation.mutate(data);
  };

  const onNotificationSubmit = (data: NotificationFormValues) => {
    updateNotificationsMutation.mutate(data);
  };

  if (!user) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button 
          variant="outline" 
          onClick={() => setLocation("/dashboard")}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>

      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display-name">Name</Label>
                    <div className="font-medium">{user.name}</div>
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <div className="font-medium">{user.username}</div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="font-medium">{user.email}</div>
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <div className="font-medium capitalize">{user.role}</div>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Note</AlertTitle>
                <AlertDescription>
                  You can update your personal information in the Profile section.
                </AlertDescription>
              </Alert>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setLocation("/profile")}>
                  Go to Profile
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Change your password and secure your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...passwordForm}>
                <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                  <FormField
                    control={passwordForm.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="newPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormDescription>
                          Password must be at least 6 characters
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={changePasswordMutation.isPending}
                  >
                    {changePasswordMutation.isPending ? "Changing Password..." : "Change Password"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                  <FormField
                    control={notificationForm.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Email Notifications</FormLabel>
                          <FormDescription>
                            Receive email updates about your account activity
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="taskReminders"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Task Reminders</FormLabel>
                          <FormDescription>
                            Receive reminders about upcoming and overdue tasks
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={notificationForm.control}
                    name="systemUpdates"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">System Updates</FormLabel>
                          <FormDescription>
                            Receive notifications about system changes and updates
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}