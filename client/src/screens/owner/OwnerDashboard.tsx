import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  TrendingUp,
  Users,
  Building2,
  Activity,
  Calendar,
  Sparkles,
  Zap
} from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);
interface SummaryResponse {
  totalMonthlyRevenue: number;
  pendingDues: number;
  occupancyRate: number;
  totalUnits: number;
  occupiedUnits: number;
}
interface RevenueResponse {
  quarterly: { label: string; value: number }[];
  annual: { label: string; value: number }[];
}
interface RevenueBreakdown {
  properties: { name: string; value: number }[];
  units: { name: string; propertyName: string; value: number }[];
}
export function OwnerDashboard() {
  const { data: summary, isLoading: loadingSummary } = useQuery<SummaryResponse>({
    queryKey: ["owner-dashboard-summary"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/dashboard/summary");
      return res.data;
    }
  });
  const { data: revenue, isLoading: loadingRevenue } = useQuery<RevenueResponse>({
    queryKey: ["owner-dashboard-revenue"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/dashboard/revenue");
      return res.data;
    }
  });
  const { data: breakdown, isLoading: loadingBreakdown } = useQuery<RevenueBreakdown>({
    queryKey: ["owner-dashboard-breakdown"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/dashboard/revenue-breakdown");
      return res.data;
    }
  });
  const loading = loadingSummary || loadingRevenue || loadingBreakdown;
  const quarterlyLabels = revenue?.quarterly.map((q) => q.label) ?? [];
  const quarterlyValues = revenue?.quarterly.map((q) => q.value) ?? [];
  const annualLabels = revenue?.annual.map((a) => a.label) ?? [];
  const annualValues = revenue?.annual.map((a) => a.value) ?? [];
  return (
    <div className="space-y-10 animate-fade-in-up pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
            Property Overview
            <Sparkles size={32} className="text-gold-500" />
          </h1>
          <p className="text-gold-700 font-light tracking-wide">Welcome back. Your portfolio performance at a glance.</p>
        </div>
        <div className="flex gap-3">
          <div className="px-5 py-3 bg-navy-800/60 border border-gold-500/20 rounded-xl flex items-center gap-3 luxury-glow">
            <div className="h-2 w-2 rounded-full bg-emerald-800 shadow-[0_0_12px_rgba(45,95,79,0.6)] animate-pulse" />
            <span className="text-[11px] font-medium text-gold-400 uppercase tracking-wider">Live Data</span>
          </div>
          <div className="px-5 py-3 bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 rounded-xl flex items-center gap-3 text-gold-400 luxury-glow">
            <Calendar size={16} strokeWidth={1.5} />
            <span className="text-[11px] font-medium uppercase tracking-wider">Jan 2026</span>
          </div>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        { }
        <motion.div
          className="glass-card p-8 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 text-gold-400 border border-gold-500/20 luxury-glow">
              <TrendingUp size={20} strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-gold-700 uppercase tracking-[0.15em]">Monthly</span>
          </div>
          <div className="serif-heading text-4xl text-pearl-50 tracking-tight mb-2">
            ₹{loading ? "..." : (summary?.totalMonthlyRevenue ?? 0).toLocaleString("en-IN")}
          </div>
          <p className="text-xs font-light text-gold-700 tracking-wide">Total Rent Collection</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <ArrowUpRight size={14} strokeWidth={2} />
            <span>+12.5% from last month</span>
          </div>
        </motion.div>
        { }
        <motion.div
          className="glass-card p-8 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-800/30 to-emerald-800/20 text-emerald-800 border border-emerald-800/20">
              <Building2 size={20} strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-gold-700 uppercase tracking-[0.15em]">Occupancy</span>
          </div>
          <div className="serif-heading text-4xl text-pearl-50 tracking-tight mb-4">
            {loading ? "..." : `${summary?.occupancyRate}%`}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 bg-navy-800/50 rounded-full overflow-hidden border border-gold-500/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${summary?.occupancyRate}%` }}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-gold-500 to-gold-600 luxury-glow"
              />
            </div>
            <span className="text-[11px] font-medium text-gold-400">
              {summary?.occupiedUnits}/{summary?.totalUnits}
            </span>
          </div>
        </motion.div>
        { }
        <motion.div
          className="glass-card p-8 group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/20 text-red-400">
              <Activity size={20} strokeWidth={2} />
            </div>
            <span className="text-xs font-medium text-gold-700 uppercase tracking-[0.15em]">Pending</span>
          </div>
          <div className="serif-heading text-4xl text-red-400 tracking-tight mb-2">
            ₹{loading ? "..." : (summary?.pendingDues ?? 0).toLocaleString("en-IN")}
          </div>
          <p className="text-xs font-light text-gold-700 tracking-wide">Outstanding Payments</p>
        </motion.div>
      </div>
      { }
      <motion.div
        className="glass-card p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-2 flex items-center gap-3">
              Revenue Analytics
              <Zap size={24} className="text-gold-500" />
            </h2>
            <p className="text-gold-700 text-sm font-light tracking-wide">Tracking your property performance over time</p>
          </div>
          <div className="flex p-1 bg-navy-800/50 rounded-xl border border-gold-500/10">
            <button className="px-5 py-2.5 bg-gradient-to-br from-gold-500 to-gold-600 text-navy-950 rounded-lg text-xs font-semibold transition-all shadow-lg luxury-glow">Quarterly</button>
            <button className="px-5 py-2.5 text-gold-700 hover:text-gold-400 rounded-lg text-xs font-medium transition-all">Annual</button>
          </div>
        </div>
        {loading ? (
          <div className="h-[350px] w-full bg-navy-800/30 rounded-2xl animate-pulse border border-gold-500/5" />
        ) : (
          <div className="space-y-12">
            <div className="h-[380px] relative px-2">
              <Line
                data={{
                  labels: quarterlyLabels,
                  datasets: [
                    {
                      label: "Revenue",
                      data: quarterlyValues,
                      borderColor: "#D4AF37",
                      borderWidth: 3,
                      pointRadius: 0,
                      pointHoverRadius: 8,
                      pointHoverBackgroundColor: "#D4AF37",
                      pointHoverBorderColor: "#0A0E1A",
                      pointHoverBorderWidth: 3,
                      tension: 0.4,
                      fill: true,
                      backgroundColor: (context: any) => {
                        const ctx = context.chart.ctx;
                        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                        gradient.addColorStop(0, "rgba(212, 175, 55, 0.2)");
                        gradient.addColorStop(1, "rgba(212, 175, 55, 0)");
                        return gradient;
                      },
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: { intersect: false, mode: 'index' },
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      backgroundColor: "#1E2330",
                      titleFont: { family: "Inter", size: 13, weight: 500 },
                      bodyFont: { family: "Inter", size: 12 },
                      titleColor: "#F5F1EB",
                      bodyColor: "#D4AF37",
                      padding: 12,
                      cornerRadius: 12,
                      displayColors: false,
                      borderColor: "rgba(212, 175, 55, 0.3)",
                      borderWidth: 1,
                      callbacks: {
                        label: (val) => ` ₹${val.formattedValue}`
                      }
                    }
                  },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: "#8B6F47", font: { family: "Inter", size: 11, weight: 500 }, padding: 8 }
                    },
                    y: {
                      border: { display: false },
                      grid: { color: "rgba(212, 175, 55, 0.08)" },
                      ticks: {
                        color: "#8B6F47",
                        font: { family: "Inter", size: 11, weight: 500 },
                        padding: 8,
                        callback: (val) => `₹${Number(val) / 1000}k`
                      }
                    }
                  }
                }}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {annualLabels.map((label, idx) => (
                <div key={label} className="dark-card hover:bg-navy-800/90 transition-all group">
                  <div className="text-[10px] font-medium text-gold-700 uppercase tracking-[0.15em] mb-2">{label}</div>
                  <div className="serif-heading text-2xl text-pearl-50 tracking-tight group-hover:text-gold-400 transition-colors">
                    ₹{(annualValues[idx] / 100000).toFixed(1)}L
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          className="glass-card p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="serif-heading text-xl text-pearl-50 tracking-tight mb-6">Revenue by Property</h3>
          <div className="space-y-4">
            {breakdown?.properties.map((p) => (
              <div key={p.name} className="flex justify-between items-center p-4 bg-navy-800/40 rounded-xl border border-gold-500/10">
                <div className="flex items-center gap-3">
                  <Building2 size={16} className="text-gold-500" />
                  <span className="text-sm font-medium text-pearl-50">{p.name}</span>
                </div>
                <span className="text-sm font-bold text-gold-400">₹{p.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
            {breakdown?.properties.length === 0 && <p className="text-xs text-gold-700">No revenue data available.</p>}
          </div>
        </motion.div>
        <motion.div
          className="glass-card p-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="serif-heading text-xl text-pearl-50 tracking-tight mb-6">Revenue by Unit</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar">
            {breakdown?.units.map((u) => (
              <div key={u.name + u.propertyName} className="flex justify-between items-center p-4 bg-navy-800/40 rounded-xl border border-gold-500/10">
                <div>
                  <div className="text-sm font-medium text-pearl-50">{u.name}</div>
                  <div className="text-[10px] text-gold-700 uppercase tracking-wider">{u.propertyName}</div>
                </div>
                <span className="text-sm font-bold text-gold-400">₹{u.value.toLocaleString("en-IN")}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div >
  );
}