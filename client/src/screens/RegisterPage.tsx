import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
      const res = await axios.post("/api/auth/register", {
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-slate-900 to-slate-950">
        <div className="glass-card max-w-md w-full p-8 text-center">
          <div className="mb-4">
            <div className="h-16 w-16 rounded-full bg-mint-400/20 border border-mint-400/40 flex items-center justify-center mx-auto">
              <svg className="h-8 w-8 text-mint-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-2">Account Created Successfully!</h2>
          <p className="text-sm text-slate-400 mb-4">
            Your owner account has been created. You can now log in and start managing your properties.
          </p>
          <p className="text-xs text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-navy-900 via-slate-900 to-slate-950">
      <div className="glass-card max-w-md w-full p-8">
        <h1 className="text-2xl font-semibold mb-1">Create Owner Account</h1>
        <p className="text-sm text-slate-400 mb-6">
          Register as a property owner to start managing your rental properties in Greater Bangalore
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Full Name (Optional)</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400/60"
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400/60"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="your@email.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Password</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400/60"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="At least 6 characters"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Confirm Password</label>
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mint-400/60"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              type="password"
              placeholder="Re-enter your password"
              required
            />
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center rounded-lg bg-mint-400 text-slate-950 text-sm font-semibold py-2.5 hover:bg-mint-400/90 transition disabled:opacity-70"
          >
            {loading ? "Creating Account..." : "Create Owner Account"}
          </button>
        </form>
        <div className="mt-4 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-mint-400 hover:text-mint-300 underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
