import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Switch } from '@/components/ui/switch';
import { Spinner } from '@/components/ui/spinner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, ShieldCheck, ShieldOff } from 'lucide-react';

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  isAdmin: boolean;
}

export function AdminRoleManager() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pendingChange, setPendingChange] = useState<{ userId: string; newState: boolean } | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('full_name', { ascending: true });

      if (profilesError) throw profilesError;

      // Fetch all admin roles
      const { data: adminRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');

      if (rolesError) throw rolesError;

      const adminUserIds = new Set(adminRoles?.map(r => r.user_id) || []);

      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email,
        full_name: profile.full_name,
        isAdmin: adminUserIds.has(profile.id),
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      console.error('Error loading users:', error);
      toast({
        title: 'Fehler beim Laden',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleRequest = (userId: string, currentState: boolean) => {
    // Prevent self-removal
    if (userId === user?.id && currentState) {
      toast({
        title: 'Nicht erlaubt',
        description: 'Sie können Ihre eigene Admin-Rolle nicht entfernen.',
        variant: 'destructive',
      });
      return;
    }

    setPendingChange({ userId, newState: !currentState });
  };

  const confirmChange = async () => {
    if (!pendingChange) return;

    const { userId, newState } = pendingChange;
    
    try {
      if (newState) {
        // Grant admin role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });

        if (error) throw error;

        toast({
          title: 'Admin-Rolle zugewiesen',
          description: 'Der Benutzer hat jetzt Admin-Rechte.',
        });
      } else {
        // Revoke admin role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');

        if (error) throw error;

        toast({
          title: 'Admin-Rolle entfernt',
          description: 'Die Admin-Rechte wurden entfernt.',
        });
      }

      // Update local state
      setUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, isAdmin: newState } : u)
      );
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast({
        title: 'Fehler',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setPendingChange(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const pendingUser = pendingChange 
    ? users.find(u => u.id === pendingChange.userId) 
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold">Admin-Verwaltung</h2>
          <p className="text-sm text-muted-foreground">
            Weisen Sie Benutzern Admin-Rechte zu, um das Team Portal zu bearbeiten.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>E-Mail</TableHead>
              <TableHead className="text-center">Admin-Rolle</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((userItem) => (
              <TableRow key={userItem.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {userItem.isAdmin && (
                      <ShieldCheck className="h-4 w-4 text-primary" />
                    )}
                    {userItem.full_name || 'Unbekannt'}
                    {userItem.id === user?.id && (
                      <span className="text-xs text-muted-foreground">(Sie)</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {userItem.email || '–'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-center">
                    <Switch
                      checked={userItem.isAdmin}
                      onCheckedChange={() => handleToggleRequest(userItem.id, userItem.isAdmin)}
                      disabled={userItem.id === user?.id && userItem.isAdmin}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                  Keine Benutzer gefunden
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <ShieldCheck className="h-4 w-4" />
        <span>Admins können das Team Portal und Kundenportfolios bearbeiten.</span>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={!!pendingChange} onOpenChange={() => setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingChange?.newState ? 'Admin-Rolle zuweisen?' : 'Admin-Rolle entfernen?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.newState ? (
                <>
                  Möchten Sie <strong>{pendingUser?.full_name || pendingUser?.email}</strong> Admin-Rechte zuweisen? 
                  Diese Person kann dann das Team Portal und Kundenportfolios bearbeiten.
                </>
              ) : (
                <>
                  Möchten Sie die Admin-Rechte von <strong>{pendingUser?.full_name || pendingUser?.email}</strong> entfernen?
                  Diese Person verliert den Zugriff auf das Team Portal.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={confirmChange}>
              {pendingChange?.newState ? 'Zuweisen' : 'Entfernen'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
