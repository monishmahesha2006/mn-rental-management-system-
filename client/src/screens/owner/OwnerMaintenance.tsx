import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Wrench,
  AlertCircle,
  CheckCircle,
  Clock,
  Sparkles,
  ChevronDown,
  Building2,
  User,
  Calendar,
  Zap,
  MessageSquare,
  Search,
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
interface MaintenanceTicket {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  createdAt: string;
  tenant: {
    id: string;
    email: string;
    name: string | null;
  };
  unit: {
    id: string;
    name: string;
    property: {
      id: string;
      name: string;
      locality: string;
    };
  } | null;
}
export function OwnerMaintenance() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<{ tickets: MaintenanceTicket[] }>({
    queryKey: ["owner-maintenance-tickets"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/maintenance-tickets");
      return res.data;
    }
  });
  const updateStatusMutation = useMutation({
    mutationFn: async ({ ticketId, status }: { ticketId: string; status: string }) => {
      const res = await axios.patch(`/api/owner/maintenance-tickets/${ticketId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-maintenance-tickets"] });
    }
  });
  const tickets = data?.tickets || [];
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN": return "border-red-500/30 text-red-400 bg-red-900/20";
      case "IN_PROGRESS": return "border-gold-500/30 text-gold-500 bg-gold-500/10";
      case "RESOLVED": return "border-emerald-800/30 text-emerald-800 bg-emerald-800/10";
      default: return "border-gold-700/30 text-gold-700 bg-navy-800/50";
    }
  };
  const getStatusIconColor = (status: string) => {
    switch (status) {
      case "OPEN": return "text-red-400";
      case "IN_PROGRESS": return "text-gold-500";
      case "RESOLVED": return "text-emerald-800";
      default: return "text-gold-700";
    }
  };
  return (
    <div className="space-y-10 animate-fade-in-up pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
            Service Requests
            <Wrench size={32} className="text-gold-500" />
          </h1>
          <p className="text-gold-700 font-light tracking-wide">Elite oversight of property maintenance and elite resident service requests.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-700 group-focus-within:text-gold-400 transition-colors" size={16} />
            <input
              className="bg-navy-800/40 border border-gold-500/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-pearl-50 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-light placeholder:text-gold-700 w-64"
              placeholder="Search requests..."
            />
          </div>
          <button className="px-5 py-3 bg-navy-800/60 border border-gold-500/10 rounded-xl text-[10px] font-semibold text-gold-700 hover:text-gold-400 hover:border-gold-500/20 transition-all flex items-center gap-2 uppercase tracking-widest luxury-glow">
            <Filter size={14} /> Filter
          </button>
        </div>
      </div>
      <div className="glass-card overflow-hidden border-gold-500/10 luxury-shadow">
        <div className="p-8 border-b border-gold-500/10 flex items-center justify-between bg-navy-900/40">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-gold-500 animate-pulse" />
            <h3 className="serif-heading text-2xl text-pearl-50 tracking-tight">Active Portfolio Maintenance</h3>
          </div>
          <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">
            Total {tickets.length} Tickets
          </div>
        </div>
        {isLoading && (
          <div className="py-32 text-center">
            <div className="h-14 w-14 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 luxury-glow" />
            <p className="text-sm font-light text-gold-700 tracking-widest uppercase">Indexing Portfolio Service Desk...</p>
          </div>
        )}
        {!isLoading && tickets.length === 0 && (
          <div className="py-32 text-center">
            <MessageSquare size={64} className="mx-auto text-gold-800 mb-6 opacity-30" />
            <h4 className="serif-heading text-3xl text-gold-700 tracking-tight">No Active Requests</h4>
            <p className="text-xs font-bold text-gold-800 uppercase tracking-widest mt-2 italic">Everything is running in pristine condition.</p>
          </div>
        )}
        {!isLoading && tickets.length > 0 && (
          <div className="divide-y divide-gold-500/10">
            {tickets.map((ticket, idx) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-10 group hover:bg-gold-500/5 transition-all duration-500"
              >
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10">
                  <div className="flex-1 space-y-6">
                    <div className="flex flex-wrap items-center gap-4">
                      <div className={`p-3 rounded-xl bg-navy-800/80 border border-gold-500/10 shadow-xl luxury-glow ${getStatusIconColor(ticket.status)}`}>
                        <Zap size={22} strokeWidth={2} />
                      </div>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="serif-heading text-3xl text-pearl-50 tracking-tight italic">{ticket.title}</h3>
                          <span className={`luxury-badge ${getStatusBadge(ticket.status)}`}>
                            <div className={`h-1.5 w-1.5 rounded-full mr-2.5 ${ticket.status === 'OPEN' ? 'bg-red-400' : ticket.status === 'IN_PROGRESS' ? 'bg-gold-500' : 'bg-emerald-800'}`} />
                            {ticket.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="text-gold-700 text-base font-light leading-relaxed max-w-3xl">{ticket.description}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 pl-0 lg:pl-16">
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest flex items-center gap-2">
                          <Sparkles size={12} className="text-gold-500/50" /> Category
                        </div>
                        <div className="text-sm font-medium text-pearl-50 tracking-tight">{ticket.category}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest flex items-center gap-2">
                          <User size={12} className="text-gold-500/50" /> Resident
                        </div>
                        <div className="text-sm font-medium text-pearl-50 tracking-tight">{ticket.tenant.name || ticket.tenant.email}</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest flex items-center gap-2">
                          <Building2 size={12} className="text-gold-500/50" /> Location
                        </div>
                        <div className="text-sm font-medium text-pearl-50 tracking-tight">
                          {ticket.unit?.name} • {ticket.unit?.property.name}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest flex items-center gap-2">
                          <Calendar size={12} className="text-gold-500/50" /> Lodged
                        </div>
                        <div className="text-sm font-medium text-pearl-50 tracking-tight flex items-center gap-2">
                          {format(new Date(ticket.createdAt), "MMM dd, h:mm a")}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 min-w-[200px] xl:items-end">
                    <label className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] px-1">Update Status</label>
                    <div className="relative group/select w-full">
                      <select
                        value={ticket.status}
                        onChange={(e) => updateStatusMutation.mutate({ ticketId: ticket.id, status: e.target.value })}
                        className={`w-full appearance-none luxury-input py-4 px-8 text-[11px] font-bold uppercase tracking-widest bg-navy-800/80 border-gold-500/30 ${getStatusIconColor(ticket.status)}`}
                      >
                        <option value="OPEN" className="bg-navy-900">Open Service</option>
                        <option value="IN_PROGRESS" className="bg-navy-900">In Progress</option>
                        <option value="RESOLVED" className="bg-navy-900">Mark Resolved</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none group-hover/select:text-gold-400 transition-colors" />
                    </div>
                    <button className="w-full luxury-button-outline py-4 text-[10px] font-bold uppercase tracking-widest border-emerald-800/20 text-emerald-800 hover:bg-emerald-800/10">
                      Contact Concierge
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}