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
        <p className="text-xs text-slate-400">
          Audit trail of SMS/Email rent reminders sent 5 days before due dates.
        </p>
      </div>
      <div className="glass-card max-h-[480px] overflow-y-auto">
        <table className="min-w-full text-xs">
          <thead className="bg-slate-900/80 text-slate-400 sticky top-0">
            <tr>
              <th className="px-4 py-2 text-left font-medium">When</th>
              <th className="px-4 py-2 text-left font-medium">Channel</th>
              <th className="px-4 py-2 text-left font-medium">Unit</th>
              <th className="px-4 py-2 text-left font-medium">Invoice</th>
              <th className="px-4 py-2 text-left font-medium">Message</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Loading automation log...
                </td>
              </tr>
            )}
            {!isLoading &&
              data?.logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-800/80 hover:bg-slate-900/60">
                  <td className="px-4 py-2 text-[11px] text-slate-300">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-[11px]">
                    <span className="inline-flex items-center rounded-full bg-slate-900/80 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-300">
                      {log.channel}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-[11px]">
                    {log.invoice.tenancy.unit.property.name} / {log.invoice.tenancy.unit.name}
                    <div className="text-[10px] text-slate-500">{log.invoice.tenancy.unit.property.locality}</div>
                  </td>
                  <td className="px-4 py-2 text-[11px] text-slate-300">
                    <div>Invoice #{log.invoice.id.slice(0, 6)}...</div>
                    <div className="text-[10px] text-slate-500">
                      Due {new Date(log.invoice.dueDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-[11px] text-slate-300 max-w-xs">
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

