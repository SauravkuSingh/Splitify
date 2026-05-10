import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import Navbar from '../components/Navbar';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const CreateGroupPage = () => {
  const [form, setForm] = useState({ name: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/groups', form);
      navigate(`/groups/${res.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] antialiased">
      <Navbar />
      <main className="container max-w-lg mx-auto px-4 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">Create a New Group</h1>
          <p className="text-sm font-medium text-muted-foreground mt-2">
            Start splitting expenses with your friends, family, or roommates.
          </p>
        </div>

        <Card className="border-gray-100 shadow-xl rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-8">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-xs font-bold mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Group Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Goa Trip 2026, Flatmates"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="rounded-xl h-11 px-4 border-gray-200 focus:bg-white transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this group for?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-xl px-4 py-3 border-gray-200 focus:bg-white transition-all text-sm font-medium min-h-[100px] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 h-12 text-sm font-bold rounded-xl border-gray-200"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-12 text-sm font-bold rounded-xl shadow-lg shadow-primary/10 transition-all hover:scale-[1.01]"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateGroupPage;