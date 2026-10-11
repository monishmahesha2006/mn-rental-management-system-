import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../shared/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, ArrowRight, Home, ShieldCheck, User, Sparkles } from "lucide-react";
export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = (location.state as any)?.from?.pathname;
      if (from && (from.startsWith("/owner") || from.startsWith("/tenant"))) {
        navigate(from, { replace: true });
      } else {
        navigate(user.role === "OWNER" ? "/owner/dashboard" : "/tenant/home", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate, location]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await login({ email, password });
      const from = (location.state as any)?.from?.pathname;
      const targetPath = from || (data.user.role === "OWNER" ? "/owner/dashboard" : "/tenant/home");
      navigate(targetPath, { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      <div className="luxury-bg" />
      {/* dot pattern overlay */}
      <div className="absolute inset-0 hero-pattern opacity-60 pointer-events-none" />
      {/* ambient orbs */}
      <div className="absolute top-0 left-0 w-[560px] h-[560px] rounded-full blur-[140px] pointer-events-none" style={{background: 'radial-gradient(circle, rgba(201,150,42,0.13) 0%, transparent 70%)'}} />
      <div className="absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full blur-[120px] pointer-events-none" style={{background: 'radial-gradient(circle, rgba(45,43,127,0.10) 0%, transparent 70%)'}} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[160px] pointer-events-none" style={{background: 'radial-gradient(circle, rgba(253,243,220,0.5) 0%, transparent 70%)'}} />
      { }
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-card p-10 md:p-14 luxury-shadow">
          {/* Logo */}
          <div className="flex justify-center mb-10">
            <div className="relative animate-float">
              <div className="h-18 w-18 rounded-2xl flex items-center justify-center shadow-xl" style={{background: 'linear-gradient(135deg, var(--indigo-deep), var(--indigo-mid))', width: '4.5rem', height: '4.5rem', boxShadow: '0 8px 30px rgba(45,43,127,0.30)'}}>
                <Home size={30} className="text-white" strokeWidth={2} />
              </div>
              <div className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full pulse-ring" style={{background: 'var(--gold)'}} />
            </div>
          </div>
          {/* Heading */}
          <div className="text-center mb-9">
            <h2 className="serif-heading text-4xl md:text-5xl mb-2.5 tracking-tight" style={{color: 'var(--slate-dark)'}}>
              Welcome Back
            </h2>
            <p className="text-sm font-light tracking-wide" style={{color: 'var(--slate)'}}>Sign in to your residence portal</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] px-1" style={{color: 'var(--slate)'}}>Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={17} strokeWidth={1.6} style={{color: 'var(--slate-light)'}} />
                <input
                  className="luxury-input"
                  style={{paddingLeft: '2.75rem'}}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>
            {/* Password */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] px-1" style={{color: 'var(--slate)'}}>Password</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors" size={17} strokeWidth={1.6} style={{color: 'var(--slate-light)'}} />
                <input
                  className="luxury-input"
                  style={{paddingLeft: '2.75rem'}}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3.5 rounded-xl text-sm font-medium flex items-center gap-2"
                style={{background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.20)', color: '#c0392b'}}
              >
                <ShieldCheck size={17} className="shrink-0" />
                {error}
              </motion.div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="luxury-button w-full py-4 text-sm group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={17} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
          <div className="mt-9 pt-7" style={{borderTop: '1px solid var(--linen)'}}>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] mb-1" style={{color: 'var(--slate)'}}>Authorized Access Only</p>
                <p className="text-xs font-light tracking-wide" style={{color: 'var(--slate-light)'}}>
                  Accounts are provisioned exclusively by management
                </p>
              </div>
              <div className="flex gap-2.5">
                <div className="p-2.5 rounded-xl transition-all" title="Secure Encrypted Authentication" style={{background: 'var(--indigo-pale)', border: '1px solid rgba(45,43,127,0.12)', color: 'var(--indigo-mid)'}}>
                  <ShieldCheck size={16} strokeWidth={1.8} />
                </div>
                <div className="p-2.5 rounded-xl transition-all" title="Verified User Profiles" style={{background: 'var(--indigo-pale)', border: '1px solid rgba(45,43,127,0.12)', color: 'var(--indigo-mid)'}}>
                  <User size={16} strokeWidth={1.8} />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Footer tagline */}
        <div className="mt-7 text-center">
          <p className="text-xs uppercase tracking-[0.18em] flex items-center justify-center gap-2" style={{color: 'var(--slate-light)'}}>
            <Sparkles size={11} style={{color: 'var(--gold)'}} />
            Premium Property Management
            <Sparkles size={11} style={{color: 'var(--gold)'}} />
          </p>
        </div>
      </motion.div>
    </div>
  );
}