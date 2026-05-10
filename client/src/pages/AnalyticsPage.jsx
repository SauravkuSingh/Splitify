import { useState, useEffect } from 'react';
import api from '../utils/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { MainLayout } from "@/components/MainLayout";
import DashboardCharts from "@/components/DashboardCharts";
import { Card } from "@/components/ui/card";
import { TrendingUp, PieChart, BarChart3, Info } from "lucide-react";

const AnalyticsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/expenses/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load stats', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner message="Generating your financial report..." />;

  return (
    <MainLayout title="Analytics">
      <div className="flex flex-col gap-12">
        <div>
          <h2 className="text-3xl font-black text-foreground tracking-tight">Spending Insights</h2>
          <p className="text-sm font-medium text-muted-foreground mt-2">Detailed breakdown of your expenses and group distribution.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white border-gray-100 shadow-sm rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all"></div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Total Volume</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">₹{stats?.totalGroupVolume?.toLocaleString() || 0}</p>
          </Card>
          <Card className="bg-white border-gray-100 shadow-sm rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all"></div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">You Paid</p>
            <p className="text-3xl font-black text-blue-600 tracking-tighter">₹{stats?.userPaidTotal?.toLocaleString() || 0}</p>
          </Card>
          <Card className="bg-white border-gray-100 shadow-sm rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all"></div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Active Groups</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{stats?.groupCount || 0}</p>
          </Card>
          <Card className="bg-white border-gray-100 shadow-sm rounded-[2rem] p-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-all"></div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Expenses</p>
            <p className="text-3xl font-black text-foreground tracking-tighter">{stats?.expenseCount || 0}</p>
          </Card>
        </div>

        <DashboardCharts stats={stats} />
        
        <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
           <div className="flex items-center gap-3 mb-6 relative z-10">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Financial Summary</h3>
           </div>
           <p className="text-sm md:text-base text-muted-foreground leading-relaxed relative z-10 max-w-3xl">
             {stats?.expenseCount > 0 
               ? `Your spending pattern shows high activity in categories like ${stats.spendingByCategory?.[0]?.name || 'uncategorized items'}. You are currently managing ${stats.groupCount} shared groups with a total transaction volume of ₹${stats.totalGroupVolume?.toLocaleString()}. You personally contributed ₹${stats.userPaidTotal?.toLocaleString()} to these shared costs.`
               : "No spending data available yet. As you and your friends add expenses to your groups, we'll analyze your spending habits and provide visual breakdowns here."
             }
           </p>
        </div>
      </div>
    </MainLayout>
  );
};

export default AnalyticsPage;
