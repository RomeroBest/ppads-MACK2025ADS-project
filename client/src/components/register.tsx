import { useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { registerUserSchema, type RegisterUserInput } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import { ClipboardList, ArrowLeft } from "lucide-react";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { login } = useAuth();

  const form = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      name: "",
    },
  });

  async function onSubmit(data: RegisterUserInput) {
    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/auth/register", data);
      const userData = await response.json();
      toast({
        title: "Registration successful",
        description: "Your account has been created successfully.",
      });
      login(userData);
      setLocation("/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: error instanceof Error 
          ? error.message 
          : "Registration failed. Please try again with different credentials.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <ClipboardList className="mx-auto h-12 w-auto text-primary" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">TaskFlow</h2>
            <p className="mt-2 text-sm text-gray-600">Create a new account</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your name" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Choose a username" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Email address" 
                        type="email" 
                        autoComplete="email" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Password" 
                        type="password" 
                        autoComplete="new-password" 
                        disabled={isLoading}
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Creating account..." : "Create Account"}
              </Button>

              <div className="text-center mt-4">
                <Button 
                  variant="link" 
                  onClick={() => setLocation("/")}
                  className="text-sm text-gray-600"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}