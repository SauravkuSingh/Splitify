import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import GroupCard from '../components/GroupCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import DashboardCharts from "@/components/DashboardCharts";

const DashboardPage = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [groupsRes, statsRes] = await Promise.all([
        api.get('/groups'),
        api.get('/expenses/stats')
      ]);
      setGroups(groupsRes.data.groups);
      setStats(statsRes.data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Accessing dashboard..." />;

  const activeGroups = groups.filter(g => g.status === 'active');
  const settledGroups = groups.filter(g => g.status === 'settled');

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#FBFBFC]">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <header className="h-16 border-b border-gray-100 bg-white/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="text-gray-500 hover:text-primary transition-colors" />
              <div className="h-4 w-px bg-gray-200"></div>
              <h1 className="text-sm font-bold text-foreground">Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <Button asChild size="sm" rounded="full" className="font-bold shadow-sm h-9 px-4">
                <Link to="/groups/new" className="flex items-center gap-2">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  New Group
                </Link>
              </Button>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="container max-w-6xl mx-auto py-8 px-6 md:px-8">
              {/* Welcome Section */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                    Welcome back, {user?.name?.split(' ')[0]}!
                  </h2>
                  <p className="text-sm font-medium text-muted-foreground mt-1 leading-relaxed">
                    Here's what's happening with your shared expenses today.
                  </p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-8 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  {error}
                </div>
              )}

              {/* Stats & Charts Section */}
              <DashboardCharts stats={stats} />

              {/* Groups Content */}
              {groups.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🎯</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No active groups</h3>
                  <p className="text-sm text-muted-foreground mb-8 max-w-xs mx-auto font-medium">
                    Groups are where the magic happens. Create one for your next trip or shared bill.
                  </p>
                  <Button asChild rounded="full" className="px-8 font-bold h-11">
                    <Link to="/groups/new">Create Group</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-12">
                  {/* Active Groups */}
                  {activeGroups.length > 0 && (
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                            Active Groups
                          </h3>
                          <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none px-2 py-0.5 font-bold text-[10px]">
                            {activeGroups.length}
                          </Badge>
                        </div>
                        <Link to="/dashboard" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All</Link>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {activeGroups.map(group => (
                          <GroupCard key={group._id} group={group} />
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Settled Groups */}
                  {settledGroups.length > 0 && (
                    <section>
                      <div className="flex items-center gap-3 mb-6">
                        <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                          Recently Settled
                        </h3>
                        <Badge variant="secondary" className="rounded-full bg-green-100 text-green-600 border-none px-2 py-0.5 font-bold text-[10px]">
                          {settledGroups.length}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {settledGroups.map(group => (
                          <GroupCard key={group._id} group={group} opacity={0.6} />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardPage;