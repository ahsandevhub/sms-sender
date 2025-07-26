import { SmsLogEntry } from "@/types/sms";
import { Activity } from "lucide-react";
import SummaryCard from "./SummaryCard";

interface DeliverySummaryProps {
  totalAttempted: number;
  successfulSends: number;
  failedSends: number;
  successRate: string;
  logs: SmsLogEntry[];
}

export default function DeliverySummary({
  totalAttempted,
  successfulSends,
  failedSends,
  successRate,
}: DeliverySummaryProps) {
  return (
    <div className="border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-5 h-5 text-yellow-500" />
        <h4 className="text-base font-semibold text-gray-800">
          Delivery Summary
        </h4>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryCard label="Total Attempted" value={totalAttempted} />
        <SummaryCard
          label="Successfully Sent"
          value={successfulSends}
          valueClassName="text-green-600"
        />
        <SummaryCard
          label="Failed"
          value={failedSends}
          valueClassName="text-red-600"
        />
        <SummaryCard label="Success Rate" value={`${successRate}%`} />
      </div>
    </div>
  );
}
