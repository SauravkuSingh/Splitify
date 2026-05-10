import { useState, useEffect } from 'react';
import api from '../utils/axios';
import ExpenseCard from '../components/ExpenseCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { MainLayout } from "@/components/MainLayout";
import { useAuth } from '../context/AuthContext';
import { History } from "lucide-react";

const RecentActivityPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const groupsRes = await api.get('/groups');
      const groups = groupsRes.data.groups;
      
      const expensePromises = groups.map(g => api.get(`/expenses/group/${g._id}`));
      const expenseResponses = await Promise.all(expensePromises);
      
      const allExpenses = expenseResponses.flatMap(res => res.data.expenses);
      allExpenses.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setActivities(allExpenses);
    } catch (err) {
      console.error('Failed to load activity', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Loading your activity history..." />;

  return (
    <MainLayout title="Recent Activity">
      <div className="flex flex-col gap-10 max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Timeline</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">A chronological feed of all expenses across your groups.</p>
        </div>
        
        {activities.length > 0 ? (
          <div className="grid grid-cols-1 gap-5">
            {activities.map(expense => (
              <ExpenseCard key={expense._id} expense={expense} currentUserId={user?._id} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
             <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🕒</div>
             <h3 className="text-2xl font-black text-foreground mb-3">No activity yet</h3>
             <p className="text-sm font-medium text-muted-foreground max-w-xs mx-auto leading-relaxed">
               Your spending history will appear here once you start adding expenses to your groups.
             </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RecentActivityPage;
