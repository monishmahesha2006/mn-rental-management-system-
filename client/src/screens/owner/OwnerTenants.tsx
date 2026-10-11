import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Link2,
  Eye,
  Plus,
  ChevronDown,
  Building,
  Search,
  Users,
  Sparkles,
  X,
  FileText
} from "lucide-react";
interface Occupant {
  id: string;
  name: string;
  age?: number | null;
  relation?: string | null;
}
interface TenantRow {
  tenantId: string;
  tenancyId: string | null;
  tenantName: string;
  tenantEmail: string;
  unitId: string | null;
  unitName: string | null;
  propertyId: string | null;
  propertyName: string | null;
  locality: string | null;
  status: "ACTIVE" | "NOTICE_PERIOD" | "UNASSIGNED";
  isAssigned: boolean;
  occupants: Occupant[];
}
interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  locality: string;
  units: Unit[];
}
interface Unit {
  id: string;
  name: string;
  rentAmount: number;
  deposit: number;
  status: string;
}
export function OwnerTenants() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPropertyForm, setShowPropertyForm] = useState(false);
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [propertyName, setPropertyName] = useState("");
  const [propertyAddress, setPropertyAddress] = useState("");
  const [propertyCity, setPropertyCity] = useState("Bangalore");
  const [propertyLocality, setPropertyLocality] = useState("");
  const [unitPropertyId, setUnitPropertyId] = useState("");
  const [unitName, setUnitName] = useState("");
  const [unitRent, setUnitRent] = useState<number>(0);
  const [unitDeposit, setUnitDeposit] = useState<number>(0);
  const { data: tenantsData, isLoading: tenantsLoading } = useQuery<{ tenants: TenantRow[] }>({
    queryKey: ["owner-tenants"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/tenants");
      return res.data;
    }
  });
  const { data: propertiesData, isLoading: propertiesLoading } = useQuery<{ properties: Property[] }>({
    queryKey: ["owner-properties"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/properties");
      return res.data;
    }
  });
  const createTenantMutation = useMutation({
    mutationFn: async (data: { email: string; password: string; name?: string }) => {
      const res = await axios.post("/api/owner/tenants/create", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-tenants"] });
      setName("");
      setEmail("");
      setPassword("");
      setShowCreateForm(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message || "Failed to create resident account");
    }
  });
  const createPropertyMutation = useMutation({
    mutationFn: async (data: { name: string; address: string; city: string; locality: string }) => {
      const res = await axios.post("/api/owner/properties", data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      setPropertyName("");
      setPropertyAddress("");
      setPropertyLocality("");
      setShowPropertyForm(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message || "Failed to create property");
    }
  });
  const assignTenantMutation = useMutation({
    mutationFn: async (data: { tenantId: string; unitId: string }) => {
      const res = await axios.post(`/api/owner/tenants/${data.tenantId}/assign`, {
        unitId: data.unitId
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      setShowAssignForm(null);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message || "Failed to assign resident");
    }
  });
  const createUnitMutation = useMutation({
    mutationFn: async (data: { propertyId: string; name: string; rentAmount: number; deposit: number }) => {
      const res = await axios.post(`/api/owner/properties/${data.propertyId}/units`, {
        name: data.name,
        rentAmount: data.rentAmount,
        deposit: data.deposit
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["owner-properties"] });
      setUnitName("");
      setUnitRent(0);
      setUnitDeposit(0);
      setUnitPropertyId("");
      setShowUnitForm(false);
      setError(null);
    },
    onError: (err: any) => {
      setError(err?.response?.data?.error?.message || "Failed to create unit");
    }
  });
  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    createTenantMutation.mutate({ email, password, name: name || undefined });
  };
  const handleCreateProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propertyName || !propertyAddress || !propertyLocality) {
      setError("Please fill in all required fields");
      return;
    }
    createPropertyMutation.mutate({
      name: propertyName,
      address: propertyAddress,
      city: propertyCity,
      locality: propertyLocality
    });
  };
  const handleCreateUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!unitPropertyId || !unitName || !unitRent || !unitDeposit) {
      setError("All fields are required");
      return;
    }
    createUnitMutation.mutate({
      propertyId: unitPropertyId,
      name: unitName,
      rentAmount: unitRent,
      deposit: unitDeposit
    });
  };
  const tenants = tenantsData?.tenants || [];
  const properties = propertiesData?.properties || [];
  const allUnits = properties.flatMap((p) => p.units.map((u) => ({ ...u, propertyName: p.name })));
  return (
    <div className="space-y-10 animate-fade-in-up pb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
            Residents & Suites
            <Sparkles size={32} className="text-gold-500" />
          </h1>
          <p className="text-gold-700 font-light tracking-wide">Manage your exclusive properties and elite residents.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setShowUnitForm(!showUnitForm); setShowPropertyForm(false); setShowCreateForm(false); }}
            className="luxury-button-outline px-6 flex items-center gap-2"
          >
            <Plus size={18} />
            {showUnitForm ? "Cancel" : "Add Unit"}
          </button>
          <button
            onClick={() => { setShowPropertyForm(!showPropertyForm); setShowUnitForm(false); setShowCreateForm(false); }}
            className="luxury-button-outline px-6 flex items-center gap-2"
          >
            <Building size={18} />
            {showPropertyForm ? "Cancel" : "Add Property"}
          </button>
          <button
            onClick={() => { setShowCreateForm(!showCreateForm); setShowPropertyForm(false); setShowUnitForm(false); }}
            className="luxury-button px-6 flex items-center gap-2"
          >
            <UserPlus size={18} strokeWidth={2.5} />
            {showCreateForm ? "Cancel" : "Add Resident"}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {showUnitForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-10 border-gold-500/20">
              <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-8">New Unit / House</h2>
              <form onSubmit={handleCreateUnit} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Select Property</label>
                  <div className="relative group/input">
                    <Building className="absolute left-5 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none" size={18} />
                    <select
                      className="luxury-input !pl-14 appearance-none bg-navy-900"
                      value={unitPropertyId}
                      onChange={(e) => setUnitPropertyId(e.target.value)}
                      required
                    >
                      <option value="" className="bg-navy-900">Select Property...</option>
                      {properties.map((p) => (
                        <option key={p.id} value={p.id} className="bg-navy-900">
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none" size={16} />
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Unit Name (e.g. 101)</label>
                    <input
                      className="luxury-input"
                      value={unitName}
                      onChange={(e) => setUnitName(e.target.value)}
                      placeholder="e.g. 101"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Rent Amount (₹)</label>
                    <input
                      className="luxury-input"
                      value={unitRent || ""}
                      onChange={(e) => setUnitRent(Number(e.target.value))}
                      type="number"
                      placeholder="Amount"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Deposit Amount (₹)</label>
                    <input
                      className="luxury-input"
                      value={unitDeposit || ""}
                      onChange={(e) => setUnitDeposit(Number(e.target.value))}
                      type="number"
                      placeholder="Amount"
                      required
                    />
                  </div>
                </div>
                {error && <p className="text-sm font-medium text-red-400 italic">{error}</p>}
                <button
                  type="submit"
                  disabled={createUnitMutation.isPending}
                  className="luxury-button px-12"
                >
                  {createUnitMutation.isPending ? "Creating..." : "Add Unit"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
        {showPropertyForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-10 border-gold-500/20">
              <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-8">Suite Details</h2>
              <form onSubmit={handleCreateProperty} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Property Name</label>
                    <input
                      className="luxury-input"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="e.g., The Ritz Residence"
                      required
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Area / Locality</label>
                    <input
                      className="luxury-input"
                      value={propertyLocality}
                      onChange={(e) => setPropertyLocality(e.target.value)}
                      placeholder="e.g., Beverly Hills"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Address</label>
                  <input
                    className="luxury-input"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="Enter full building address..."
                    required
                  />
                </div>
                {error && <p className="text-sm font-medium text-red-400 italic">{error}</p>}
                <button
                  type="submit"
                  disabled={createPropertyMutation.isPending}
                  className="luxury-button px-12"
                >
                  {createPropertyMutation.isPending ? "Saving..." : "Save Property"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="glass-card p-10 border-gold-500/20">
              <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-8">Resident Profile</h2>
              <form onSubmit={handleCreateTenant} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Full Name</label>
                    <input
                      className="luxury-input"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g., Julian Sterling"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Partner Email</label>
                    <input
                      className="luxury-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      placeholder="julian@luxury.com"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Secure Key (Password)</label>
                  <input
                    className="luxury-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                    placeholder="Min. 6 characters"
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-sm font-medium text-red-400 italic">{error}</p>}
                <button
                  type="submit"
                  disabled={createTenantMutation.isPending}
                  className="luxury-button px-12"
                >
                  {createTenantMutation.isPending ? "Creating..." : "Generate Account"}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div
        className="glass-card overflow-hidden border-gold-500/10 luxury-shadow"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="p-8 border-b border-gold-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <h3 className="serif-heading text-2xl text-pearl-50 tracking-tight flex items-center gap-3">
            <Users size={24} className="text-gold-500" /> Executive Registry
          </h3>
          <div className="flex gap-3">
            <div className="relative group flex-1 sm:w-72">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gold-700 group-focus-within:text-gold-400 transition-colors" size={16} />
              <input
                className="w-full bg-navy-800/40 border border-gold-500/10 rounded-2xl pl-12 pr-4 py-3 text-sm text-pearl-50 focus:outline-none focus:ring-2 focus:ring-gold-500/20 transition-all font-light placeholder:text-gold-700"
                placeholder="Search by name or email..."
              />
            </div>
            <button className="px-5 py-3 bg-navy-800/60 border border-gold-500/10 rounded-xl text-[11px] font-semibold text-gold-700 hover:text-gold-400 hover:border-gold-500/20 transition-all flex items-center gap-2 uppercase tracking-widest luxury-glow">
              Filter <ChevronDown size={14} />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto custom-scrollbar bg-navy-950/20">
          <table className="min-w-full">
            <thead>
              <tr className="bg-navy-900/40 text-[10px] font-semibold text-gold-700 uppercase tracking-[0.2em]">
                <th className="px-10 py-6 text-left">Resident Profile</th>
                <th className="px-10 py-6 text-left">Location / Unit</th>
                <th className="px-10 py-6 text-left">Status</th>
                <th className="px-10 py-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-500/10">
              {tenantsLoading ? (
                <tr>
                  <td colSpan={4} className="px-10 py-32 text-center">
                    <div className="w-12 h-12 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto mb-6 luxury-glow" />
                    <p className="text-sm font-light text-gold-700 tracking-widest uppercase">Fetching Records...</p>
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.tenantId} className="group hover:bg-gold-500/5 transition-all duration-300">
                    <td className="px-10 py-8">
                      <div className="flex items-center gap-6">
                        <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-gold-500/20 to-gold-600/20 border border-gold-500/30 flex items-center justify-center font-serif text-2xl font-light text-gold-400 luxury-glow shadow-xl">
                          {t.tenantName[0]}
                        </div>
                        <div>
                          <div className="text-lg font-medium text-pearl-50 tracking-tight">{t.tenantName}</div>
                          <div className="text-xs font-light text-gold-700 mt-1.5 tracking-wide">{t.tenantEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-8">
                      {t.isAssigned ? (
                        <div className="space-y-1.5">
                          <div className="text-sm font-medium text-gold-400 tracking-tight flex items-center gap-2">
                            <Sparkles size={14} /> {t.unitName}
                          </div>
                          <div className="text-[10px] font-medium text-gold-700 uppercase tracking-widest">{t.propertyName} • {t.locality}</div>
                        </div>
                      ) : (
                        <span className="text-xs font-light text-gold-800 uppercase tracking-[0.2em] italic">Pending Assignment</span>
                      )}
                    </td>
                    <td className="px-10 py-8">
                      <span
                        className={`luxury-badge
                          ${t.status === "ACTIVE"
                            ? "border-emerald-800/30 text-emerald-800 bg-emerald-800/10"
                            : t.status === "NOTICE_PERIOD"
                              ? "border-gold-500/30 text-gold-500 bg-gold-500/10"
                              : "border-gold-700 text-gold-700 bg-navy-800/50"
                          }`}
                      >
                        <div className={`h-1.5 w-1.5 rounded-full mr-2.5 ${t.status === "ACTIVE" ? "bg-emerald-800" : t.status === "NOTICE_PERIOD" ? "bg-gold-500" : "bg-gold-700"}`} />
                        {t.status === "NOTICE_PERIOD" ? "Relocating" : t.status}
                      </span>
                    </td>
                    <td className="px-10 py-8">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => navigate(`/owner/tenants/${t.tenantId}`)}
                          className="p-4 bg-navy-800/60 border border-gold-500/10 rounded-2xl text-gold-700 hover:text-gold-400 hover:border-gold-500/30 transition-all flex items-center gap-3 luxury-glow"
                        >
                          <Eye size={18} />
                          <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">View</span>
                        </button>
                        {t.isAssigned && (
                          <button
                            onClick={() => window.open(`/api/owner/tenants/${t.tenantId}/lease`, '_blank')}
                            className="p-4 bg-navy-800/60 border border-gold-500/10 rounded-2xl text-gold-700 hover:text-gold-400 hover:border-gold-500/30 transition-all flex items-center gap-3 luxury-glow"
                          >
                            <FileText size={18} />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em]">Lease</span>
                          </button>
                        )}
                        {!t.isAssigned && (
                          <button
                            onClick={() => setShowAssignForm(t.tenantId)}
                            className="p-4 bg-gradient-to-br from-gold-500 to-gold-600 text-navy-950 rounded-2xl hover:scale-105 transition-all flex items-center gap-3 font-semibold luxury-glow shadow-xl"
                          >
                            <Link2 size={18} strokeWidth={3} />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Assign</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
      { }
      <AnimatePresence>
        {showAssignForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-navy-950/90 backdrop-blur-xl flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass-card max-w-lg w-full p-14 border-gold-500/20 luxury-shadow relative"
            >
              <button
                onClick={() => setShowAssignForm(null)}
                className="absolute top-8 right-8 text-gold-700 hover:text-gold-400 transition-colors"
              >
                <X size={24} />
              </button>
              <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-br from-gold-500/20 to-gold-600/20 text-gold-500 border border-gold-500/30 flex items-center justify-center mx-auto mb-10 luxury-glow shadow-2xl">
                <Link2 size={40} />
              </div>
              <h3 className="serif-heading text-4xl text-pearl-50 tracking-tight text-center mb-12">Assign Excellence</h3>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as any;
                  assignTenantMutation.mutate({ tenantId: showAssignForm, unitId: target.unit.value });
                }}
                className="space-y-10"
              >
                <div className="space-y-3">
                  <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Select Available Suite</label>
                  <select
                    name="unit"
                    className="luxury-input appearance-none bg-navy-900"
                    required
                  >
                    <option value="" className="bg-navy-900">Choose a suite...</option>
                    {allUnits
                      .filter((u) => u.status === "AVAILABLE")
                      .map((u) => (
                        <option key={u.id} value={u.id} className="bg-navy-900 text-pearl-50">
                          {u.name} • {u.propertyName} (₹{u.rentAmount.toLocaleString()})
                        </option>
                      ))}
                  </select>
                </div>
                {error && <p className="text-sm font-medium text-red-400 text-center italic">{error}</p>}
                <div className="flex flex-col gap-4">
                  <button
                    type="submit"
                    disabled={assignTenantMutation.isPending}
                    className="luxury-button w-full py-5 text-sm"
                  >
                    {assignTenantMutation.isPending ? "Finalizing..." : "Confirm Assignment"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAssignForm(null);
                      setError(null);
                    }}
                    className="w-full bg-navy-800/50 border border-gold-500/10 text-gold-700 font-medium py-5 rounded-2xl hover:text-gold-400 transition-all uppercase tracking-[0.2em] text-[10px]"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}