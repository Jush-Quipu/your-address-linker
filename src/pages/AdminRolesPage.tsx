import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRole } from '@/context/RoleContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { HomeIcon, Users, UserCheck, UserPlus, UserMinus, Shield, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DeveloperRole, addUserRole, removeUserRole } from '@/services/developerService';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface User {
  id: string;
  email: string;
  created_at: string;
  roles: DeveloperRole[];
  fullName?: string;
  avatarUrl?: string;
}

// Interface for the developer_roles table rows
interface DeveloperRoleRecord {
  user_id: string;
  role: string;
}

const AdminRolesPage: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const { isAdmin, refreshRoles } = useRole();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<DeveloperRole>(DeveloperRole.DEVELOPER);
  const [emailToAdd, setEmailToAdd] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [redirect, setRedirect] = useState<boolean>(false);

  // First, check auth status
  useEffect(() => {
    if (!isLoading && (!isAuthenticated || !isAdmin)) {
      setRedirect(true);
    }
  }, [isLoading, isAuthenticated, isAdmin]);

  // Fetch users effect
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        
        // Get all users with their roles
        const { data: usersData, error: usersError } = await supabase
          .from('profiles')
          .select('id, email, created_at, full_name, avatar_url');
          
        if (usersError) throw usersError;
        
        // Get all role assignments
        const { data: rolesData, error: rolesError } = await supabase
          .from('developer_roles')
          .select('*');
          
        if (rolesError) throw rolesError;
        
        // Map roles to users
        const usersWithRoles = (usersData || []).map((user: any) => {
          const userRoles = rolesData
            .filter((role: DeveloperRoleRecord) => role.user_id === user.id)
            .map((role: DeveloperRoleRecord) => role.role as DeveloperRole);
            
          return {
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            roles: userRoles
          };
        });
        
        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthenticated && isAdmin) {
      fetchUsers();
    }
  }, [isAuthenticated, isAdmin]);

  // If not authenticated or not admin, redirect
  if (redirect) {
    return <Navigate to="/" />;
  }

  const handleAddRole = async (userId: string, role: DeveloperRole) => {
    const success = await addUserRole(userId, role);
    if (success) {
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, roles: [...user.roles.filter(r => r !== role), role] }
            : user
        )
      );
    }
  };

  const handleRemoveRole = async (userId: string, role: DeveloperRole) => {
    const success = await removeUserRole(userId, role);
    if (success) {
      // Update local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { ...user, roles: user.roles.filter(r => r !== role) }
            : user
        )
      );
    }
  };

  const handleAddUserByEmail = async () => {
    if (!emailToAdd.trim()) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      setAddingUser(true);
      
      // Find user with this email
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', emailToAdd.trim())
        .single();
        
      if (userError) {
        toast.error('User not found');
        return;
      }
      
      // Add the selected role to this user
      const success = await addUserRole(userData.id, selectedRole);
      
      if (success) {
        toast.success(`Added ${selectedRole} role to ${emailToAdd}`);
        
        // Check if user is already in the list
        const existingUser = users.find(u => u.id === userData.id);
        
        if (existingUser) {
          // Update existing user
          setUsers(prevUsers => 
            prevUsers.map(user => 
              user.id === userData.id 
                ? { ...user, roles: [...user.roles.filter(r => r !== selectedRole), selectedRole] }
                : user
            )
          );
        } else {
          // Add new user to the list
          setUsers(prevUsers => [
            ...prevUsers, 
            { 
              id: userData.id, 
              email: userData.email, 
              created_at: new Date().toISOString(),
              roles: [selectedRole] 
            }
          ]);
        }
        
        // Clear the input
        setEmailToAdd('');
      }
    } catch (error) {
      console.error('Error adding user role:', error);
      toast.error('Failed to add role to user');
    } finally {
      setAddingUser(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getInitials = (user: User) => {
    if (user.fullName) {
      return user.fullName.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 md:px-12">
        <div className="max-w-7xl mx-auto">
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">
                  <HomeIcon className="h-4 w-4 mr-1" />
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer">Developer</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/admin">
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/developer/admin/roles">
                  <Users className="h-4 w-4 mr-1" />
                  Role Management
                </BreadcrumbLink>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mb-8 space-y-4">
            <h1 className="text-2xl font-bold flex items-center">
              <Shield className="mr-2 h-6 w-6 text-primary" />
              Developer Role Management
            </h1>
            <p className="text-muted-foreground">
              Manage developer and admin access for users in the SecureAddress Bridge platform.
            </p>
          </div>

          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Role-Based Access Control</AlertTitle>
            <AlertDescription>
              Users with the Developer role can access the developer portal. Users with the Admin role can manage other users' roles.
            </AlertDescription>
          </Alert>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add User Role</CardTitle>
              <CardDescription>
                Assign developer or admin roles to users by email address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-grow">
                  <Input
                    placeholder="User email address"
                    value={emailToAdd}
                    onChange={(e) => setEmailToAdd(e.target.value)}
                  />
                </div>
                <div className="w-48">
                  <Select 
                    value={selectedRole} 
                    onValueChange={(value) => setSelectedRole(value as DeveloperRole)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Roles</SelectLabel>
                        <SelectItem value={DeveloperRole.DEVELOPER}>Developer</SelectItem>
                        <SelectItem value={DeveloperRole.ADMIN}>Admin</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleAddUserByEmail} disabled={addingUser}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Roles</CardTitle>
              <CardDescription>
                Manage existing users and their assigned roles
              </CardDescription>
              <div className="mt-4">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading user data...</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8">
                          No users found matching your search
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredUsers.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatarUrl} />
                                <AvatarFallback>{getInitials(user)}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.email}</div>
                                {user.fullName && (
                                  <div className="text-sm text-muted-foreground">{user.fullName}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {user.roles.includes(DeveloperRole.ADMIN) && (
                                <Badge variant="default" className="bg-red-100 text-red-800 hover:bg-red-100">
                                  Admin
                                </Badge>
                              )}
                              {user.roles.includes(DeveloperRole.DEVELOPER) && (
                                <Badge variant="secondary">
                                  Developer
                                </Badge>
                              )}
                              {user.roles.length === 0 && (
                                <span className="text-muted-foreground text-sm">No roles</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {!user.roles.includes(DeveloperRole.DEVELOPER) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAddRole(user.id, DeveloperRole.DEVELOPER)}
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Add Developer
                                </Button>
                              )}
                              {user.roles.includes(DeveloperRole.DEVELOPER) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRemoveRole(user.id, DeveloperRole.DEVELOPER)}
                                >
                                  <UserMinus className="h-3 w-3 mr-1" />
                                  Remove Developer
                                </Button>
                              )}
                              
                              {!user.roles.includes(DeveloperRole.ADMIN) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleAddRole(user.id, DeveloperRole.ADMIN)}
                                >
                                  <UserPlus className="h-3 w-3 mr-1" />
                                  Add Admin
                                </Button>
                              )}
                              {user.roles.includes(DeveloperRole.ADMIN) && (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRemoveRole(user.id, DeveloperRole.ADMIN)}
                                >
                                  <UserMinus className="h-3 w-3 mr-1" />
                                  Remove Admin
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminRolesPage;
