import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axios';
import toast from 'react-hot-toast';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowRight, LayoutDashboard, AlertCircle, CheckCircle2 } from "lucide-react";

const JoinGroupPage = () => {
  const { inviteToken } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | joining | success | error | already
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      // Not logged in — save token and redirect to signup
      localStorage.setItem('splitify_pending_invite', inviteToken);
      toast('Login or Signup to join the group', { icon: '🔑' });
      navigate(`/signup?invite=${inviteToken}`);
      return;
    }
    joinGroup();
  }, [user, inviteToken]);

  const joinGroup = async () => {
    setStatus('joining');
    try {
      const res = await api.post(`/groups/join/${inviteToken}`);
      setStatus('success');
      toast.success(`Joined "${res.data.group.name}"! 🎉`, { duration: 3000 });
      setTimeout(() => {
        navigate(`/groups/${res.data.group._id}`);
      }, 2000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid invite link';
      setMessage(msg);
      if (msg.toLowerCase().includes('already a member')) {
        setStatus('already');
      } else {
        setStatus('error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] antialiased flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Ornaments */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full -mr-64 -mt-64 blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full -ml-64 -mb-64 blur-3xl"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo Header */}
        <div className="flex flex-col items-center mb-10">
           <Link to="/" className="flex items-center gap-4 mb-4 group">
              <div className="w-14 h-14 bg-primary rounded-[1.25rem] flex items-center justify-center shadow-2xl shadow-primary/30 group-hover:rotate-3 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tighter">Splitify</h1>
           </Link>
           <div className="h-1 w-12 bg-gray-100 rounded-full"></div>
        </div>

        <Card className="border-gray-100 shadow-2xl rounded-[2.5rem] overflow-hidden bg-white/80 backdrop-blur-xl">
          <CardContent className="p-10 text-center">
            
            {(status === 'loading' || status === 'joining') && (
              <div className="space-y-8 py-4">
                <div className="relative mx-auto w-20 h-20">
                  <div className="absolute inset-0 border-4 border-primary/10 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Joining Group</h2>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Verifying your invite...</p>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="space-y-8 py-4 animate-in fade-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">You're In!</h2>
                  <p className="text-sm font-medium text-muted-foreground">Successfully joined the group. Redirecting you to the shared expenses...</p>
                </div>
              </div>
            )}

            {status === 'already' && (
              <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-blue-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                  <LayoutDashboard className="w-10 h-10 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Welcome Back</h2>
                  <p className="text-sm font-medium text-muted-foreground mb-10">You are already a member of this group. No extra steps needed!</p>
                  <Button asChild rounded="full" className="w-full h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                    <Link to="/dashboard">Go to Dashboard</Link>
                  </Button>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-8 py-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-20 h-20 bg-red-50 rounded-[2rem] flex items-center justify-center mx-auto shadow-inner">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight mb-2">Invalid Link</h2>
                  <p className="text-sm font-medium text-muted-foreground mb-10">{message || 'This invite link is invalid or has expired.'}</p>
                  <div className="flex flex-col gap-3">
                    <Button asChild rounded="full" className="w-full h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20">
                      <Link to="/dashboard">Return Home</Link>
                    </Button>
                    <Button asChild variant="ghost" rounded="full" className="w-full h-14 font-black text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground">
                      <Link to="/login">Try Another Account</Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}

          </CardContent>
        </Card>

        {/* Footer Info */}
        <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] mt-10">
          Powered by Splitify Smart Engine
        </p>
      </div>
    </div>
  );
};

export default JoinGroupPage;