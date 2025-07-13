"use client";

import {
  History,
  Home,
  Menu,
  MessageSquare,
  Settings,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { location: "/dashboard", icon: Home, label: "Dashboard" },
    {
      location: "/dashboard/campaigns",
      icon: MessageSquare,
      label: "Campaigns",
    },
    { location: "/dashboard/contacts", icon: Users, label: "Contacts" },
    { location: "/dashboard/history", icon: History, label: "History" },
    { location: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path: string) => pathname === path;

  const Sidebar = (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between md:justify-start">
        <div className="flex items-center gap-2">
          <img
            src="/WeTrainEducation Icon.png"
            alt="icon"
            className="h-10 w-auto"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">WeSend</h1>
            <p className="text-[11px] text-gray-500 -mt-0.5">
              Multi Channel Promotion
            </p>
          </div>
        </div>
        <button
          className="md:hidden text-gray-700"
          onClick={() => setSidebarOpen(false)}
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.location}>
              <Link
                href={item.location}
                className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive(item.location)
                    ? "bg-yellow-500 text-white font-bold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 text-xs text-gray-500">
        v1.0.0
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="relative z-50">{Sidebar}</div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0">
        {Sidebar}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find((item) => item.location === pathname)?.label ||
              "Dashboard"}
          </h2>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
