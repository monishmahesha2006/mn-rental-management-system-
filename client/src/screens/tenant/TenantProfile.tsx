import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
    UserPlus,
    Trash2,
    User,
    Sparkles,
    ShieldCheck,
    ChevronDown,
    X,
    Camera,
    Users,
    Settings,
    Phone,
    Mail
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
interface Occupant {
    id: string;
    name: string;
    age?: number | null;
    relation?: string | null;
    phoneNumber?: string | null;
    aadharId?: string | null;
    photoUrl?: string | null;
}
interface TenantProfileData {
    unitId: string | null;
    occupants: Occupant[];
    name: string;
    phone: string | null;
    email: string;
}
export function TenantProfile() {
    const queryClient = useQueryClient();
    const [showAddForm, setShowAddForm] = useState(false);
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [userPhone, setUserPhone] = useState("");
    const [userName, setUserName] = useState("");
    const [name, setName] = useState("");
    const [age, setAge] = useState("");
    const [relation, setRelation] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [aadharId, setAadharId] = useState("");
    const [photoUrl, setPhotoUrl] = useState("");
    const { data: profileData, isLoading } = useQuery<TenantProfileData>({
        queryKey: ["tenant-profile"],
        queryFn: async () => {
            const res = await axios.get("/api/tenant/profile");
            const data = res.data;
            setUserName(data.name || "");
            setUserPhone(data.phone || "");
            return data;
        }
    });
    const updateProfileMutation = useMutation({
        mutationFn: async (data: { name: string; phone: string }) => {
            const res = await axios.patch("/api/tenant/profile", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
            setSuccess("Account information synchronized.");
            setShowProfileEdit(false);
            setTimeout(() => setSuccess(null), 3000);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.error?.message || "Failed to update record.");
        }
    });
    const addOccupantMutation = useMutation({
        mutationFn: async (data: {
            name: string;
            age?: number;
            relation?: string;
            phoneNumber?: string;
            aadharId?: string;
            photoUrl?: string;
        }) => {
            const res = await axios.post("/api/tenant/occupants", data);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
            setSuccess("Elite profile registry updated.");
            setShowAddForm(false);
            resetForm();
            setTimeout(() => setSuccess(null), 3000);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.error?.message || "Failed to update registry.");
        }
    });
    const deleteOccupantMutation = useMutation({
        mutationFn: async (occupantId: string) => {
            const res = await axios.delete(`/api/tenant/occupants/${occupantId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tenant-profile"] });
            setSuccess("Occupant removed from registry.");
            setTimeout(() => setSuccess(null), 3000);
        },
        onError: (err: any) => {
            setError(err?.response?.data?.error?.message || "Failed to revoke registry.");
        }
    });
    const resetForm = () => {
        setName("");
        setAge("");
        setRelation("");
        setPhoneNumber("");
        setAadharId("");
        setPhotoUrl("");
        setError(null);
    };
    const handleAddOccupant = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!name.trim()) {
            setError("Name is required");
            return;
        }
        addOccupantMutation.mutate({
            name: name.trim(),
            age: age ? Number(age) : undefined,
            relation: relation.trim() || undefined,
            phoneNumber: phoneNumber.trim() || undefined,
            aadharId: aadharId.trim() || undefined,
            photoUrl: photoUrl.trim() || undefined
        });
    };
    const handleUpdateProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfileMutation.mutate({ name: userName, phone: userPhone });
    };
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="h-16 w-16 border-2 border-gold-500 border-t-transparent rounded-full animate-spin luxury-glow" />
                <p className="text-[10px] font-bold text-gold-700 uppercase tracking-[0.3em]">Synching Secure Registry...</p>
            </div>
        );
    }
    return (
        <div className="space-y-10 animate-fade-in-up pb-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight mb-3 flex items-center gap-3">
                        Residency Profile
                        <ShieldCheck size={32} className="text-gold-500" />
                    </h1>
                    <p className="text-gold-700 font-light tracking-wide">Secure information registry for all distinguished household members.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowProfileEdit(!showProfileEdit)}
                        className="luxury-button-outline px-6 py-4 flex items-center gap-2"
                    >
                        <Settings size={18} /> Account Info
                    </button>
                    <button
                        onClick={() => {
                            setShowAddForm(!showAddForm);
                            if (showAddForm) resetForm();
                        }}
                        className="luxury-button px-8 flex items-center gap-2 group"
                    >
                        {showAddForm ? <X size={18} /> : <UserPlus size={18} strokeWidth={2.5} />}
                        {showAddForm ? "Cancel Registration" : "Enrole Occupant"}
                    </button>
                </div>
            </div>
            <AnimatePresence>
                {success && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 border-emerald-800/20 bg-emerald-800/10 mb-8 flex items-center gap-3">
                        <Sparkles size={18} className="text-emerald-800" />
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">{success}</p>
                    </motion.div>
                )}
                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass-card p-6 border-red-500/20 bg-red-900/20 mb-8 flex items-center gap-3">
                        <X size={18} className="text-red-400" />
                        <p className="text-xs font-bold text-red-400 uppercase tracking-widest italic">{error}</p>
                    </motion.div>
                )}
                {showProfileEdit && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-12">
                        <div className="glass-card p-10 border-gold-500/20 luxury-shadow">
                            <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-8 italic">Account Information</h2>
                            <form onSubmit={handleUpdateProfile} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Primary Resident Name</label>
                                        <input
                                            className="luxury-input"
                                            value={userName}
                                            onChange={(e) => setUserName(e.target.value)}
                                            placeholder="Your full name..."
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">WhatsApp / Phone Number</label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                className="luxury-input"
                                                value={userPhone}
                                                onChange={(e) => setUserPhone(e.target.value)}
                                                placeholder="+91..."
                                                required
                                            />
                                            <Phone size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gold-700" />
                                        </div>
                                        <p className="text-[10px] text-gold-700 italic px-1">* Real rent reminders & automations will be sent to this number.</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <button type="submit" disabled={updateProfileMutation.isPending} className="luxury-button px-14">
                                        {updateProfileMutation.isPending ? "Synchronizing..." : "Update Private Record"}
                                    </button>
                                    <div className="flex items-center gap-2 text-gold-700">
                                        <Mail size={14} />
                                        <span className="text-xs font-light">{profileData?.email}</span>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
                {showAddForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mb-12"
                    >
                        <div className="glass-card p-10 border-gold-500/20 luxury-shadow">
                            <h2 className="serif-heading text-3xl text-pearl-50 tracking-tight mb-8">Registry Enrollment</h2>
                            <form onSubmit={handleAddOccupant} className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Full Name</label>
                                        <input
                                            className="luxury-input"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., Alexander Sterling"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Relation</label>
                                        <div className="relative">
                                            <select
                                                className="luxury-input appearance-none bg-navy-900"
                                                value={relation}
                                                onChange={(e) => setRelation(e.target.value)}
                                            >
                                                <option value="" className="bg-navy-900">Select...</option>
                                                <option value="Self" className="bg-navy-900">Self</option>
                                                <option value="Spouse" className="bg-navy-900">Spouse</option>
                                                <option value="Child" className="bg-navy-900">Child</option>
                                                <option value="Parent" className="bg-navy-900">Parent</option>
                                                <option value="Sibling" className="bg-navy-900">Sibling</option>
                                                <option value="Other" className="bg-navy-900">Other</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-6 top-1/2 -translate-y-1/2 text-gold-700 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Age</label>
                                        <input
                                            type="number"
                                            className="luxury-input"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            placeholder="Enter age..."
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Contact Reference</label>
                                        <input
                                            type="tel"
                                            className="luxury-input"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Aadhar ID (Security)</label>
                                        <input
                                            className="luxury-input"
                                            value={aadharId}
                                            onChange={(e) => setAadharId(e.target.value)}
                                            placeholder="12-digit number..."
                                            maxLength={12}
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-medium text-gold-400 uppercase tracking-[0.15em] px-1">Visual Profile URL</label>
                                        <input
                                            type="url"
                                            className="luxury-input"
                                            value={photoUrl}
                                            onChange={(e) => setPhotoUrl(e.target.value)}
                                            placeholder="Secure image host link..."
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={addOccupantMutation.isPending}
                                    className="luxury-button px-14"
                                >
                                    {addOccupantMutation.isPending ? "Validating..." : "Confirm Enrollment"}
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="glass-card p-10 border-gold-500/10 luxury-shadow">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="serif-heading text-2xl text-pearl-50 tracking-tight flex items-center gap-3">
                        <Users size={24} className="text-gold-500" /> Residency Registry
                        <span className="text-sm font-light text-gold-700 ml-4 border-l border-gold-500/20 pl-4 uppercase tracking-[0.2em]">
                            {profileData?.occupants.length || 0} Distinguished Members
                        </span>
                    </h2>
                </div>
                {!profileData?.occupants || profileData.occupants.length === 0 ? (
                    <div className="text-center py-24 border border-dashed border-gold-500/10 rounded-[3rem]">
                        <User size={64} strokeWidth={1} className="mx-auto text-gold-800 mb-6 opacity-30" />
                        <h4 className="serif-heading text-2xl text-gold-700 tracking-tight">Empty Registry</h4>
                        <p className="text-[10px] font-bold text-gold-800 uppercase tracking-[0.2em] mt-3 italic">Establish your household records to finalize residency profile.</p>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
                        {profileData.occupants.map((occupant, idx) => (
                            <motion.div
                                key={occupant.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative glass-card p-8 border-gold-500/10 bg-navy-900/40 hover:bg-gold-500/5 transition-all duration-500 luxury-glow shadow-2xl"
                            >
                                <button
                                    onClick={() => {
                                        if (window.confirm("Are you sure you want to revoke this occupant's residency record?")) {
                                            deleteOccupantMutation.mutate(occupant.id);
                                        }
                                    }}
                                    className="absolute top-6 right-6 p-3 rounded-xl bg-navy-800/80 border border-gold-500/10 text-gold-800 hover:text-red-400 hover:border-red-500/30 transition-all z-10"
                                    title="Revoke Registry"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
                                    <div className="relative group/avatar shrink-0">
                                        {occupant.photoUrl ? (
                                            <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden border border-gold-500/20 luxury-glow shadow-2xl transition-transform duration-500 group-hover/avatar:scale-105">
                                                <img
                                                    src={occupant.photoUrl}
                                                    alt={occupant.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-32 h-32 rounded-[2.5rem] bg-navy-800/80 border border-gold-500/10 flex items-center justify-center text-gold-700 luxury-glow shadow-2xl group-hover/avatar:border-gold-500/30 transition-all">
                                                <User size={48} strokeWidth={1} />
                                            </div>
                                        )}
                                        <div className="absolute -bottom-2 -right-2 p-2 bg-gradient-to-br from-gold-500 to-gold-600 rounded-xl text-navy-950 shadow-xl opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                            <Camera size={14} />
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-6 pt-2 text-center sm:text-left">
                                        <div>
                                            <div className="text-[10px] font-bold text-gold-500 uppercase tracking-[0.25em] mb-2 flex items-center justify-center sm:justify-start gap-2">
                                                <Sparkles size={12} /> {occupant.relation || "Resident"}
                                            </div>
                                            <h3 className="serif-heading text-3xl text-pearl-50 tracking-tight group-hover:text-gold-400 transition-colors">
                                                {occupant.name}
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 pt-2 border-t border-gold-500/5">
                                            {occupant.age && (
                                                <div className="space-y-1">
                                                    <div className="text-[9px] font-bold text-gold-700 uppercase tracking-widest">Age</div>
                                                    <div className="text-sm font-medium text-pearl-50 tracking-tight">{occupant.age} Years</div>
                                                </div>
                                            )}
                                            {occupant.phoneNumber && (
                                                <div className="space-y-1">
                                                    <div className="text-[9px] font-bold text-gold-700 uppercase tracking-widest">Reference</div>
                                                    <div className="text-sm font-medium text-pearl-50 tracking-tight">{occupant.phoneNumber}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="glass-card p-8 border-gold-500/10 bg-navy-800/30 flex items-center gap-6"
            >
                <div className="h-12 w-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 luxury-glow border border-gold-400/20">
                    <ShieldCheck size={24} />
                </div>
                <div>
                    <h5 className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-1">Administrative Note</h5>
                    <p className="text-[11px] text-gold-700 font-light italic leading-relaxed">
                        All household registry information is securely processed and accessible by property management for safety and service excellence.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}