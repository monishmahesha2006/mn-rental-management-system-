import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Megaphone,
    AlertTriangle,
    Info,
    Flame,
    Clock,
    User,
    Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface Notice {
    id: string;
    title: string;
    content: string;
    priority: "NORMAL" | "IMPORTANT" | "URGENT";
    createdAt: string;
}

export function TenantNoticeBoard() {
    const { data, isLoading } = useQuery<{ notices: Notice[] }>({
        queryKey: ["tenant-notices"],
        queryFn: async () => {
            const res = await axios.get("/api/tenant/notices");
            return res.data;
        }
    });

    const getPriorityStyles = (priority: string) => {
        switch (priority) {
            case "URGENT": return "border-red-500/30 text-red-400 bg-red-900/20";
            case "IMPORTANT": return "border-gold-500/30 text-gold-500 bg-gold-500/10";
            default: return "border-gold-700/30 text-gold-700 bg-navy-800/50";
        }
    };

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "URGENT": return <Flame size={14} />;
            case "IMPORTANT": return <Sparkles size={14} />;
            default: return <Info size={14} />;
        }
    };

    const notices = data?.notices || [];

    return (
        <div className="space-y-10 animate-fade-in-up pb-16">
            <div className="relative overflow-hidden rounded-[2.5rem] bg-navy-900/40 p-10 md:p-14 border border-gold-500/10 luxury-shadow">
                <div className="relative z-10 max-w-2xl">
                    <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-4 flex items-center gap-4">
                        Notice Board
                        <Megaphone size={36} className="text-gold-500" />
                    </h1>
                    <p className="text-gold-700 text-lg font-light leading-relaxed">Stay updated with exclusive announcements and official communications regarding your residency.</p>
                </div>
                <div className="absolute top-0 right-0 p-10 text-gold-500/5 animate-pulse">
                    <Megaphone size={200} strokeWidth={0.5} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="glass-card p-10 h-72 animate-pulse border-gold-500/5" />
                    ))
                ) : notices.length === 0 ? (
                    <div className="col-span-full py-28 text-center glass-card border-dashed border-gold-500/10 bg-transparent">
                        <Info size={56} className="text-gold-800 mx-auto mb-6" />
                        <h3 className="serif-heading text-3xl text-gold-700 tracking-tight">No Recent Updates</h3>
                        <p className="text-gold-800 text-sm font-medium mt-2 uppercase tracking-[0.2em]">Everything is refined and quiet.</p>
                    </div>
                ) : (
                    notices.map((notice, idx) => (
                        <motion.div
                            key={notice.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative glass-card p-10 flex flex-col justify-between group border-gold-500/10 hover:border-gold-500/25 transition-all duration-500"
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <span className={`luxury-badge ${getPriorityStyles(notice.priority)}`}>
                                        {getPriorityIcon(notice.priority)}
                                        {notice.priority}
                                    </span>
                                </div>
                                <div className="space-y-3">
                                    <h3 className="serif-heading text-3xl text-pearl-50 leading-tight tracking-tight italic group-hover:text-gold-400 transition-colors">{notice.title}</h3>
                                    <div className="flex items-center gap-4 text-gold-700 text-[10px] font-bold uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-2">
                                            <User size={14} className="text-gold-500" />
                                            <span>Concierge</span>
                                        </div>
                                        <span className="text-gold-500/30 opacity-30">•</span>
                                        <div className="flex items-center gap-2">
                                            <Clock size={14} />
                                            <span>{format(new Date(notice.createdAt), "MMM dd")}</span>
                                        </div>
                                    </div>
                                </div>
                                <p className="text-gold-700 text-sm leading-relaxed font-light line-clamp-4 group-hover:text-gold-400/80 transition-colors">
                                    {notice.content}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-gold-500/10">
                                <button className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.25em] flex items-center gap-3 hover:text-gold-400 transition-all group-hover:gap-5">
                                    Read Full Bulletin
                                    <Sparkles size={12} />
                                </button>
                            </div>

                            {/* Corner Ornament */}
                            <div className="absolute -bottom-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-12 h-12 border-r-2 border-b-2 border-gold-500/20 rounded-br-2xl" />
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
