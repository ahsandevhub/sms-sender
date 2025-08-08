import { Inbox } from "lucide-react";

export default function EmptyState() {
  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
      <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
      <p className="text-gray-500">
        No logs yet. Messages will appear here once sent.
      </p>
    </div>
  );
}
