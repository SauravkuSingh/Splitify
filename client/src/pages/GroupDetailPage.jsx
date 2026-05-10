import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import ExpenseCard from '../components/ExpenseCard';
import BalanceCard from '../components/BalanceCard';
import AddExpenseModal from '../components/AddExpenseModal';
import { AddMemberModal } from "../components/AddMemberModal";
import { GroupDetailSkeleton } from '../components/Skeleton';
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Plus, 
  Share2, 
  BrainCircuit, 
  Receipt, 
  Scale, 
  History,
  CheckCircle2,
  ArrowLeft,
  Trash2,
  LayoutDashboard
} from "lucide-react";

const GroupDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [copied, setCopied] = useState(false);
  const [runningAlgo, setRunningAlgo] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [groupRes, expensesRes, balancesRes, settlementsRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/expenses/group/${id}`),
        api.get(`/expenses/group/${id}/balances`),
        api.get(`/settlements/group/${id}`),
      ]);
      setGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses);
      setBalances(balancesRes.data.balances);
      setSettlements(settlementsRes.data.settlements);
    } catch (err) {
      toast.error('Failed to load group');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${group.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success('Invite link copied! 🔗');
    setTimeout(() => setCopied(false), 2000);
  };

  const runSettlement = async () => {
    setRunningAlgo(true);
    try {
      const res = await api.post(`/settlements/run/${id}`);
      const settlementsRes = await api.get(`/settlements/group/${id}`);
      setSettlements(settlementsRes.data.settlements);
      setActiveTab('settlements');
      toast.success(`${res.data.settlements?.length || 0} transactions calculated! 🧠`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to run settlement');
    } finally {
      setRunningAlgo(false);
    }
  };

  const markComplete = async (settlementId) => {
    try {
      const res = await api.put(`/settlements/${settlementId}/complete`);
      const settlementsRes = await api.get(`/settlements/group/${id}`);
      setSettlements(settlementsRes.data.settlements);
      if (res.data.groupFullySettled) {
        const groupRes = await api.get(`/groups/${id}`);
        setGroup(groupRes.data.group);
        toast.success('🎉 All settled up! Group is now closed.');
      } else {
        toast.success('Payment marked as done ✅');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark complete');
    }
  };

  const [deleting, setDeleting] = useState(false);

  const handleDeleteGroup = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const confirmed = window.confirm('Are you sure you want to delete this group? This action cannot be undone.');
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      console.log('Sending DELETE request to /groups/', id);
      const res = await api.delete(`/groups/${id}`);
      console.log('Delete response:', res.data);
      toast.success('Group deleted successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Delete error:', err);
      toast.error(err.response?.data?.message || 'Failed to delete group');
    } finally {
      setDeleting(false);
    }
  };

  const handleExpenseAdded = () => {
    fetchAll();
  };

  if (loading) return (
    <MainLayout title="Loading Group...">
      <GroupDetailSkeleton />
    </MainLayout>
  );

  if (!group) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const myBalance = balances.find(b => b.user._id === user?._id);
  const pendingSettlements = settlements.filter(s => s.status === 'pending');
  const completedSettlements = settlements.filter(s => s.status === 'completed');

  const avatarColors = ['bg-primary', 'bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500'];

  return (
    <MainLayout title={group.name}>
      <div className="max-w-5xl mx-auto">
        {/* Breadcrumbs & Back Button Header */}
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(-1)} 
                className="rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 h-10 w-10"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                <Link to="/dashboard" className="hover:text-primary transition-colors flex items-center gap-1">
                  <LayoutDashboard className="w-3 h-3" /> Dashboard
                </Link>
                <span>/</span>
                <span className="text-foreground">{group.name}</span>
              </div>
           </div>
           
           <div className="flex items-center gap-3">
              {(group.createdBy?._id === user?._id || group.createdBy === user?._id) && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleDeleteGroup}
                  disabled={deleting}
                  className={`text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-full transition-all ${deleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Delete Group"
                >
                  <Trash2 className={`w-4 h-4 ${deleting ? 'animate-pulse' : ''}`} />
                </Button>
              )}
              <Badge 
                variant="secondary" 
                className={`rounded-full px-3 py-1 font-bold text-[9px] uppercase tracking-widest ${
                  group.status === 'settled'
                    ? 'bg-green-100 text-green-600'
                    : 'bg-primary/10 text-primary'
                }`}
              >
                {group.status === 'settled' ? 'Settled' : 'Active'}
              </Badge>
           </div>
        </div>

        {/* Group Hero Section */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 mb-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-10">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                <div className={`w-20 h-20 md:w-24 md:h-24 ${avatarColors[group.name.charCodeAt(0) % avatarColors.length]} rounded-[2rem] flex items-center justify-center text-white text-3xl md:text-4xl font-black shadow-2xl shadow-primary/20 transform hover:rotate-3 transition-transform cursor-default`}>
                  {group.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-center md:text-left">
                  <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight mb-3">
                    {group.name}
                  </h1>
                  <p className="text-sm md:text-base font-medium text-muted-foreground mb-6 max-w-md leading-relaxed">
                    {group.description || 'Shared group for splitting expenses efficiently and transparently.'}
                  </p>
                  
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-2.5 items-center">
                        {group.members?.slice(0, 5).map((member, i) => (
                          <div
                            key={member._id}
                            title={member.name}
                            className="w-9 h-9 rounded-full bg-white border-2 border-white ring-2 ring-gray-50 flex items-center justify-center text-[10px] text-primary font-black shadow-sm"
                            style={{ zIndex: 5 - i }}
                          >
                            {member.name?.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {group.members?.length > 5 && (
                          <div className="w-9 h-9 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] text-muted-foreground font-black z-0 shadow-sm" style={{ zIndex: 0 }}>
                            +{group.members.length - 5}
                          </div>
                        )}
                        <button 
                          onClick={() => setIsAddMemberModalOpen(true)}
                          className="w-9 h-9 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-colors z-0 shadow-sm ml-2 relative"
                          title="Add Member"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] ml-2">
                        {group.members?.length} Members
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  rounded="full" 
                  onClick={copyInviteLink}
                  className="font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-6 border-gray-100 hover:border-primary/30 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Invite'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  rounded="full" 
                  onClick={runSettlement}
                  disabled={runningAlgo || expenses.length === 0}
                  className="font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-6 border-primary/10 text-primary hover:bg-primary/5 transition-all"
                >
                  <BrainCircuit className="w-4 h-4" />
                  {runningAlgo ? 'Analyzing...' : 'Smart Settle'}
                </Button>
                {group.status !== 'settled' && (
                  <Button 
                    size="sm" 
                    rounded="full" 
                    onClick={() => setShowAddExpense(true)}
                    className="font-black text-[10px] uppercase tracking-widest gap-2 h-11 px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    Add Expense
                  </Button>
                )}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-white">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Total Volume</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">₹{totalExpenses.toLocaleString()}</p>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-white">
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Transactions</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">{expenses.length}</p>
              </div>
              <div className="bg-gray-50/50 rounded-2xl p-6 border border-white relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3 relative z-10">Your Net Balance</p>
                <p className={`text-3xl font-black tracking-tighter relative z-10 ${
                  !myBalance ? 'text-muted-foreground'
                  : myBalance.balance > 0 ? 'text-green-500'
                  : myBalance.balance < 0 ? 'text-primary'
                  : 'text-muted-foreground'
                }`}>
                  {myBalance
                    ? myBalance.balance === 0 ? '✓'
                    : `${myBalance.balance > 0 ? '+' : '-'}₹${Math.abs(myBalance.balance).toFixed(0)}`
                    : '—'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area with Tabs */}
        <Tabs defaultValue="expenses" className="w-full" onValueChange={setActiveTab}>
          <TabsList className="flex w-full overflow-x-auto hide-scrollbar max-w-lg mx-auto bg-white border border-gray-100 p-1.5 rounded-2xl h-auto min-h-[56px] mb-12 shadow-sm">
            <TabsTrigger value="expenses" className="flex-1 min-w-[110px] whitespace-nowrap rounded-xl font-bold text-xs gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Receipt className="w-4 h-4 shrink-0" />
              Expenses
              {expenses.length > 0 && <Badge className="ml-1 bg-white/20 text-[9px] h-5 min-w-[20px] font-black">{expenses.length}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="balances" className="flex-1 min-w-[110px] whitespace-nowrap rounded-xl font-bold text-xs gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Scale className="w-4 h-4 shrink-0" />
              Balances
            </TabsTrigger>
            <TabsTrigger value="settlements" className="flex-1 min-w-[110px] whitespace-nowrap rounded-xl font-bold text-xs gap-2 data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <History className="w-4 h-4 shrink-0" />
              Settlements
              {pendingSettlements.length > 0 && <Badge className="ml-1 bg-white/20 text-[9px] h-5 min-w-[20px] font-black">{pendingSettlements.length}</Badge>}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="focus-visible:outline-none">
            {expenses.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">💸</div>
                <h3 className="text-2xl font-black text-foreground mb-3">No expenses yet</h3>
                <p className="text-sm font-medium text-muted-foreground mb-10 max-w-xs mx-auto leading-relaxed">
                  The list is quiet. Start adding expenses to keep track of shared costs fairly.
                </p>
                {group.status !== 'settled' && (
                  <Button rounded="full" onClick={() => setShowAddExpense(true)} className="px-10 font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-primary/20">
                    Add First Expense
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5">
                {expenses.map(expense => (
                  <ExpenseCard key={expense._id} expense={expense} currentUserId={user?._id} />
                ))}
                {group.status !== 'settled' && (
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="w-full py-10 rounded-[2rem] border-2 border-dashed border-gray-100 text-muted-foreground text-xs font-black uppercase tracking-[0.2em] hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-3 group"
                  >
                    <Plus className="w-5 h-5 stroke-[3] group-hover:scale-110 transition-transform" />
                    Add Another Expense
                  </button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances" className="focus-visible:outline-none">
            {balances.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">⚖️</div>
                <p className="text-sm font-medium text-muted-foreground">Add expenses to calculate member balances.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-5 max-w-3xl mx-auto">
                {balances.map(b => <BalanceCard key={b.user._id} balanceData={b} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settlements" className="focus-visible:outline-none">
            {settlements.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
                <div className="w-24 h-24 bg-orange-50 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner">🧠</div>
                <h3 className="text-2xl font-black text-foreground mb-3">Optimize Settlements</h3>
                <p className="text-sm font-medium text-muted-foreground mb-10 max-w-xs mx-auto leading-relaxed">
                  Our smart algorithm calculates the minimum number of transactions needed to settle everyone up.
                </p>
                <Button rounded="full" onClick={runSettlement} disabled={runningAlgo || expenses.length === 0} className="px-10 font-black text-xs uppercase tracking-widest h-12 shadow-xl shadow-primary/20 gap-3">
                  <BrainCircuit className="w-5 h-5 stroke-[2.5]" />
                  {runningAlgo ? 'Analyzing...' : 'Run Optimization'}
                </Button>
              </div>
            ) : (
              <div className="space-y-8 max-w-3xl mx-auto">
                {/* Optimization Summary */}
                <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                  <div className="flex items-center justify-between mb-6 relative z-10">
                    <div>
                      <p className="text-sm font-black text-foreground mb-1">
                        {pendingSettlements.length} Payment{pendingSettlements.length !== 1 ? 's' : ''} Pending
                      </p>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {completedSettlements.length} of {settlements.length} Transactions Completed
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={runSettlement} disabled={runningAlgo} className="text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5 rounded-full px-6 h-9">
                      Recalculate
                    </Button>
                  </div>
                  <div className="h-2.5 bg-gray-50 rounded-full overflow-hidden relative z-10 border border-white">
                    <div
                      className="bg-primary h-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(232,80,10,0.3)]"
                      style={{ width: `${(completedSettlements.length / settlements.length) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5">
                  {settlements.map(s => (
                    <div key={s._id} className={`bg-white rounded-3xl border p-8 transition-all ${
                      s.status === 'completed' ? 'border-green-100 opacity-60 bg-gray-50/30' : 'border-gray-50 shadow-sm hover:shadow-md'
                    }`}>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
                        <div className="flex items-center gap-8">
                          {/* From */}
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-base font-black shadow-inner">
                              {s.from?.name?.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground mt-3 uppercase tracking-widest">{s.from?.name?.split(' ')[0]}</p>
                          </div>

                          {/* Flow Visualization */}
                          <div className="flex flex-col items-center gap-3">
                             <div className="text-xl font-black text-foreground tabular-nums tracking-tighter">₹{s.amount.toLocaleString()}</div>
                             <div className="flex items-center gap-3">
                                <div className="h-[2px] w-10 md:w-16 bg-gray-100 rounded-full"></div>
                                <div className="text-primary animate-pulse">
                                   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
                                      <path d="M5 12h14M12 5l7 7-7 7"/>
                                   </svg>
                                </div>
                                <div className="h-[2px] w-10 md:w-16 bg-gray-100 rounded-full"></div>
                             </div>
                          </div>

                          {/* To */}
                          <div className="flex flex-col items-center">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 text-base font-black shadow-inner">
                              {s.to?.name?.charAt(0).toUpperCase()}
                            </div>
                            <p className="text-[10px] font-black text-muted-foreground mt-3 uppercase tracking-widest">{s.to?.name?.split(' ')[0]}</p>
                          </div>
                        </div>

                        {/* Final Action */}
                        {s.status === 'completed' ? (
                          <div className="flex items-center gap-3 text-green-600 bg-green-50 px-6 py-3 rounded-2xl border border-green-100">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Verified</span>
                          </div>
                        ) : s.from?._id === user?._id ? (
                          <Button 
                            size="sm" 
                            rounded="full" 
                            onClick={() => markComplete(s._id)}
                            className="font-black text-[10px] uppercase tracking-widest h-12 px-8 shadow-lg shadow-primary/10 hover:scale-105 transition-all"
                          >
                            Mark as Settled
                          </Button>
                        ) : (
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] bg-gray-50/50 px-6 py-3 rounded-2xl border border-gray-100 italic">
                            Awaiting Payer
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modern Modal Overlay */}
      {showAddExpense && (
        <AddExpenseModal
          group={group}
          currentUser={user}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {isAddMemberModalOpen && (
        <AddMemberModal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          groupId={group?._id}
          currentMembers={group?.members || []}
          onMemberAdded={fetchAll}
        />
      )}
    </MainLayout>
  );
};

export default GroupDetailPage;
