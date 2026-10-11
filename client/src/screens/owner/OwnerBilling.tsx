import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  ReceiptIndianRupee,
  Droplets,
  Sparkles,
  ChevronDown,
  Zap,
  Calculator,
  ShieldCheck,
  Search,
  Building2,
  Users,
  CheckSquare,
  Square
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
interface ResultInvoice {
  invoiceId: string;
  unitName: string;
  residents: number;
  amount: number;
}
interface TankerResult {
  totalCost: number;
  totalResidents: number;
  perResident: number;
  invoices: ResultInvoice[];
}
export function OwnerBilling() {
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [selectedUnitIds, setSelectedUnitIds] = useState<string[]>([]);
  const [totalCost, setTotalCost] = useState<number>(0);
  const { data: propertiesData } = useMutation({
    mutationFn: async () => {
      const res = await axios.get("/api/owner/properties");
      return res.data;
    }
  }) as any;
  const { data: propsData } = useQuery({
    queryKey: ["owner-properties-billing"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/properties");
      return res.data;
    }
  });
  const mutation = useMutation({
    mutationFn: async (body: { propertyId: string; totalCost: number; unitIds: string[] }) => {
      const res = await axios.post("/api/owner/billing/tanker-split", body);
      return res.data as TankerResult;
    }
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPropertyId || !totalCost) return;
    mutation.mutate({
      propertyId: selectedPropertyId,
      totalCost,
      unitIds: selectedUnitIds.length > 0 ? selectedUnitIds : []
    });
  };
  const properties = propsData?.properties || [];
  const selectedProperty = properties.find((p: any) => p.id === selectedPropertyId);
  const availableUnits = selectedProperty?.units?.filter((u: any) => u.status === "OCCUPIED" || u.tenancies?.length > 0) || [];
  const toggleUnit = (unitId: string) => {
    if (selectedUnitIds.includes(unitId)) {
      setSelectedUnitIds(selectedUnitIds.filter(id => id !== unitId));
    } else {
      setSelectedUnitIds([...selectedUnitIds, unitId]);
    }
  };
  const toggleAllUnits = () => {
    if (selectedUnitIds.length === availableUnits.length) {
      setSelectedUnitIds([]);
    } else {
      setSelectedUnitIds(availableUnits.map((u: any) => u.id));
    }
  };
  const result = mutation.data;
  return (
    <div className="space-y-10 animate-fade-in-up pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
            Utility Engine
            <Droplets size={32} className="text-gold-500" />
          </h1>
          <p className="text-gold-700 font-light tracking-wide">Elite automated utilities distribution and investment splitting for exclusive properties.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-5 py-3 bg-navy-800/60 border border-gold-500/10 rounded-2xl flex items-center gap-3 luxury-glow">
            <ShieldCheck size={18} className="text-gold-500" />
            <span className="text-[11px] font-semibold text-gold-400 uppercase tracking-[0.15em]">Automated Auditing</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-1 glass-card p-10 border-gold-500/20 luxury-shadow"
        >
          <div className="flex items-center gap-3 mb-10">
            <div className="p-3 bg-gold-500/10 text-gold-500 rounded-xl border border-gold-500/20 luxury-glow">
              <Calculator size={22} strokeWidth={2} />
            </div>
            <h2 className="serif-heading text-2xl text-pearl-50 tracking-tight">Split Parameters</h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Selected Property</label>
              <div className="relative group/input">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none" size={18} />
                <select
                  className="luxury-input !pl-14 appearance-none bg-navy-900"
                  value={selectedPropertyId}
                  onChange={(e) => {
                    setSelectedPropertyId(e.target.value);
                    setSelectedUnitIds([]); 
                  }}
                  required
                >
                  <option value="" className="bg-navy-900">Select Property...</option>
                  {properties.map((p: any) => (
                    <option key={p.id} value={p.id} className="bg-navy-900">
                      {p.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none" size={16} />
              </div>
            </div>
            {selectedPropertyId && (
              <div className="space-y-3 animate-fade-in-up">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em]">Allocated Units</label>
                  <button
                    type="button"
                    onClick={toggleAllUnits}
                    className="text-[10px] text-gold-500 hover:text-gold-300 transition-colors uppercase tracking-wider"
                  >
                    {selectedUnitIds.length === availableUnits.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                {availableUnits.length === 0 ? (
                  <div className="p-4 rounded-xl border border-gold-500/10 bg-navy-900/40 text-center">
                    <p className="text-xs text-gold-700 italic">No occupied units found in this property.</p>
                  </div>
                ) : (
                  <div className="max-h-48 overflow-y-auto custom-scrollbar p-1 space-y-2">
                    {availableUnits.map((u: any) => {
                      const isSelected = selectedUnitIds.includes(u.id);
                      return (
                        <div
                          key={u.id}
                          onClick={() => toggleUnit(u.id)}
                          className={`
                                            flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                                            ${isSelected
                              ? "bg-gold-500/10 border-gold-500/30"
                              : "bg-navy-800/40 border-gold-500/5 hover:border-gold-500/20"}
                                        `}
                        >
                          <div className="flex items-center gap-3">
                            {isSelected
                              ? <CheckSquare size={16} className="text-gold-500" />
                              : <Square size={16} className="text-gold-700" />}
                            <span className={`text-sm ${isSelected ? "text-pearl-50" : "text-gold-700"}`}>{u.name}</span>
                          </div>
                          <span className="text-[10px] text-gold-700 uppercase tracking-widest">{u.rentAmount ? `₹${u.rentAmount}` : "N/A"}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="text-[10px] text-right text-gold-700 italic">
                  {selectedUnitIds.length} units selected for split
                </div>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Total Tanker Cost (₹)</label>
              <div className="relative group/input">
                <Droplets className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none group-focus-within/input:text-gold-400" size={18} />
                <input
                  type="number"
                  className="luxury-input !pl-14"
                  placeholder="Enter total investment amount..."
                  value={totalCost || ""}
                  onChange={(e) => setTotalCost(Number(e.target.value))}
                  min={0}
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="luxury-button w-full py-5 text-sm"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Calculating Distribution..." : "Execute Tanker Split"}
            </button>
            {mutation.error && (
              <p className="text-sm font-medium text-red-400 italic text-center">
                {(mutation.error as any)?.response?.data?.error?.message || "Failed to execute split engine"}
              </p>
            )}
          </form>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="xl:col-span-2 space-y-8"
        >
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="glass-card overflow-hidden border-gold-500/10 luxury-shadow"
              >
                <div className="p-10 border-b border-gold-500/10 bg-navy-900/40 flex flex-col md:flex-row md:items-center justify-between gap-8">
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em]">Execution Summary</div>
                    <div className="serif-heading text-4xl text-pearl-50 tracking-tight">
                      ₹{result.totalCost.toLocaleString("en-IN")} <span className="text-gold-700 text-lg mx-2 italic">over</span> {result.totalResidents} residents
                    </div>
                  </div>
                  <div className="px-8 py-5 bg-gold-500/10 border border-gold-500/20 rounded-2xl flex flex-col items-end luxury-glow">
                    <div className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.2em] mb-1">Per Resident</div>
                    <div className="text-2xl font-bold text-gold-400 tracking-tight">₹{result.perResident.toFixed(2)}</div>
                  </div>
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full">
                    <thead className="bg-navy-900/40 text-[10px] font-bold text-gold-700 uppercase tracking-[0.15em]">
                      <tr>
                        <th className="px-10 py-6 text-left">Elite Suite</th>
                        <th className="px-10 py-6 text-center">Occupancy</th>
                        <th className="px-10 py-6 text-right">Apportioned Amt</th>
                        <th className="px-10 py-6 text-right">Invoice Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gold-500/10">
                      {result.invoices.map((inv, idx) => (
                        <motion.tr
                          key={inv.invoiceId}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="group hover:bg-gold-500/5 transition-all duration-300"
                        >
                          <td className="px-10 py-8">
                            <div className="flex items-center gap-4">
                              <div className="h-8 w-8 rounded-lg bg-navy-800 border border-gold-500/20 flex items-center justify-center text-gold-500 luxury-glow">
                                <Zap size={14} />
                              </div>
                              <span className="font-medium text-pearl-50 tracking-tight">{inv.unitName}</span>
                            </div>
                          </td>
                          <td className="px-10 py-8 text-center">
                            <div className="inline-flex items-center gap-1.5 text-gold-700 text-sm font-light">
                              <Users size={14} />
                              {inv.residents} Residents
                            </div>
                          </td>
                          <td className="px-10 py-8 text-right font-serif text-2xl text-gold-400 tracking-tight">
                            ₹{inv.amount.toLocaleString("en-IN")}
                          </td>
                          <td className="px-10 py-8 text-right">
                            <div className="inline-flex items-center gap-2 group/ref cursor-help">
                              <span className="text-[10px] font-mono text-gold-800 uppercase tracking-widest">{inv.invoiceId.slice(0, 10)}...</span>
                              <ShieldCheck size={14} className="text-gold-500/30 group-hover/ref:text-gold-400 transition-colors" />
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card py-32 text-center border-gold-500/10 h-full flex flex-col items-center justify-center"
              >
                <Droplets size={64} className="text-gold-800 mb-6 opacity-20" />
                <h3 className="serif-heading text-3xl text-gold-700 tracking-tight">Engine Awaiting Input</h3>
                <p className="text-[10px] font-bold text-gold-800 uppercase tracking-[0.2em] mt-3">Ready for utility distribution execution</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}