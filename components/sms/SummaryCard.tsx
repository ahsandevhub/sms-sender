interface SummaryCardProps {
  label: string;
  value: string | number;
  emoji?: boolean;
  valueClassName?: string;
}

export default function SummaryCard({
  label,
  value,
  emoji = false,
  valueClassName = "",
}: SummaryCardProps) {
  return (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
      <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
      <p
        className={`font-medium text-gray-800 ${
          emoji ? "emoji" : ""
        } ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}
