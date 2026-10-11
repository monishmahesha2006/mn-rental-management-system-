import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Receipt, Calendar, Building2, Tag, ArrowUpRight } from "lucide-react";
interface Expense {
    id: string;
    label: string;
    amount: number;
    category: string;
    date: string;
    description: string | null;
    propertyId: string;
    property: { name: string };
}
export function OwnerExpenses() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [label, setLabel] = useState("");
    const [amount, setAmount] = useState<number>(0);
    const [category, setCategory] = useState("MAINTENANCE");
    const [propertyId, setPropertyId] = useState("");
    const [description, setDescription] = useState("");
    const { data: propertiesData } = useQuery<{ properties: any[] }>({
        queryKey: ["owner-properties"],
        queryFn: async () => (await axios.get("/api/owner/properties")).data
    });
    const { data: expensesData, isLoading } = useQuery<{ expenses: Expense[] }>({
        queryKey: ["owner-expenses"],
        queryFn: async () => (await axios.get("/api/owner/expenses")).data
    });
    const createMutation = useMutation({
        mutationFn: async (vars: any) => await axios.post("/api/owner/expenses", vars),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-expenses"] });
            setShowForm(false);
            setLabel("");
            setAmount(0);
        }
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ label, amount, category, propertyId, description });
    };
    const totalExpenses = expensesData?.expenses.reduce((sum, e) => sum + e.amount, 0) || 0;
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="serif-heading text-4xl text-pearl-50 tracking-tight mb-2">Expense Ledger</h1>
                    <p className="text-gold-700 font-light">Track maintenance costs and property overheads.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="luxury-button"
                >
                    <Plus size={18} />
                    Log Expense
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-8 border-gold-500/10">
                    <div className="text-[10px] font-bold text-gold-700 uppercase tracking-widest mb-2">Total Outflow</div>
                    <div className="serif-heading text-3xl text-pearl-50">₹{totalExpenses.toLocaleString()}</div>
                </div>
            </div>
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="glass-card p-10 border-gold-500/20"
                >
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gold-400 uppercase tracking-widest">Expense Label</label>
                            <input
                                value={label}
                                onChange={(e) => setLabel(e.target.value)}
                                className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                placeholder="e.g. Plumbing Repair"
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gold-400 uppercase tracking-widest">Amount (₹)</label>
                            <input
                                type="number"
                                value={amount || ""}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                required
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gold-400 uppercase tracking-widest">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                            >
                                <option value="MAINTENANCE">Maintenance</option>
                                <option value="TAX">Property Tax</option>
                                <option value="UTILITY">Utilities</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-xs font-medium text-gold-400 uppercase tracking-widest">Property</label>
                            <select
                                value={propertyId}
                                onChange={(e) => setPropertyId(e.target.value)}
                                className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                required
                            >
                                <option value="">Select Property</option>
                                {propertiesData?.properties.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="luxury-button w-full"
                                disabled={createMutation.isPending}
                            >
                                {createMutation.isPending ? "Logging..." : "Confirm Entry"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-navy-900/50 text-gold-400 text-[10px] uppercase tracking-widest border-b border-gold-500/10">
                        <tr>
                            <th className="px-8 py-4">Expense</th>
                            <th className="px-8 py-4">Category</th>
                            <th className="px-8 py-4">Property</th>
                            <th className="px-8 py-4">Date</th>
                            <th className="px-8 py-4 text-right">Amount</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/5">
                        {expensesData?.expenses.map((expense) => (
                            <tr key={expense.id} className="hover:bg-gold-500/5 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gold-500/10 rounded-lg text-gold-500">
                                            <Receipt size={14} />
                                        </div>
                                        <span className="text-pearl-50 font-medium">{expense.label}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className="text-[10px] bg-navy-800 text-gold-400 px-2 py-1 rounded border border-gold-500/10">
                                        {expense.category}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-gold-700 text-sm">{expense.property.name}</td>
                                <td className="px-8 py-6 text-gold-700 text-sm">{new Date(expense.date).toLocaleDateString()}</td>
                                <td className="px-8 py-6 text-right font-bold text-pearl-50">₹{expense.amount.toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}