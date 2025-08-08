import { getCountryFlag } from "@/lib/countries";
import { ClipboardCheck } from "lucide-react";
import SummaryCard from "./SummaryCard";

interface CampaignSummaryProps {
  name: string;
  country: string;
  provider: string;
  contactCount: number;
  numbersArray: string[];
}

export default function CampaignSummary({
  name,
  country,
  provider,
  contactCount,
  numbersArray,
}: CampaignSummaryProps) {
  return (
    <div className="space-y-3 border-b border-gray-200 pb-5 mb-5">
      <div className="flex items-center gap-2 mb-3">
        <ClipboardCheck className="w-5 h-5 text-yellow-500" />
        <h4 className="text-base font-semibold text-gray-800">
          Campaign Summary
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <SummaryCard label="Campaign Name" value={name || "N/A"} />

        <SummaryCard
          label="Target Country"
          value={country ? `${getCountryFlag(country)} ${country}` : "N/A"}
          emoji
        />

        <SummaryCard label="Provider" value={provider || "N/A"} />

        <SummaryCard
          label="Total Recipients"
          value={contactCount || numbersArray.length || "0"}
        />
      </div>
    </div>
  );
}
