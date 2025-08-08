"use client";

import {
  ChevronDown,
  ChevronRight,
  History,
  Home,
  LogOut,
  MessageCircle,
  MessageSquare,
  Settings,
  UserCircle2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo, useState } from "react";

type NavItem = {
  location: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subItems?: {
    location: string;
    label: string;
  }[];
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    "/dashboard/campaigns": true,
  });

  const navItems: NavItem[] = [
    { location: "/dashboard", icon: Home, label: "Dashboard" },
    {
      location: "/dashboard/campaigns/whatsapp",
      icon: MessageCircle,
      label: "WhatsApp Campaigns",
    },
    {
      location: "/dashboard/campaigns/sms",
      icon: MessageSquare,
      label: "SMS Campaigns",
    },
    { location: "/dashboard/contacts", icon: Users, label: "Contacts" },
    { location: "/dashboard/history", icon: History, label: "History" },
    { location: "/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  const toggleItemExpand = (path: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [path]: !prev[path],
    }));
  };

  const isActive = (path: string) => pathname === path;

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      return (
        <div key={path} className="flex items-center">
          {index !== 0 && (
            <ChevronRight className="mx-1 w-4 h-4 text-gray-400" />
          )}
          <Link
            href={path}
            className={`capitalize ${
              index === segments.length - 1
                ? "text-gray-800 font-medium"
                : "text-gray-500 hover:text-gray-700 hover:underline"
            }`}
          >
            {seg.replace(/-/g, " ")}
          </Link>
        </div>
      );
    });
  }, [pathname]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-50">
            <Sidebar
              navItems={navItems}
              isActive={isActive}
              expandedItems={expandedItems}
              toggleItemExpand={toggleItemExpand}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0">
        <Sidebar
          navItems={navItems}
          isActive={isActive}
          expandedItems={expandedItems}
          toggleItemExpand={toggleItemExpand}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 hover:text-gray-700 mr-4"
              aria-label="Open menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>

          {/* Breadcrumbs */}
          <div className="text-sm font-medium flex items-center overflow-x-auto whitespace-nowrap">
            {breadcrumbs}
          </div>

          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-medium">Admin User</span>
              <span className="text-xs text-gray-500">admin@wesend.com</span>
            </div>
            <button className="flex items-center gap-1 p-1 rounded-full hover:bg-gray-100">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600">
                <UserCircle2 className="w-5 h-5" />
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          {children}
        </main>
      </div>
    </div>
  );
}

type SidebarProps = {
  navItems: NavItem[];
  isActive: (path: string) => boolean;
  expandedItems: Record<string, boolean>;
  toggleItemExpand: (path: string) => void;
  onClose?: () => void;
};

function Sidebar({
  navItems,
  isActive,
  expandedItems,
  toggleItemExpand,
  onClose,
}: SidebarProps) {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64">
      {/* Logo */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/WeTrainEducation Icon.png"
            alt="WeSend Logo"
            className="h-10 w-auto"
          />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-gray-800">WeSend</h1>
            <p className="text-[11px] text-gray-500 -mt-0.5">
              Multi Channel Promotion
            </p>
          </div>
        </Link>
        {onClose && (
          <button
            className="text-gray-700"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.location}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleItemExpand(item.location)}
                    className={`flex items-center justify-between w-full p-3 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.location)
                        ? "bg-yellow-50 text-yellow-600"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.label}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        expandedItems[item.location] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedItems[item.location] && (
                    <ul className="ml-4 mt-1 space-y-1">
                      {item.subItems.map((subItem) => (
                        <li key={subItem.location}>
                          <Link
                            href={subItem.location}
                            className={`flex items-center gap-3 p-2 pl-8 rounded-lg text-sm font-medium transition-colors ${
                              isActive(subItem.location)
                                ? "bg-yellow-500 text-white font-bold"
                                : "hover:bg-gray-100 text-gray-700"
                            }`}
                          >
                            {subItem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={item.location}
                  className={`flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.location)
                      ? "bg-yellow-500 text-white font-bold"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4 text-sm">
        <button
          onClick={() => console.log("Logout logic here")}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 w-full p-2 rounded-lg hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
}
