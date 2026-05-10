import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import ExpenseCard from '../components/ExpenseCard';
import BalanceCard from '../components/BalanceCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const GroupDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [runningAlgo, setRunningAlgo] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAll();
  }, [id]);

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
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${group.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const runSettlement = async () => {
    setRunningAlgo(true);
    try {
      await api.post(`/settlements/run/${id}`);
      const res = await api.get(`/settlements/group/${id}`);
      setSettlements(res.data.settlements);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to run settlement');
    } finally {
      setRunningAlgo(false);
    }
  };

  const markComplete = async (settlementId) => {
    try {
      await api.put(`/settlements/${settlementId}/complete`);
      const res = await api.get(`/settlements/group/${id}`);
      setSettlements(res.data.settlements);
      const groupRes = await api.get(`/groups/${id}`);
      setGroup(groupRes.data.group);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark complete');
    }
  };

  if (loading) return <LoadingSpinner message="Loading group..." />;
  if (!group) return <div className="text-center py-20 font-bold">Group not found</div>;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const myBalance = balances.find(b => b.user._id === user?._id);

  return (
    <div className="layout-wrapper bg-[#FBFBFC] antialiased">
      <Navbar />

      <main className="container-centered py-10">
        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground mb-8">
           <Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
           <span>/</span>
           <span className="text-foreground">{group.name}</span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-8 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              {error}
            </span>
            <button onClick={() => setError('')} className="p-1 hover:bg-red-100 rounded-full">✕</button>
          </div>
        )}

        {/* Group Header Card */}
        <Card className="border-gray-200 rounded-2xl p-8 mb-8 shadow-sm bg-white relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-primary/20">
                  {group.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">{group.name}</h1>
                    <Badge 
                      variant="secondary" 
                      className={`rounded-full px-2.5 py-0.5 font-bold text-[10px] uppercase tracking-widest ${
                        group.status === 'settled' ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {group.status === 'settled' ? 'Settled' : 'Active'}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{group.description || 'Shared expenses'}</p>
                </div>
              </div>

              {/* Members */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2">
                  {group.members?.map((member, i) => (
                    <Avatar 
                      key={member._id} 
                      className="w-8 h-8 border-2 border-white shadow-sm"
                      style={{ zIndex: group.members.length - i }}
                    >
                      <AvatarFallback className="bg-orange-50 text-primary text-[10px] font-bold">
                        {member.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{group.members?.length} Members</span>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-auto">
              <Button
                variant="outline"
                rounded="full"
                onClick={copyInviteLink}
                className="flex-1 font-bold border-gray-200 hover:border-primary/20 hover:bg-primary/5 h-11 text-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mr-2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                </svg>
                {copied ? 'Copied!' : 'Copy Invite Link'}
              </Button>
              <Button
                onClick={runSettlement}
                disabled={runningAlgo || expenses.length === 0}
                rounded="full"
                className="flex-1 font-bold shadow-lg shadow-primary/10 h-11 text-xs"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mr-2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                {runningAlgo ? 'Calculating...' : 'Run Smart Settle'}
              </Button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-gray-50">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">₹{totalExpenses.toLocaleString()}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Total spent</p>
            </div>
            <div className="text-center border-x border-gray-50">
              <p className="text-xl font-bold text-foreground">{expenses.length}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Expenses</p>
            </div>
            <div className="text-center">
              <p className={`text-xl font-bold ${
                !myBalance ? 'text-foreground'
                : myBalance.balance > 0 ? 'text-green-600'
                : myBalance.balance < 0 ? 'text-primary'
                : 'text-muted-foreground'
              }`}>
                {myBalance
                  ? myBalance.balance === 0 ? '✓'
                  : `${myBalance.balance > 0 ? '+' : ''}₹${Math.abs(myBalance.balance).toFixed(0)}`
                  : '—'
                }
              </p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Your balance</p>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="expenses" className="w-full">
          <div className="flex items-center justify-between mb-8">
            <TabsList className="bg-white border border-gray-100 h-11 p-1 rounded-xl shadow-sm">
              <TabsTrigger value="expenses" className="rounded-lg px-6 h-full font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                Expenses {expenses.length > 0 && <span className="ml-1 opacity-60">({expenses.length})</span>}
              </TabsTrigger>
              <TabsTrigger value="balances" className="rounded-lg px-6 h-full font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                Balances
              </TabsTrigger>
              <TabsTrigger value="settlements" className="rounded-lg px-6 h-full font-bold text-xs data-[state=active]:bg-primary data-[state=active]:text-white">
                Settlements {settlements.length > 0 && <span className="ml-1 opacity-60">({settlements.length})</span>}
              </TabsTrigger>
            </TabsList>
            
            <Button size="sm" rounded="full" className="font-bold shadow-md shadow-primary/10 h-10 px-6" onClick={() => navigate(`/groups/${id}/expenses/new`)}>
              + Add Expense
            </Button>
          </div>

          <TabsContent value="expenses" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {expenses.length === 0 ? (
              <Card className="bg-white border-gray-100 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">💸</div>
                <h3 className="text-lg font-bold text-foreground mb-2">No expenses yet</h3>
                <p className="text-sm text-muted-foreground font-medium mb-8">Ready to track? Add your first group expense.</p>
                <Button rounded="full" className="px-8 font-bold" onClick={() => navigate(`/groups/${id}/expenses/new`)}>
                  Add My First Expense
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {expenses.map(expense => (
                  <ExpenseCard key={expense._id} expense={expense} currentUserId={user?._id} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="balances" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {balances.length === 0 ? (
              <Card className="bg-white border-gray-100 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">⚖️</div>
                <p className="text-sm text-muted-foreground font-medium">Add expenses to see who owes what.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {balances.map(b => <BalanceCard key={b.user._id} balanceData={b} />)
              }</div>
            )}
          </TabsContent>

          <TabsContent value="settlements" className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {settlements.length === 0 ? (
              <Card className="bg-white border-gray-100 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6">🧠</div>
                <h3 className="text-lg font-bold text-foreground mb-2">No settlements yet</h3>
                <p className="text-sm text-muted-foreground font-medium mb-8">Run smart settle to find the most efficient payments.</p>
                <Button 
                  onClick={runSettlement} 
                  disabled={runningAlgo || expenses.length === 0}
                  rounded="full"
                  className="px-8 font-bold"
                >
                  {runningAlgo ? 'Calculating...' : 'Calculate Settlements'}
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {settlements.map(s => (
                  <Card key={s._id} className={`rounded-2xl border-gray-100 p-6 transition-all ${
                    s.status === 'completed' ? 'bg-green-50/50 border-green-100 opacity-70' : 'bg-white'
                  }`}>
                    <div className="flex items-center justify-between gap-6">
                      <div className="flex items-center gap-4 flex-1">
                        {/* From */}
                        <div className="text-center">
                          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-orange-100 text-orange-600 font-bold text-[10px]">
                              {s.from?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-[10px] font-bold text-foreground mt-2">{s.from?.name?.split(' ')[0]}</p>
                        </div>

                        {/* Arrow + amount */}
                        <div className="flex flex-col items-center flex-1">
                          <Badge variant="secondary" className="mb-2 bg-primary/10 text-primary border-none font-bold text-[10px]">
                            ₹{s.amount}
                          </Badge>
                          <div className="w-full h-0.5 bg-gradient-to-r from-primary to-green-500 rounded-full"></div>
                        </div>

                        {/* To */}
                        <div className="text-center">
                          <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                            <AvatarFallback className="bg-green-100 text-green-600 font-bold text-[10px]">
                              {s.to?.name?.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="text-[10px] font-bold text-foreground mt-2">{s.to?.name?.split(' ')[0]}</p>
                        </div>
                      </div>

                      {/* Status / Action */}
                      {s.status === 'completed' ? (
                        <div className="bg-green-100 text-green-600 px-4 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-widest">
                          Paid
                        </div>
                      ) : s.from?._id === user?._id ? (
                        <Button
                          onClick={() => markComplete(s._id)}
                          rounded="full"
                          size="sm"
                          className="font-bold text-[10px] px-4"
                        >
                          Mark Paid
                        </Button>
                      ) : (
                        <Badge variant="secondary" className="px-4 py-1.5 rounded-full font-bold text-[10px] bg-gray-100 text-gray-500 border-none uppercase tracking-widest">
                          Pending
                        </Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GroupDetailPage;