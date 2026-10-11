import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Upload, FileText, CheckCircle, ExternalLink, Lock } from "lucide-react";
interface Doc {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
}
export function TenantVault() {
  const queryClient = useQueryClient();
  const [docType, setDocType] = useState("ID_PROOF");
  const [docName, setDocName] = useState("");
  const { data: docsData, isLoading } = useQuery<{ documents: Doc[] }>({
    queryKey: ["tenant-documents"],
    queryFn: async () => (await axios.get("/api/tenant/documents")).data
  });
  const uploadMutation = useMutation({
    mutationFn: async (vars: any) => await axios.post("/api/tenant/documents/upload", vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-documents"] });
      setDocName("");
    }
  });
  const handleMockUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docName) return;
    uploadMutation.mutate({ name: docName, type: docType });
  };
  return (
    <div className="space-y-10 animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <div className="flex items-center gap-3 text-gold-500 mb-2">
            <Lock size={18} />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em]">End-to-End Encrypted</span>
          </div>
          <h1 className="serif-heading text-5xl text-pearl-50 tracking-tight">Digital Vault</h1>
          <p className="text-gold-700 font-light mt-2 max-w-lg">
            Securely manage your identity documents, lease agreements, and compliance certifications.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="glass-card p-8 border-gold-500/20 bg-gold-500/5">
            <h3 className="serif-heading text-xl text-pearl-50 mb-6">Sensitive Upload</h3>
            <form onSubmit={handleMockUpload} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Document Label</label>
                <input
                  value={docName} onChange={(e) => setDocName(e.target.value)}
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                  placeholder="e.g. Aadhaar Card" required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Type</label>
                <select
                  value={docType} onChange={(e) => setDocType(e.target.value)}
                  className="w-full bg-navy-950/50 border border-gold-500/20 rounded-xl py-3 px-4 text-pearl-50"
                >
                  <option value="ID_PROOF">Identity Proof</option>
                  <option value="AGREEMENT">Lease Agreement</option>
                  <option value="POLICE_VERIFICATION">Police Verification</option>
                  <option value="OTHER">Other Document</option>
                </select>
              </div>
              <button type="submit" className="luxury-button w-full">
                <Upload size={18} />
                Secure Upload
              </button>
            </form>
          </div>
          <div className="glass-card p-8 border-emerald-800/20 bg-emerald-800/5">
            <div className="flex items-center gap-4 text-emerald-400 mb-4">
              <ShieldCheck size={32} />
              <div className="serif-heading text-lg">Trust Level: Verified</div>
            </div>
            <p className="text-xs text-gold-700 leading-relaxed">
              Your KYC compliance is complete. Your profile is rated "Platinum" for priority service requests.
            </p>
          </div>
        </div>
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 content-start">
          {docsData?.documents.map((doc) => (
            <motion.div
              key={doc.id}
              className="glass-card p-6 border-gold-500/10 flex items-center justify-between group hover:bg-gold-500/5 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-navy-900 border border-gold-500/10 flex items-center justify-center text-gold-500">
                  <FileText size={20} />
                </div>
                <div>
                  <div className="text-pearl-50 font-medium text-sm">{doc.name}</div>
                  <div className="text-[9px] text-gold-700 uppercase tracking-widest mt-1">{doc.type}</div>
                </div>
              </div>
              <a
                href={doc.url} target="_blank" rel="noreferrer"
                className="p-2 text-gold-700 hover:text-gold-500 transition-colors"
              >
                <ExternalLink size={18} />
              </a>
            </motion.div>
          ))}
          {docsData?.documents.length === 0 && (
            <div className="md:col-span-2 py-20 text-center border-2 border-dashed border-gold-500/10 rounded-3xl">
              <FileText className="mx-auto text-gold-700/20 mb-4" size={48} />
              <p className="text-gold-700 font-medium italic">No documents in the vault yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}