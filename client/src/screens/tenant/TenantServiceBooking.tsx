import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Calendar, Clock, ClipboardList, Info, HelpCircle } from "lucide-react";
interface Request {
    id: string;
    serviceType: string;
    preferredDate: string;
    status: string;
    notes: string | null;
}
export function TenantServiceBooking() {
    const queryClient = useQueryClient();
    const [serviceType, setServiceType] = useState("CLEANING");
    const [preferredDate, setPreferredDate] = useState("");
    const [notes, setNotes] = useState("");
    const { data: requestsData, isLoading } = useQuery<{ requests: Request[] }>({
        queryKey: ["tenant-service-requests"],
        queryFn: async () => (await axios.get("/api/tenant/service-requests")).data
    });
    const bookingMutation = useMutation({
        mutationFn: async (vars: any) => await axios.post("/api/tenant/service-requests", vars),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-service-requests"] });
            setNotes("");
            setPreferredDate("");
        }
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!preferredDate) return;
        bookingMutation.mutate({ serviceType, preferredDate, notes });
    };
    return (
        <div className="space-y-12 animate-fade-in-up pb-16">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight">Concierge Services</h1>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider shadow-sm">
                            Coming Soon
                        </span>
                    </div>
                    <p className="text-gold-700 font-light mt-2 max-w-xl">
                        Dedicated hospitality, suite housekeeping, and on-demand care services are launching soon for your residence.
                    </p>
                </div>
                <div className="px-5 py-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center gap-3 shadow-sm">
                    <Sparkles size={18} className="text-amber-600" />
                    <div className="text-xs font-medium text-amber-900">
                        <span className="font-bold">Partner Certification in Progress</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                { }
                <div className="lg:col-span-5">
                    <div className="glass-card p-10 border-gold-500/10 luxury-shadow">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-gold-500/10 text-gold-500 rounded-xl luxury-glow">
                                <Sparkles size={24} />
                            </div>
                            <h2 className="serif-heading text-2xl text-pearl-50">New Reservation</h2>
                        </div>

                        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 mb-6 flex items-start gap-3">
                            <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
                            <p className="text-xs text-amber-900 leading-relaxed">
                                <strong>Feature Preview:</strong> Online concierge reservations will go live once verified local vendors complete background verification.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] px-1">Service Package</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["CLEANING", "DEEP_CLEANING", "REPAIR", "HEATING_AC"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setServiceType(type)}
                                            className={`p-4 rounded-xl border text-[11px] font-bold tracking-wider transition-all ${serviceType === type ? 'bg-gold-500/10 border-gold-500/50 text-gold-400 luxury-glow' : 'bg-navy-900/50 border-gold-500/10 text-gold-700 hover:border-gold-500/30'}`}
                                        >
                                            {type.replace('_', ' ')}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] px-1">Preferred Date</label>
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-500" size={18} />
                                    <input
                                        type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)}
                                        className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-4 pl-12 pr-4 text-pearl-50 focus:outline-none focus:border-gold-500/50"
                                        disabled
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] px-1">Special Instructions</label>
                                <textarea
                                    value={notes} onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-4 px-4 text-pearl-50 h-28 resize-none focus:outline-none focus:border-gold-500/50"
                                    placeholder="e.g. Master bedroom needs special attention..."
                                    disabled
                                />
                            </div>
                            <button
                                type="button"
                                disabled
                                className="luxury-button w-full h-14 opacity-75 cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                <Sparkles size={18} />
                                <span>Reservation Gateway Coming Soon</span>
                            </button>
                        </form>
                    </div>
                </div>
                { }
                <div className="lg:col-span-7 space-y-6">
                    <h3 className="serif-heading text-2xl text-pearl-50 px-2">Reservation History</h3>
                    <div className="space-y-4">
                        {requestsData?.requests.map((request) => (
                            <motion.div
                                key={request.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="glass-card p-6 border-gold-500/10 flex items-center justify-between group hover:bg-gold-500/5"
                            >
                                <div className="flex items-center gap-6">
                                    <div className="text-center min-w-[60px]">
                                        <div className="text-2xl font-bold text-pearl-50 tracking-tighter">
                                            {new Date(request.preferredDate).getDate()}
                                        </div>
                                        <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">
                                            {new Date(request.preferredDate).toLocaleString('default', { month: 'short' })}
                                        </div>
                                    </div>
                                    <div className="h-10 w-[1px] bg-gold-500/10" />
                                    <div>
                                        <div className="text-pearl-50 font-medium mb-1">{request.serviceType.replace('_', ' ')}</div>
                                        <div className="flex items-center gap-2 text-gold-700 text-xs font-light italic">
                                            <Clock size={12} />
                                            {request.notes || "No special instructions"}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-[10px] font-bold tracking-[0.15em] border ${request.status === 'PENDING' ? 'border-gold-500/20 text-gold-500' : 'border-emerald-800/30 text-emerald-400 bg-emerald-800/10'}`}>
                                    {request.status}
                                </div>
                            </motion.div>
                        ))}
                        {requestsData?.requests.length === 0 && (
                            <div className="glass-card p-12 text-center border-gold-500/5 opacity-50">
                                <ClipboardList className="mx-auto text-gold-700 mb-4" size={40} />
                                <p className="text-gold-700 font-light italic">No prior service reservations found.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}