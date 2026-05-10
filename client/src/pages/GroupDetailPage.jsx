import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/axios";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import ExpenseCard from "../components/ExpenseCard";
import BalanceCard from "../components/BalanceCard";
import AddExpenseModal from "../components/AddExpenseModal";
import { GroupDetailSkeleton } from "../components/Skeleton";

const GroupDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("expenses");
  const [copied, setCopied] = useState(false);
  const [runningAlgo, setRunningAlgo] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);

  useEffect(() => {
    fetchAll();
  }, [id]);

  const fetchAll = async () => {
    try {
      const [groupRes, expensesRes, balancesRes, settlementsRes] =
        await Promise.all([
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
      toast.error("Failed to load group");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const copyInviteLink = () => {
    const link = `${window.location.origin}/join/${group.inviteToken}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Invite link copied! 🔗");
    setTimeout(() => setCopied(false), 2000);
  };

  const runSettlement = async () => {
    setRunningAlgo(true);
    try {
      const res = await api.post(`/settlements/run/${id}`);
      const settlementsRes = await api.get(`/settlements/group/${id}`);
      setSettlements(settlementsRes.data.settlements);
      setActiveTab("settlements");
      toast.success(
        `${res.data.settlements?.length || 0} transactions calculated! 🧠`,
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to run settlement");
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
        toast.success("🎉 All settled up! Group is now closed.");
      } else {
        toast.success("Payment marked as done ✅");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to mark complete");
    }
  };

  const handleExpenseAdded = () => {
    fetchAll(); // Refresh everything
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <GroupDetailSkeleton />
      </div>
    );

  if (!group) return null;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const myBalance = balances.find((b) => b.user._id === user?._id);
  const pendingSettlements = settlements.filter((s) => s.status === "pending");
  const completedSettlements = settlements.filter(
    (s) => s.status === "completed",
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Group Header Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-5 shadow-sm">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-md shadow-orange-100">
                {group.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">
                    {group.name}
                  </h1>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      group.status === "settled"
                        ? "bg-green-50 text-green-600"
                        : "bg-orange-50 text-orange-500"
                    }`}
                  >
                    {group.status === "settled" ? "✓ Settled" : "Active"}
                  </span>
                </div>
                <p className="text-sm text-gray-400">
                  {group.description || "No description"}
                </p>
                {/* Members */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex -space-x-2">
                    {group.members?.slice(0, 5).map((member, i) => (
                      <div
                        key={member._id}
                        title={member.name}
                        className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center text-xs text-orange-600 font-semibold"
                        style={{ zIndex: 5 - i }}
                      >
                        {member.name?.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">
                    {group.members?.length} members
                  </span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={copyInviteLink}
                className="flex items-center gap-2 text-sm border border-gray-200 text-gray-600 px-4 py-2 rounded-full hover:bg-gray-50 transition-colors"
              >
                🔗 {copied ? "Copied!" : "Invite"}
              </button>
              <button
                onClick={runSettlement}
                disabled={runningAlgo || expenses.length === 0}
                className="flex items-center gap-2 text-sm border border-orange-200 text-orange-500 px-4 py-2 rounded-full hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                🧠 {runningAlgo ? "Calculating..." : "Smart settle"}
              </button>
              {group.status !== "settled" && (
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="flex items-center gap-2 text-sm bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
                >
                  + Add expense
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-5 border-t border-gray-50">
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">
                ₹{totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Total spent</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-xl font-bold text-gray-900">
                {expenses.length}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Expenses</p>
            </div>
            <div className="text-center">
              <p
                className={`text-xl font-bold ${
                  !myBalance
                    ? "text-gray-400"
                    : myBalance.balance > 0
                      ? "text-green-500"
                      : myBalance.balance < 0
                        ? "text-orange-500"
                        : "text-gray-400"
                }`}
              >
                {myBalance
                  ? myBalance.balance === 0
                    ? "✓"
                    : `${myBalance.balance > 0 ? "+" : ""}₹${Math.abs(myBalance.balance).toFixed(0)}`
                  : "—"}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Your balance</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl border border-gray-100 p-1.5 mb-5 shadow-sm">
          {[
            { key: "expenses", label: "Expenses", count: expenses.length },
            { key: "balances", label: "Balances", count: null },
            {
              key: "settlements",
              label: "Settlements",
              count: pendingSettlements.length || null,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-sm font-semibold capitalize transition-all flex items-center justify-center gap-1.5 ${
                activeTab === tab.key
                  ? "bg-orange-500 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                    activeTab === tab.key
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Expenses Tab */}
        {activeTab === "expenses" && (
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">💸</div>
                <h3 className="font-bold text-gray-900 mb-2">
                  No expenses yet
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                  Add your first expense to start tracking who owes what
                </p>
                {group.status !== "settled" && (
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors"
                  >
                    + Add first expense
                  </button>
                )}
              </div>
            ) : (
              <>
                {expenses.map((expense) => (
                  <ExpenseCard
                    key={expense._id}
                    expense={expense}
                    currentUserId={user?._id}
                  />
                ))}
                {group.status !== "settled" && (
                  <button
                    onClick={() => setShowAddExpense(true)}
                    className="w-full py-4 rounded-2xl border-2 border-dashed border-gray-200 text-gray-400 text-sm font-medium hover:border-orange-300 hover:text-orange-500 transition-all"
                  >
                    + Add another expense
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* Balances Tab */}
        {activeTab === "balances" && (
          <div className="space-y-3">
            {balances.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">⚖️</div>
                <p className="text-sm text-gray-400">
                  Add expenses to see balances
                </p>
              </div>
            ) : (
              balances.map((b) => (
                <BalanceCard key={b.user._id} balanceData={b} />
              ))
            )}
          </div>
        )}

        {/* Settlements Tab */}
        {activeTab === "settlements" && (
          <div className="space-y-3">
            {settlements.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <div className="text-5xl mb-4">🧠</div>
                <h3 className="font-bold text-gray-900 mb-2">
                  No settlements calculated yet
                </h3>
                <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto">
                  Click "Smart settle" to calculate the minimum transactions
                  needed
                </p>
                <button
                  onClick={runSettlement}
                  disabled={runningAlgo || expenses.length === 0}
                  className="bg-orange-500 text-white px-6 py-3 rounded-full text-sm font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {runningAlgo ? "Calculating..." : "🧠 Run smart settle"}
                </button>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {pendingSettlements.length} payment
                        {pendingSettlements.length !== 1 ? "s" : ""} remaining
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {completedSettlements.length} of {settlements.length}{" "}
                        completed
                      </p>
                    </div>
                    <button
                      onClick={runSettlement}
                      disabled={runningAlgo}
                      className="text-xs text-orange-500 border border-orange-200 px-3 py-1.5 rounded-full hover:bg-orange-100 transition-colors"
                    >
                      Recalculate
                    </button>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-3 bg-orange-200 rounded-full h-1.5">
                    <div
                      className="bg-orange-500 h-1.5 rounded-full transition-all"
                      style={{
                        width: `${(completedSettlements.length / settlements.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {settlements.map((s) => (
                  <div
                    key={s._id}
                    className={`bg-white rounded-2xl border p-5 transition-all ${
                      s.status === "completed"
                        ? "border-green-100 opacity-60"
                        : "border-gray-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* From */}
                        <div className="text-center">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 text-sm font-bold mx-auto">
                            {s.from?.name?.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 font-medium">
                            {s.from?.name?.split(" ")[0]}
                          </p>
                        </div>

                        {/* Arrow + amount */}
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-sm font-bold text-gray-900">
                            ₹{s.amount}
                          </span>
                          <div className="flex items-center gap-1">
                            <div className="w-8 h-0.5 bg-orange-200 rounded"></div>
                            <span className="text-orange-400 text-xs">→</span>
                            <div className="w-8 h-0.5 bg-orange-200 rounded"></div>
                          </div>
                        </div>

                        {/* To */}
                        <div className="text-center">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600 text-sm font-bold mx-auto">
                            {s.to?.name?.charAt(0).toUpperCase()}
                          </div>
                          <p className="text-xs text-gray-400 mt-1 font-medium">
                            {s.to?.name?.split(" ")[0]}
                          </p>
                        </div>
                      </div>

                      {/* Action */}
                      {s.status === "completed" ? (
                        <span className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-full font-semibold">
                          ✓ Paid
                        </span>
                      ) : s.from?._id === user?._id ? (
                        <button
                          onClick={() => markComplete(s._id)}
                          className="text-xs bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors font-semibold"
                        >
                          Mark as paid
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-full">
                          Waiting
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          group={group}
          currentUser={user}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}
    </div>
  );
};

export default GroupDetailPage;
