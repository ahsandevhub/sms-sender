import { SmsLogEntry } from "@/types/sms";
import { Clock } from "lucide-react";

export default function LogEntryItem({ log }: { log: SmsLogEntry }) {
  const isSuccess = log.status === "sent";

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isSuccess
          ? "border-green-100 bg-green-50 hover:bg-green-100"
          : "border-red-100 bg-red-50 hover:bg-red-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-800">{log.to}</p>
          {log.originalMessage && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Message:</span>{" "}
              <span className="italic">{log.originalMessage}</span>
            </p>
          )}
          {log.error && (
            <p className="mt-1 text-sm text-red-600">{log.error}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            isSuccess
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isSuccess ? "Delivered" : "Failed"}
        </span>
      </div>
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <Clock className="w-3 h-3 mr-1" />
        {(log.timestamp || new Date()).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    </div>
  );
}
