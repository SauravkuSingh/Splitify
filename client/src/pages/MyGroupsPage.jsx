import { useState, useEffect } from 'react';
import api from '../utils/axios';
import GroupCard from '../components/GroupCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { MainLayout } from "@/components/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const MyGroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await api.get('/groups');
      setGroups(res.data.groups);
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your groups..." />;

  const activeGroups = groups.filter(g => g.status === 'active');
  const settledGroups = groups.filter(g => g.status === 'settled');

  return (
    <MainLayout title="My Groups">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Your Expense Groups</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">Manage and track all your shared expenses in one place.</p>
        </div>
        <Button asChild rounded="full" className="font-black text-xs uppercase tracking-widest px-8 h-12 shadow-xl shadow-primary/20">
          <Link to="/groups/new" className="flex items-center gap-2">
            <Plus className="w-4 h-4 stroke-[3]" />
            Create New Group
          </Link>
        </Button>
      </div>

      <div className="space-y-16">
        {activeGroups.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
              <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em]">
                Active Groups
              </h3>
              <Badge variant="secondary" className="rounded-full bg-primary/10 text-primary border-none px-3 py-1 font-black text-[10px]">
                {activeGroups.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeGroups.map(group => (
                <GroupCard key={group._id} group={group} />
              ))}
            </div>
          </section>
        )}

        {settledGroups.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-8">
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

        {groups.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
             <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">👥</div>
             <h3 className="text-2xl font-black text-foreground mb-3">No groups found</h3>
             <p className="text-sm font-medium text-muted-foreground mb-10 max-w-xs mx-auto leading-relaxed">
               Groups are where you split bills with friends. Create your first group to get started!
             </p>
             <Button asChild rounded="full" className="px-10 font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-primary/20">
               <Link to="/groups/new">Create Group</Link>
             </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyGroupsPage;
