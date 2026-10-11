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
                    <thead className="bg-amber-50/50 text-slate-700 border-b border-linen">
                        <tr>
                            <th className="px-4 py-3 text-left font-semibold">Tenant</th>
                            <th className="px-4 py-3 text-left font-semibold">Unit</th>
                            <th className="px-4 py-3 text-left font-semibold">Initial (₹)</th>
                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                            <th className="px-4 py-3 text-left font-semibold">Painting</th>
                            <th className="px-4 py-3 text-left font-semibold">Cleaning</th>
                            <th className="px-4 py-3 text-left font-semibold">Other</th>
                            <th className="px-4 py-3 text-left font-semibold">Balance</th>
                            <th className="px-4 py-3 text-right font-semibold">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading && (
                            <tr>
                                <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                                    Loading deposits...
                                </td>
                            </tr>
                        )}
                        {!isLoading &&
                            data?.deposits.map((d) => (
                                <tr key={d.tenancyId} className="border-t border-linen hover:bg-amber-50/30 transition">
                                    <td className="px-4 py-3 text-[11px]">
                                        <div className="font-semibold text-slate-900">{d.tenantName}</div>
                                        <div className="text-[10px] text-slate-500">{d.propertyName}</div>
                                    </td>
                                    <td className="px-4 py-3 text-[11px] text-slate-700 font-medium">{d.unitName}</td>
                                    <td className="px-4 py-3 text-[11px] text-slate-900 font-bold">
                                        ₹{d.initialAmount.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-[11px]">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${d.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                                            {d.status === 'VERIFIED' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                                            {d.status || 'PENDING'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-[11px] text-slate-600">
                                        ₹{d.paintingDeduction.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-[11px] text-slate-600">
                                        ₹{d.cleaningDeduction.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-[11px] text-slate-600">
                                        ₹{d.otherDeduction.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-[11px] font-bold text-emerald-700">
                                        ₹{d.balance.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        {d.status !== 'VERIFIED' && (
                                            <button
                                                onClick={() => verifyMutation.mutate(d.tenancyId)}
                                                disabled={verifyMutation.isPending}
                                                className="text-[10px] bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 px-3 py-1 rounded font-semibold transition-colors disabled:opacity-50"
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