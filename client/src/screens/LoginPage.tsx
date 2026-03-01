import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
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
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-navy-950">
      <div className="luxury-bg" />

      {/* Decorative Glow Elements */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gold-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-800/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gold-500/5 rounded-full blur-[150px]" />

      {/* Main Login Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-card p-12 md:p-16 luxury-shadow">
          {/* Logo/Brand */}
          <div className="flex justify-center mb-12">
            <div className="relative">
              <div className="h-20 w-20 rounded-[1.5rem] bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-2xl luxury-glow">
                <Home size={36} className="text-navy-950" strokeWidth={2} />
              </div>
              <div className="absolute -top-2 -right-2 h-6 w-6 bg-gold-500 rounded-full animate-pulse luxury-glow" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-12">
            <h2 className="serif-heading text-5xl md:text-6xl text-pearl-50 mb-4 tracking-tight">
              Welcome
            </h2>
            <p className="text-gold-700 font-light tracking-wide text-sm">Access your exclusive residence portal</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Email Field */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-700 group-focus-within:text-gold-400 transition-colors" size={18} strokeWidth={1.5} />
                <input
                  className="luxury-input pl-14 py-5"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-3">
              <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Password</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-700 group-focus-within:text-gold-400 transition-colors" size={18} strokeWidth={1.5} />
                <input
                  className="luxury-input pl-14 py-5"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-900/20 border border-red-500/30 text-red-400 px-5 py-4 rounded-2xl text-sm font-medium flex items-center gap-2"
              >
                <ShieldCheck size={18} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="luxury-button w-full py-5 text-sm group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-12 pt-10 border-t border-gold-500/10">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="text-center sm:text-left">
                <p className="text-xs font-medium text-gold-700 uppercase tracking-[0.1em] mb-2">New Resident?</p>
                <Link to="/register" className="text-gold-400 font-medium hover:text-gold-300 transition-colors text-sm">Create Account</Link>
              </div>
              <div className="flex gap-4">
                <div className="p-3 rounded-xl bg-navy-800/50 border border-gold-500/10 text-gold-700 hover:text-gold-400 hover:border-gold-500/20 transition-all cursor-help luxury-glow" title="Secure Access">
                  <ShieldCheck size={18} strokeWidth={1.5} />
                </div>
                <div className="p-3 rounded-xl bg-navy-800/50 border border-gold-500/10 text-gold-700 hover:text-gold-400 hover:border-gold-500/20 transition-all cursor-help luxury-glow" title="Verified Users">
                  <User size={18} strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Text */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gold-700 tracking-[0.15em] uppercase flex items-center justify-center gap-2">
            <Sparkles size={12} className="text-gold-500" />
            Premium Property Management
            <Sparkles size={12} className="text-gold-500" />
          </p>
        </div>
      </motion.div>
    </div>
  );
}
