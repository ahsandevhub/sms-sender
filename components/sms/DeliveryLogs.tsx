import { SmsLogEntry } from "@/types/sms";
import { ListOrdered } from "lucide-react";
import EmptyState from "./EmptyState";
import LogEntryItem from "./LogEntryItem";

export default function DeliveryLogs({ logs }: { logs: SmsLogEntry[] }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-4">
        <ListOrdered className="w-5 h-5 text-yellow-500" />
        <h4 className="text-base font-semibold text-gray-800">Delivery Logs</h4>
      </div>

      {logs.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-2">
          {logs.map((log, i) => (
            <LogEntryItem key={i} log={log} />
          ))}
        </div>
      )}
    </div>
  );
}
