import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Background } from "@/components/kasona/Background";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Shield,
  Users,
  UserCheck,
  Clock,
  AlertCircle,
  Plus,
  Search,
  Edit,
  Mail,
  MessageSquare,
  TrendingUp,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { EmailTemplateModal } from "@/components/team/EmailTemplateModal";
import { AdminRoleManager } from "@/components/team/AdminRoleManager";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

interface Customer {
  id: string;
  name: string;
  email: string;
  account_id: string | null;
  status: "active" | "pending" | "incomplete";
  profileCompleteness: number;
  portfolioCount: number;
  lastActivity: string;
  createdAt: string;
}

const getStatusBadge = (status: Customer["status"]) => {
  switch (status) {
    case "active":
      return (
        <Badge variant="default" className="bg-green-500/20 text-green-500 border-green-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5" />
          Aktiv
        </Badge>
      );
    case "pending":
      return (
        <Badge variant="default" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5" />
          Pending Review
        </Badge>
      );
    case "incomplete":
      return (
        <Badge variant="default" className="bg-red-500/20 text-red-500 border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5" />
          Unvollständig
        </Badge>
      );
  }
};

export default function TeamCustomerList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'customers' | 'admins'>('customers');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      // Fetch profiles with related data counts
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get holdings counts for each user from holdings_v2
      const customerData: Customer[] = await Promise.all(
        (profiles || []).map(async (profile) => {
          // Count holdings_v2
          const { count: holdingsCount } = await supabase
            .from('holdings_v2')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', profile.id);

          // Check if investor_profile_v2 exists
          const { data: investorProfile } = await supabase
            .from('investor_profiles_v2')
            .select('id')
            .eq('user_id', profile.id)
            .maybeSingle();

          // Calculate profile completeness
          let completeness = 0;
          if (profile.full_name) completeness += 25;
          if (profile.email) completeness += 25;
          if (profile.account_id) completeness += 25;
          if (investorProfile) completeness += 25;

          // Determine status
          let status: Customer["status"] = "incomplete";
          if (completeness === 100 && (holdingsCount || 0) > 0) {
            status = "active";
          } else if (completeness >= 50) {
            status = "pending";
          }

          // Format last activity
          const lastActivity = profile.updated_at 
            ? formatRelativeTime(new Date(profile.updated_at))
            : 'Unbekannt';

          return {
            id: profile.id,
            name: profile.full_name || 'Unbekannt',
            email: profile.email || '',
            account_id: profile.account_id,
            status,
            profileCompleteness: completeness,
            portfolioCount: holdingsCount || 0,
            lastActivity,
            createdAt: profile.created_at || '',
          };
        })
      );

      setCustomers(customerData);
    } catch (error: any) {
      console.error('Error loading customers:', error);
      toast({
        title: 'Fehler beim Laden',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Heute';
    if (diffDays === 1) return 'Gestern';
    if (diffDays < 7) return `Vor ${diffDays} Tagen`;
    if (diffDays < 30) return `Vor ${Math.floor(diffDays / 7)} Wochen`;
    return `Vor ${Math.floor(diffDays / 30)} Monaten`;
  };

  const filteredCustomers = customers.filter((customer) => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.account_id?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "all" || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: customers.length,
    active: customers.filter((c) => c.status === "active").length,
    pending: customers.filter((c) => c.status === "pending").length,
    thisWeek: customers.filter((c) => {
      const created = new Date(c.createdAt);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return created >= weekAgo;
    }).length,
  };

  const handleSendEmail = (customer: Customer) => {
    setSelectedCustomer(customer);
    setEmailModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <Background />

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Team Portal</h1>
                  <p className="text-sm text-muted-foreground">
                    Kundenübersicht & Portfolio-Verwaltung
                  </p>
                </div>
              </div>
              <Button onClick={() => navigate("/team/onboarding")} className="gap-2">
                <Plus className="h-4 w-4" />
                Neuer Kunde
              </Button>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 border-b border-border pb-4">
            <Button
              variant={activeTab === 'customers' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('customers')}
              className="gap-2"
            >
              <Users className="h-4 w-4" />
              Kunden
            </Button>
            <Button
              variant={activeTab === 'admins' ? 'default' : 'ghost'}
              onClick={() => setActiveTab('admins')}
              className="gap-2"
            >
              <ShieldCheck className="h-4 w-4" />
              Admin-Verwaltung
            </Button>
          </div>

          {activeTab === 'admins' ? (
            <div className="glass-card rounded-xl p-6">
              <AdminRoleManager />
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.total}</p>
                      <p className="text-sm text-muted-foreground">Gesamt</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.active}</p>
                      <p className="text-sm text-muted-foreground">Aktiv</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-yellow-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.pending}</p>
                      <p className="text-sm text-muted-foreground">Pending</p>
                    </div>
                  </div>
                </div>
                <div className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{stats.thisWeek}</p>
                      <p className="text-sm text-muted-foreground">Diese Woche</p>
                    </div>
                  </div>
                </div>
              </div>

          {/* Search & Filter */}
          <div className="glass-card rounded-xl p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Suche nach Name, E-Mail oder Account-ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Status filtern" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="pending">Pending Review</SelectItem>
                  <SelectItem value="incomplete">Unvollständig</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Customer Table */}
          <div className="glass-card rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Kunde</TableHead>
                  <TableHead>Account-ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Profil</TableHead>
                  <TableHead className="text-center">Positionen</TableHead>
                  <TableHead>Letzte Aktivität</TableHead>
                  <TableHead className="text-right">Aktionen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.account_id ? (
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {customer.account_id}
                        </code>
                      ) : (
                        <span className="text-muted-foreground text-xs">–</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(customer.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              customer.profileCompleteness >= 80
                                ? "bg-green-500"
                                : customer.profileCompleteness >= 50
                                ? "bg-yellow-500"
                                : "bg-red-500"
                            }`}
                            style={{ width: `${customer.profileCompleteness}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground w-8">
                          {customer.profileCompleteness}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Briefcase className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono">{customer.portfolioCount}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {customer.lastActivity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate(`/team/onboarding/${customer.id}`)}
                          title="Portfolio bearbeiten"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSendEmail(customer)}
                          title="E-Mail senden"
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => navigate("/app/chat")}
                          title="Chat öffnen"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCustomers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <AlertCircle className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Keine Kunden gefunden</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
            </>
          )}
        </main>
      </div>

      {/* Email Modal */}
      <EmailTemplateModal
        open={emailModalOpen}
        onOpenChange={setEmailModalOpen}
        customer={selectedCustomer}
      />
    </div>
  );
}
