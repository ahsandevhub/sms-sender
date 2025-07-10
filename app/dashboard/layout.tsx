"use client";

import { History, Home, MessageSquare, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

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

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <img
              src="/WeTrainEducation Icon.png"
              alt="icon"
              className="size-10"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-gray-800">WeSend</h1>
              <p className="text-[11px] text-gray-500 -mt-0.5">
                Multi Channel Promotion
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.location;
              return (
                <li key={item.location}>
                  <Link
                    href={item.location}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-yellow-500 text-slate-50 font-bold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">v1.0.0</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find((item) => item.location === pathname)?.label ||
              "Dashboard"}
          </h2>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}
