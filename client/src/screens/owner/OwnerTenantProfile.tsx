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

    // Billing config state
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

    // Password Reset Mutation
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
            {/* Header */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => navigate("/owner/tenants")}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-semibold px-3 py-2 hover:bg-slate-800/70 transition"
                >
                    <ArrowLeft size={16} />
                    Back to Tenants
                </button>
                <div>
                    <h1 className="text-lg font-semibold">{profileData.tenantName}'s Profile</h1>
                    <p className="text-xs text-slate-400">{profileData.tenantEmail} {profileData.tenantPhone && `• ${profileData.tenantPhone}`}</p>
                </div>
            </div>

            {/* Success Message */}
            {success && (
                <div className="glass-card p-4 bg-mint-400/10 border border-mint-400/30">
                    <p className="text-xs text-mint-300">✓ {success}</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="glass-card p-4 bg-red-400/10 border border-red-400/30">
                    <p className="text-xs text-red-300">✗ {error}</p>
                </div>
            )}

            {/* Status Card */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <User size={18} className="text-mint-400" />
                    <h2 className="text-sm font-semibold">Tenant Status</h2>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-xs">
                    <div>
                        <div className="text-slate-400 mb-1">Status</div>
                        <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${profileData.status === "ACTIVE"
                                ? "bg-mint-400/15 text-mint-300"
                                : profileData.status === "NOTICE_PERIOD"
                                    ? "bg-amber-400/20 text-amber-300"
                                    : "bg-slate-700/50 text-slate-400"
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
                            <div className="text-slate-400 mb-1">Start Date</div>
                            <div className="font-semibold text-slate-200">
                                {new Date(profileData.startDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                    {profileData.endDate && (
                        <div>
                            <div className="text-slate-400 mb-1">End Date</div>
                            <div className="font-semibold text-slate-200">
                                {new Date(profileData.endDate).toLocaleDateString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Property & Unit Details */}
            {profileData.unitId && (
                <div className="glass-card p-4 md:p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Home size={18} className="text-mint-400" />
                        <h2 className="text-sm font-semibold">Property & Unit Details</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <div className="text-slate-400 mb-1">Property</div>
                            <div className="font-semibold text-slate-200">{profileData.propertyName}</div>
                            <div className="text-slate-400 text-[11px] mt-1">{profileData.locality}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 mb-1">Unit</div>
                            <div className="font-semibold text-slate-200">{profileData.unitName}</div>
                        </div>
                        <div>
                            <div className="text-slate-400 mb-1">Monthly Rent</div>
                            <div className="font-semibold text-slate-200">
                                ₹{profileData.rentAmount?.toLocaleString("en-IN")}
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400 mb-1">Security Deposit</div>
                            <div className="font-semibold text-slate-200">
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
                        <Calendar size={18} className="text-mint-400" />
                        <h2 className="text-sm font-semibold">Billing Configuration</h2>
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
                            className="text-xs text-mint-300 hover:text-mint-400 transition"
                        >
                            {showBillingForm ? "Cancel" : "Edit"}
                        </button>
                    )}
                </div>

                {!profileData.tenancyId ? (
                    <p className="text-xs text-slate-400">
                        Tenant must be assigned to a unit before setting billing configuration.
                    </p>
                ) : showBillingForm ? (
                    <form onSubmit={handleUpdateBilling} className="space-y-3">
                        <div className="grid md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    Rent Due Day (1-31) *
                                </label>
                                <input
                                    max="31"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-mint-400/60 !pl-3"
                                    value={rentDueDay}
                                    onChange={(e) => setRentDueDay(Number(e.target.value))}
                                    required
                                />
                                <p className="text-[10px] text-slate-500 mt-1">
                                    Day of the month when rent is due
                                </p>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-slate-300 mb-1">
                                    Other Bills Due Day (1-31) *
                                </label>
                                <input
                                    max="31"
                                    className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-mint-400/60 !pl-3"
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
                            className="inline-flex items-center justify-center rounded-lg bg-mint-400 text-slate-950 text-xs font-semibold px-4 py-2 hover:bg-mint-400/90 transition disabled:opacity-60"
                        >
                            {updateBillingMutation.isPending ? "Saving..." : "Save Billing Config"}
                        </button>
                    </form>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <div className="text-slate-400 mb-1">Rent Due Day</div>
                            <div className="font-semibold text-slate-200">
                                Day {profileData.billingConfig?.rentDueDay || 5} of each month
                            </div>
                        </div>
                        <div>
                            <div className="text-slate-400 mb-1">Other Bills Due Day</div>
                            <div className="font-semibold text-slate-200">
                                Day {profileData.billingConfig?.billDueDay || 10} of each month
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Occupants */}
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <FileText size={18} className="text-mint-400" />
                    <h2 className="text-sm font-semibold">Occupants ({profileData.occupants.length})</h2>
                </div>

                {profileData.occupants.length === 0 ? (
                    <p className="text-xs text-slate-400">
                        No occupants registered yet. The tenant can add occupant details from their portal.
                    </p>
                ) : (
                    <div className="grid md:grid-cols-2 gap-4">
                        {profileData.occupants.map((occupant) => (
                            <div
                                key={occupant.id}
                                className="border border-slate-700 rounded-lg p-4 bg-slate-900/40"
                            >
                                <div className="flex items-start gap-3">
                                    {occupant.photoUrl ? (
                                        <img
                                            src={occupant.photoUrl}
                                            alt={occupant.name}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-slate-800 flex items-center justify-center">
                                            <User size={24} className="text-slate-600" />
                                        </div>
                                    )}
                                    <div className="flex-1 text-xs">
                                        <div className="font-semibold text-slate-200 mb-1">{occupant.name}</div>
                                        {occupant.relation && (
                                            <div className="text-slate-400 mb-1">Relation: {occupant.relation}</div>
                                        )}
                                        {occupant.age && (
                                            <div className="text-slate-400 mb-1">Age: {occupant.age}</div>
                                        )}
                                        {occupant.phoneNumber && (
                                            <div className="text-slate-400 mb-1">Phone: {occupant.phoneNumber}</div>
                                        )}
                                        {occupant.aadharId && (
                                            <div className="text-slate-400">Aadhar: {occupant.aadharId}</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Payment History */}
            <div className="glass-card p-4 md:p-6 text-xs">
                <div className="flex items-center gap-2 mb-4">
                    <History size={18} className="text-mint-400" />
                    <h2 className="text-sm font-semibold">Payment History</h2>
                </div>

                {isHistoryLoading ? (
                    <p className="text-slate-400">Loading history...</p>
                ) : !historyData?.invoices || historyData.invoices.length === 0 ? (
                    <p className="text-slate-400">No payment history found for this tenant.</p>
                ) : (
                    <div className="space-y-3">
                        {historyData.invoices.slice(0, 5).map((inv) => (
                            <div key={inv.id} className="flex items-center justify-between border-b border-slate-800 pb-2">
                                <div>
                                    <div className="font-medium text-slate-200">
                                        {format(new Date(inv.dueDate), "MMMM yyyy")}
                                    </div>
                                    <div className="text-[10px] text-slate-500">
                                        ID: #{inv.id.slice(-8)} • {inv.items?.map((it: any) => it.label).join(", ")}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-slate-200">₹{inv.totalAmount.toLocaleString()}</div>
                                    <div className={`text-[10px] font-medium uppercase tracking-wider ${inv.status === "PAID" ? "text-emerald-400" :
                                        inv.status === "PENDING" ? "text-amber-400" : "text-rose-400"
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
            <div className="glass-card p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Settings size={18} className="text-mint-400" />
                    <h2 className="text-sm font-semibold">Quick Actions</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button
                        onClick={() => {
                            if (window.confirm("Are you sure you want to generate a rent invoice for this month?")) {
                                generateRentMutation.mutate();
                            }
                        }}
                        disabled={generateRentMutation.isPending || !profileData.tenancyId}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-semibold px-4 py-2 hover:bg-indigo-500/30 transition disabled:opacity-50"
                    >
                        <ReceiptIndianRupee size={14} />
                        {generateRentMutation.isPending ? "Generating..." : "Generate Rent"}
                    </button>
                    <button
                        onClick={() => navigate("/owner/billing")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-semibold px-4 py-2 hover:bg-slate-800/70 transition"
                    >
                        <FileText size={14} />
                        View Invoices
                    </button>
                    <button
                        onClick={() => navigate("/owner/maintenance")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-semibold px-4 py-2 hover:bg-slate-800/70 transition"
                    >
                        <Settings size={14} />
                        Maintenance Tickets
                    </button>
                    <button
                        onClick={() => navigate("/owner/security-deposit")}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 text-slate-300 text-xs font-semibold px-4 py-2 hover:bg-slate-800/70 transition"
                    >
                        <Calendar size={14} />
                        Security Deposit
                    </button>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-semibold px-4 py-2 hover:bg-orange-500/30 transition disabled:opacity-50"
                    >
                        <Settings size={14} />
                        Reset Password
                    </button>
                </div>
            </div>

            {/* Password Reset Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in-up">
                    <div className="glass-card max-w-sm w-full p-6 border-orange-500/30">
                        <h3 className="text-lg font-semibold text-pearl-50 mb-4">Reset Tenant Password</h3>
                        <p className="text-xs text-slate-400 mb-6">Enter a new secure password for {profileData.tenantName}. This action overrides their existing password.</p>

                        <form onSubmit={(e) => { e.preventDefault(); resetPasswordMutation.mutate(newPassword); }}>
                            <div className="space-y-3 mb-6">
                                <label className="text-xs font-medium text-gold-400 uppercase tracking-widest pl-1">New Password</label>
                                <input
                                    type="text"
                                    className="luxury-input !pl-4 border-orange-500/20 focus:border-orange-500/50"
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
                                    className="flex-1 py-3 rounded-xl bg-slate-800 text-slate-400 text-xs font-semibold hover:bg-slate-700 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={resetPasswordMutation.isPending}
                                    className="flex-1 py-3 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition disabled:opacity-50"
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
