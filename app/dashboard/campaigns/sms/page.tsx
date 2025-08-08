"use client";

import { countries, getCountryFlag } from "@/lib/countries";
import {
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
  type: "sms" | "whatsapp" | "email" | "telegram";
  provider: string;
  senderId?: string;
  country: string;
  language: string;
  message: string;
  characters: number;
  segments: number;
  estimatedCost: number;
  totalSent: number;
  successful: number;
  failed: number;
  numbers: string[];
  results: {
    to: string;
    status: string;
    error?: string;
    message?: string;
  }[];
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
      type: "sms",
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
          <h2 className="text-2xl font-bold text-gray-800">
            SMS Campaign History
          </h2>
        </div>
        <Link
          href="/dashboard/campaigns/sms/new"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" /> New SMS Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
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

      {/* Table */}
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
        <div className="overflow-hidden rounded-xl shadow-sm border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Campaign
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
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
                {campaigns.map((c) => (
                  <tr key={c._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap max-w-64">
                      <div className="text-sm font-medium text-gray-900">
                        {c.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {c.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {c.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {c.provider}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {c.senderId || "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">
                      <div className="flex items-center gap-2">
                        <span className="emoji">
                          {getCountryFlag(c.country)}
                        </span>
                        <span>{c.country}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex gap-4">
                        <div className="text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {c.totalSent}
                          </div>
                          <div className="text-xs text-gray-500">Total</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-green-600">
                            {c.successful}
                          </div>
                          <div className="text-xs text-gray-500">Success</div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-medium text-red-600">
                            {c.failed}
                          </div>
                          <div className="text-xs text-gray-500">Failed</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                      ৳{c.estimatedCost?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(c.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/dashboard/campaigns/sms/${c._id}`}
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
      )}

      {/* Pagination */}
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
