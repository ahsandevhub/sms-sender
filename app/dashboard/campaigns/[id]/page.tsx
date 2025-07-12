"use client";

import { getCountryFlag } from "@/lib/countries";
import { motion } from "framer-motion";
import {
  CheckCircle,
  ChevronLeft,
  Clock,
  DollarSign,
  Globe,
  Inbox,
  Mail,
  MessageCircle,
  Smartphone,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function CampaignDetails() {
  const { id } = useParams();
  const [campaign, setCampaign] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/campaigns/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setCampaign(data.campaign);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="text-yellow-500"
        >
          <Clock className="w-8 h-8 animate-spin" />
        </motion.div>
      </div>
    );
  }

  if (!campaign) return <p className="p-6 text-gray-600">Campaign not found</p>;

  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/campaigns"
          className="text-yellow-600 hover:text-yellow-800"
        >
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex items-center gap-3">
          <Mail className="w-7 h-7 text-yellow-500" />
          <h2 className="text-2xl font-bold text-gray-800">Campaign Details</h2>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
        {/* Primary Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Name"
            value={campaign.name}
            icon={<MessageCircle className="text-yellow-500" />}
          />
          <StatCard
            title="Country"
            value={
              <span className="flex items-center gap-2">
                <span className="emoji">
                  {getCountryFlag(campaign.country)}
                </span>
                {campaign.country}
              </span>
            }
            icon={<Globe className="text-blue-500" />}
          />
          <StatCard
            title="Estimated Cost"
            value={`৳${campaign.estimatedCost?.toFixed(2)}`}
            icon={<DollarSign className="text-green-500" />}
          />
          <StatCard
            title="Segments"
            value={campaign.segments}
            icon={<MessageCircle className="text-purple-500" />}
          />
        </div>

        {/* Delivery Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Sent"
            value={campaign.totalSent}
            icon={<Inbox className="text-yellow-500" />}
          />
          <StatCard
            title="Successful"
            value={campaign.successful}
            icon={<CheckCircle className="text-green-500" />}
            percentage={Math.round(
              (campaign.successful / campaign.totalSent) * 100
            )}
          />
          <StatCard
            title="Failed"
            value={campaign.failed}
            icon={<XCircle className="text-red-500" />}
            percentage={Math.round(
              (campaign.failed / campaign.totalSent) * 100
            )}
          />
          <StatCard
            title="Created At"
            value={new Date(campaign.createdAt).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
            icon={<Clock className="text-blue-500" />}
          />
        </div>

        {/* Message Content */}
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-sm font-medium text-yellow-700 mb-2">
            Message Content
          </h3>
          <p className="text-gray-800 whitespace-pre-line">
            {campaign.message}
          </p>
        </div>

        {/* Delivery Logs */}
        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-yellow-500" />
            Delivery Results
          </h3>
          <div className="space-y-3">
            {campaign.results.map((r: any, i: number) => (
              <div
                key={i}
                className={`p-4 rounded-lg ${
                  r.status === "sent"
                    ? "bg-green-50 border-l-4 border-green-500"
                    : "bg-red-50 border-l-4 border-red-500"
                }`}
              >
                <p className="font-medium">
                  <span className="text-gray-700">{r.to}</span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full break-all ${
                      r.status === "sent"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {r.status}
                  </span>
                </p>
                {r.error && (
                  <p className="mt-1 text-sm text-red-600 break-all">
                    {r.error}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, percentage }: any) {
  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl font-semibold text-gray-800 break-all">
            {value}
          </p>
        </div>
        {percentage !== undefined ? (
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
                stroke={title === "Failed" ? "#ef4444" : "#10b981"}
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
