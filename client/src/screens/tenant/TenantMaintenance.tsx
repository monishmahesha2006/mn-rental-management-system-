import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  Sparkles,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  MessageSquare
} from "lucide-react";
import { format } from "date-fns";
type Status = "OPEN" | "IN_PROGRESS" | "RESOLVED";
type Category = "PLUMBING" | "ELECTRICAL" | "APPLIANCE" | "OTHER";
interface Ticket {
  id: string;
  title: string;
  description: string;
  category: Category;
  status: Status;
  createdAt: string;
}
export function TenantMaintenance() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const { data, isLoading } = useQuery<{ tickets: Ticket[] }>({
    queryKey: ["tenant-maintenance"],
    queryFn: async () => {
      const res = await axios.get("/api/tenant/maintenance");
      return res.data;
    }
  });
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Category>("PLUMBING");
  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.post("/api/tenant/maintenance", {
        title,
        description,
        category
      });
      return res.data;
    },
    onSuccess: async () => {
      setTitle("");
      setDescription("");
      setCategory("PLUMBING");
      setShowForm(false);
      await queryClient.invalidateQueries({ queryKey: ["tenant-maintenance"] });
    }
  });
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Status }) => {
      const res = await axios.patch(`/api/tenant/maintenance/${id}`, { status });
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenant-maintenance"] });
    }
  });
  const tickets = data?.tickets ?? [];
  const getStatusBadge = (status: Status) => {
    switch (status) {
      case "OPEN": return "border-red-500/30 text-red-400 bg-red-900/20";
      case "IN_PROGRESS": return "border-gold-500/30 text-gold-500 bg-gold-500/10";
      case "RESOLVED": return "border-emerald-800/30 text-emerald-800 bg-emerald-800/10";
    }
  };
  return (
    <div className="space-y-10 animate-fade-in-up pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
            Service Desk
            <Wrench size={32} className="text-gold-500" />
          </h1>
          <p className="text-gold-700 font-light tracking-wide">Elite concierge services for all your suite maintenance requirements.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="luxury-button px-8 flex items-center gap-2 group"
        >
          {showForm ? <X size={18} /> : <Plus size={18} strokeWidth={2.5} />}
          {showForm ? "Cancel Request" : "Raise Service Ticket"}
        </button>
      </div>
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-10 border-gold-500/20 luxury-shadow">
              <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-8">Service Request</h2>
              <form
                className="space-y-8"
                onSubmit={(e) => {
                  e.preventDefault();
                  createMutation.mutate();
                }}
              >
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Issue Subject</label>
                    <input
                      className="luxury-input"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Master Suite AC Calibration"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Service Category</label>
                    <select
                      className="luxury-input appearance-none bg-navy-900"
                      value={category}
                      onChange={(e) => setCategory(e.target.value as Category)}
                    >
                      <option value="PLUMBING" className="bg-navy-900">Plumbing</option>
                      <option value="ELECTRICAL" className="bg-navy-900">Electrical</option>
                      <option value="APPLIANCE" className="bg-navy-900">Appliance</option>
                      <option value="OTHER" className="bg-navy-900">Other</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Request Details</label>
                  <textarea
                    className="luxury-input min-h-[120px] resize-none"
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your maintenance needs in detail..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="luxury-button px-14"
                >
                  {createMutation.isPending ? "Transmitting..." : "Send Request"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="glass-card p-10 border-gold-500/10 luxury-shadow">
        <div className="flex items-center justify-between mb-10">
          <h3 className="serif-heading text-2xl text-pearl-50 tracking-tight flex items-center gap-3">
            <Clock size={24} className="text-gold-500" /> Active Requests
          </h3>
          <div className="px-5 py-2.5 bg-navy-800/60 border border-gold-500/10 rounded-xl text-[10px] font-bold text-gold-700 uppercase tracking-widest flex items-center gap-2">
            Filter Status <ChevronDown size={14} />
          </div>
        </div>
        {isLoading && (
          <div className="py-20 text-center">
            <div className="h-12 w-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 opacity-30" />
            <p className="text-xs font-bold text-gold-700 tracking-[0.2em] uppercase">Syncing with Concierge...</p>
          </div>
        )}
        {!isLoading && tickets.length === 0 && (
          <div className="py-20 text-center border border-dashed border-gold-500/10 rounded-3xl">
            <MessageSquare size={48} className="mx-auto text-gold-800 mb-4 opacity-50" />
            <p className="text-sm font-light text-gold-700 uppercase tracking-[0.15em]">Your suites are currently in pristine condition.</p>
          </div>
        )}
        <div className="grid gap-6">
          {tickets.map((t, idx) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="group rounded-2xl border border-gold-500/10 bg-navy-900/40 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-8 hover:bg-gold-500/5 transition-all duration-300 luxury-glow"
            >
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gold-500/10 text-gold-500 border border-gold-500/20 flex items-center justify-center">
                    <Sparkles size={18} />
                  </div>
                  <div className="font-medium text-lg text-pearl-50 tracking-tight">{t.title}</div>
                </div>
                <div className="text-sm font-light text-gold-700 leading-relaxed pl-14">{t.description}</div>
                <div className="flex items-center gap-4 text-[10px] font-bold text-gold-700 uppercase tracking-widest pl-14">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={14} className="text-gold-500/50" />
                    {t.category}
                  </div>
                  <span className="opacity-20">•</span>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-gold-500/50" />
                    {format(new Date(t.createdAt), "MMM dd, h:mm a")}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 pl-14 md:pl-0">
                <span className={`luxury-badge ${getStatusBadge(t.status)}`}>
                  <div className={`h-1.5 w-1.5 rounded-full mr-2.5 ${t.status === 'OPEN' ? 'bg-red-400' : t.status === 'IN_PROGRESS' ? 'bg-gold-500' : 'bg-emerald-800'}`} />
                  {t.status.replace("_", " ")}
                </span>
                <div className="relative group/select">
                  <select
                    className="appearance-none luxury-input py-2.5 px-6 pr-10 text-[10px] font-bold uppercase tracking-widest bg-navy-800/80 border-gold-500/20 w-36"
                    value={t.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({ id: t.id, status: e.target.value as Status })
                    }
                  >
                    <option value="OPEN" className="bg-navy-900">Open</option>
                    <option value="IN_PROGRESS" className="bg-navy-900">In-Progress</option>
                    <option value="RESOLVED" className="bg-navy-900">Resolved</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none group-hover/select:text-gold-400" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}