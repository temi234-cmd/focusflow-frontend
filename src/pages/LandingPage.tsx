import { motion } from "motion/react";
import { 
  Bolt, 
  CheckSquare, 
  Calendar, 
  Sparkles, 
  Star, 
  Globe, 
  Share2,
  ArrowRight
} from "lucide-react";
import { useNavigate } from 'react-router-dom'
const Navbar = () => {
  const navigate = useNavigate();
  
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-[#0F172A]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg flex items-center justify-center text-white">
            <Bolt className="w-5 h-5 fill-current" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">FocusFlow</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
<nav className="hidden md:flex items-center gap-8">
  <a 
    className="text-sm font-medium text-slate-400 hover:text-primary transition-colors cursor-pointer" 
    onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
  >Features</a>
  <a 
    className="text-sm font-medium text-slate-400 hover:text-primary transition-colors cursor-pointer" 
    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
  >How it works</a>
  <a 
    className="text-sm font-medium text-slate-400 hover:text-primary transition-colors cursor-pointer" 
    onClick={() => document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' })}
  >Testimonials</a>
</nav>
        </nav>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/signin')} className="px-4 py-2 text-sm font-semibold text-slate-200 hover:text-primary transition-colors">Login</button>
          <button onClick={() => navigate('/signup')} className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary/90 rounded-lg shadow-lg shadow-primary/20 transition-all">Sign Up</button>
        </div>
      </div>
    </header>
  );
};

const Hero = () => {
    const navigate = useNavigate();
return(
  <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 hero-gradient overflow-hidden">
    <div className="max-w-7xl mx-auto px-6 text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
        </span>
       New: Personalized AI Reports
      </motion.div>
      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-5xl md:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400"
      >
        Your productivity,<br />finally in one place
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 mb-10"
      >
        FocusFlow brings your tasks, habits, and AI-driven insights together in one clean interface designed for deep work.
      </motion.p>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
      >
       <button 
  onClick={() => navigate('/signup')}
  className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-white bg-accent-green hover:bg-emerald-500 rounded-xl shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
>
  Get Started Free <ArrowRight className="w-5 h-5" />
</button>
        {/* <button className="w-full sm:w-auto px-8 py-4 text-lg font-bold text-slate-200 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-xl transition-all flex items-center justify-center gap-2">
          <Play className="w-5 h-5 fill-current" /> Watch Demo
        </button> */}
      </motion.div>
      
      {/* Dashboard Mockup */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
        className="relative mx-auto max-w-5xl group"
      >
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent-green rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
        <div className="relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
          <img 
            alt="FocusFlow Dashboard Preview" 
            className="w-full h-auto object-cover opacity-90" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfBrydOfXDMMfLoX4XEMgJRMbwAgFrYBAKgf-o35RTBehm5wArhu8b2Lz8jvSZfik_9s0atIIUBBXUS4VHdSL1kLdDv61WCdL3Pqt5KkL1qTdKbs4v0vCDTFLYaNs-AuJshztHquRLV28MpKBMj9RKf1JvNrR_lTY0pI0AiQs3bWZBQoRNO0l39PkWHfwQDZ-6q3ZDPgk-7z_kCWtTFAo2TkqFJTrBegOIJnOgQb_6-VIGjGu6pDX509FudOwlluuCNK3-i1TUxVmw"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.div>
    </div>
  </section>
)
};

const Features = () => (
  <section className="py-24 bg-slate-900/50" id="features">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful features for modern workflows</h2>
        <p className="text-slate-400">Everything you need to stay focused and hit your goals faster.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <CheckSquare className="w-6 h-6" />,
            title: "Task Management",
            desc: "Organize your daily to-dos with intuitive drag-and-drop boards and nested subtasks."
          },
          {
            icon: <Calendar className="w-6 h-6" />,
            title: "Habit Tracking",
            desc: "Build lasting routines with visual progress streaks, reminders, and daily goal setting."
          },
          {
            icon: <Sparkles className="w-6 h-6" />,
            title: "AI Weekly Insights",
            desc: "Get personalized productivity reports powered by AI to understand your peak focus hours."
          }
        ].map((feature, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="p-8 rounded-2xl glass-card hover:border-primary/50 transition-all group"
          >
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const HowItWorks = () => (
  <section className="py-24" id="how-it-works">
    <div className="max-w-5xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">How it Works</h2>
        <p className="text-slate-400">Transform your productivity in three simple steps.</p>
      </div>
      <div className="space-y-12">
        {[
          {
            step: "1",
            title: "Create your account",
            desc: "Sign up in seconds with your email or Google account. No credit card required to get started."
          },
          {
            step: "2",
            title: "Set up your tasks and habits",
            desc: "Add your daily tasks to the Kanban board and build habits you want to stick to. Track your streaks and stay consistent."
          },
          {
            step: "3",
            title: "Get AI-powered insights",
            desc: "Every week FocusFlow's AI analyzes your productivity patterns and delivers a personalized report to help you improve."
          }
        ].map((item, i) => (
          <div key={i} className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-16 h-16 shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-2xl font-black text-primary border border-primary/20">
              {item.step}
            </div>
            <div className="flex-grow text-center md:text-left">
              <h4 className="text-xl font-bold mb-2">{item.title}</h4>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
const Testimonials = () => (
  <section className="py-24 bg-primary/5" id="testimonials">
    <div className="max-w-7xl mx-auto px-6">
      <h2 className="text-center text-3xl font-bold mb-16">Loved by focus-driven professionals</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            name: "Sarah Jenkins",
            role: "Product Designer",
            quote: "FocusFlow changed the way I work. The AI insights helped me realize I'm most productive at 7 AM.",
            color: "bg-primary/20"
          },
          {
            name: "Marcus Chen",
            role: "Software Engineer",
            quote: "Cleanest UI I've ever used. It doesn't distract me with complex features I'll never use.",
            color: "bg-accent-green/20"
          },
          {
            name: "Alex Rivera",
            role: "Founder, Velocity",
            quote: "The habit tracking streaks are incredibly motivating. I haven't missed a gym day in 3 months!",
            color: "bg-indigo-500/20"
          }
        ].map((t, i) => (
          <div key={i} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-sm">
            <div className="flex gap-1 text-amber-400 mb-4">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
            </div>
            <p className="text-slate-300 italic mb-6">"{t.quote}"</p>
            <div className="flex items-center gap-4">
              <div className={`w-10 h-10 rounded-full ${t.color}`}></div>
              <div>
                <p className="text-sm font-bold">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const FinalCTA = () => {
  const navigate = useNavigate()
  
  return (
    <section className="py-24">
      <div className="max-w-4xl mx-auto px-6 text-center bg-primary rounded-3xl py-16 text-white relative overflow-hidden shadow-2xl shadow-primary/40">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        <h2 className="text-4xl font-black mb-6 relative">Ready to find your flow?</h2>
        <p className="text-lg mb-10 text-slate-100 max-w-lg mx-auto relative opacity-90">Join 10,000+ professionals who are reclaiming their focus and building better habits every day.</p>
        <button 
          onClick={() => navigate('/signup')}
          className="relative bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl"
        >
          Start 3-Month Free Trial
        </button>
        <p className="mt-4 text-sm text-white/70 relative">No credit card required.</p>
      </div>
    </section>
  )
}

const Footer = () => (
  <footer className="bg-slate-950 border-t border-slate-800 py-12">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="col-span-1 md:col-span-1">
        <div className="flex items-center gap-2 mb-6">
          <div className="bg-primary p-1 rounded flex items-center justify-center text-white">
            <Bolt className="w-4 h-4 fill-current" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">FocusFlow</span>
        </div>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">Master your time, reclaim your attention, and build a workflow that actually works for you.</p>
        <div className="flex gap-4">
          <a className="text-slate-400 hover:text-primary transition-colors" href="#"><Globe className="w-5 h-5" /></a>
          <a className="text-slate-400 hover:text-primary transition-colors" href="#"><Share2 className="w-5 h-5" /></a>
        </div>
      </div>
      <div>
        <h5 className="font-bold mb-4">Product</h5>
        <ul className="space-y-3 text-sm text-slate-400">
          <li><a className="hover:text-primary transition-colors" href="#">Features</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Pricing</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Roadmap</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Changelog</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-bold mb-4">Company</h5>
        <ul className="space-y-3 text-sm text-slate-400">
          <li><a className="hover:text-primary transition-colors" href="#">About</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Blog</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Careers</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Privacy Policy</a></li>
        </ul>
      </div>
      <div>
        <h5 className="font-bold mb-4">Contact</h5>
        <ul className="space-y-3 text-sm text-slate-400">
          <li><a className="hover:text-primary transition-colors" href="#">Support</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Contact Us</a></li>
          <li><a className="hover:text-primary transition-colors" href="#">Help Center</a></li>
        </ul>
      </div>
    </div>
    <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-sm text-slate-500">© 2026 FocusFlow Inc. All rights reserved.</p>
      <div className="flex gap-6 text-xs text-slate-400">
        <a className="hover:text-primary" href="#">Terms</a>
        <a className="hover:text-primary" href="#">Privacy</a>
        <a className="hover:text-primary" href="#">Cookies</a>
      </div>
    </div>
  </footer>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
