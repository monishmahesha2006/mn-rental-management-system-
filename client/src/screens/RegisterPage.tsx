import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";
import { Lock, Mail, User, ArrowRight, Home, ShieldCheck, CheckCircle2 } from "lucide-react";

export function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await axios.post("/api/auth/register", {
        email,
        password,
        name: name || undefined,
        role: "OWNER"
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err?.response?.data?.error?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="luxury-bg" />
        <div className="glass-card max-w-md w-full p-10 text-center luxury-shadow relative z-10 m-6">
          <div className="mb-6">
            <div className="h-16 w-16 rounded-2xl flex items-center justify-center mx-auto" style={{background: 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(5,150,105,0.25))', border: '1px solid rgba(5,150,105,0.3)'}}>
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
          </div>
          <h2 className="serif-heading text-3xl mb-3 tracking-tight" style={{color: 'var(--slate-dark)'}}>
            Account Created!
          </h2>
          <p className="text-sm font-light mb-6" style={{color: 'var(--slate)'}}>
            Your owner account has been registered. Redirecting you to login...
          </p>
          <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden py-12">
      <div className="luxury-bg" />
      <div className="absolute inset-0 hero-pattern opacity-60 pointer-events-none" />
      <div className="absolute top-0 left-0 w-[560px] h-[560px] rounded-full blur-[140px] pointer-events-none" style={{background: 'radial-gradient(circle, rgba(201,150,42,0.13) 0%, transparent 70%)'}} />
      <div className="absolute bottom-0 right-0 w-[460px] h-[460px] rounded-full blur-[120px] pointer-events-none" style={{background: 'radial-gradient(circle, rgba(45,43,127,0.10) 0%, transparent 70%)'}} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="glass-card p-10 md:p-12 luxury-shadow">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative animate-float">
              <div className="h-16 w-16 rounded-2xl flex items-center justify-center shadow-xl" style={{background: 'linear-gradient(135deg, var(--indigo-deep), var(--indigo-mid))', boxShadow: '0 8px 30px rgba(45,43,127,0.30)'}}>
                <Home size={26} className="text-white" strokeWidth={2} />
              </div>
              <div className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full pulse-ring" style={{background: 'var(--gold)'}} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="serif-heading text-3xl md:text-4xl mb-2 tracking-tight" style={{color: 'var(--slate-dark)'}}>
              Create Owner Account
            </h1>
            <p className="text-xs font-light tracking-wide" style={{color: 'var(--slate)'}}>
              Register as a property owner to manage your portfolio
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] px-1" style={{color: 'var(--slate)'}}>
                Full Name (Optional)
              </label>
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2" size={17} strokeWidth={1.6} style={{color: 'var(--slate-light)'}} />
                <input
                  className="luxury-input"
                  style={{paddingLeft: '2.75rem'}}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type="text"
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] px-1" style={{color: 'var(--slate)'}}>
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2" size={17} strokeWidth={1.6} style={{color: 'var(--slate-light)'}} />
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

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] px-1" style={{color: 'var(--slate)'}}>
                Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={17} strokeWidth={1.6} style={{color: 'var(--slate-light)'}} />
                <input
                  className="luxury-input"
                  style={{paddingLeft: '2.75rem'}}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-[0.14em] px-1" style={{color: 'var(--slate)'}}>
                Confirm Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2" size={17} strokeWidth={1.6} style={{color: 'var(--slate-light)'}} />
                <input
                  className="luxury-input"
                  style={{paddingLeft: '2.75rem'}}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  type="password"
                  placeholder="Re-enter password"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2"
                style={{background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.20)', color: '#c0392b'}}
              >
                <ShieldCheck size={16} className="shrink-0" />
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="luxury-button w-full py-3.5 text-xs group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Create Owner Account
                  <ArrowRight size={16} strokeWidth={2.5} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 text-center" style={{borderTop: '1px solid var(--linen)'}}>
            <p className="text-xs font-medium" style={{color: 'var(--slate)'}}>
              Already have an account?{" "}
              <Link to="/login" className="font-semibold transition-colors" style={{color: 'var(--indigo-mid)'}}>
                Sign in →
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}