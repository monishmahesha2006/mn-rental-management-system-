import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Phone, Mail, MapPin, Wrench, Zap, Trash2, Search } from "lucide-react";
interface Vendor {
    id: string;
    name: string;
    contactName: string | null;
    phone: string;
    category: string;
    email: string | null;
    address: string | null;
}
export function OwnerVendors() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [category, setCategory] = useState("PLUMBER");
    const [contactName, setContactName] = useState("");
    const { data: vendorsData, isLoading } = useQuery<{ vendors: Vendor[] }>({
        queryKey: ["owner-vendors"],
        queryFn: async () => (await axios.get("/api/owner/vendors")).data
    });
    const createMutation = useMutation({
        mutationFn: async (vars: any) => await axios.post("/api/owner/vendors", vars),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-vendors"] });
            setShowForm(false);
            setName("");
            setPhone("");
        }
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name, phone, category, contactName });
    };
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="serif-heading text-4xl text-pearl-50 tracking-tight mb-2">Service Network</h1>
                    <p className="text-gold-700 font-light">Manage your trusted plumbers, electricians, and maintenance staff.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="luxury-button"
                >
                    <UserPlus size={18} />
                    Register Vendor
                </button>
            </div>
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-10 border-gold-500/20 max-w-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.2em]">Agency Name</label>
                                <input
                                    value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                    placeholder="e.g. Elite Plumbing Solutions" required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.2em]">Category</label>
                                <select
                                    value={category} onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                >
                                    <option value="PLUMBER">Plumber</option>
                                    <option value="ELECTRICIAN">Electrician</option>
                                    <option value="CLEANER">Cleaning Service</option>
                                    <option value="CARPENTER">Carpenter</option>
                                    <option value="OTHER">Other Service</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.2em]">Contact Person</label>
                                <input
                                    value={contactName} onChange={(e) => setContactName(e.target.value)}
                                    className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                    placeholder="e.g. Ramesh Kumar"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.2em]">Phone Number</label>
                                <input
                                    value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                    placeholder="+91 XXXXX XXXXX" required
                                />
                            </div>
                        </div>
                        <button type="submit" className="luxury-button w-full">Save Vendor Details</button>
                    </form>
                </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendorsData?.vendors.map((vendor) => (
                    <motion.div
                        key={vendor.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 border-gold-500/10 hover:border-gold-500/30 transition-all group"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-gold-500/10 text-gold-500 rounded-2xl group-hover:luxury-glow">
                                {vendor.category === "ELECTRICIAN" ? <Zap size={24} /> : <Wrench size={24} />}
                            </div>
                            <span className="text-[9px] font-bold text-gold-700 uppercase tracking-widest bg-navy-800 px-2 py-1 rounded">
                                {vendor.category}
                            </span>
                        </div>
                        <h3 className="serif-heading text-xl text-pearl-50 mb-1">{vendor.name}</h3>
                        {vendor.contactName && (
                            <p className="text-sm text-gold-700 font-medium mb-4 italic">POC: {vendor.contactName}</p>
                        )}
                        <div className="space-y-3 pt-4 border-t border-gold-500/5">
                            <a href={`tel:${vendor.phone}`} className="flex items-center gap-3 text-gold-400 hover:text-gold-500 transition-colors">
                                <Phone size={14} />
                                <span className="text-sm font-medium">{vendor.phone}</span>
                            </a>
                            {vendor.email && (
                                <div className="flex items-center gap-3 text-gold-700">
                                    <Mail size={14} />
                                    <span className="text-sm">{vendor.email}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}