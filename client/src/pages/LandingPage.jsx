import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/dashboard");
  }, [user, navigate]);

  // Scroll-triggered reveal for the "How It Works" steps
  const stepsRef = useRef(null);
  const [stepsVisible, setStepsVisible] = useState(false);

  useEffect(() => {
    const el = stepsRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setStepsVisible(true);
      return;
    }

    // If the section is already on screen at mount, reveal immediately.
    const rect = el.getBoundingClientRect();
    const viewportH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < viewportH && rect.bottom > 0) {
      setStepsVisible(true);
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStepsVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);

    // Safety net — make sure the steps never stay invisible forever.
    const fallback = setTimeout(() => setStepsVisible(true), 2000);

    return () => {
      obs.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="layout-wrapper bg-white overflow-x-hidden antialiased">
      {/* NAV */}
      <header className="border-b border-gray-100/80 sticky top-0 bg-white/70 backdrop-blur-xl z-50">
        <div className="container-centered h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src="/favicon.png" alt="Splitify Logo" className="w-9 h-9 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 drop-shadow-md" />
            <span className="text-lg font-bold tracking-tight">Splitify</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/login" className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest hidden sm:block">
              Sign In
            </Link>
            <Button asChild rounded="full" className="px-6 font-bold shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 h-10 transition-all hover:scale-105">
              <Link to="/signup">Start Free</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="relative pt-16 md:pt-24 pb-16 md:pb-20 overflow-hidden">
          {/* Decorative background */}
          <div aria-hidden="true" className="absolute inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] via-white to-white" />
            <div
              className="absolute inset-0 opacity-[0.18]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, oklch(0.92 0 0) 1px, transparent 1px), linear-gradient(to bottom, oklch(0.92 0 0) 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
                WebkitMaskImage:
                  "radial-gradient(ellipse 80% 60% at 50% 0%, black 30%, transparent 75%)",
              }}
            />
            <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute -top-24 -right-24 w-[420px] h-[420px] rounded-full bg-amber-300/20 blur-[120px]" />
          </div>

          <div className="container-centered text-center relative z-10">
            <Badge variant="secondary" className="mb-6 rounded-full px-4 py-1 border border-primary/20 text-primary bg-primary/5 hover:bg-primary/10 font-bold text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-500 shadow-sm">
              <span className="relative flex h-1.5 w-1.5 mr-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary"></span>
              </span>
              AI-Powered Expense Splitting
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.05] animate-in fade-in slide-in-from-bottom-4 duration-700">
              Split bills without<br className="hidden md:block" />
              the{" "}
              <span className="relative inline-block align-baseline pr-3 pb-1">
                <span className="font-display italic font-normal relative z-10 bg-gradient-to-br from-primary via-orange-500 to-amber-500 bg-clip-text text-transparent leading-[1.05] pr-2">
                  awkward math
                </span>
                <svg className="absolute -bottom-1 left-0 right-3 w-[calc(100%-0.75rem)]" height="14" viewBox="0 0 200 14" fill="none" preserveAspectRatio="none" aria-hidden="true">
                  <path d="M2 9 Q 50 2, 100 7 T 198 6" stroke="currentColor" className="text-primary/40" strokeWidth="4" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-6 duration-700 px-4">
              Stop stressing over who owes what. Snap a receipt, let AI handle the details, and settle up in seconds with our smart optimization engine.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <Button size="lg" rounded="full" className="px-10 h-12 text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:scale-105 transition-all" asChild>
                <Link to="/signup">Get Started For Free →</Link>
              </Button>
              <Button size="lg" variant="outline" rounded="full" className="px-10 h-12 text-sm font-bold border-gray-200 bg-white/60 backdrop-blur-sm hover:bg-white hover:border-gray-300 transition-all" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            </div>

            {/* TRUST INDICATORS */}
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="text-amber-500 text-sm">★★★★★</span>
                <span className="text-foreground">4.9/5</span> Rating
              </span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-2">👥 <span className="text-foreground">1,200+</span> Users</span>
              <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300" />
              <span className="flex items-center gap-2">🛡️ <span className="text-foreground">100%</span> Private</span>
            </div>
          </div>

          {/* APP PREVIEW MOCKUP */}
          <div className="container-centered mt-16 max-w-3xl relative animate-in fade-in slide-in-from-bottom-12 duration-1000">
            {/* glow */}
            <div aria-hidden="true" className="absolute inset-x-8 -inset-y-4 bg-gradient-to-r from-primary/30 via-amber-300/30 to-primary/30 blur-3xl opacity-50 -z-10" />

            {/* Floating notification - top left */}
            <div className="hidden md:flex absolute -left-6 lg:-left-12 top-12 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 pr-4 items-center gap-3 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
              <div className="w-9 h-9 bg-green-50 rounded-full flex items-center justify-center text-lg">✅</div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-foreground">Payment Settled</p>
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">2 min ago</p>
              </div>
            </div>

            {/* Floating notification - bottom right */}
            <div className="hidden md:flex absolute -right-6 lg:-right-12 bottom-16 z-20 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 pr-4 items-center gap-3 animate-in fade-in slide-in-from-right-8 duration-1000 delay-500 fill-mode-both">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-lg">📷</div>
              <div className="text-left">
                <p className="text-[11px] font-bold text-foreground">Receipt scanned</p>
                <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">₹2,450 detected</p>
              </div>
            </div>

            <Card className="text-left border-gray-100 shadow-2xl shadow-gray-200/60 rounded-[2rem] overflow-hidden bg-white p-1.5 relative">
              {/* Browser-like top bar */}
              <div className="flex items-center gap-1.5 px-4 py-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-300" />
              </div>
              <div className="border border-gray-50 rounded-[1.6rem] overflow-hidden bg-gradient-to-br from-gray-50/60 to-white">
                <div className="p-6 md:p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">Goa Trip 🏖️</h3>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">Active Group · 5 Members</p>
                    </div>
                    <Badge className="bg-green-50 text-green-700 border border-green-100 rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                      In Sync
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div className="bg-gradient-to-br from-primary/10 via-orange-50 to-white border border-primary/15 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                      <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full bg-primary/10 blur-2xl" />
                      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2 relative">Total Expenses</p>
                      <p className="text-3xl font-black text-foreground tracking-tight relative">₹12,450</p>
                      <p className="text-[10px] font-bold text-green-600 mt-1 relative">↑ 12% this week</p>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm relative overflow-hidden">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">You Owe</p>
                      <p className="text-3xl font-black text-primary tracking-tight">₹1,840</p>
                      <p className="text-[10px] font-bold text-muted-foreground mt-1">2 settlements pending</p>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <p className="text-[10px] font-bold text-foreground mb-6 flex items-center gap-2 uppercase tracking-widest">
                      <span className="w-5 h-5 bg-gradient-to-br from-primary to-orange-600 rounded-full flex items-center justify-center text-white text-[8px] shadow-sm shadow-primary/30">AI</span>
                      Smart Settlement Analysis
                    </p>
                    <div className="flex items-center gap-4 md:gap-6">
                      <Avatar className="w-10 h-10 border-2 border-white shadow-md ring-2 ring-primary/10">
                        <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">P</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <Badge variant="default" className="bg-gradient-to-r from-primary to-orange-600 hover:from-primary hover:to-orange-600 font-bold px-3 py-0.5 rounded-full text-[10px] shadow-sm shadow-primary/20">₹1,840</Badge>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden relative">
                          <div className="h-full w-2/3 bg-gradient-to-r from-primary to-orange-500 rounded-full relative">
                            <div className="absolute inset-0 bg-white/30 animate-pulse" />
                          </div>
                        </div>
                      </div>
                      <Avatar className="w-10 h-10 border-2 border-white shadow-md ring-2 ring-green-100">
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
        <section className="py-20 md:py-32 bg-gradient-to-b from-gray-50/60 via-gray-50/40 to-white relative overflow-hidden">
          <div aria-hidden="true" className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="container-centered relative">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 rounded-full border-primary/20 text-primary bg-primary/5 px-4 py-1 font-bold text-[10px] uppercase tracking-widest">
                Features
              </Badge>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground mb-4">
                Everything you need to{" "}
                <span className="bg-gradient-to-br from-primary to-orange-600 bg-clip-text text-transparent">split smarter</span>
              </h2>
              <p className="text-sm md:text-base text-muted-foreground font-medium max-w-xl mx-auto">
                Powerful tools wrapped in a beautifully simple experience.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { icon: "📷", title: "AI Receipt Scan", desc: "Our OCR engine extracts all items and totals instantly. Just snap and forget.", accent: "from-primary/15 to-orange-100/40" },
                { icon: "🧠", title: "Smart Algorithm", desc: "We find the most efficient way to settle everyone in the minimum steps.", accent: "from-amber-200/40 to-orange-100/30" },
                { icon: "🔗", title: "Instant Invites", desc: "Magic links that let your friends join in a single tap—no annoying login first.", accent: "from-blue-100/40 to-sky-100/30" },
                { icon: "⚖️", title: "Infinite Split Options", desc: "Split by amount, percentage, itemized list, or custom weight. Total flexibility.", accent: "from-purple-100/40 to-pink-100/30" },
                { icon: "🏷️", title: "Auto Categorizing", desc: "We track where your money goes across food, travel, lodging, and more.", accent: "from-green-100/40 to-emerald-100/30" },
                { icon: "✅", title: "Real-time Verification", desc: "Payments are tracked in real-time. Know exactly who paid whom and when.", accent: "from-primary/10 to-amber-100/30" }
              ].map((f) => (
                <div
                  key={f.title}
                  className="group relative p-8 rounded-2xl bg-white border border-gray-100 hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300"
                >
                  <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />
                  <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-white to-gray-50 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-sm border border-gray-100 group-hover:scale-110 group-hover:rotate-3 group-hover:border-primary/20 transition-all duration-300">
                      {f.icon}
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-3 tracking-tight">{f.title}</h3>
                    <p className="text-xs text-muted-foreground font-medium leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section ref={stepsRef} className="py-20 md:py-32 bg-white relative overflow-hidden">
          <div className="container-centered relative">
            <div className="text-center mb-16">
              <Badge variant="outline" className="mb-4 rounded-full border-primary/20 text-primary bg-primary/5 px-4 py-1 font-bold text-[10px] uppercase tracking-widest">
                How It Works
              </Badge>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
                3 Steps. <span className="bg-linear-to-br from-primary to-orange-600 bg-clip-text text-transparent">Zero Headache.</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-12 relative">
              {/* Connecting dashed line (desktop only) — animates "drawing" across */}
              <div aria-hidden="true" className="hidden sm:block absolute top-8 left-[16.66%] right-[16.66%] h-px overflow-hidden">
                <div
                  className={`w-full h-full border-t-2 border-dashed border-primary/30 origin-left transition-transform ease-out ${stepsVisible ? "scale-x-100" : "scale-x-0"}`}
                  style={{ transitionDuration: "1200ms", transitionDelay: "250ms" }}
                />
              </div>

              {[
                { step: "01", title: "Launch Group", desc: "Create a trip or house group in seconds and share the invite link." },
                { step: "02", title: "Track Shared Cost", desc: "Add expenses as they happen. Use AI to scan receipts and auto-split." },
                { step: "03", title: "Auto Settle", desc: "Our algorithm finds the fastest way for everyone to pay back the pool." }
              ].map((s, i) => (
                <div
                  key={s.step}
                  className={`text-center flex flex-col items-center relative group transition-all ease-out ${stepsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
                  style={{ transitionDuration: "700ms", transitionDelay: `${i * 220}ms` }}
                >
                  <div className="relative mb-6">
                    <div
                      aria-hidden="true"
                      className={`absolute inset-0 bg-primary/30 blur-2xl rounded-full transition-opacity duration-700 ${stepsVisible ? "opacity-100" : "opacity-0"} group-hover:opacity-100`}
                      style={{ transitionDelay: `${i * 220 + 150}ms` }}
                    />
                    <div
                      className={`relative w-16 h-16 bg-linear-to-br from-primary to-orange-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/30 ring-4 ring-white transition-all ease-out ${stepsVisible ? "scale-100 rotate-0" : "scale-50 -rotate-12"} group-hover:scale-110 group-hover:rotate-3`}
                      style={{ transitionDuration: "600ms", transitionDelay: `${i * 220 + 100}ms` }}
                    >
                      {s.step}
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-3 tracking-tight">{s.title}</h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-[220px]">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50/40 to-white relative overflow-hidden">
          <div className="container-centered relative">
            <div className="text-center mb-14">
              <Badge variant="outline" className="mb-4 rounded-full border-primary/20 text-primary bg-primary/5 px-4 py-1 font-bold text-[10px] uppercase tracking-widest">
                Loved By Many
              </Badge>
              <h2 className="text-2xl md:text-4xl font-extrabold tracking-tight text-foreground">
                What our users are saying
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  quote: "Splitting our Bali trip across 8 friends was effortless. The receipt scan saved hours.",
                  name: "Priya S.",
                  role: "Frequent Traveler",
                  initials: "PS",
                  color: "bg-primary/10 text-primary"
                },
                {
                  quote: "Roommate expenses used to be a monthly fight. Now everyone settles up in two taps.",
                  name: "Rahul M.",
                  role: "Apartment Sharer",
                  initials: "RM",
                  color: "bg-green-50 text-green-700"
                },
                {
                  quote: "The smart settlement algorithm is genius. Six people, two payments. Done.",
                  name: "Ananya K.",
                  role: "Team Lead",
                  initials: "AK",
                  color: "bg-purple-50 text-purple-700"
                }
              ].map((t) => (
                <div key={t.name} className="p-7 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                  <div className="flex items-center gap-1 text-amber-500 text-sm mb-4">★★★★★</div>
                  <p className="text-sm text-foreground font-medium leading-relaxed mb-6">"{t.quote}"</p>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 border-2 border-white shadow-sm">
                      <AvatarFallback className={`${t.color} font-bold text-xs`}>{t.initials}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-bold text-foreground">{t.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="py-20 px-4 text-center relative overflow-hidden">
          <div className="container-centered relative">
            <div className="relative rounded-[2.5rem] bg-gradient-to-br from-primary via-orange-600 to-amber-600 py-16 md:py-20 px-6 overflow-hidden shadow-2xl shadow-primary/30">
              {/* Decorative pattern */}
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.6) 1px, transparent 0)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div aria-hidden="true" className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-white/10 blur-3xl" />
              <div aria-hidden="true" className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-amber-300/20 blur-3xl" />

              <div className="relative">
                <Badge variant="outline" className="mb-6 rounded-full border-white/30 text-white bg-white/10 backdrop-blur-sm px-4 py-1 font-bold text-[10px] uppercase tracking-widest">
                  Free Forever · No Credit Card
                </Badge>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
                  Ready to end the math?
                </h2>
                <p className="text-white/85 text-base md:text-lg font-medium mb-10 max-w-xl mx-auto leading-relaxed">
                  Join thousands of people who've stopped worrying about debt and started enjoying their time together.
                </p>
                <Button size="lg" variant="secondary" rounded="full" className="px-10 h-14 text-sm font-bold shadow-2xl bg-white text-primary hover:bg-white hover:scale-105 transition-all" asChild>
                  <Link to="/signup">Start Your First Group 🚀</Link>
                </Button>
                <p className="text-[10px] font-bold text-white/70 uppercase tracking-widest mt-6">
                  Setup in under 60 seconds
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container-centered flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2">
            <img src="/favicon.svg" alt="Splitify Logo" className="w-8 h-8 drop-shadow-sm" />
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
