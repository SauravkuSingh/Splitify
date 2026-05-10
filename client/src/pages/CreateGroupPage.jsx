import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MainLayout } from "@/components/MainLayout";
import { ArrowLeft, Users } from "lucide-react";
import toast from 'react-hot-toast';

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
      toast.success('Group created! 🚀');
      navigate(`/groups/${res.data.group._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group. Please try again.');
      toast.error('Could not create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Create Group">
      <div className="max-w-2xl mx-auto py-6">
        <div className="mb-10 flex items-center gap-6">
           <Button 
             variant="ghost" 
             size="icon" 
             onClick={() => navigate(-1)} 
             className="rounded-full bg-white border border-gray-100 shadow-sm hover:bg-gray-50 h-12 w-12"
           >
             <ArrowLeft className="w-5 h-5" />
           </Button>
           <div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">New Group</h1>
              <p className="text-sm font-medium text-muted-foreground mt-1">
                Organize your expenses with friends and roommates.
              </p>
           </div>
        </div>

        <Card className="border-gray-100 shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardContent className="p-10">
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 px-5 py-4 rounded-2xl text-xs font-bold mb-8 flex items-center gap-3">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Group Name</Label>
                <div className="relative">
                   <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <Input
                     id="name"
                     placeholder="Goa Trip 2026, Flatmates..."
                     value={form.name}
                     onChange={(e) => setForm({ ...form, name: e.target.value })}
                     className="rounded-2xl h-14 pl-12 pr-6 border-gray-100 bg-gray-50/30 focus:bg-white transition-all text-sm font-bold tracking-tight"
                     required
                   />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="What is this group for? Add a short note..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="rounded-2xl px-6 py-4 border-gray-100 bg-gray-50/30 focus:bg-white transition-all text-sm font-medium min-h-[140px] resize-none leading-relaxed"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1 h-14 text-xs font-black uppercase tracking-widest rounded-2xl border-gray-100 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-[2] h-14 text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-[1.02]"
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default CreateGroupPage;