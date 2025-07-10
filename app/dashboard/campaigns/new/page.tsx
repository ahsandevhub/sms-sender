"use client";

import { motion } from "framer-motion";
import { ClipboardList, Loader2, Send, Smartphone } from "lucide-react";
import { useState } from "react";

export default function SmsDashboard() {
  const [provider, setProvider] = useState("twilio"); // default provider
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<
    { to: string; status: string; error?: string }[]
  >([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setLogs([]);

    const numbersArray = numbers
      .split("\n")
      .map((num) => num.trim())
      .filter(Boolean);

    const apiRoute =
      provider === "twilio" ? "/api/sms/twilio" : "/api/sms/bulksmsbd";

    const res = await fetch(apiRoute, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ numbers: numbersArray, message }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLogs([
        { to: "N/A", status: "failed", error: data.error || "Unknown error" },
      ]);
    } else {
      setLogs(data.results || []);
    }

    setSending(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Smartphone className="w-7 h-7 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">SMS Campaign</h2>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: Form */}
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200"
        >
          {/* Provider Dropdown */}
          <div>
            <label
              htmlFor="provider"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Select SMS Provider
            </label>
            <select
              id="provider"
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="twilio">Twilio</option>
              <option value="bulksmsbd">BulkSMSBD</option>
            </select>
          </div>

          {/* Numbers Input */}
          <div>
            <label
              htmlFor="numbers"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Recipient Numbers (one per line)
            </label>
            <textarea
              id="numbers"
              rows={5}
              placeholder="88017XXXXXXXX"
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              required
            />
          </div>

          {/* Message Input */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message Content
            </label>
            <textarea
              id="message"
              rows={10}
              placeholder="Type your message here..."
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={sending}
            className={`w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition-colors ${
              sending
                ? "bg-yellow-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {sending ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                </motion.div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Send Messages
              </>
            )}
          </button>
        </form>

        {/* Right: Logs */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4 h-fit">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Delivery Logs
            </h3>
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <p>No logs yet. Messages you send will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((log, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg ${
                    log.status === "sent"
                      ? "bg-green-50 border-l-4 border-green-500"
                      : "bg-red-50 border-l-4 border-red-500"
                  }`}
                >
                  <p className="font-medium">
                    <span className="text-gray-700">{log.to}</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full break-all ${
                        log.status === "sent"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {log.status}
                    </span>
                  </p>
                  {log.error && (
                    <p className="mt-1 text-sm text-red-600">{log.error}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
