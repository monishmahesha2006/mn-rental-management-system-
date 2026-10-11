import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Banknote, CheckCircle2, XCircle, Clock, User, Building2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
interface PendingPayment {
    invoiceId: string;
    amount: number;
    dueDate: string;
    tenantName: string;
    tenantEmail: string;
    propertyName: string;
    unitName: string;
    paymentRef: string;
}
export function OwnerCashApprovals() {
    const queryClient = useQueryClient();
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const { data, isLoading } = useQuery<{ pendingPayments: PendingPayment[] }>({
        queryKey: ["pending-cash-payments"],
        queryFn: async () => {
            const res = await axios.get("/api/owner/pending-cash-payments");
            return res.data;
        }
    });
    const approveMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            const res = await axios.post(`/api/owner/invoices/${invoiceId}/approve-cash`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-cash-payments"] });
            setMessage({ type: 'success', text: 'Cash payment approved successfully!' });
            setTimeout(() => setMessage(null), 3000);
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err?.response?.data?.error?.message || 'Failed to approve payment' });
        }
    });
    const rejectMutation = useMutation({
        mutationFn: async (invoiceId: string) => {
            const res = await axios.post(`/api/owner/invoices/${invoiceId}/reject-cash`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pending-cash-payments"] });
            setMessage({ type: 'success', text: 'Cash payment rejected' });
            setTimeout(() => setMessage(null), 3000);
        },
        onError: (err: any) => {
            setMessage({ type: 'error', text: err?.response?.data?.error?.message || 'Failed to reject payment' });
        }
    });
    const pendingPayments = data?.pendingPayments ?? [];
    return (
        <div className="max-w-6xl mx-auto space-y-10 animate-fade-in-up">
            <div className="text-center space-y-4">
                <div className="inline-flex p-3 bg-gold-500/10 rounded-2xl border border-gold-500/20 text-gold-500 luxury-glow mb-4">
                    <Banknote size={32} />
                </div>
                <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight">Cash Payment Approvals</h1>
                <p className="text-gold-700 font-light max-w-xl mx-auto">
                    Review and approve cash payments submitted by your tenants.
                </p>
            </div>
            { }
            <AnimatePresence>
                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`p-6 rounded-2xl border flex items-center gap-4 ${message.type === 'success'
                            ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-400'
                            : 'bg-red-900/20 border-red-500/30 text-red-400'
                            }`}
                    >
                        {message.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
                        <span className="font-medium">{message.text}</span>
                        <button onClick={() => setMessage(null)} className="ml-auto text-xs underline">Dismiss</button>
                    </motion.div>
                )}
            </AnimatePresence>
            {isLoading ? (
                <div className="py-24 text-center">
                    <div className="h-16 w-16 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 opacity-30" />
                    <p className="text-gold-700 text-sm">Loading pending payments...</p>
                </div>
            ) : pendingPayments.length === 0 ? (
                <div className="glass-card p-16 text-center border-gold-500/10">
                    <div className="h-20 w-20 rounded-full bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={32} className="text-gold-500" />
                    </div>
                    <h3 className="serif-heading text-2xl text-pearl-50 mb-2">All Caught Up!</h3>
                    <p className="text-gold-700">No pending cash payments to review at this time.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {pendingPayments.map((payment, idx) => (
                        <motion.div
                            key={payment.invoiceId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="glass-card p-8 border-gold-500/10 luxury-shadow"
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="space-y-6 flex-1">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="serif-heading text-2xl text-pearl-50">
                                                    ₹{payment.amount.toLocaleString("en-IN")}
                                                </h3>
                                                <span className="luxury-badge border-amber-500/30 text-amber-400 bg-amber-900/20">
                                                    <Clock size={12} className="mr-2" />
                                                    PENDING APPROVAL
                                                </span>
                                            </div>
                                            <p className="text-xs text-gold-700 uppercase tracking-widest">
                                                Invoice {payment.invoiceId.slice(0, 8).toUpperCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                                    <User size={16} className="text-gold-500" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">Tenant</div>
                                                    <div className="text-sm text-pearl-50 font-medium">{payment.tenantName}</div>
                                                    <div className="text-xs text-gold-700">{payment.tenantEmail}</div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center">
                                                    <Building2 size={16} className="text-gold-500" />
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest">Property</div>
                                                    <div className="text-sm text-pearl-50 font-medium">{payment.propertyName}</div>
                                                    <div className="text-xs text-gold-700">Unit: {payment.unitName}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6 text-xs text-gold-700">
                                        <div>
                                            <span className="font-bold uppercase tracking-widest">Due Date:</span>{" "}
                                            {format(new Date(payment.dueDate), "MMM dd, yyyy")}
                                        </div>
                                        <span className="opacity-20">•</span>
                                        <div>
                                            <span className="font-bold uppercase tracking-widest">Ref:</span>{" "}
                                            {payment.paymentRef}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex lg:flex-col gap-4 lg:w-48">
                                    <button
                                        onClick={() => approveMutation.mutate(payment.invoiceId)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                        className="luxury-button flex-1 lg:w-full py-4 flex items-center justify-center gap-3"
                                    >
                                        {approveMutation.isPending ? (
                                            <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <CheckCircle2 size={16} />
                                                Approve
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => rejectMutation.mutate(payment.invoiceId)}
                                        disabled={approveMutation.isPending || rejectMutation.isPending}
                                        className="luxury-button-outline flex-1 lg:w-full py-4 flex items-center justify-center gap-3 border-red-500/20 text-red-400 hover:bg-red-900/20"
                                    >
                                        {rejectMutation.isPending ? (
                                            <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <XCircle size={16} />
                                                Reject
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
            <div className="glass-card p-8 border-gold-500/10 bg-navy-900/40">
                <div className="flex items-start gap-4">
                    <AlertCircle size={20} className="text-gold-500 flex-shrink-0 mt-0.5" />
                    <div className="space-y-2">
                        <h4 className="font-bold text-sm text-pearl-50">Important Notes</h4>
                        <ul className="text-xs text-gold-700 space-y-1 list-disc list-inside">
                            <li>Approving a cash payment will mark the invoice as PAID immediately</li>
                            <li>Rejecting will reset the invoice to PENDING status, allowing the tenant to choose another payment method</li>
                            <li>All actions are logged and cannot be undone</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}