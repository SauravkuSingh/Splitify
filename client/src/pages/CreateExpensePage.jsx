import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import LoadingSpinner from '../components/LoadingSpinner';

const CreateExpensePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'other',
    notes: '',
    splitType: 'equal',
  });

  const [selectedMembers, setSelectedMembers] = useState([]);

  useEffect(() => {
    fetchGroup();
  }, [id]);

  const fetchGroup = async () => {
    try {
      const res = await api.get(`/groups/${id}`);
      setGroup(res.data.group);
      setSelectedMembers(res.data.group.members.map(m => m._id));
    } catch (err) {
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(m => m !== memberId) 
        : [...prev, memberId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMembers.length === 0) {
      setError('Please select at least one person to split with.');
      return;
    }
    setError('');
    setSubmitting(true);

    try {
      await api.post('/expenses', {
        groupId: id,
        title: form.title,
        amount: parseFloat(form.amount),
        paidBy: currentUser._id,
        splitBetween: selectedMembers,
        splitType: 'equal',
        category: form.category,
        notes: form.notes
      });
      navigate(`/groups/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Preparing expense form..." />;
  if (!group) return <div className="text-center py-20 font-bold">Group not found</div>;

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <Navbar />
      <main className="container max-w-2xl mx-auto px-4 py-12">
        <Link to={`/groups/${id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Back to {group.name}
        </Link>

        <Card className="border-gray-200 shadow-sm rounded-2xl overflow-hidden">
          <CardHeader className="bg-white border-b border-gray-100 p-8">
            <CardTitle className="text-2xl font-bold">Add an Expense</CardTitle>
            <CardDescription className="text-muted-foreground font-medium mt-1">
              Splitting with {group.name} members.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl text-sm mb-6 font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Description</Label>
                  <Input
                    id="title"
                    placeholder="Lunch, Groceries, Movie..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="h-11 rounded-lg border-gray-200"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="h-11 rounded-lg border-gray-200"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Split between</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  {group.members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-3 p-2 hover:bg-white rounded-lg transition-colors">
                      <Checkbox 
                        id={`member-${member._id}`} 
                        checked={selectedMembers.includes(member._id)}
                        onCheckedChange={() => toggleMember(member._id)}
                        className="rounded-md"
                      />
                      <label 
                        htmlFor={`member-${member._id}`}
                        className="text-sm font-semibold cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {member.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <select
                  id="category"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="food">🍔 Food & Drinks</option>
                  <option value="travel">✈️ Travel</option>
                  <option value="accommodation">🏨 Accommodation</option>
                  <option value="entertainment">🎬 Entertainment</option>
                  <option value="shopping">🛍️ Shopping</option>
                  <option value="utilities">💡 Utilities</option>
                  <option value="medical">💊 Medical</option>
                  <option value="other">📦 Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any details about this expense?"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="rounded-xl resize-none h-24"
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]"
              >
                {submitting ? 'Adding Expense...' : 'Add Expense'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateExpensePage;
