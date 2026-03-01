import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { CheckCircle, AlertCircle } from "lucide-react";

interface DepositRow {
    tenancyId: string;
    tenantName: string;
    unitName: string;
    propertyName: string;
    initialAmount: number;
    paintingDeduction: number;
    cleaningDeduction: number;
    otherDeduction: number;
    balance: number;
    status: string;
}

export function OwnerSecurityDeposit() {
    const queryClient = useQueryClient();
    const { data, isLoading } = useQuery<{ deposits: DepositRow[] }>({
        queryKey: ["owner-security-deposits"],
        queryFn: async () => {
            const res = await axios.get("/api/owner/security-deposits");
            return res.data;
        }
    });

    const verifyMutation = useMutation({
        mutationFn: async (tenancyId: string) => {
            await axios.post(`/api/owner/security-deposits/${tenancyId}/verify`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-security-deposits"] });
        }
    });

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-lg font-semibold">Security Deposit Tracker</h1>
                <p className="text-xs text-slate-400">
                    Transparent view of 10-month deposits minus standard Painting / Cleaning deductions for each tenancy.
                </p>
            </div>
            <div className="glass-card overflow-x-auto">
                <table className="min-w-full text-xs">
                    <thead className="bg-slate-900/80 text-slate-400">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium">Tenant</th>
                            <th className="px-4 py-2 text-left font-medium">Unit</th>
                            <th className="px-4 py-2 text-left font-medium">Initial (₹)</th>
                            <th className="px-4 py-2 text-left font-medium">Status</th>
                            <th className="px-4 py-2 text-left font-medium">Painting</th>
                            <th className="px-4 py-2 text-left font-medium">Cleaning</th>
                            <th className="px-4 py-2 text-left font-medium">Other</th>
                            <th className="px-4 py-2 text-left font-medium">Balance</th>
                            <th className="px-4 py-2 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={9} className="px-4 py-6 text-center text-slate-400">
                                    Loading deposits...
                                </td>
                            </tr>
                        )}
                        {!isLoading &&
                            data?.deposits.map((d) => (
                                <tr key={d.tenancyId} className="border-t border-slate-800/80 hover:bg-slate-900/60">
                                    <td className="px-4 py-2 text-[11px]">
                                        <div className="font-medium">{d.tenantName}</div>
                                        <div className="text-[10px] text-slate-500">{d.propertyName}</div>
                                    </td>
                                    <td className="px-4 py-2 text-[11px]">{d.unitName}</td>
                                    <td className="px-4 py-2 text-[11px]">
                                        ₹{d.initialAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-2 text-[11px]">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] ${d.status === 'VERIFIED' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-gold-500/10 text-gold-500'}`}>
                                            {d.status === 'VERIFIED' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                            {d.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-[11px]">
                                        ₹{d.paintingDeduction.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-2 text-[11px]">
                                        ₹{d.cleaningDeduction.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-2 text-[11px]">
                                        ₹{d.otherDeduction.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-2 text-[11px] font-semibold text-mint-300">
                                        ₹{d.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-2 text-right">
                                        {d.status !== 'VERIFIED' && (
                                            <button
                                                onClick={() => verifyMutation.mutate(d.tenancyId)}
                                                disabled={verifyMutation.isPending}
                                                className="text-[10px] bg-gold-500/20 hover:bg-gold-500/30 text-gold-400 px-3 py-1 rounded transition-colors disabled:opacity-50"
                                            >
                                                {verifyMutation.isPending ? "..." : "Verify"}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
