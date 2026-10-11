import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ReceiptIndianRupee,
  Download,
  Sparkles,
  ChevronDown,
  Clock,
  ShieldCheck,
  AlertCircle,
  Building2,
  Zap,
  Droplets,
  Wallet,
  CreditCard,
  Banknote,
  CheckCircle2,
  XCircle,
  ArrowRight
} from "lucide-react";
import { format, isValid } from "date-fns";
import { useSearchParams } from "react-router-dom";
interface InvoiceItem {
  id: string;
  label: string;
  amount: number;
  category: "RENT" | "WATER" | "ELECTRICITY" | "OTHER";
}
interface Invoice {
  id: string;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  totalAmount: number;
  items: InvoiceItem[];
  paymentMethod?: string | null;
  cashApprovalPending?: boolean;
}
declare global {
  interface Window {
    Razorpay: any;
  }
}
export function TenantBills() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasAutoOpened = useRef(false);
  const { data, isLoading, error } = useQuery<{ invoices: Invoice[] }>({
    queryKey: ["tenant-bills"],
    queryFn: async () => {
      const res = await axios.get("/api/tenant/bills");
      return res.data;
    }
  });
  const [downloading, setDownloading] = useState<string | null>(null);
  const [paymentModal, setPaymentModal] = useState<{ invoiceId: string; amount: number } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const invoices = useMemo(() => data?.invoices ?? [], [data]);
  const safeFormatDate = (dateStr: any) => {
    try {
      if (!dateStr) return "TBD";
      const d = new Date(dateStr);
      if (!isValid(d)) return "Invalid Date";
      return format(d, "MMM dd, yyyy");
    } catch (e) {
      return "N/A";
    }
  };
  useEffect(() => {
    if (isLoading || hasAutoOpened.current || !data?.invoices) return;
    const action = searchParams.get("action");
    if (action === "pay_outstanding") {
      const pendingInvoice = data.invoices.find(
        (inv) => (inv.status === "PENDING" || inv.status === "OVERDUE") && !inv.cashApprovalPending
      );
      if (pendingInvoice) {
        setPaymentModal({ invoiceId: pendingInvoice.id, amount: pendingInvoice.totalAmount });
        hasAutoOpened.current = true;
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete("action");
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [data, isLoading, searchParams, setSearchParams]);
  const handleDownload = async (invoiceId: string) => {
    try {
      setDownloading(invoiceId);
      const res = await axios.get(`/api/tenant/bills/${invoiceId}/pdf`, {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${invoiceId.substring(0, 8)}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Statement download failed' });
    } finally {
      setDownloading(null);
    }
  };
  const cashPaymentMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await axios.post(`/api/tenant/bills/${invoiceId}/pay-cash`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-bills"] });
      setPaymentModal(null);
      setMessage({ type: 'success', text: 'Cash settlement initiated. Awaiting verification.' });
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err?.response?.data?.error?.message || 'Verification failed' });
    }
  });
  const onlinePaymentMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await axios.post(`/api/tenant/bills/${invoiceId}/create-order`);
      return res.data;
    },
    onSuccess: (orderData) => {
      if (orderData.isMock) {
        setMessage({ type: 'success', text: 'Simulating secure payment (Demo Mode)...' });
        setTimeout(async () => {
          try {
            await axios.post(`/api/tenant/bills/${orderData.invoiceId}/verify-payment`, {
              razorpay_order_id: orderData.orderId,
              razorpay_payment_id: "pay_mock_" + Date.now(),
              razorpay_signature: "sig_mock_" + Date.now()
            });
            queryClient.invalidateQueries({ queryKey: ["tenant-bills"] });
            setPaymentModal(null);
            setMessage({ type: 'success', text: 'Transaction confirmed (Demo). Portfolio updated.' });
          } catch (err) {
            setMessage({ type: 'error', text: 'Demo payment simulation failed' });
          }
        }, 1500);
        return;
      }
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => initiateRazorpayPayment(orderData);
        document.body.appendChild(script);
      } else {
        initiateRazorpayPayment(orderData);
      }
    },
    onError: (err: any) => {
      setMessage({ type: 'error', text: err?.response?.data?.error?.message || 'Online gateway unavailable' });
    }
  });
  const initiateRazorpayPayment = (orderData: any) => {
    const options = {
      key: orderData.keyId,
      amount: orderData.amount * 100,
      currency: orderData.currency,
      name: 'BLR RENTAL',
      description: `Settlement ID: ${orderData.invoiceId.substring(0, 8)}`,
      order_id: orderData.orderId,
      prefill: {
        name: orderData.tenantName,
        email: orderData.tenantEmail
      },
      theme: { color: '#D4AF37' },
      handler: async function (response: any) {
        try {
          await axios.post(`/api/tenant/bills/${orderData.invoiceId}/verify-payment`, {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });
          queryClient.invalidateQueries({ queryKey: ["tenant-bills"] });
          setPaymentModal(null);
          setMessage({ type: 'success', text: 'Transaction confirmed. Portfolio updated.' });
        } catch (err: any) {
          setMessage({ type: 'error', text: 'Payment confirmation failed' });
        }
      },
      modal: { ondismiss: () => setPaymentModal(null) }
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  const sections: { key: string; label: string; icon: any; filter: (item: InvoiceItem) => boolean }[] = [
    { key: "RENT", label: "Suite Investment (Rent)", icon: Building2, filter: (i) => i.category === "RENT" },
    { key: "WATER", label: "Utility - Water", icon: Droplets, filter: (i) => i.category === "WATER" },
    { key: "ELECTRICITY", label: "Utility - Power", icon: Zap, filter: (i) => i.category === "ELECTRICITY" }
  ];
  if (error) {
    return (
      <div className="py-20 text-center text-pearl-50">
        <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
        <h2 className="serif-heading text-3xl mb-2">Service Unavailable</h2>
        <p className="text-gold-700">Please try again later or contact support.</p>
      </div>
    );
  }
  return (
    <div className="space-y-10 animate-fade-in-up pb-16">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="serif-heading text-5xl text-pearl-50 mb-3 flex items-center gap-3">
            Financial Ledger
            <ReceiptIndianRupee size={32} className="text-gold-500" />
          </h1>
          <p className="text-gold-700 font-light tracking-wide italic">Elite breakdown of your residency investments.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2.5 bg-amber-50 border border-amber-200/80 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 font-medium shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Online Payment: <span className="font-bold">Coming Soon</span>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-6 rounded-2xl border flex items-center justify-between ${message.type === 'success' ? 'bg-emerald-900/20 border-emerald-800/30 text-emerald-400' : 'bg-red-900/20 border-red-500/30 text-red-400'}`}
          >
            <div className="flex items-center gap-3">
              {message.type === 'success' ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
              <span className="font-medium">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-xs uppercase tracking-widest opacity-50 hover:opacity-100">Dismiss</button>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="grid gap-8">
        {sections.map((sec) => (
          <div key={sec.key} className="glass-card overflow-hidden border-gold-500/10 luxury-shadow">
            <div className="p-8 border-b border-gold-500/10 bg-navy-900/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-gold-500/10 text-gold-500 border border-gold-500/20 flex items-center justify-center">
                  <sec.icon size={18} />
                </div>
                <h2 className="serif-heading text-2xl text-pearl-50 tracking-tight">{sec.label}</h2>
              </div>
            </div>
            <div className="p-8">
              {isLoading ? (
                <div className="py-12 text-center">
                  <div className="h-10 w-10 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-4 opacity-30" />
                </div>
              ) : (
                <div className="grid gap-6">
                  {invoices.map((inv) => {
                    const items = (inv.items || []).filter(sec.filter);
                    if (!items.length) return null;
                    return (
                      <div key={inv.id + sec.key} className="rounded-2xl border border-gold-500/10 bg-navy-900/40 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 hover:bg-gold-500/5 transition-all">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="text-pearl-50 font-medium">#{inv.id.substring(0, 8).toUpperCase()}</span>
                            <span className={`px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase ${inv.status === 'PAID' ? 'bg-emerald-900/20 text-emerald-400 border border-emerald-800/20' :
                              inv.cashApprovalPending ? 'bg-amber-900/20 text-amber-400 border border-amber-800/20' :
                                'bg-gold-500/10 text-gold-500 border border-gold-500/10'
                              }`}>
                              {inv.cashApprovalPending ? 'Pending Verification' : inv.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-6 text-[10px] font-bold text-gold-700 uppercase tracking-widest">
                            <div className="flex items-center gap-2"><Clock size={14} /> Due: {safeFormatDate(inv.dueDate)}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="text-right flex-1 md:flex-none">
                            <div className="text-[10px] text-gold-800 uppercase font-bold mb-1">Amount</div>
                            <div className="serif-heading text-3xl text-pearl-50">
                              ₹{(items.reduce((sum, i) => sum + i.amount, 0)).toLocaleString("en-IN")}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {inv.status === "PENDING" && !inv.cashApprovalPending && (
                              <button onClick={() => setPaymentModal({ invoiceId: inv.id, amount: inv.totalAmount })} className="luxury-button py-2.5 px-6 !text-[10px]">Settle</button>
                            )}
                            <button onClick={() => handleDownload(inv.id)} disabled={downloading === inv.id} className="luxury-button-outline py-2.5 px-4 !text-[10px]">
                              {downloading === inv.id ? "..." : <Download size={16} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {paymentModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4"
            onClick={() => setPaymentModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="glass-card max-w-md w-full p-10 border-gold-500/20 text-center"
            >
              <h3 className="serif-heading text-3xl text-pearl-50 mb-2">Clear Dues</h3>
              <p className="text-gold-700 text-sm mb-6">Amount: ₹{paymentModal.amount.toLocaleString("en-IN")}</p>
              <div className="grid gap-4">
                {/* Online Payment Coming Soon Box */}
                <div className="p-4 rounded-2xl border border-linen bg-white/80 text-left shadow-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                      <CreditCard size={16} className="text-indigo-600" />
                      Online Payment (UPI / Cards)
                    </span>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 uppercase tracking-wider">
                      Coming Soon
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Razorpay instant checkout is currently under activation. Please use direct settlement below.
                  </p>
                </div>

                <button
                  onClick={() => cashPaymentMutation.mutate(paymentModal.invoiceId)}
                  className="luxury-button w-full py-4 text-xs font-bold"
                  disabled={cashPaymentMutation.isPending}
                >
                  {cashPaymentMutation.isPending ? "Recording Request..." : "Pay via Physical Cash / Direct Settlement"}
                </button>
                <button
                  onClick={() => setPaymentModal(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 uppercase tracking-wider mt-2 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}