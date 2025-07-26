"use client";

import { countries, getCountryFlag } from "@/lib/countries";
import { motion } from "framer-motion";
import {
  ClipboardCheck,
  Clock,
  Inbox,
  ListOrdered,
  Loader2,
  Send,
  Smartphone,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export default function WhatsAppCampaign() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateSid, setSelectedTemplateSid] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [country, setCountry] = useState("");
  const [numbers, setNumbers] = useState("");
  const [logs, setLogs] = useState<
    { to: string; status: string; error?: string }[]
  >([]);
  const [campaignName, setCampaignName] = useState("");
  const [sending, setSending] = useState(false);
  const [contactCount, setContactCount] = useState(0);

  const numbersArray = useMemo(
    () =>
      numbers
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
    [numbers]
  );

  useEffect(() => {
    fetch("/api/whatsapp/templates")
      .then((res) => res.json())
      .then((data) => setTemplates(data.templates || []));
  }, []);

  const handleCountryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCountry = e.target.value;
    setCountry(selectedCountry);
    setNumbers("");

    try {
      const res = await fetch("/api/contacts/by-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry }),
      });

      const data = await res.json();
      if (res.ok) {
        setNumbers(data.numbers);
        setContactCount(data.numbers.split("\n").filter(Boolean).length);
      } else {
        setContactCount(0);
      }
    } catch {
      setContactCount(0);
    }
  };

  const handleTemplateChange = (sid: string) => {
    setSelectedTemplateSid(sid);
    const found = templates.find((tpl) => tpl.sid === sid);
    setSelectedTemplate(found || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setLogs([]);

    const payload = {
      name: campaignName,
      country,
      numbers: numbersArray,
      templateSid: selectedTemplateSid,
      language: selectedTemplate?.language || "en",
    };

    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setLogs(data.results || []);
      } else {
        setLogs([{ to: "N/A", status: "failed", error: data.error }]);
      }
    } catch (error: any) {
      setLogs([{ to: "N/A", status: "failed", error: error.message }]);
    }

    setSending(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="w-7 h-7 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">WhatsApp Campaign</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-3 space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Name
            </label>
            <input
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              required
              placeholder="Your campaign name here..."
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Template Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select WhatsApp Template
            </label>
            <select
              value={selectedTemplateSid}
              onChange={(e) => handleTemplateChange(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select a template</option>
              {templates.map((tpl) => (
                <option key={tpl.sid} value={tpl.sid}>
                  {tpl.friendlyName} ({tpl.language})
                </option>
              ))}
            </select>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <div className="bg-gray-50 border rounded p-4 text-sm text-gray-800">
              <strong>Template Preview:</strong>
              <p className="mt-2 whitespace-pre-wrap">
                {selectedTemplate.content?.text}
              </p>
            </div>
          )}

          {/* Country Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Country
            </label>
            <select
              value={country}
              onChange={handleCountryChange}
              required
              className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select country</option>
              {Object.values(countries).map((c) => (
                <option key={c.name} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Numbers Textarea */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Recipient Numbers (one per line)
              </label>
              <p className="text-sm text-gray-500">
                Total: <strong>{numbersArray.length}</strong>
              </p>
            </div>
            <textarea
              rows={6}
              placeholder="88017XXXXXXXX"
              value={numbers}
              onChange={(e) => setNumbers(e.target.value)}
              required
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:ring-2 focus:ring-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={sending}
            className={`w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition-colors ${
              sending
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
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
                Send WhatsApp
              </>
            )}
          </button>
        </form>

        {/* Logs Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6 h-fit">
          <div className="space-y-3 border-b border-gray-200 pb-5 mb-5">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="w-5 h-5 text-green-500" />
              <h4 className="text-base font-semibold text-gray-800">
                Campaign Summary
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Campaign Name
                </p>
                <p className="font-medium text-gray-800">
                  {campaignName || "N/A"}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-1">
                  Target Country
                </p>
                <p className="font-medium text-gray-800">
                  {`${getCountryFlag(country)} ${country}` || "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Logs */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-5 h-5 text-green-500" />
              <h4 className="text-base font-semibold text-gray-800">
                Delivery Logs
              </h4>
            </div>
            {logs.length === 0 ? (
              <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
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
                    className={`p-4 rounded-lg border ${
                      log.status === "sent"
                        ? "border-green-100 bg-green-50 hover:bg-green-100"
                        : "border-red-100 bg-red-50 hover:bg-red-100"
                    }`}
                  >
                    <div className="flex justify-between items-start">
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
                      {new Date().toLocaleString()}
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
