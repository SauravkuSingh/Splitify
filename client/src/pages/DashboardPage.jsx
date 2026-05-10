import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import GroupCard from '../components/GroupCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import DashboardCharts from "@/components/DashboardCharts";
import { MainLayout } from "@/components/MainLayout";
import { LayoutDashboard } from "lucide-react";

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
    <MainLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h2>
          <p className="text-sm font-medium text-muted-foreground mt-2 leading-relaxed">
            Here's what's happening with your shared expenses today.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-[1.5rem] text-xs font-bold mb-10 flex items-center gap-3">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          {error}
        </div>
      )}

      {/* Stats & Charts Section */}
      <DashboardCharts stats={stats} />

      {/* Groups Content */}
      {groups.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200 mt-12">
          <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🎯</div>
          <h3 className="text-2xl font-black text-foreground mb-3">No active groups</h3>
          <p className="text-sm font-medium text-muted-foreground mb-10 max-w-xs mx-auto leading-relaxed">
            Groups are where the magic happens. Create one for your next trip or shared bill to start splitting.
          </p>
          <Button asChild rounded="full" className="px-10 font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-primary/20">
            <Link to="/groups/new">Create Group</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-16 mt-12">
          {/* Active Groups */}
          {activeGroups.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                    Active Groups
                  </h3>
                  <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none px-3 py-1 font-black text-[10px]">
                    {activeGroups.length}
                  </Badge>
                </div>
                <Link to="/groups" className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline decoration-2 underline-offset-4">View All</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {activeGroups.map(group => (
                  <GroupCard key={group._id} group={group} />
                ))}
              </div>
            </section>
          )}

          {/* Settled Groups */}
          {settledGroups.length > 0 && (
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                  Recently Settled
                </h3>
                <Badge variant="secondary" className="rounded-full bg-green-100 text-green-600 border-none px-3 py-1 font-black text-[10px]">
                  {settledGroups.length}
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {settledGroups.map(group => (
                  <GroupCard key={group._id} group={group} opacity={0.6} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </MainLayout>
  );
};

export default DashboardPage;