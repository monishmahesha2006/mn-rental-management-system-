import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { Package, CheckCircle2, AlertTriangle, Building2, Plus, Box } from "lucide-react";
interface Asset {
    id: string;
    name: string;
    category: string;
    status: string;
    purchaseDate: string | null;
    description: string | null;
    unitId: string;
    unit: { name: string; property: { name: string } };
}
export function OwnerInventory() {
    const queryClient = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [name, setName] = useState("");
    const [category, setCategory] = useState("APPLIANCE");
    const [unitId, setUnitId] = useState("");
    const { data: propertiesData } = useQuery<{ properties: any[] }>({
        queryKey: ["owner-properties"],
        queryFn: async () => (await axios.get("/api/owner/properties")).data
    });
    const { data: assetsData, isLoading } = useQuery<{ assets: Asset[] }>({
        queryKey: ["owner-assets"],
        queryFn: async () => (await axios.get("/api/owner/assets")).data
    });
    const createMutation = useMutation({
        mutationFn: async (vars: any) => await axios.post("/api/owner/assets", vars),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["owner-assets"] });
            setShowForm(false);
            setName("");
        }
    });
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createMutation.mutate({ name, category, unitId });
    };
    const allUnits = propertiesData?.properties.flatMap(p => p.units.map((u: any) => ({ ...u, propertyName: p.name }))) || [];
    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="serif-heading text-4xl text-pearl-50 tracking-tight mb-2">Asset Vault</h1>
                    <p className="text-gold-700 font-light">Inventory tracking for appliances, furniture, and unit fixtures.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="luxury-button"
                >
                    <Plus size={18} />
                    Catalog Asset
                </button>
            </div>
            {showForm && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="glass-card p-10 border-gold-500/20"
                >
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Asset Name</label>
                            <input
                                value={name} onChange={(e) => setName(e.target.value)}
                                className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                placeholder="e.g. Samsung AC 1.5T" required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Category</label>
                            <select
                                value={category} onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                            >
                                <option value="APPLIANCE">Appliance</option>
                                <option value="FURNITURE">Furniture</option>
                                <option value="FIXTURE">Fixture</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Assign to Unit</label>
                            <select
                                value={unitId} onChange={(e) => setUnitId(e.target.value)}
                                className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                                required
                            >
                                <option value="">Select Unit</option>
                                {allUnits.map(u => (
                                    <option key={u.id} value={u.id}>{u.propertyName} - {u.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="md:col-span-3">
                            <button type="submit" className="luxury-button w-full">Update Catalog</button>
                        </div>
                    </form>
                </motion.div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {assetsData?.assets.map((asset) => (
                    <div key={asset.id} className="glass-card p-6 border-gold-500/10 hover:bg-gold-500/5 transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <Box className="text-gold-500" size={24} />
                            <span className={`text-[9px] font-bold px-2 py-1 rounded ${asset.status === 'GOOD' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
                                {asset.status}
                            </span>
                        </div>
                        <h4 className="text-pearl-50 font-medium mb-1 tracking-tight">{asset.name}</h4>
                        <p className="text-[10px] text-gold-700 uppercase tracking-widest mb-4">{asset.category}</p>
                        <div className="flex items-center gap-2 text-[11px] text-gold-400 font-medium bg-navy-800/40 p-3 rounded-lg">
                            <Building2 size={12} />
                            {asset.unit.property.name} • {asset.unit.name}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}