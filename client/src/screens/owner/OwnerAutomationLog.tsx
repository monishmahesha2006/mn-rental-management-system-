import { useQuery } from "@tanstack/react-query";
import axios from "axios";
interface AutomationLog {
  id: string;
  type: string;
  channel: string;
  message?: string | null;
  createdAt: string;
  invoice: {
    id: string;
    dueDate: string;
    tenancy: {
      unit: {
        name: string;
        property: {
          name: string;
          locality: string;
        };
      };
    };
  };
}
export function OwnerAutomationLog() {
  const { data, isLoading } = useQuery<{ logs: AutomationLog[] }>({
    queryKey: ["owner-automation-log"],
    queryFn: async () => {
      const res = await axios.get("/api/owner/automation-log");
      return res.data;
    }
  });
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">Automation Log</h1>
        <p className="text-xs text-slate-600 mt-1">
          Audit trail of SMS/Email rent reminders sent 5 days before due dates.
        </p>
      </div>
      <div className="glass-card max-h-[480px] overflow-y-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-amber-50/60 text-slate-700 border-b border-linen sticky top-0">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">When</th>
              <th className="px-4 py-3 text-left font-semibold">Channel</th>
              <th className="px-4 py-3 text-left font-semibold">Unit</th>
              <th className="px-4 py-3 text-left font-semibold">Invoice</th>
              <th className="px-4 py-3 text-left font-semibold">Message</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                  Loading automation log...
                </td>
              </tr>
            )}
            {!isLoading &&
              data?.logs.map((log) => (
                <tr key={log.id} className="border-t border-linen hover:bg-amber-50/30 transition">
                  <td className="px-4 py-3 text-[11px] text-slate-700 font-medium">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[11px]">
                    <span className="inline-flex items-center rounded-full bg-indigo-50 border border-indigo-200/60 px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wide text-indigo-700">
                      {log.channel}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px]">
                    <div className="font-semibold text-slate-900">{log.invoice.tenancy.unit.property.name} / {log.invoice.tenancy.unit.name}</div>
                    <div className="text-[10px] text-slate-500">{log.invoice.tenancy.unit.property.locality}</div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-800">
                    <div className="font-medium text-slate-900">Invoice #{log.invoice.id.slice(0, 6)}...</div>
                    <div className="text-[10px] text-slate-500">
                      Due {new Date(log.invoice.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-700 max-w-xs">
                    {log.message || "Rent reminder sent automatically."}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}