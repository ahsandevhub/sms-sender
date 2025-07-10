"use client";

import { motion } from "framer-motion";
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
import Link from "next/link";

export default function DashboardPage() {
  // Mock data
  const stats = {
    totalSent: 12453,
    successful: 11208,
    failed: 1245,
    pending: 542,
    channels: [
      { name: "SMS", value: 6842, color: "bg-yellow-500" },
      { name: "WhatsApp", value: 3210, color: "bg-green-500" },
      { name: "Email", value: 1987, color: "bg-blue-500" },
      { name: "Telegram", value: 414, color: "bg-purple-500" },
    ],
    recentCampaigns: [
      {
        id: 1,
        name: "Summer Sale",
        date: "2023-06-15",
        status: "completed",
        channel: "SMS/WhatsApp",
      },
      {
        id: 2,
        name: "New Product Launch",
        date: "2023-06-10",
        status: "completed",
        channel: "Email",
      },
      {
        id: 3,
        name: "Flash Sale",
        date: "2023-06-05",
        status: "completed",
        channel: "All Channels",
      },
    ],
    userActivity: [
      { name: "Active", value: 42, color: "bg-yellow-500" },
      { name: "Inactive", value: 8, color: "bg-gray-300" },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Dashboard Overview</h2>
        <div className="flex space-x-2">
          <Link
            href={"/dashboard/campaigns/new"}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            New Campaign
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Sent"
          value={stats.totalSent.toLocaleString()}
          icon={<Inbox className="text-yellow-500" />}
          trend="up"
        />
        <StatCard
          title="Successful"
          value={stats.successful.toLocaleString()}
          icon={<CheckCircle className="text-green-500" />}
          percentage={Math.round((stats.successful / stats.totalSent) * 100)}
        />
        <StatCard
          title="Failed"
          value={stats.failed.toLocaleString()}
          icon={<AlertCircle className="text-red-500" />}
          percentage={Math.round((stats.failed / stats.totalSent) * 100)}
        />
        <StatCard
          title="Pending"
          value={stats.pending.toLocaleString()}
          icon={<Clock className="text-yellow-500" />}
          trend="down"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Channel Distribution */}
        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Channel Distribution
          </h3>
          <div className="space-y-2">
            {stats.channels.map((channel) => (
              <div
                key={channel.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full ${channel.color}`}
                  ></div>
                  <span className="text-sm text-gray-700">{channel.name}</span>
                </div>
                <span className="text-sm font-medium">
                  {channel.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Campaign Progress */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Recent Campaigns
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">
                    Campaign
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">
                    Channel
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-800 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.recentCampaigns.map((campaign) => (
                  <tr key={campaign.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">
                      {campaign.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {campaign.date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                      {campaign.channel}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          campaign.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {campaign.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* User Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            User Activity
          </h3>
          <div className="flex items-center justify-center h-64">
            <DoughnutChart data={stats.userActivity} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <BarChart2 className="w-5 h-5" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickActionCard
              icon={<MessageSquare className="w-6 h-6 text-green-500" />}
              title="WhatsApp Blast"
              action={() => console.log("WhatsApp")}
            />
            <QuickActionCard
              icon={<Smartphone className="w-6 h-6 text-blue-500" />}
              title="SMS Campaign"
              action={() => console.log("SMS")}
            />
            <QuickActionCard
              icon={<Mail className="w-6 h-6 text-red-500" />}
              title="Email Newsletter"
              action={() => console.log("Email")}
            />
            <QuickActionCard
              icon={<Send className="w-6 h-6 text-purple-500" />}
              title="Telegram Broadcast"
              action={() => console.log("Telegram")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Updated StatCard without Tremor
function StatCard({ title, value, icon, percentage, trend }: any) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-semibold text-gray-800">{value}</p>
        </div>
        {percentage ? (
          <div className="relative w-12 h-12">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke={title === "Failed" ? "#ef4444" : "#f59e0b"}
                strokeWidth="3"
                strokeDasharray={`${percentage} 100`}
                strokeLinecap="round"
                transform="rotate(-90 18 18)"
              />
            </svg>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-medium text-gray-600">
              {percentage}%
            </span>
          </div>
        ) : (
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-600">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

// QuickActionCard remains the same
function QuickActionCard({ icon, title, action }: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      onClick={action}
      className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg border border-gray-200 hover:bg-yellow-100 transition-colors"
    >
      <div className="p-3 mb-2 rounded-full bg-white shadow-sm">{icon}</div>
      <span className="text-sm font-medium text-gray-800">{title}</span>
    </motion.button>
  );
}

// DoughnutChart remains the same
function DoughnutChart({ data }: any) {
  const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
  const circumference = 2 * Math.PI * 40;

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#fef3c7"
          strokeWidth="10"
        />
        {/* Segments */}
        {data.map((item: any, index: number) => {
          const percent = item.value / total;
          const offset = circumference * (1 - percent);
          const prevPercent = data
            .slice(0, index)
            .reduce((sum: number, i: any) => sum + i.value / total, 0);
          const dashOffset = circumference * (1 - prevPercent);

          return (
            <circle
              key={item.name}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={index === 0 ? "#f59e0b" : "#fbbf24"}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <span className="text-2xl font-bold text-gray-800">{total}</span>
          <span className="block text-xs text-gray-500">Total Users</span>
        </div>
      </div>
    </div>
  );
}
