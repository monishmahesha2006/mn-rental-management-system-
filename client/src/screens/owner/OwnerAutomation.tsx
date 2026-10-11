import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Send, FileText, CheckCircle2, AlertCircle, Clock, Sparkles } from "lucide-react";
export function OwnerAutomation() {
    const [message, setMessage] = useState<string | null>(null);
    const inviteMutation = useMutation({
        mutationFn: async () => (await axios.post("/api/owner/automation/generate-monthly-invoices")).data,
        onSuccess: (data) => setMessage(data.message)
    });
    const reminderMutation = useMutation({
        mutationFn: async () => (await axios.post("/api/owner/automation/send-reminders")).data,
        onSuccess: (data) => setMessage(data.message)
    });
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-fade-in-up">
            <div className="text-center space-y-4">
                <div className="inline-flex p-3 bg-gold-500/10 rounded-2xl border border-gold-500/20 text-gold-500 luxury-glow mb-4">
                    <Zap size={32} />
                </div>
                <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight">Productivity Engine</h1>
                <p className="text-gold-700 font-light max-w-xl mx-auto">
                    Automate the heavy lifting. One-click billing and intelligent tenant reminders.
                </p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                { }
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-10 border-gold-500/10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 text-gold-500/5 group-hover:text-gold-500/10 transition-colors">
                        <FileText size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <h3 className="serif-heading text-2xl text-pearl-50">Bulk Billing</h3>
                        <p className="text-sm text-gold-700 leading-relaxed">
                            Generate rent invoices for all active tenancies for the current month. The system avoids duplicates.
                        </p>
                        <button
                            onClick={() => inviteMutation.mutate()}
                            disabled={inviteMutation.isPending}
                            className="luxury-button w-full"
                        >
                            {inviteMutation.isPending ? "Generating..." : "Run Monthly Billing"}
                            <Sparkles size={16} />
                        </button>
                    </div>
                </motion.div>
                { }
                <motion.div
                    whileHover={{ y: -5 }}
                    className="glass-card p-10 border-gold-500/10 relative overflow-hidden group"
                >
                    <div className="absolute top-0 right-0 p-8 text-gold-500/5 group-hover:text-gold-500/10 transition-colors">
                        <Send size={120} />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <h3 className="serif-heading text-2xl text-pearl-50">Smart Reminders</h3>
                        <p className="text-sm text-gold-700 leading-relaxed">
                            Dispatch formal payment reminders to all tenants with pending or overdue balances.
                        </p>
                        <button
                            onClick={() => reminderMutation.mutate()}
                            disabled={reminderMutation.isPending}
                            className="luxury-button w-full border-gold-500/20 bg-gold-500/5 text-gold-500"
                        >
                            {reminderMutation.isPending ? "Dispatching..." : "Send Formal Reminders"}
                            <Clock size={16} />
                        </button>
                    </div>
                </motion.div>
            </div>
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="p-6 bg-emerald-900/20 border border-emerald-800/30 rounded-2xl flex items-center justify-center gap-4 text-emerald-400"
                    >
                        <CheckCircle2 size={24} />
                        <span className="font-medium">{message}</span>
                        <button onClick={() => setMessage(null)} className="ml-4 text-xs underline">Dismiss</button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}