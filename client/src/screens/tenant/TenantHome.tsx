import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Zap,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Building2,
  Sparkles,
  ShieldCheck,
  Star,
  Megaphone,
  Home,
  Info
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface Summary {
  outstanding: number;
  lastPaidAt: string | null;
  property: {
    name: string;
    address: string;
    locality: string;
    city: string;
  } | null;
  unit: {
    name: string;
    rentAmount: number;

  } | null;
  depositInfo: {
    amount: number;
    status: string;
  } | null;
}

export function TenantHome() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<Summary>({
    queryKey: ["tenant-home-summary"],
    queryFn: async () => {
      const res = await axios.get("/api/tenant/home/summary");
      return res.data;
    }
  });

  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const { data: noticesData } = useQuery<{ notices: any[] }>({
    queryKey: ["tenant-notices"],
    queryFn: async () => (await axios.get("/api/tenant/notices")).data
  });

  const submitDepositMutation = useMutation({
    mutationFn: async (amount: number) => {
      const res = await axios.post("/api/tenant/security-deposits/submit", { amount });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-home-summary"] });
      setMessage("Security deposit submitted for verification.");
    }
  });

  const [depositAmount, setDepositAmount] = useState<number>(0);

  return (
    <div className="space-y-10 animate-fade-in-up pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
            My Residence
            <Home size={32} className="text-gold-500" />
          </h1>
          <p className="text-gold-700 font-light tracking-wide">Welcome to your exclusive dashboard. Manage your luxury suite with ease.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex px-5 py-3 bg-navy-800/60 border border-gold-500/10 rounded-2xl items-center gap-3 luxury-glow">
            <Sparkles size={18} className="text-gold-500" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.15em]">Platinum Resident</span>
          </div>
          <div className="h-12 w-12 rounded-[1.25rem] bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 flex items-center justify-center text-gold-500 shadow-2xl luxury-glow">
            <ShieldCheck size={22} />
          </div>
        </div>
      </div>

      {noticesData?.notices && noticesData.notices.length > 0 && (
        <div className="bg-gold-500/10 border-y border-gold-500/20 py-2 overflow-hidden whitespace-nowrap relative">
          <div className="flex animate-marquee gap-8 items-center">
            {noticesData.notices.map((n, i) => (
              <div key={i} className="flex items-center gap-3">
                <Megaphone size={14} className="text-gold-500" />
                <span className="text-[11px] font-bold text-gold-400 uppercase tracking-widest">{n.title}:</span>
                <span className="text-[11px] text-pearl-50 font-light">{n.content}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment Summary */}
        <motion.div
          className="lg:col-span-2 glass-card p-10 border-gold-500/10 luxury-shadow relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="absolute top-0 right-0 p-8 text-gold-500/5">
            <CreditCard size={120} strokeWidth={0.5} />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/20 luxury-glow">
                  <Zap size={20} strokeWidth={2} />
                </div>
                <h2 className="serif-heading text-2xl text-pearl-50 tracking-tight">Financial Standings</h2>
              </div>

              <div className="flex flex-col sm:flex-row items-baseline gap-12 pt-4">
                <div>
                  <div className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] mb-4">Total Outstanding</div>
                  <div className={`serif-heading text-6xl tracking-tighter ${data?.outstanding ? 'text-red-400' : 'text-gold-500'}`}>
                    ₹{isLoading ? "..." : (data?.outstanding || 0).toLocaleString("en-IN")}
                  </div>
                </div>
                {data?.lastPaidAt && (
                  <div className="sm:border-l border-gold-500/10 sm:pl-12">
                    <div className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] mb-4">Last Settlement</div>
                    <div className="text-2xl font-medium text-pearl-50 tracking-tight flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-800 animate-pulse" />
                      {format(new Date(data.lastPaidAt), "MMMM dd, yyyy")}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-12 flex flex-col sm:flex-row gap-6">
              <button
                onClick={() => navigate("/tenant/bills?action=pay_outstanding")}
                disabled={data?.outstanding === 0 && !isLoading}
                className="luxury-button px-12 group flex-1 sm:flex-none"
              >
                <>
                  <CreditCard size={18} strokeWidth={2.5} />
                  Settle Dues Now
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              </button>
              {message && (
                <div className="flex items-center gap-3 text-gold-400 text-sm font-light italic bg-navy-800/40 px-6 py-4 rounded-2xl border border-gold-500/10">
                  <Info size={16} />
                  {message}
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Property Profile */}
        <motion.div
          className="glass-card p-10 border-gold-500/10 luxury-shadow bg-gradient-to-br from-navy-900/60 to-navy-950/60"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-emerald-800/10 text-emerald-800 rounded-xl border border-emerald-800/10">
              <Building2 size={20} strokeWidth={2} />
            </div>
            <h2 className="serif-heading text-2xl text-pearl-50 tracking-tight">Suite Address</h2>
          </div>

          {!isLoading && data?.property ? (
            <div className="space-y-8">
              <div className="space-y-2">
                <div className="serif-heading text-3xl text-gold-400 tracking-tight">{data.property.name}</div>
                <div className="flex items-start gap-2 text-gold-700 font-light text-sm italic">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  {data.property.address}, {data.property.locality}, {data.property.city}
                </div>
              </div>

              <div className="luxury-divider" />

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] mb-2">Designation</div>
                  <div className="text-xl font-medium text-pearl-50 tracking-tight flex items-center gap-2">
                    <Star size={16} className="text-gold-500" />
                    {data.unit?.name}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] mb-2">Investment</div>
                  <div className="text-xl font-medium text-pearl-50 tracking-tight flex items-center gap-1">
                    <span className="text-gold-700 text-sm">₹</span>
                    {data.unit?.rentAmount?.toLocaleString() || "0"} <span className="text-[10px] text-gold-700 uppercase font-bold">/Mo</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center">
              <div className="h-12 w-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 opacity-30" />
              <p className="text-xs font-bold text-gold-700 tracking-[0.2em] uppercase">Indexing Profile...</p>
            </div>
          )}
        </motion.div>


        {/* Security Deposit Card */}
        <motion.div
          className="lg:col-span-3 glass-card p-10 border-gold-500/10 luxury-shadow flex flex-col md:flex-row items-center justify-between gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center gap-6">
            <div className="p-4 bg-gold-500/10 text-gold-500 rounded-2xl border border-gold-500/20 luxury-glow">
              <ShieldCheck size={32} />
            </div>
            <div>
              <h3 className="serif-heading text-2xl text-pearl-50 tracking-tight mb-2">Security Deposit</h3>
              <p className="text-gold-700 font-light text-sm">
                {data?.depositInfo
                  ? `Status: ${data.depositInfo.status}`
                  : "Please submit your security deposit details for verification."}
              </p>
            </div>
          </div>

          {data?.depositInfo ? (
            <div className="flex items-center gap-6 bg-navy-900/50 p-6 rounded-2xl border border-gold-500/10">
              <div>
                <div className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] mb-1">Deposited Amount</div>
                <div className="serif-heading text-3xl text-pearl-50 tracking-tight">₹{data.depositInfo.amount.toLocaleString()}</div>
              </div>
              <span className={`luxury-badge ${data.depositInfo.status === 'VERIFIED' ? 'border-emerald-800/30 text-emerald-800 bg-emerald-800/10' : 'border-gold-500/30 text-gold-500 bg-gold-500/10'}`}>
                {data.depositInfo.status}
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
              <div className="relative group w-full sm:w-64">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-700">₹</span>
                <input
                  type="number"
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 pl-8 pr-4 text-pearl-50 focus:outline-none focus:border-gold-500/50 transition-all font-medium"
                  placeholder="Enter Amount"
                  value={depositAmount || ""}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                />
              </div>
              <button
                onClick={() => submitDepositMutation.mutate(depositAmount)}
                disabled={submitDepositMutation.isPending || !depositAmount}
                className="luxury-button px-8 w-full sm:w-auto"
              >
                {submitDepositMutation.isPending ? "Submitting..." : "Submit for Verification"}
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Action Ornaments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Concierge", desc: "Maintenance & Request", icon: Zap, to: "/tenant/concierge" },
          { label: "Vault", desc: "Private Documents", icon: ShieldCheck, to: "/tenant/vault" },
          { label: "Updates", desc: "Residence Notices", icon: Sparkles, to: "/tenant/notices" },
          { label: "Analytics", desc: "Payment History", icon: Clock, to: "/tenant/payment-history" }
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            onClick={() => navigate(item.to)}
            className="glass-card p-6 border-gold-500/10 hover:bg-gold-500/5 transition-all text-center group cursor-pointer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
          >
            <div className="h-12 w-12 rounded-xl bg-navy-800/60 border border-gold-500/10 flex items-center justify-center text-gold-700 mx-auto mb-4 group-hover:text-gold-500 group-hover:border-gold-500/30 transition-all luxury-glow">
              <item.icon size={22} strokeWidth={1.5} />
            </div>
            <div className="text-sm font-medium text-pearl-50 tracking-tight mb-1">{item.label}</div>
            <div className="text-[10px] font-medium text-gold-700 uppercase tracking-widest">{item.desc}</div>
          </motion.div>
        ))}
      </div>

    </div >
  );
}
