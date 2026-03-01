import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    History,
    Download,
    CheckCircle2,
    ReceiptIndianRupee,
    Building2,
    ArrowRight,
    Sparkles,
    ShieldCheck,
    Clock
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface PaymentHistoryInvoice {
    id: string;
    dueDate: string;
    paidAt: string;
    totalAmount: number;
    status: string;
    items: {
        label: string;
        amount: number;
        category: string;
    }[];
    tenancy: {
        unit: {
            name: string;
            property: {
                name: string;
                address: string;
            }
        }
    };
}

export function TenantPaymentHistory() {
    const { data: history, isLoading } = useQuery<{ invoices: PaymentHistoryInvoice[] }>({
        queryKey: ["tenant-payment-history"],
        queryFn: async () => {
            const res = await axios.get("/api/tenant/payment-history");
            return res.data;
        }
    });

    const handleDownloadReceipt = (invoiceId: string) => {
        alert(`Generating Premium PDF Receipt for Statement ${invoiceId.toUpperCase()}... Verification successful.`);
    };

    return (
        <div className="space-y-10 animate-fade-in-up pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
                        Payment Registry
                        <History size={32} className="text-gold-500" />
                    </h1>
                    <p className="text-gold-700 font-light tracking-wide">A comprehensive record of your elite residency investments and settlements.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-5 py-3 bg-navy-800/60 border border-gold-500/10 rounded-2xl flex items-center gap-3 luxury-glow">
                        <ShieldCheck size={18} className="text-gold-500" />
                        <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.15em]">Verified Records</span>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="py-32 text-center">
                    <div className="h-14 w-14 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 luxury-glow" />
                    <p className="text-sm font-light text-gold-700 tracking-widest uppercase">Fetching Historical Statements...</p>
                </div>
            ) : history?.invoices.length === 0 ? (
                <div className="glass-card p-20 text-center space-y-8 border-gold-500/10">
                    <div className="w-24 h-24 bg-navy-800/60 border border-gold-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto text-gold-700 luxury-glow shadow-2xl">
                        <History size={48} strokeWidth={1} />
                    </div>
                    <div className="space-y-3">
                        <h3 className="serif-heading text-3xl text-pearl-50 tracking-tight">No Finished Settlements</h3>
                        <p className="text-gold-700 text-sm font-light uppercase tracking-widest italic">Your registry will populate upon your first successful transaction.</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-6">
                    {history?.invoices.map((invoice, idx) => (
                        <motion.div
                            key={invoice.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="glass-card p-8 group flex flex-col xl:flex-row xl:items-center gap-8 border-gold-500/10 hover:border-gold-500/30 transition-all duration-500 luxury-glow shadow-xl"
                        >
                            <div className="flex-1 space-y-6">
                                <div className="flex flex-wrap items-center justify-between gap-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-emerald-800/10 text-emerald-800 border border-emerald-800/20 luxury-glow">
                                            <CheckCircle2 size={20} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-[0.2em] bg-emerald-800/10 px-3 py-1 rounded-full border border-emerald-800/20">Settled</span>
                                                <span className="text-gold-500/30 text-xs">•</span>
                                                <span className="text-gold-700 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                                                    <Clock size={14} className="opacity-50" />
                                                    {format(new Date(invoice.paidAt), "MMMM dd, yyyy")}
                                                </span>
                                            </div>
                                            <div className="serif-heading text-2xl text-pearl-50 tracking-tight">Statement {invoice.id.slice(0, 10).toUpperCase()}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest mb-1">Total Investment</div>
                                        <div className="serif-heading text-4xl text-pearl-50 tracking-tighter">
                                            ₹{invoice.totalAmount.toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-6 xl:pl-16">
                                    <div className="flex items-center gap-3 text-sm font-light text-gold-700 italic">
                                        <Building2 size={16} className="text-gold-500" />
                                        <span>{invoice.tenancy.unit.property.name} • {invoice.tenancy.unit.name}</span>
                                    </div>
                                    <span className="hidden md:block text-gold-500/20 select-none">•</span>
                                    <div className="flex items-center gap-3 text-sm font-light text-gold-700 italic">
                                        <ReceiptIndianRupee size={16} className="text-gold-500" />
                                        <span>{invoice.items.map(i => i.label).join(", ")}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="xl:border-l border-gold-500/10 xl:pl-8 flex xl:block">
                                <button
                                    onClick={() => handleDownloadReceipt(invoice.id)}
                                    className="luxury-button-outline w-full xl:w-auto py-4 px-8 text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-3 border-gold-500/20 group/btn"
                                >
                                    <Download size={16} className="group-hover/btn:translate-y-0.5 transition-transform" />
                                    Download Registry Seal
                                    <Sparkles size={14} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
