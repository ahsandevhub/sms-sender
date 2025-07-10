"use client";

import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "./dashboard/layout";

export default function NotFound() {
  return (
    <DashboardLayout>
      <div className="flex items-center justify-center h-full">
        <div className="text-center bg-white p-10 rounded-xl shadow-xl border-2 border-gray-300 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="w-12 h-12 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">
            404 - Page Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            Sorry, the page you are looking for does not exist.
          </p>
          <Link href="/dashboard">
            <button className="px-6 py-2 rounded-md bg-yellow-500 hover:bg-yellow-600 text-white font-semibold transition-colors">
              Go to Homepage
            </button>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
