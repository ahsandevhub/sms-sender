"use client";

import { motion } from "framer-motion";
import { ClipboardList, Loader2, Send, Smartphone } from "lucide-react";
import { useState } from "react";

export default function SmsDashboard() {
  const [provider, setProvider] = useState("");
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<
    { to: string; status: string; error?: string }[]
  >([]);
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");

  const messageLength = message.trim().length;
  const segments = messageLength === 0 ? 0 : Math.ceil(messageLength / 160);
  const numbersArray = numbers
    .split("\n")
    .map((num) => num.trim())
    .filter(Boolean);
  const estimatedCost = segments * numbersArray.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setLogs([]);

    const apiRoute =
      provider === "twilio"
        ? "/api/sms/twilio"
        : provider === "bulksmsbd"
        ? "/api/sms/bulksmsbd"
        : "/api/sms/cheapglobalsms";

    try {
      const res = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          country,
          numbers: numbersArray,
          message: message.trim(),
          segments,
          estimatedCost,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setLogs([
          { to: "N/A", status: "failed", error: data.error || "Unknown error" },
        ]);
      } else {
        setLogs(data.results || []);
      }
    } catch (error: any) {
      setLogs([
        {
          to: "N/A",
          status: "failed",
          error: error.message || "Network error",
        },
      ]);
    }

    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="w-7 h-7 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">SMS Campaign</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200"
        >
          {/* Provider Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select SMS Provider
            </label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="" disabled>
                Select a provider
              </option>
              <option value="twilio">Twilio</option>
              <option value="bulksmsbd">BulkSMSBD</option>
              <option value="cheapglobalsms">CheapGlobalSMS</option>
            </select>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select country</option>
              <option value="US">USA</option>
              <option value="CA">Canada</option>
              <option value="AR">Argentina</option>
              <option value="CO">Colombia</option>
              <option value="SG">Singapore</option>
              <option value="MX">Mexico</option>
              <option value="PE">Peru</option>
              <option value="BD">Bangladesh</option>
              <option value="IN">India</option>
            </select>
          </div>

          {/* Numbers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Recipient Numbers (one per line)
            </label>
            <textarea
              rows={5}
              placeholder="88017XXXXXXXX"
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              rows={10}
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
            <p className="text-sm text-gray-500 mt-1">
              Characters: <strong>{messageLength}</strong> | Segments:{" "}
              <strong>{segments}</strong> | Estimated Cost:{" "}
              <strong>{estimatedCost}</strong> unit(s)
            </p>
          </div>

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

        {/* Logs */}
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
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${
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
