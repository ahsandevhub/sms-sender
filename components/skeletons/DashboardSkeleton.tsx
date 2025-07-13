import {
  AlertCircle,
  BarChart2,
  CheckCircle,
  Clock,
  Inbox,
  Mail,
  MessageSquare,
  PieChart,
  Send,
  Smartphone,
  Users,
} from "lucide-react";

export default function DashboardSkeleton() {
  const statIcons = [
    <Inbox className="text-yellow-500" />,
    <CheckCircle className="text-green-500" />,
    <AlertCircle className="text-red-500" />,
    <Clock className="text-yellow-500" />,
  ];

  const quickActionIcons = [
    <MessageSquare className="w-6 h-6 text-green-500" />,
    <Smartphone className="w-6 h-6 text-blue-500" />,
    <Mail className="w-6 h-6 text-red-500" />,
    <Send className="w-6 h-6 text-purple-500" />,
  ];

  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="h-8 bg-gray-200 rounded w-1/4 max-w-xs" />
        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 w-40 h-10" />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded-xl shadow border border-gray-200"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24" />
                <div className="h-7 bg-gray-300 rounded w-20" />
              </div>
              {i < 2 ? (
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full bg-gray-200" />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="h-3 w-6 bg-gray-300 rounded" />
                  </div>
                </div>
              ) : (
                <div className="p-2 rounded-full bg-gray-100">
                  {statIcons[i]}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="w-5 h-5 text-gray-300" />
            <div className="h-5 bg-gray-200 rounded w-32" />
          </div>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-200" />
                  <div className="h-3 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-3 bg-gray-200 rounded w-8" />
              </div>
            ))}
          </div>
        </div>

        {/* Recent Campaigns */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-gray-300" />
            <div className="h-5 bg-gray-200 rounded w-32" />
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-4 gap-4 mb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-5 bg-gray-200 rounded" />
              ))}
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="grid grid-cols-4 gap-4">
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded" />
                <div className="h-4 bg-gray-100 rounded w-16" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Activity */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <Users className="w-5 h-5 text-gray-300" />
            <div className="h-5 bg-gray-200 rounded w-24" />
          </div>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 rounded-full bg-gray-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-6 bg-gray-200 rounded w-12 mx-auto mb-1" />
                  <div className="h-3 bg-gray-200 rounded w-20 mx-auto" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-gray-300" />
            <div className="h-5 bg-gray-200 rounded w-24" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg border border-gray-200"
              >
                <div className="p-3 mb-2 rounded-full bg-white shadow-sm">
                  {quickActionIcons[i]}
                </div>
                <div className="h-4 bg-gray-200 rounded w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
