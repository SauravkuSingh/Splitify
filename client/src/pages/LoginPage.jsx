import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      
      // Check for pending invite
      const pendingInvite = localStorage.getItem('splitify_pending_invite');
      if (pendingInvite) {
        localStorage.removeItem('splitify_pending_invite');
        navigate(`/join/${pendingInvite}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBFBFC] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 antialiased">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center mx-auto shadow-lg shadow-primary/20 group-hover:scale-105 transition-all">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3"/>
              </svg>
            </div>
            <span className="text-2xl font-black tracking-tighter text-foreground">Splitify</span>
          </Link>
          <h2 className="mt-8 text-2xl font-extrabold text-gray-900 tracking-tight">Welcome back!</h2>
          <p className="mt-2 text-sm text-gray-500 font-medium">Continue your smart splitting journey.</p>
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
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="rounded-xl h-11 px-4 border-gray-200 focus:bg-white transition-all text-sm font-medium"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between ml-1">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Password</Label>
                  <a href="#" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">Forgot?</a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="rounded-xl h-11 px-4 border-gray-200 focus:bg-white transition-all text-sm font-medium"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                rounded="full"
                className="w-full h-12 text-sm font-bold shadow-lg shadow-primary/10 hover:scale-[1.01] active:scale-95 transition-all mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In to Account'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-500 font-medium">
            New to Splitify?{' '}
            <Link to="/signup" className="text-primary font-bold hover:underline underline-offset-4 ml-1">
              Create an account free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;