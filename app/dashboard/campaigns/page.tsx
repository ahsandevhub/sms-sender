"use client";

import { countries, getCountryFlag } from "@/lib/countries";
import {
  BarChart2,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Globe,
  Inbox,
  Mail,
  RefreshCw,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Campaign {
  _id: string;
  name: string;
  country: string;
  message: string;
  totalSent: number;
  successful: number;
  failed: number;
  segments: number;
  estimatedCost: number;
  createdAt: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [country, setCountry] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const limit = 10;

  useEffect(() => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (country) params.append("country", country);
    if (from) params.append("from", from);
    if (to) params.append("to", to);

    setLoading(true);
    fetch(`/api/campaigns?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaigns(data.campaigns);
        setTotal(data.total);
        setLoading(false);
      });
  }, [page, country, from, to]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Mail className="w-7 h-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Campaign History</h2>
        </div>
        <Link
          href="/dashboard/campaigns/new"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" /> New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Country Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Globe className="h-4 w-4 text-gray-400" />
            </div>
            <select
              className="emoji block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
            >
              <option value="">All Countries</option>
              {Object.values(countries).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filters */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="From date"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Calendar className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="To date"
            />
          </div>

          <button
            onClick={() => {
              setCountry("");
              setFrom("");
              setTo("");
              setPage(1);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin h-12 w-12 rounded-full border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-12 bg-yellow-50 rounded-lg border border-dashed border-yellow-300">
          <Inbox className="mx-auto h-12 w-12 text-yellow-400" />
          <h3 className="mt-2 text-lg font-medium text-yellow-800">
            No campaigns found
          </h3>
          <p className="mt-1 text-sm text-yellow-600">
            {country || from || to
              ? "Try adjusting your filters"
              : "Create your first campaign to get started"}
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards */}
          <div className="space-y-3 md:hidden">
            {campaigns.map((campaign) => (
              <div
                key={campaign._id}
                className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {campaign.name}
                  </h3>
                  <span className="emoji text-2xl">
                    {getCountryFlag(campaign.country)}
                  </span>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-600">
                    <span className="font-medium">Total:</span>{" "}
                    {campaign.totalSent}
                  </div>
                  <div className="text-green-600">
                    <span className="font-medium">Success:</span>{" "}
                    {campaign.successful}
                  </div>
                  <div className="text-red-600">
                    <span className="font-medium">Failed:</span>{" "}
                    {campaign.failed}
                  </div>
                  <div className="text-yellow-600">
                    <span className="font-medium">Cost:</span> ৳
                    {campaign.estimatedCost?.toFixed(2)}
                  </div>
                </div>

                <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                  {campaign.message}
                </p>

                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(campaign.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/dashboard/campaigns/${campaign._id}`}
                    className="text-yellow-600 hover:text-yellow-800 text-sm font-medium flex items-center"
                  >
                    Details <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-white">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campaign
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        Country
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <BarChart2 className="w-4 h-4" />
                        Stats
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cost
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <tr key={campaign._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap max-w-48">
                        <div className="text-sm font-medium text-gray-900">
                          {campaign.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {campaign.message}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                        <div className="flex items-center gap-2">
                          <span className="emoji">
                            {getCountryFlag(campaign.country)}
                          </span>
                          <span>{campaign.country}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-4">
                          <div className="text-center">
                            <div className="text-sm font-medium text-gray-900">
                              {campaign.totalSent}
                            </div>
                            <div className="text-xs text-gray-500">Total</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-green-600">
                              {campaign.successful}
                            </div>
                            <div className="text-xs text-gray-500">Success</div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm font-medium text-red-600">
                              {campaign.failed}
                            </div>
                            <div className="text-xs text-gray-500">Failed</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                        ৳{campaign.estimatedCost?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(campaign.createdAt).toLocaleDateString(
                          "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/dashboard/campaigns/${campaign._id}`}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pagination Info */}
      {total > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
            <span className="font-medium">{Math.min(page * limit, total)}</span>{" "}
            of <span className="font-medium">{total}</span> campaigns
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => (p * limit < total ? p + 1 : p))}
              disabled={page * limit >= total}
              className="px-3 py-1.5 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
