"use client";

import { countries, getCountryFlag } from "@/lib/countries";
import { motion } from "framer-motion";
import {
  Activity,
  ClipboardCheck,
  Clock,
  Inbox,
  ListOrdered,
  Loader2,
  Send,
  Smartphone,
} from "lucide-react";
import { useMemo, useState } from "react";

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
  const [twilioSender, setTwilioSender] = useState("+14312443960");
  const [contactCount, setContactCount] = useState(0);
  const totalRecipients = useMemo(() => {
    return numbers
      .split("\n")
      .map((num) => num.trim())
      .filter(Boolean).length;
  }, [numbers]);

  const messageLength = message.trim().length;
  const segments = messageLength === 0 ? 0 : Math.ceil(messageLength / 160);
  const numbersArray = numbers
    .split("\n")
    .map((num) => num.trim())
    .filter(Boolean);
  const estimatedCost = segments * numbersArray.length;

  const handleCountryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setNumbers(""); // reset first

    try {
      const res = await fetch("/api/contacts/by-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry }),
      });

      const data = await res.json();
      if (res.ok) {
        setNumbers(data.numbers);
        const count = data.numbers.split("\n").filter(Boolean).length;
        setContactCount(count);
      } else {
        setNumbers("");
        setContactCount(0);
      }
    } catch {
      setNumbers("");
      setContactCount(0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setLogs([]);

    const apiRoute =
      provider === "twilio"
        ? "/api/sms/twilio"
        : provider === "bulksmsbd"
        ? "/api/sms/bulksmsbd"
        : provider === "cheapglobalsms"
        ? "/api/sms/cheapglobalsms"
        : "/api/sms/esms";

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
          ...(provider === "twilio" && { fromNumber: twilioSender }),
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Your campaign name here..."
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

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
              <option value="esms">ESMS (Dianahost)</option>
              <option value="cheapglobalsms">CheapGlobalSMS</option>
            </select>
          </div>

          {provider === "twilio" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Twilio Sender Number
              </label>
              <select
                value={twilioSender}
                onChange={(e) => setTwilioSender(e.target.value)}
                required
                className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="" disabled>
                  Select sender number
                </option>
                <option value="+12295149122">
                  +12295149122 (Americus, GA, US)
                </option>
                <option value="+16292991476">
                  +16292991476 (Nashville, US)
                </option>
                <option value="+14312443960">+14312443960 (Canada, CA)</option>
                {/* Add more verified Twilio numbers */}
              </select>
            </div>
          )}

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Country
            </label>
            <select
              value={country}
              onChange={handleCountryChange}
              required
              className="emoji w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select country</option>
              {Object.values(countries).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Numbers */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Recipient Numbers (one per line)
              </label>
              <p className="text-sm text-gray-500 mt-1">
                Total Recipients: <strong>{totalRecipients}</strong>
              </p>
            </div>
            <textarea
              rows={8}
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
          {/* ✅ Summary Section Here */}
          <div className="space-y-3 border-b border-gray-200 pb-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="w-5 h-5 text-yellow-500" />
              <h4 className="text-base font-semibold text-gray-800">
                Campaign Summary
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Row 1 */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Campaign Name
                </p>
                <p className="font-medium text-gray-800">
                  {name || <span className="text-gray-400">N/A</span>}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Target Country
                </p>
                <p className="emoji font-medium text-gray-800">
                  {`${getCountryFlag(country)} ${country}` || (
                    <span className="text-gray-400">N/A</span>
                  )}
                </p>
              </div>

              {/* Row 2 */}
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Provider
                </p>
                <p className="font-medium text-gray-800">
                  {provider || <span className="text-gray-400">N/A</span>}
                </p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Total Recipients
                </p>
                <p className="font-medium text-gray-800">
                  {contactCount || numbersArray.length || (
                    <span className="text-gray-400">0</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {logs.length > 0 && (
            <div className="border-gray-200">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-5 h-5 text-yellow-500" />
                <h4 className="text-base font-semibold text-gray-800">
                  Delivery Summary
                </h4>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Total Attempted */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Total Attempted
                  </p>
                  <p className="font-medium text-gray-800">{logs.length}</p>
                </div>

                {/* Successfully Sent */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Successfully Sent
                  </p>
                  <p className="font-medium text-green-600">
                    {logs.filter((log) => log.status === "sent").length}
                  </p>
                </div>

                {/* Failed */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Failed
                  </p>
                  <p className="font-medium text-red-600">
                    {logs.filter((log) => log.status === "failed").length}
                  </p>
                </div>

                {/* Success Rate */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Success Rate
                  </p>
                  <p className="font-medium text-gray-800">
                    {(
                      (logs.filter((log) => log.status === "sent").length /
                        logs.length) *
                      100
                    ).toFixed(1)}
                    %
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Delivery Logs Section */}
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4">
              <ListOrdered className="w-5 h-5 text-yellow-500" />
              <h4 className="text-base font-semibold text-gray-800">
                Delivery Logs
              </h4>
            </div>

            {logs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  No logs yet. Messages will appear here once sent.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border transition-all ${
                      log.status === "sent"
                        ? "border-green-100 bg-green-50 hover:bg-green-100"
                        : "border-red-100 bg-red-50 hover:bg-red-100"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">{log.to}</p>
                        {log.error && (
                          <p className="mt-1 text-sm text-red-600">
                            {log.error}
                          </p>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 text-xs rounded-full font-medium ${
                          log.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {log.status === "sent" ? "Delivered" : "Failed"}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date().toLocaleString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
