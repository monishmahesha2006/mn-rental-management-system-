import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    CheckCircle2,
    Clock,
    AlertCircle,
    ReceiptIndianRupee,
    Building2,
    Search,
    Eye
} from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

interface RentSummary {
    month: number;
    year: number;
    totalExpected: number;
    paidCount: number;
    pendingCount: number;
    tenants: {
        tenantId: string;
        tenantName: string;
        propertyName: string;
        unitName: string;
        rentAmount: number;
        status: string;
        paidAt: string | null;
        invoiceId: string | null;
    }[];
}

export function OwnerRentAnalytics() {
    const navigate = useNavigate();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [searchTerm, setSearchTerm] = useState("");

    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();

    const { data: summary, isLoading } = useQuery<RentSummary>({
        queryKey: ["rent-analytics", month, year],
        queryFn: async () => {
            const res = await axios.get(`/api/owner/analytics/rent-summary?month=${month}&year=${year}`);
            return res.data;
        }
    });

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const filteredTenants = summary?.tenants.filter(t =>
        t.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.propertyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.unitName.toLowerCase().includes(searchTerm.toLowerCase())
    ) || [];

    const stats = [
        {
            label: "Collection Progress",
            value: summary ? `${summary.paidCount}/${summary.totalExpected}` : "0/0",
            icon: CheckCircle2,
            color: "text-emerald-400",
            bg: "bg-emerald-400/10"
        },
        {
            label: "Monthly Revenue",
            value: summary ? `₹${summary.tenants.filter(t => t.status === "PAID").reduce((acc, t) => acc + t.rentAmount, 0).toLocaleString()}` : "₹0",
            icon: ReceiptIndianRupee,
            color: "text-blue-400",
            bg: "bg-blue-400/10"
        },
        {
            label: "Pending",
            value: summary ? `₹${summary.tenants.filter(t => t.status !== "PAID").reduce((acc, t) => acc + t.rentAmount, 0).toLocaleString()}` : "₹0",
            icon: Clock,
            color: "text-amber-400",
            bg: "bg-amber-400/10"
        }
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header & Month Selector */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">Rent Analytics</h1>
                    <p className="text-slate-400 text-sm">Monthly rent collection overview and tracking.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/50 p-1 rounded-xl border border-slate-800">
                    <button
                        onClick={prevMonth}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="px-4 py-1 text-center min-w-[140px]">
                        <div className="text-xs font-medium text-mint-400 uppercase tracking-wider">
                            {format(currentDate, "yyyy")}
                        </div>
                        <div className="text-sm font-bold text-white">
                            {format(currentDate, "MMMM")}
                        </div>
                    </div>
                    <button
                        onClick={nextMonth}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition"
                    >
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="glass-card p-4 relative overflow-hidden group">
                        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition duration-300 ${stat.color}`}>
                            <stat.icon size={48} />
                        </div>
                        <div className="relative z-10 flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-400">{stat.label}</p>
                                <p className="text-xl font-bold text-white">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Detailed Tracking */}
            <div className="glass-card">
                <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h2 className="text-sm font-semibold flex items-center gap-2">
                        <Building2 size={16} className="text-mint-400" />
                        Collection Details
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                        <input
                            type="text"
                            placeholder="Search property or tenant..."
                            className="bg-slate-900/60 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-mint-400 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="text-slate-400 border-b border-slate-800">
                            <tr>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Tenant & Property</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider">Payment Date</th>
                                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        Loading monthly analytics...
                                    </td>
                                </tr>
                            ) : filteredTenants.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                        No data found for this month.
                                    </td>
                                </tr>
                            ) : (
                                filteredTenants.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-slate-800/30 transition group">
                                        <td className="px-6 py-4">
                                            <div
                                                className="font-semibold text-slate-200 cursor-pointer hover:text-mint-400 transition"
                                                onClick={() => navigate(`/owner/tenants/${item.tenantId}`)}
                                            >
                                                {item.tenantName}
                                            </div>
                                            <div className="text-[10px] text-slate-500">{item.propertyName} • {item.unitName}</div>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-300">
                                            ₹{item.rentAmount.toLocaleString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            {item.status === "PAID" ? (
                                                <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full font-medium">
                                                    <CheckCircle2 size={10} /> Paid
                                                </span>
                                            ) : item.status === "PENDING" ? (
                                                <span className="inline-flex items-center gap-1 text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full font-medium">
                                                    <Clock size={10} /> Pending
                                                </span>
                                            ) : item.status === "OVERDUE" ? (
                                                <span className="inline-flex items-center gap-1 text-rose-400 bg-rose-400/10 px-2 py-0.5 rounded-full font-medium">
                                                    <AlertCircle size={10} /> Overdue
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-slate-400 bg-slate-400/10 px-2 py-0.5 rounded-full font-medium">
                                                    <AlertCircle size={10} /> Not Generated
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-slate-400">
                                            {item.paidAt ? format(new Date(item.paidAt), "dd MMM, yyyy") : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => navigate(`/owner/tenants/${item.tenantId}`)}
                                                className="inline-flex items-center gap-1 text-mint-400 hover:text-mint-300 font-medium opacity-0 group-hover:opacity-100 transition"
                                            >
                                                <Eye size={12} /> View History
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
