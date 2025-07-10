"use client";

import {
  CheckCircle,
  ChevronRight,
  Clock,
  Inbox,
  Mail,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Campaign {
  _id: string;
  message: string;
  totalSent: number;
  successful: number;
  failed: number;
  createdAt: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data.campaigns);
        setLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Mail className="w-7 h-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Campaign History</h2>
        </div>
        <Link
          href={"/dashboard/campaigns/new"}
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border border-dashed border-yellow-300">
          <Inbox className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-yellow-800">
            No campaigns yet
          </h3>
          <p className="mt-1 text-sm text-yellow-600">
            Your campaign history will appear here
          </p>
        </div>
      ) : (
        <>
          {/* ✅ Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl shadow border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-green-500" /> Success
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-500" /> Failed
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Inbox className="w-4 h-4 text-blue-500" /> Total
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-800 uppercase tracking-wider">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-500" /> Date
                    </div>
                  </th>
                  <th className="px-6 py-3 relative">
                    <span className="sr-only">Details</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {campaigns.map((campaign) => (
                  <tr
                    key={campaign._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800 max-w-xs truncate">
                      {campaign.message}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        {campaign.successful}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        {campaign.failed}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {campaign.totalSent}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(campaign.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/dashboard/campaigns/${campaign._id}`}
                        className="text-yellow-600 hover:text-yellow-800 flex items-center gap-1"
                      >
                        Details <ChevronRight className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile Cards */}
          <div className="space-y-4 md:hidden">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm space-y-2"
              >
                <p className="text-sm font-medium text-gray-700 truncate">
                  <span className="font-semibold text-gray-900">Message:</span>{" "}
                  {campaign.message}
                </p>
                <p className="text-sm text-green-700">
                  ✅ Success:{" "}
                  <span className="font-semibold">{campaign.successful}</span>
                </p>
                <p className="text-sm text-red-700">
                  ❌ Failed:{" "}
                  <span className="font-semibold">{campaign.failed}</span>
                </p>
                <p className="text-sm text-blue-700">
                  📦 Total:{" "}
                  <span className="font-semibold">{campaign.totalSent}</span>
                </p>
                <p className="text-sm text-gray-600">
                  🕒{" "}
                  {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <Link
                  href={`/dashboard/campaigns/${campaign._id}`}
                  className="inline-flex items-center text-yellow-600 hover:underline text-sm font-medium"
                >
                  View Details <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
