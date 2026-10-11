import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, User, Home, Calendar, FileText, Settings, Upload, ReceiptIndianRupee, History } from "lucide-react";
import { format } from "date-fns";
interface Occupant {
    id: string;
    name: string;
    age?: number | null;
    relation?: string | null;
    phoneNumber?: string | null;
    aadharId?: string | null;
    photoUrl?: string | null;
}
interface TenantProfile {
    tenantId: string;
    tenantName: string;
    tenantEmail: string;
    tenantPhone: string | null;
    tenancyId: string | null;
    unitId: string | null;
    unitName: string | null;
    propertyId: string | null;
    propertyName: string | null;
    locality: string | null;
    rentAmount: number | null;
    deposit: number | null;
    status: "ACTIVE" | "NOTICE_PERIOD" | "UNASSIGNED";
    startDate: string | null;
    endDate: string | null;
    occupants: Occupant[];
    billingConfig: {
        rentDueDay: number;
        billDueDay: number;
    } | null;
}
export function OwnerTenantProfile() {
    const { tenantId } = useParams<{ tenantId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [rentDueDay, setRentDueDay] = useState<number>(5);
    const [billDueDay, setBillDueDay] = useState<number>(10);
    const [showBillingForm, setShowBillingForm] = useState(false);
    const { data: profileData, isLoading } = useQuery<TenantProfile>({
        queryKey: ["tenant-profile", tenantId],
        queryFn: async () => {
            const res = await axios.get(`/api/owner/tenants/${tenantId}/profile`);
            return res.data;
        },
        enabled: !!tenantId
    });
    const updateBillingMutation = useMutation({
        mutationFn: async (data: { rentDueDay: number; billDueDay: number }) => {
            const res = await axios.post(`/api/owner/tenants/${tenantId}/billing-config`, data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-profile", tenantId] });
            setSuccess("Billing configuration updated successfully!");
            setShowBillingForm(false);
            setError(null);
            setTimeout(() => setSuccess(null), 3000);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.error?.message || "Failed to update billing config");
        }
    });
    const generateRentMutation = useMutation({
        mutationFn: async () => {
            const res = await axios.post(`/api/owner/tenants/${tenantId}/generate-rent`);
            return res.data;
        },
        onSuccess: () => {
            setSuccess("Rent invoice generated successfully!");
            setError(null);
            setTimeout(() => setSuccess(null), 3000);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.error?.message || "Failed to generate rent invoice");
        }
    });
    const resetPasswordMutation = useMutation({
        mutationFn: async (password: string) => {
            const res = await axios.patch(`/api/owner/tenants/${tenantId}/password`, { password });
            return res.data;
        },
        onSuccess: () => {
            setSuccess("Password reset successfully! Make sure to share the new credentials with the tenant.");
            setTimeout(() => setSuccess(null), 5000);
            setShowPasswordModal(false);
            setNewPassword("");
            setError(null);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.error?.message || "Failed to reset password");
        }
    });
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const { data: historyData, isLoading: isHistoryLoading } = useQuery<{ invoices: any[] }>({
        queryKey: ["tenant-history", tenantId],
        queryFn: async () => {
            const res = await axios.get(`/api/owner/tenants/${tenantId}/payment-history`);
            return res.data;
        },
        enabled: !!tenantId
    });
    const handleUpdateBilling = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (rentDueDay < 1 || rentDueDay > 31 || billDueDay < 1 || billDueDay > 31) {
            setError("Due days must be between 1 and 31");
            return;
        }
        updateBillingMutation.mutate({ rentDueDay, billDueDay });
    };
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-slate-400">Loading tenant profile...</p>
            </div>
        );
    }
    if (!profileData) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-slate-400">Tenant not found</p>
            </div>
        );
    }
    return (
        <div className="space-y-4">
            { }
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/owner/tenants")}
                    className="inline-flex items-center gap-2 rounded-xl border border-linen bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 shadow-sm transition"
                >
                    <ArrowLeft size={16} />
                    Back to Tenants
                </button>
                <div>
                    <h1 className="serif-heading text-3xl text-slate-900">{profileData.tenantName}'s Profile</h1>
                    <p className="text-xs text-slate-600 mt-0.5">{profileData.tenantEmail} {profileData.tenantPhone && `• ${profileData.tenantPhone}`}</p>
                </div>
            </div>
            {/* Success Message */}
            {success && (
                <div className="glass-card p-4 bg-emerald-50 border border-emerald-200">
                    <p className="text-xs text-emerald-800 font-semibold">✓ {success}</p>
                </div>
            )}
            {/* Error Message */}
            {error && (
                <div className="glass-card p-4 bg-rose-50 border border-rose-200">
                    <p className="text-xs text-rose-800 font-semibold">✗ {error}</p>
                </div>
            )}
            {/* Status Card */}
            <div className="glass-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Tenant Status</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <div className="text-slate-600 font-medium mb-1">Status</div>
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${profileData.status === "ACTIVE"
                                ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                : profileData.status === "NOTICE_PERIOD"
                                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                                    : "bg-slate-100 text-slate-700 border border-slate-200"
                                }`}
                        >
                            {profileData.status === "UNASSIGNED"
                                ? "Unassigned"
                                : profileData.status === "ACTIVE"
                                    ? "Active"
                                    : "Notice Period"}
                        </span>
                    </div>
                    {profileData.startDate && (
                        <div>
                            <div className="text-slate-600 font-medium mb-1">Start Date</div>
                            <div className="font-bold text-slate-900">
                                {new Date(profileData.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                    {profileData.endDate && (
                        <div>
                            <div className="text-slate-600 font-medium mb-1">End Date</div>
                            <div className="font-bold text-slate-900">
                                {new Date(profileData.endDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            {/* Property & Unit Details */}
            {profileData.unitId && (
                <div className="glass-card p-5 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Home size={18} className="text-indigo-600" />
                        <h2 className="text-sm font-semibold text-slate-900">Property & Unit Details</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <div className="text-slate-600 font-medium mb-1">Property</div>
                            <div className="font-bold text-slate-900">{profileData.propertyName}</div>
                            <div className="text-slate-500 text-[11px] mt-0.5">{profileData.locality}</div>
                        </div>
                        <div>
                            <div className="text-slate-600 font-medium mb-1">Unit</div>
                            <div className="font-bold text-slate-900">{profileData.unitName}</div>
                        </div>
                        <div>
                            <div className="text-slate-600 font-medium mb-1">Monthly Rent</div>
                            <div className="font-bold text-slate-900">
                                ₹{profileData.rentAmount?.toLocaleString("en-IN")}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-600 font-medium mb-1">Security Deposit</div>
                            <div className="font-bold text-slate-900">
                                ₹{profileData.deposit?.toLocaleString("en-IN")}
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Billing Configuration */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-indigo-600" />
                        <h2 className="text-sm font-semibold text-slate-900">Billing Configuration</h2>
                    </div>
                    {profileData.tenancyId && (
                        <button
                            onClick={() => {
                                setShowBillingForm(!showBillingForm);
                                if (profileData.billingConfig) {
                                    setRentDueDay(profileData.billingConfig.rentDueDay);
                                    setBillDueDay(profileData.billingConfig.billDueDay);
                                }
                            }}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition"
                        >
                            {showBillingForm ? "Cancel" : "Edit"}
                        </button>
                    )}
                </div>
                {!profileData.tenancyId ? (
                    <p className="text-xs text-slate-600">
                        Tenant must be assigned to a unit before setting billing configuration.
                    </p>
                ) : showBillingForm ? (
                    <form onSubmit={handleUpdateBilling} className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                    Rent Due Day (1-31) *
                                </label>
                                <input
                                    max="31"
                                    className="w-full rounded-xl border border-linen bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 !pl-3"
                                    value={rentDueDay}
                                    onChange={(e) => setRentDueDay(Number(e.target.value))}
                                    required
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Day of the month when rent is due
                                </p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                                    Other Bills Due Day (1-31) *
                                </label>
                                <input
                                    max="31"
                                    className="w-full rounded-xl border border-linen bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 !pl-3"
                                    value={billDueDay}
                                    onChange={(e) => setBillDueDay(Number(e.target.value))}
                                    required
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Day of the month when other bills are due
                                </p>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={updateBillingMutation.isPending}
                            className="inline-flex items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-semibold px-4 py-2 hover:bg-indigo-700 transition disabled:opacity-60 shadow-sm"
                        >
                            {updateBillingMutation.isPending ? "Saving..." : "Save Billing Config"}
                        </button>
                    </form>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <div className="text-slate-600 font-medium mb-1">Rent Due Day</div>
                            <div className="font-bold text-slate-900">
                                Day {profileData.billingConfig?.rentDueDay || 5} of each month
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-600 font-medium mb-1">Other Bills Due Day</div>
                            <div className="font-bold text-slate-900">
                                Day {profileData.billingConfig?.billDueDay || 10} of each month
                            </div>
                        </div>
                    </div>
                )}
            </div>
            {/* Occupants */}
            <div className="glass-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Occupants ({profileData.occupants.length})</h2>
                </div>
                {profileData.occupants.length === 0 ? (
                    <p className="text-xs text-slate-600">
                        No occupants registered yet. The tenant can add occupant details from their portal.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {profileData.occupants.map((occupant) => (
                            <div
                                key={occupant.id}
                                className="border border-linen rounded-xl p-4 bg-white/80 shadow-sm"
                            >
                                <div className="flex items-start gap-3">
                                    {occupant.photoUrl ? (
                                        <img
                                            src={occupant.photoUrl}
                                            alt={occupant.name}
                                            className="w-16 h-16 rounded-xl object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-500">
                                            <User size={24} />
                                        </div>
                                    )}
                                    <div className="flex-1 text-xs">
                                        <div className="font-bold text-slate-900 mb-1">{occupant.name}</div>
                                        {occupant.relation && (
                                            <div className="text-slate-600 mb-0.5">Relation: {occupant.relation}</div>
                                        )}
                                        {occupant.age && (
                                            <div className="text-slate-600 mb-0.5">Age: {occupant.age}</div>
                                        )}
                                        {occupant.phoneNumber && (
                                            <div className="text-slate-600 mb-0.5">Phone: {occupant.phoneNumber}</div>
                                        )}
                                        {occupant.aadharId && (
                                            <div className="text-slate-600">Aadhar: {occupant.aadharId}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Payment History */}
            <div className="glass-card p-5 md:p-6 text-xs">
                <div className="flex items-center gap-2 mb-4">
                    <History size={18} className="text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Payment History</h2>
                </div>
                {isHistoryLoading ? (
                    <p className="text-slate-500">Loading history...</p>
                ) : !historyData?.invoices || historyData.invoices.length === 0 ? (
                    <p className="text-slate-600">No payment history found for this tenant.</p>
                ) : (
                    <div className="space-y-3">
                        {historyData.invoices.slice(0, 5).map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between border-b border-linen pb-3">
                                <div>
                                    <div className="font-bold text-slate-900">
                                        {format(new Date(inv.dueDate), "MMMM yyyy")}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                        ID: #{inv.id.slice(-8)} • {inv.items?.map((it: any) => it.label).join(", ")}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-900">₹{inv.totalAmount.toLocaleString()}</div>
                                    <div className={`text-[10px] font-bold uppercase tracking-wider ${inv.status === "PAID" ? "text-emerald-700" :
                                        inv.status === "PENDING" ? "text-amber-700" : "text-rose-700"
                                        }`}>
                                        {inv.status}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Quick Actions */}
            <div className="glass-card p-5 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings size={18} className="text-indigo-600" />
                    <h2 className="text-sm font-semibold text-slate-900">Quick Actions</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to generate a rent invoice for this month?")) {
                                generateRentMutation.mutate();
                            }
                        }}
                        disabled={generateRentMutation.isPending || !profileData.tenancyId}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-4 py-2.5 hover:bg-indigo-100 transition disabled:opacity-50"
                    >
                        <ReceiptIndianRupee size={14} />
                        {generateRentMutation.isPending ? "Generating..." : "Generate Rent"}
                    </button>
                    <button
                        onClick={() => navigate("/owner/billing")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-linen bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 shadow-sm transition"
                    >
                        <FileText size={14} />
                        View Invoices
                    </button>
                    <button
                        onClick={() => navigate("/owner/maintenance")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-linen bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 shadow-sm transition"
                    >
                        <Settings size={14} />
                        Maintenance Tickets
                    </button>
                    <button
                        onClick={() => navigate("/owner/security-deposit")}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-linen bg-white text-slate-700 text-xs font-semibold px-4 py-2.5 hover:bg-slate-50 shadow-sm transition"
                    >
                        <Calendar size={14} />
                        Security Deposit
                    </button>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold px-4 py-2.5 hover:bg-amber-100 transition disabled:opacity-50"
                    >
                        <Settings size={14} />
                        Reset Password
                    </button>
                </div>
            </div>
            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in-up">
                    <div className="glass-card max-w-sm w-full p-6 border-linen shadow-2xl bg-white">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">Reset Tenant Password</h3>
                        <p className="text-xs text-slate-600 mb-6">Enter a new secure password for {profileData.tenantName}. This action overrides their existing password.</p>
                        <form onSubmit={(e) => { e.preventDefault(); resetPasswordMutation.mutate(newPassword); }}>
                            <div className="space-y-2 mb-6">
                                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider pl-1">New Password</label>
                                <input
                                    type="text"
                                    className="luxury-input !pl-4 border-linen focus:border-indigo-500"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Minimum 6 characters"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordModal(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetPasswordMutation.isPending}
                                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition disabled:opacity-50 shadow-sm"
                                >
                                    {resetPasswordMutation.isPending ? "Resetting..." : "Confirm Reset"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}