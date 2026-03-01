import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    Plus,
    Trash2,
    Megaphone,
    Clock,
    AlertTriangle,
    Info,
    CheckCircle,
    X,
    Send,
    MessageSquare,
    Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface Notice {
    id: string;
    title: string;
    content: string;
    priority: string;
    createdAt: string;
}

export function OwnerNoticeBoard() {
    const queryClient = useQueryClient();
    const [isAdding, setIsAdding] = useState(false);
    const [newNotice, setNewNotice] = useState({ title: "", content: "", priority: "NORMAL" });

    const { data, isLoading } = useQuery<{ notices: Notice[] }>({
        queryKey: ["owner-notices"],
        queryFn: async () => {
            const res = await axios.get("/api/owner/notices");
            return res.data;
        }
    });

    const createMutation = useMutation({
        mutationFn: async (notice: typeof newNotice) => {
            const res = await axios.post("/api/owner/notices", notice);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-notices"] });
            setNewNotice({ title: "", content: "", priority: "NORMAL" });
            setIsAdding(false);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await axios.delete(`/api/owner/notices/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-notices"] });
        }
    });

    const handleCreate = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newNotice.title || !newNotice.content) return;
        createMutation.mutate(newNotice);
    };

    const getPriorityStyles = (p: string) => {
        switch (p) {
            case "URGENT": return "border-red-500/30 text-red-400 bg-red-900/20";
            case "IMPORTANT": return "border-gold-500/30 text-gold-500 bg-gold-500/10";
            default: return "border-gold-700/30 text-gold-700 bg-navy-800/50";
        }
    };

    const getPriorityIcon = (p: string) => {
        switch (p) {
            case "URGENT": return <AlertTriangle size={14} />;
            case "IMPORTANT": return <Sparkles size={14} />;
            default: return <Info size={14} />;
        }
    };

    const notices = data?.notices || [];

    return (
        <div className="space-y-10 animate-fade-in-up pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
                        Notice Board
                        <Megaphone size={32} className="text-gold-500" />
                    </h1>
                    <p className="text-gold-700 font-light tracking-wide">Keep your residents informed with official, high-priority updates.</p>
                </div>
                <button
                    onClick={() => setIsAdding(true)}
                    className="luxury-button group"
                >
                    <Plus size={22} strokeWidth={2.5} />
                    New Announcement
                </button>
            </div>

            <AnimatePresence>
                {isAdding && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        className="glass-card p-10 border-gold-500/20 relative"
                    >
                        <button
                            onClick={() => setIsAdding(false)}
                            className="absolute top-8 right-8 text-gold-700 hover:text-gold-400 transition-colors"
                        >
                            <X size={24} />
                        </button>
                        <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-8">Compose Message</h2>
                        <form onSubmit={handleCreate} className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Subject</label>
                                <input
                                    className="luxury-input"
                                    placeholder="e.g., Gala Event / Maintenance Update"
                                    value={newNotice.title}
                                    onChange={e => setNewNotice({ ...newNotice, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-3">
                                <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Message Body</label>
                                <textarea
                                    className="luxury-input min-h-[160px] resize-none py-5"
                                    placeholder="Enter detailed information for your residents..."
                                    value={newNotice.content}
                                    onChange={e => setNewNotice({ ...newNotice, content: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-4">
                                <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Importance Level</label>
                                <div className="flex flex-wrap gap-4">
                                    {["NORMAL", "IMPORTANT", "URGENT"].map(p => (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setNewNotice({ ...newNotice, priority: p })}
                                            className={`px-8 py-3.5 rounded-2xl text-[10px] font-bold transition-all border uppercase tracking-widest ${newNotice.priority === p
                                                ? "bg-gradient-to-br from-gold-500 to-gold-600 text-navy-950 border-gold-500 shadow-xl luxury-glow"
                                                : "bg-navy-800/50 text-gold-700 border-gold-500/10 hover:border-gold-500/30"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={createMutation.isPending}
                                    className="luxury-button px-12 group"
                                >
                                    <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    {createMutation.isPending ? "Posting..." : "Broadcast Update"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {isLoading ? (
                    <div className="lg:col-span-2 space-y-6">
                        {[1, 2].map(i => (
                            <div key={i} className="h-48 glass-card animate-pulse border-gold-500/5" />
                        ))}
                    </div>
                ) : notices.length === 0 ? (
                    <div className="lg:col-span-2 py-24 text-center glass-card border-dashed bg-transparent border-gold-500/10">
                        <MessageSquare className="mx-auto text-gold-800 mb-6" size={56} />
                        <h3 className="serif-heading text-2xl text-gold-700 tracking-tight">No announcements Yet.</h3>
                        <p className="text-sm font-light text-gold-800 mt-2 uppercase tracking-widest">Everything is currently quiet.</p>
                    </div>
                ) : (
                    notices.map((notice, idx) => (
                        <motion.div
                            key={notice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-10 flex flex-col justify-between group border-gold-500/10 hover:border-gold-500/25"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className={`luxury-badge ${getPriorityStyles(notice.priority)}`}>
                                        {getPriorityIcon(notice.priority)}
                                        {notice.priority}
                                    </span>
                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-gold-700 uppercase tracking-widest">
                                        <Clock size={14} className="text-gold-500" />
                                        {format(new Date(notice.createdAt), "MMM dd, yyyy")}
                                    </div>
                                </div>
                                <h3 className="serif-heading text-3xl text-pearl-50 tracking-tight italic group-hover:text-gold-400 transition-colors">{notice.title}</h3>
                                <p className="text-gold-700 text-base leading-relaxed font-light line-clamp-4">{notice.content}</p>
                            </div>
                            <div className="mt-10 pt-8 border-t border-gold-500/10 flex justify-end">
                                <button
                                    onClick={() => deleteMutation.mutate(notice.id)}
                                    className="p-4 bg-navy-800/60 border border-gold-500/10 rounded-2xl text-gold-800 hover:text-red-400 hover:border-red-500/30 transition-all hover:shadow-lg luxury-glow"
                                    title="Revoke Announcement"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
