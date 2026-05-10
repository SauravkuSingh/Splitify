import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  return (
    <div className="layout-wrapper bg-white overflow-x-hidden antialiased">
      {/* NAV */}
      <header className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="container-centered h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center shadow-lg shadow-primary/10 group-hover:scale-105 transition-transform">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">Splitify</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest hidden sm:block">
              Sign In
            </Link>
            <Button asChild rounded="full" className="px-6 font-bold shadow-sm h-10 transition-all">
              <Link to="/signup">Start Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative pt-16 md:pt-24 pb-16 md:pb-20">
          <div className="container-centered text-center relative z-10">
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1 border-primary/10 text-primary bg-primary/5 hover:bg-primary/10 font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-500">
              ✨ AI-Powered Expense Splitting
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
              Split bills without<br className="hidden md:block" />
              the <span className="text-primary italic">awkward math</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 px-4">
              Stop stressing over who owes what. Snap a receipt, let AI handle the details, and settle up in seconds with our smart optimization engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Button size="lg" rounded="full" className="px-10 h-12 text-sm font-bold shadow-md shadow-primary/10 hover:scale-105 transition-all" asChild>
                <Link to="/signup">Get Started For Free</Link>
              </Button>
              <Button size="lg" variant="outline" rounded="full" className="px-10 h-12 text-sm font-bold border-gray-200 hover:bg-gray-50 transition-all" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>

            {/* TRUST INDICATORS */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-60">
              <span className="flex items-center gap-2">⭐ <span className="text-foreground">4.9/5</span> Rating</span>
              <span className="flex items-center gap-2">👥 <span className="text-foreground">1,200+</span> Users</span>
              <span className="flex items-center gap-2">🛡️ <span className="text-foreground">100%</span> Private</span>
            </div>
          </div>

          {/* APP PREVIEW MOCKUP - REFINED SIZE */}
          <div className="container-centered mt-16 max-w-3xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <Card className="text-left border-gray-100 shadow-xl rounded-[2rem] overflow-hidden bg-white p-1">
              <div className="border border-gray-50 rounded-[1.8rem] overflow-hidden bg-gray-50/30">
                <div className="p-6 md:p-8">
                   <div className="flex items-center justify-between mb-8">
                     <div>
                       <h3 className="text-lg font-bold text-foreground">Goa Trip 🏖️</h3>
                       <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Active Group</p>
                     </div>
                     <Badge className="bg-primary/10 text-primary border-none rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest">
                       In Sync
                     </Badge>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                     <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                       <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">Total Expenses</p>
                       <p className="text-3xl font-black text-foreground tracking-tight">₹12,450</p>
                     </div>
                     <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                       <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">You Owe</p>
                       <p className="text-3xl font-black text-primary tracking-tight">₹1,840</p>
                     </div>
                   </div>

                   <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                     <p className="text-[10px] font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-widest">
                       <span className="w-5 h-5 bg-primary rounded-full flex items-center justify-center text-white text-[8px]">AI</span>
                       Smart Settlement Analysis
                     </p>
                     <div className="flex items-center gap-4 md:gap-6">
                       <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">P</AvatarFallback>
                       </Avatar>
                       <div className="flex-1 flex flex-col items-center gap-2">
                         <Badge variant="default" className="bg-primary/90 hover:bg-primary font-bold px-3 py-0.5 rounded-full text-[10px]">₹1,840</Badge>
                         <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                           <div className="h-full w-2/3 bg-primary rounded-full"></div>
                         </div>
                       </div>
                       <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                          <AvatarFallback className="bg-green-50 text-green-600 font-bold text-xs">R</AvatarFallback>
                       </Avatar>
                     </div>
                   </div>
                </div>
              </div>
            </Card>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-20 md:py-32 bg-gray-50/50">
          <div className="container-centered">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 rounded-full border-primary/20 text-primary bg-primary/5 px-4 py-1 font-bold text-[10px] uppercase tracking-widest">
                Features
              </Badge>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                Everything you need to split smarter
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "📷", title: "AI Receipt Scan", desc: "Our OCR engine extracts all items and totals instantly. Just snap and forget." },
                { icon: "🧠", title: "Smart Algorithm", desc: "We find the most efficient way to settle everyone in the minimum steps." },
                { icon: "🔗", title: "Instant Invites", desc: "Magic links that let your friends join in a single tap—no annoying login first." },
                { icon: "⚖️", title: "Infinite Split Options", desc: "Split by amount, percentage, itemized list, or custom weight. Total flexibility." },
                { icon: "🏷️", title: "Auto Categorizing", desc: "We track where your money goes across food, travel, lodging, and more." },
                { icon: "✅", title: "Real-time Verification", desc: "Payments are tracked in real-time. Know exactly who paid whom and when." }
              ].map((f) => (
                <div key={f.title} className="p-8 rounded-2xl bg-white border border-gray-100 hover:shadow-md transition-all duration-300">
                  <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-2xl mb-6 shadow-inner">{f.icon}</div>
                  <h3 className="text-base font-bold text-foreground mb-3 tracking-tight">{f.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container-centered">
            <div className="text-center mb-16">
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
                3 Steps. Zero Headache.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 relative">
              {[
                { step: "01", title: "Launch Group", desc: "Create a trip or house group in seconds and share the invite link." },
                { step: "02", title: "Track Shared Cost", desc: "Add expenses as they happen. Use AI to scan receipts and auto-split." },
                { step: "03", title: "Auto Settle", desc: "Our algorithm finds the fastest way for everyone to pay back the pool." }
              ].map((s) => (
                <div key={s.step} className="text-center flex flex-col items-center">
                  <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-md shadow-primary/20 mb-6">
                    {s.step}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[200px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-primary py-20 px-4 text-center">
          <div className="container-centered">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white mb-6">Ready to end the math?</h2>
            <p className="text-white/80 text-base md:text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
              Join thousands of people who've stopped worrying about debt and started enjoying their time together.
            </p>
            <Button size="lg" variant="secondary" rounded="full" className="px-10 h-14 text-sm font-bold shadow-md hover:scale-105 transition-all" asChild>
              <Link to="/signup">Start Your First Group 🚀</Link>
            </Button>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container-centered flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-md shadow-primary/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3m8 0h3a2 2 0 0 0 2-2v-3" />
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight">Splitify</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            <Link to="#" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-primary transition-colors">Terms</Link>
            <Link to="#" className="hover:text-primary transition-colors">Support</Link>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">© 2026 Splitify</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
