import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/context/auth-context";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ShieldCheck, UserCheck, Search, RefreshCw, UserCog } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  role: string;
  profilePicture?: string | null;
  googleId?: string | null;
}

export function AdminUserManagement() {
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [delegationDialogOpen, setDelegationDialogOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("userList");
  const [delegatedPermissions, setDelegatedPermissions] = useState<{[key: string]: boolean}>({
    canManageUsers: false,
    canViewReports: false,
    canAssignTasks: false,
    canManageSettings: false
  });
  const [userToDelegateRoleTo, setUserToDelegateRoleTo] = useState<User | null>(null);

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!currentUser?.id && currentUser.role === "admin",
  });

  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Count statistics
  const totalUsers = users.length;
  const adminUsers = users.filter(user => user.role === "admin").length;
  const standardUsers = totalUsers - adminUsers;
  const googleAuthUsers = users.filter(user => user.googleId).length;

  const updateUserMutation = useMutation({
    mutationFn: async (userData: { id: number; name?: string; email?: string; role?: string; permissions?: any }) => {
      const response = await apiRequest("PUT", `/api/admin/users/${userData.id}`, userData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Updated",
        description: "The user has been successfully updated.",
      });
      setEditDialogOpen(false);
      setDelegationDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update user.",
      });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      await apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({
        title: "User Deleted",
        description: "The user has been successfully deleted.",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete user.",
      });
    },
  });

  const handleEditUser = (user: User) => {
    setUserToEdit(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
    setEditDialogOpen(true);
  };

  const handleDelegateRole = (user: User) => {
    setUserToDelegateRoleTo(user);
    // Initialize with default permissions (you could load these from the user if stored)
    setDelegatedPermissions({
      canManageUsers: false,
      canViewReports: false,
      canAssignTasks: false,
      canManageSettings: false
    });
    setDelegationDialogOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (!userToEdit) return;

    const updatedFields: { id: number; name?: string; email?: string; role?: string } = {
      id: userToEdit.id,
    };

    if (editName !== userToEdit.name) updatedFields.name = editName;
    if (editEmail !== userToEdit.email) updatedFields.email = editEmail;
    if (editRole !== userToEdit.role) updatedFields.role = editRole;

    updateUserMutation.mutate(updatedFields);
  };

  const handleDelegatePermissions = () => {
    if (!userToDelegateRoleTo) return;

    updateUserMutation.mutate({
      id: userToDelegateRoleTo.id,
      role: delegatedPermissions.canManageUsers ? "admin" : "user",
      permissions: delegatedPermissions
    });
  };

  const handleConfirmDelete = () => {
    if (userToDelete !== null) {
      deleteUserMutation.mutate(userToDelete);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading users...</div>;
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* User Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full md:w-1/3">
          <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="rounded-full bg-blue-100 p-3">
              <UserCheck className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold">{totalUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="rounded-full bg-indigo-100 p-3">
              <ShieldCheck className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Admins</p>
              <p className="text-2xl font-bold">{adminUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="rounded-full bg-green-100 p-3">
              <UserCheck className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Standard Users</p>
              <p className="text-2xl font-bold">{standardUsers}</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 flex items-center space-x-4">
            <div className="rounded-full bg-purple-100 p-3">
              <UserCog className="h-6 w-6 text-purple-700" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Google Auth</p>
              <p className="text-2xl font-bold">{googleAuthUsers}</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 w-full">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="userList">User List</TabsTrigger>
                <TabsTrigger value="roleManagement">Role Management</TabsTrigger>
              </TabsList>

              <TabsContent value="userList">
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Auth Type</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                {user.profilePicture ? (
                                  <AvatarImage src={user.profilePicture} alt={user.name} />
                                ) : (
                                  <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                )}
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-xs text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>
                            <Badge variant={user.role === "admin" ? "default" : "outline"}>
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {user.googleId ? (
                              <Badge variant="secondary">Google</Badge>
                            ) : (
                              <Badge variant="outline">Local</Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleEditUser(user)}
                                disabled={user.id === currentUser?.id}
                                title="Edit User"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              {user.role !== "admin" && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleDelegateRole(user)}
                                  disabled={user.id === currentUser?.id}
                                  title="Manage Permissions"
                                >
                                  <ShieldCheck className="h-4 w-4 text-blue-600" />
                                </Button>
                              )}
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500" 
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={user.id === currentUser?.id}
                                title="Delete User"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4">
                            No users found matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="roleManagement">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded p-4 text-sm text-blue-700 mb-6">
                    <p>Manage user roles and delegate administrative privileges to specific users. Assign permissions based on user responsibilities.</p>
                  </div>
                  
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>User</TableHead>
                          <TableHead>Current Role</TableHead>
                          <TableHead>Permissions</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.map((user) => (
                          <TableRow key={user.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-8 w-8">
                                  {user.profilePicture ? (
                                    <AvatarImage src={user.profilePicture} alt={user.name} />
                                  ) : (
                                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                  )}
                                </Avatar>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-xs text-gray-500">{user.email}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                                {user.role}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {user.role === "admin" ? (
                                <span className="text-sm text-gray-500">Full Access</span>
                              ) : (
                                <span className="text-sm text-gray-500">Standard Access</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleDelegateRole(user)}
                                disabled={user.id === currentUser?.id}
                              >
                                {user.role === "admin" ? "Revoke Admin" : "Delegate Admin"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Make changes to the user details. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                type="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleUpdateUser} disabled={updateUserMutation.isPending}>
              {updateUserMutation.isPending ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this user and all of their data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Role Delegation Dialog */}
      <Dialog open={delegationDialogOpen} onOpenChange={setDelegationDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Delegate Permissions</DialogTitle>
            <DialogDescription>
              {userToDelegateRoleTo?.role === "admin" 
                ? "Manage admin permissions for this user." 
                : "Grant administrative privileges to this user."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {userToDelegateRoleTo && (
              <div className="flex items-center gap-4 p-4 border rounded-md bg-gray-50">
                <Avatar className="h-10 w-10">
                  {userToDelegateRoleTo.profilePicture ? (
                    <AvatarImage src={userToDelegateRoleTo.profilePicture} alt={userToDelegateRoleTo.name} />
                  ) : (
                    <AvatarFallback>{getInitials(userToDelegateRoleTo.name)}</AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <h3 className="font-semibold">{userToDelegateRoleTo.name}</h3>
                  <p className="text-sm text-gray-500">{userToDelegateRoleTo.email}</p>
                </div>
                <Badge className="ml-auto" variant={userToDelegateRoleTo.role === "admin" ? "default" : "outline"}>
                  {userToDelegateRoleTo.role}
                </Badge>
              </div>
            )}
            
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Permission Settings</h3>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canManageUsers" 
                  checked={delegatedPermissions.canManageUsers}
                  onCheckedChange={(checked) => 
                    setDelegatedPermissions({
                      ...delegatedPermissions,
                      canManageUsers: checked === true
                    })
                  }
                />
                <label
                  htmlFor="canManageUsers"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can manage users
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canViewReports" 
                  checked={delegatedPermissions.canViewReports}
                  onCheckedChange={(checked) => 
                    setDelegatedPermissions({
                      ...delegatedPermissions,
                      canViewReports: checked === true
                    })
                  }
                />
                <label
                  htmlFor="canViewReports"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can view reports and analytics
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canAssignTasks" 
                  checked={delegatedPermissions.canAssignTasks}
                  onCheckedChange={(checked) => 
                    setDelegatedPermissions({
                      ...delegatedPermissions,
                      canAssignTasks: checked === true
                    })
                  }
                />
                <label
                  htmlFor="canAssignTasks"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can assign tasks to others
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="canManageSettings" 
                  checked={delegatedPermissions.canManageSettings}
                  onCheckedChange={(checked) => 
                    setDelegatedPermissions({
                      ...delegatedPermissions,
                      canManageSettings: checked === true
                    })
                  }
                />
                <label
                  htmlFor="canManageSettings"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Can modify system settings
                </label>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDelegationDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleDelegatePermissions} 
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Permissions"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}