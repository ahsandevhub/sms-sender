"use client";

import { SubmitButton } from "@/components/sms/SubmitButton";
import { countries, getCountryFlag } from "@/lib/countries";
import {
  ClipboardCheck,
  Clock,
  Inbox,
  ListOrdered,
  MessageSquare,
  Send,
  Smartphone,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type LogEntry = { to: string; status: string; error?: string };

export default function WhatsAppCampaign() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplateSid, setSelectedTemplateSid] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [country, setCountry] = useState("");
  const [numbers, setNumbers] = useState("");
  const [campaignName, setCampaignName] = useState("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [sending, setSending] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [stopRequested, setStopRequested] = useState(false);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const numbersArray = useMemo(
    () =>
      numbers
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean),
    [numbers]
  );

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (sending) {
      setElapsed(0);
      timer = setInterval(() => setElapsed((e) => e + 1), 1000);
    }
    return () => clearInterval(timer);
  }, [sending]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCountryChange = async (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selected = e.target.value;
    setCountry(selected);
    setNumbers("");
    try {
      const res = await fetch("/api/contacts/by-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selected }),
      });
      const data = await res.json();
      if (res.ok) {
        setNumbers(data.numbers);
      }
    } catch {}
  };

  const handleFinalSubmit = async () => {
    setSending(true);
    setLogs([]);

    const payload = {
      name: campaignName, // used as variable in WhatsApp template
      campaignName,
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
    } catch (err: any) {
      setLogs([{ to: "N/A", status: "failed", error: err.message }]);
    }

    setSending(false);
  };

  const success = logs.filter((log) => log.status === "sent").length;
  const failed = logs.filter((log) => log.status === "failed").length;
  const successRate = logs.length
    ? ((success / logs.length) * 100).toFixed(1)
    : "0";

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Smartphone className="w-7 h-7 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-800">WhatsApp Campaign</h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirmModal(true);
          }}
          className="lg:col-span-3 space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200"
        >
          <FormField
            label="Campaign Name"
            value={campaignName}
            onChange={setCampaignName}
          />

          <FormField
            label="WhatsApp Template SID"
            value={selectedTemplateSid}
            onChange={setSelectedTemplateSid}
            placeholder="HXdaf08f0be74e8568890e8abba5ebd0d" // example SID
            required
          />

          <p className="text-sm text-gray-500">
            You can find your approved templates here:{" "}
            <a
              href="https://console.twilio.com/us1/develop/sms/content-template-builder"
              target="_blank"
              className="text-blue-600 underline"
            >
              Twilio Content Template Builder
            </a>
          </p>

          {selectedTemplate && (
            <div className="bg-gray-50 border rounded p-4 text-sm text-gray-800">
              <strong>Template Preview:</strong>
              <p className="mt-2 whitespace-pre-wrap">
                {selectedTemplate.content?.text}
              </p>
            </div>
          )}

          <SelectField
            label="Target Country"
            value={country}
            onChange={(val: string) => {
              setCountry(val);
              handleCountryChange({
                target: { value: val },
              } as React.ChangeEvent<HTMLSelectElement>);
            }}
            options={[
              { value: "", label: "Select country", disabled: true },
              ...Object.values(countries).map((c) => ({
                value: c.name,
                label: `${c.flag} ${c.name}`,
              })),
            ]}
          />

          <TextArea
            label="Recipient Numbers (one per line)"
            value={numbers}
            onChange={setNumbers}
            rows={6}
          />

          <SubmitButton
            sending={sending}
            onStop={() => setStopRequested(true)}
          />
        </form>

        {/* Right Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-200 space-y-6">
          <CampaignSummary name={campaignName} country={country} />

          {logs.length > 0 && (
            <DeliverySummary
              total={logs.length}
              success={success}
              failed={failed}
              rate={successRate}
            />
          )}

          <div>
            <div className="flex items-center gap-2 mb-3">
              <ListOrdered className="w-5 h-5 text-green-500" />
              <h4 className="text-base font-semibold text-gray-800">
                Delivery Logs
              </h4>
            </div>
            <div
              className="max-h-[500px] overflow-y-auto pr-2 space-y-2"
              ref={logsRef}
            >
              {logs.length === 0 ? (
                <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 text-center">
                  <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No logs yet. Messages will appear here.
                  </p>
                </div>
              ) : (
                logs.map((log, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      log.status === "sent"
                        ? "border-green-100 bg-green-50"
                        : "border-red-100 bg-red-50"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{log.to}</p>
                        {log.error && (
                          <p className="text-sm text-red-600">{log.error}</p>
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
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl border border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <ClipboardCheck className="w-5 h-5 text-green-500" />
              <h2 className="text-lg font-semibold text-gray-800">
                Confirm Campaign
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <SummaryCard label="Campaign Name" value={campaignName} />
              <SummaryCard
                label="Target Country"
                value={`${getCountryFlag(country)} ${country}`}
              />
              <SummaryCard
                label="Template"
                value={selectedTemplate?.friendlyName || "N/A"}
              />
              <SummaryCard label="Recipients" value={numbersArray.length} />
            </div>

            <div className="mb-5">
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-green-500" />
                <h4 className="text-sm font-medium text-gray-800">
                  Template Preview
                </h4>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedTemplate?.content?.text || "No preview available."}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  setShowConfirmModal(false);
                  await handleFinalSubmit();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                Confirm & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========== SHARED COMPONENTS ==========

const FormField = ({ label, value, onChange }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      required
    />
  </div>
);

const SelectField = ({ label, value, onChange, options }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="emoji w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500"
      required
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value} disabled={opt.disabled}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const TextArea = ({ label, value, onChange, rows = 6 }: any) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
      required
    />
  </div>
);

const SummaryCard = ({ label, value }: any) => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <p className="emoji font-medium text-gray-800">{value}</p>
  </div>
);

const CampaignSummary = ({ name, country }: any) => (
  <div className="space-y-3 border-b border-gray-200 pb-5 mb-5">
    <div className="flex items-center gap-2 mb-3">
      <ClipboardCheck className="w-5 h-5 text-green-500" />
      <h4 className="text-base font-semibold text-gray-800">
        Campaign Summary
      </h4>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SummaryCard label="Campaign Name" value={name || "N/A"} />
      <SummaryCard
        label="Target Country"
        value={`${getCountryFlag(country)} ${country}`}
      />
    </div>
  </div>
);

const DeliverySummary = ({ total, success, failed, rate }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 mb-3">
      <ListOrdered className="w-5 h-5 text-green-500" />
      <h4 className="text-base font-semibold text-gray-800">
        Delivery Summary
      </h4>
    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <SummaryCard label="Total Attempted" value={total} />
      <SummaryCard label="Successfully Sent" value={success} />
      <SummaryCard label="Failed" value={failed} />
      <SummaryCard label="Success Rate" value={`${rate}%`} />
    </div>
  </div>
);
