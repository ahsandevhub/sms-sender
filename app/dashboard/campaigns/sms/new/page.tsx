"use client";

import { countries, getCountryFlag, type Provider } from "@/lib/countries";
import {
  Activity,
  ClipboardCheck,
  Clock,
  Inbox,
  Languages,
  ListOrdered,
  Loader2,
  MessageSquare,
  Send,
  Smartphone,
  Undo2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

type LogEntry = {
  to: string;
  status: "sent" | "failed";
  error?: string;
  timestamp?: Date;
};

export default function SmsDashboard() {
  const stopRequestedRef = useRef(false);
  const [provider, setProvider] = useState<Provider | "">("");
  const [name, setName] = useState("OFF ");
  const [country, setCountry] = useState("");
  const [numbers, setNumbers] = useState("");
  const [message, setMessage] = useState("");
  const [twilioSender, setTwilioSender] = useState("+14312443960");
  const [dynamicMode, setDynamicMode] = useState(false);
  const [csvText, setCsvText] = useState("");
  const [originalMessage, setOriginalMessage] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);
  const [autoTranslate, setAutoTranslate] = useState(false);
  const [sending, setSending] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsRef = useRef<HTMLDivElement | null>(null);
  const [autoSelectedProvider, setAutoSelectedProvider] = useState<
    Provider | ""
  >("");

  const numbersArray = useMemo(
    () =>
      numbers
        .split("\n")
        .map((num) => num.trim())
        .filter(Boolean),
    [numbers]
  );

  const totalRecipients = useMemo(() => {
    if (dynamicMode) {
      return csvText
        .split("\n")
        .slice(1) // Skip the CSV header
        .map((row) => row.trim())
        .filter(Boolean).length;
    }
    return numbersArray.length;
  }, [dynamicMode, csvText, numbersArray]);

  const messageLength = message.trim().length;
  const isUnicode = /[^\u0000-\u007F]/.test(message); // Checks for non-ASCII characters
  const singleLimit = isUnicode ? 70 : 160;
  const multipartLimit = isUnicode ? 67 : 153;

  const segments =
    messageLength === 0
      ? 0
      : messageLength <= singleLimit
      ? 1
      : Math.ceil(messageLength / multipartLimit);

  const rate = countries[country]?.smsRate?.[provider as Provider] ?? 0;

  const estimatedCost = segments * totalRecipients * rate;
  const estimatedCostBDT = estimatedCost * 120;

  const successfulSends = logs.filter((log) => log.status === "sent").length;
  const failedSends = logs.filter((log) => log.status === "failed").length;
  const successRate =
    logs.length > 0 ? ((successfulSends / logs.length) * 100).toFixed(1) : "0";
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const translateMessage = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    if (targetLang === "en") return text;

    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ q: text, source: "en", target: targetLang }),
      });

      const data = await res.json();
      console.log("[Translation Result]", data);
      return data.translatedText || text;
    } catch (err) {
      console.error("Translation failed:", err);
      return text;
    }
  };

  useEffect(() => {
    const translateIfNeeded = async () => {
      if (!autoTranslate || !message || !country) return;

      const lang = countries[country]?.language || "en";
      if (lang === "en") return;

      setIsTranslating(true);
      const translated = await translateMessage(message, lang);
      setMessage(translated);
      setIsTranslating(false);
    };

    translateIfNeeded();
  }, [autoTranslate, country]);

  useEffect(() => {
    if (!country) return;
    const recommended = countries[country]?.recommended;
    if (!provider || provider === autoSelectedProvider) {
      if (recommended) {
        setProvider(recommended);
        setAutoSelectedProvider(recommended);
      }
    }
  }, [country]);

  useEffect(() => {
    if (logsRef.current) {
      logsRef.current.scrollTop = logsRef.current.scrollHeight;
    }
  }, [logs]);

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

      if (!res.ok) throw new Error("Failed to fetch contacts");

      const data = await res.json();
      setNumbers(data.numbers || "");
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setNumbers("");
    }
  };

  const handleFinalSubmit = async () => {
    setSending(true);
    setLogs([]);

    if (!provider || !name || !country || !message) {
      setLogs([
        {
          to: "N/A",
          status: "failed",
          error: "Please fill all required fields",
          timestamp: new Date(),
        },
      ]);
      setSending(false);
      return;
    }

    if (provider === "bulksmsbd" && dynamicMode) {
      await handleBulkSMSDynamic();
      return;
    }

    await handleRegularSMS();
  };

  const handleBulkSMSDynamic = async () => {
    try {
      const res = await fetch("/api/sms/bulksmsbd/dynamic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          country,
          template: message.trim(),
          csv: csvText.trim(),
          language: countries[country]?.language || "en",
        }),
      });

      const data = await res.json();
      const timestampedLogs = (data.results || []).map((log: LogEntry) => ({
        ...log,
        timestamp: new Date(),
      }));

      if (!res.ok) {
        setLogs([
          {
            to: "N/A",
            status: "failed",
            error: data.error || "Unknown error",
            timestamp: new Date(),
          },
        ]);
      } else {
        setLogs(timestampedLogs);
      }
    } catch (error: any) {
      setLogs([
        {
          to: "N/A",
          status: "failed",
          error: error.message || "Failed to send dynamic SMS",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleRegularSMS = async () => {
    setLogs([]);

    const apiUrl = "/api/sms/" + provider;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        country,
        numbers: numbersArray,
        message: message.trim(),
        language: "english",
        fromNumber: twilioSender,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      setLogs([
        {
          to: "N/A",
          status: "failed",
          error: data.error || "Unknown error",
          timestamp: new Date(),
        },
      ]);
    } else {
      const timestampedLogs = data.results.map((log: LogEntry) => ({
        ...log,
        timestamp: new Date(),
      }));

      setLogs(timestampedLogs);
    }

    setSending(false);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-3">
        <Smartphone className="w-7 h-7 text-yellow-500" />
        <h1 className="text-2xl font-bold text-gray-800">SMS Campaign</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form Section */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setShowConfirmModal(true); // open preview modal first
          }}
          className="lg:col-span-3 space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200"
        >
          <FormField
            label="Campaign Name"
            value={name}
            onChange={setName}
            placeholder="Your campaign name here..."
            required
          />

          <SelectField
            label="Target Country"
            value={country}
            onChange={(value) => {
              setCountry(value);
              handleCountryChange({
                target: { value },
              } as React.ChangeEvent<HTMLSelectElement>);
            }}
            options={[
              { value: "", label: "Select country", disabled: true },
              ...Object.values(countries).map((c) => ({
                value: c.name,
                label: `${c.flag} ${c.name}`,
              })),
            ]}
            required
            emoji
          />

          <SelectField
            label="Select SMS Provider"
            value={provider}
            onChange={(value) => {
              setProvider(value as Provider);
              setAutoSelectedProvider(""); // disable auto-select override
            }}
            options={[
              { value: "", label: "Select a provider", disabled: true },
              { value: "twilio", label: "Twilio" },
              { value: "bulksmsbd", label: "BulkSMSBD" },
              { value: "cheapglobalsms", label: "CheapGlobalSMS" },
              { value: "hablame", label: "Hablame" },
              { value: "esms", label: "ESMS (Dianahost)" },
            ]}
            required
          />

          {provider === "twilio" && (
            <SelectField
              label="Twilio Sender Number"
              value={twilioSender}
              onChange={setTwilioSender}
              options={[
                { value: "", label: "Select sender number", disabled: true },
                {
                  value: "+12295149122",
                  label: "+12295149122 (Americus, GA, US)",
                },
                {
                  value: "+16292991476",
                  label: "+16292991476 (Nashville, US)",
                },
                {
                  value: "+14312443960",
                  label: "+14312443960 (Canada, CA)",
                },
              ]}
              required
            />
          )}

          {provider === "bulksmsbd" && (
            <DynamicSMSFields
              dynamicMode={dynamicMode}
              setDynamicMode={setDynamicMode}
              csvText={csvText}
              setCsvText={setCsvText}
            />
          )}

          {!dynamicMode && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Recipient Numbers (one per line)
                </label>
                <p className="text-sm text-gray-500">
                  Total Recipients: <strong>{totalRecipients}</strong>
                </p>
              </div>
              <TextArea
                rows={8}
                placeholder="88017XXXXXXXX"
                value={numbers}
                onChange={setNumbers}
                required={!dynamicMode}
                disabled={dynamicMode}
              />
            </div>
          )}

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message Content
            </label>
            <TextArea
              rows={10}
              placeholder="Type your message here..."
              value={message}
              onChange={setMessage}
              required
            />
            <MessageStats
              messageLength={messageLength}
              segments={segments}
              estimatedCost={estimatedCost}
              estimatedCostBDT={estimatedCostBDT}
            />
            <div className="absolute right-5 bottom-12">
              <button
                type="button"
                onClick={async () => {
                  const newAutoTranslate = !autoTranslate;
                  setAutoTranslate(newAutoTranslate);
                  if (!newAutoTranslate && originalMessage) {
                    setMessage(originalMessage); // undo
                  } else {
                    setOriginalMessage(message); // save original
                  }
                }}
                disabled={isTranslating}
                className={`relative inline-flex items-center px-3 py-1.5 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 ${
                  autoTranslate
                    ? "bg-orange-500 hover:bg-orange-400 text-gray-50"
                    : "bg-yellow-400 hover:bg-yellow-500 text-gray-800"
                } ${isTranslating ? "opacity-75 cursor-not-allowed" : ""}`}
              >
                {isTranslating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    <span>Translating...</span>
                  </>
                ) : autoTranslate ? (
                  <>
                    <Undo2 className="w-4 h-4 mr-1.5" />
                    <span>Undo Translation</span>
                  </>
                ) : (
                  <>
                    <Languages className="w-4 h-4 mr-1.5" />
                    <span>
                      Translate to {countries[country]?.language || "en"}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          <SubmitButton
            sending={sending}
            onStop={() => (stopRequestedRef.current = true)}
          />
        </form>

        {showConfirmModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-3xl border border-gray-200">
              {/* Header with icon matching your design system */}
              <div className="flex items-center gap-2 mb-4">
                <ClipboardCheck className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Confirm Campaign
                </h2>
              </div>

              {/* Summary cards grid matching your existing style */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                <SummaryCard label="Campaign Name" value={name || "N/A"} />
                <SummaryCard
                  label="Target Country"
                  value={
                    country ? `${getCountryFlag(country)} ${country}` : "N/A"
                  }
                  emoji
                />
                <SummaryCard label="Provider" value={provider || "N/A"} />
                <SummaryCard
                  label="Total Recipients"
                  value={totalRecipients || "0"}
                />
                <SummaryCard
                  label="Estimated Cost (USD)"
                  value={`$${estimatedCost.toFixed(2)}`}
                />
                <SummaryCard
                  label="Estimated Cost (BDT)"
                  value={`৳${estimatedCostBDT.toFixed(0)}`}
                />
              </div>

              {/* Message preview with consistent styling */}
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-5 h-5 text-yellow-500" />
                  <h4 className="text-sm font-medium text-gray-800">
                    Message Preview
                  </h4>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {message}
                </div>
              </div>

              {/* Action buttons with consistent spacing */}
              <div className="flex justify-end gap-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowConfirmModal(false);
                    await handleFinalSubmit();
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  Confirm & Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
          <CampaignSummary
            name={name}
            country={country}
            provider={provider}
            totalRecipients={totalRecipients}
            estimatedCost={estimatedCost}
            estimatedCostBDT={estimatedCostBDT}
          />

          {logs.length > 0 && (
            <DeliverySummary
              totalAttempted={logs.length}
              successfulSends={successfulSends}
              failedSends={failedSends}
              successRate={successRate}
            />
          )}

          <DeliveryLogs logs={logs} logsRef={logsRef} />
        </div>
      </div>
    </div>
  );
}

// Reusable Components

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
  type?: string;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
    />
  </div>
);

const SelectField = ({
  label,
  value,
  onChange,
  options,
  required = false,
  emoji = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  required?: boolean;
  emoji?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className={`w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
        emoji ? "emoji" : ""
      }`}
    >
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

const TextArea = ({
  rows,
  placeholder,
  value,
  onChange,
  required = false,
  disabled = false,
}: {
  rows: number;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
}) => (
  <textarea
    rows={rows}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    required={required}
    disabled={disabled}
    className={`w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
      disabled ? "bg-gray-100 cursor-not-allowed" : ""
    }`}
  />
);

const MessageStats = ({
  messageLength,
  segments,
  estimatedCost,
  estimatedCostBDT,
}: {
  messageLength: number;
  segments: number;
  estimatedCost: number;
  estimatedCostBDT: number;
}) => (
  <p className="text-sm text-gray-500 mt-1">
    Characters: <strong>{messageLength}</strong> | Segments:{" "}
    <strong>{segments}</strong> | Estimated Cost:{" "}
    <strong>
      ${estimatedCost.toFixed(4)} USD / ৳{estimatedCostBDT.toFixed(2)} BDT
    </strong>
  </p>
);

const DynamicSMSFields = ({
  dynamicMode,
  setDynamicMode,
  csvText,
  setCsvText,
}: {
  dynamicMode: boolean;
  setDynamicMode: (value: boolean) => void;
  csvText: string;
  setCsvText: (value: string) => void;
}) => (
  <div className="space-y-3">
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
      <input
        type="checkbox"
        checked={dynamicMode}
        onChange={(e) => setDynamicMode(e.target.checked)}
        className="accent-yellow-500"
      />
      Enable Dynamic SMS (Paste CSV)
    </label>

    {dynamicMode && (
      <>
        <label className="block text-sm font-medium text-gray-700">
          Paste CSV (first line must be headers like{" "}
          <code>phone,name,position</code>)
        </label>
        <TextArea
          rows={8}
          placeholder={`phone,name,position\n+8801712345678,Sadia Afrin,Customer Support`}
          value={csvText}
          onChange={setCsvText}
          required={dynamicMode}
        />
        <p className="text-xs text-gray-500">
          Use placeholders like <code>[name]</code>, <code>[position]</code> in
          your message
        </p>
      </>
    )}
  </div>
);

const SubmitButton = ({
  sending,
  onStop,
}: {
  sending: boolean;
  onStop: () => void;
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (sending) {
      setElapsedTime(0); // reset when sending starts
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sending]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="relative w-full space-y-2">
      <div className="flex items-center gap-2 w-full">
        {/* Main Button */}
        <div className="relative flex-1">
          <button
            type="submit"
            disabled={sending}
            className={`relative w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition-all duration-300 overflow-hidden ${
              sending
                ? "bg-gray-200 cursor-progress"
                : "bg-yellow-500 hover:bg-yellow-600 shadow-md hover:shadow-lg"
            }`}
          >
            <span className="relative z-10 flex items-center gap-2">
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                  <span className="text-gray-700">
                    Sending... Please wait, don’t close it
                  </span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Messages</span>
                </>
              )}
            </span>
          </button>
        </div>

        {/* Stop Button */}
        {sending && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onStop();
            }}
            className="flex items-center justify-center py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg shadow-md transition-colors duration-200 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                clipRule="evenodd"
              />
            </svg>
            Stop
          </button>
        )}
      </div>

      {/* Timer */}
      {sending && (
        <p className="text-sm text-gray-500 text-center">
          Time elapsed: <strong>{formatTime(elapsedTime)}</strong>
        </p>
      )}
    </div>
  );
};

const CampaignSummary = ({
  name,
  country,
  provider,
  totalRecipients,
  estimatedCost,
  estimatedCostBDT,
}: {
  name: string;
  country: string;
  provider: string;
  totalRecipients: number;
  estimatedCost: number;
  estimatedCostBDT: number;
}) => (
  <div className="space-y-3 border-b border-gray-200 pb-5 mb-5">
    <div className="flex items-center gap-2 mb-3">
      <ClipboardCheck className="w-5 h-5 text-yellow-500" />
      <h4 className="text-base font-semibold text-gray-800">
        Campaign Summary
      </h4>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <SummaryCard label="Campaign Name" value={name || "N/A"} />

      <SummaryCard
        label="Target Country"
        value={country ? `${getCountryFlag(country)} ${country}` : "N/A"}
        emoji
      />

      <SummaryCard label="Provider" value={provider || "N/A"} />

      <SummaryCard label="Total Recipients" value={totalRecipients || "0"} />

      <SummaryCard
        label="Estimated Cost (USD)"
        value={`$${estimatedCost.toFixed(2)}`}
      />

      <SummaryCard
        label="Estimated Cost (BDT)"
        value={`৳${estimatedCostBDT.toFixed(0)}`}
      />
    </div>
  </div>
);

const SummaryCard = ({
  label,
  value,
  emoji = false,
  valueClassName = "",
}: {
  label: string;
  value: string | number;
  emoji?: boolean;
  valueClassName?: string;
}) => (
  <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
    <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
    <p
      className={`font-medium text-gray-800 ${
        emoji ? "emoji" : ""
      } ${valueClassName}`}
    >
      {value}
    </p>
  </div>
);

const DeliverySummary = ({
  totalAttempted,
  successfulSends,
  failedSends,
  successRate,
}: {
  totalAttempted: number;
  successfulSends: number;
  failedSends: number;
  successRate: string;
}) => (
  <div className="border-gray-200">
    <div className="flex items-center gap-2 mb-3">
      <Activity className="w-5 h-5 text-yellow-500" />
      <h4 className="text-base font-semibold text-gray-800">
        Delivery Summary
      </h4>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <SummaryCard label="Total Attempted" value={totalAttempted} />
      <SummaryCard
        label="Successfully Sent"
        value={successfulSends}
        valueClassName="text-green-600"
      />
      <SummaryCard
        label="Failed"
        value={failedSends}
        valueClassName="text-red-600"
      />
      <SummaryCard label="Success Rate" value={`${successRate}%`} />
    </div>
  </div>
);

const DeliveryLogs = ({
  logs,
  logsRef,
}: {
  logs: LogEntry[];
  logsRef: React.RefObject<HTMLDivElement | null>;
}) => (
  <div className="mt-6">
    <div className="flex items-center gap-2 mb-4">
      <ListOrdered className="w-5 h-5 text-yellow-500" />
      <h4 className="text-base font-semibold text-gray-800">Delivery Logs</h4>
    </div>

    {logs.length === 0 ? (
      <EmptyState />
    ) : (
      <div
        className="space-y-2 max-h-[520px] overflow-y-auto pr-2"
        ref={logsRef}
      >
        {logs.map((log, i) => (
          <LogEntry key={i} log={log} />
        ))}
      </div>
    )}
  </div>
);

const EmptyState = () => (
  <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
    <Inbox className="w-10 h-10 text-gray-400 mx-auto mb-3" />
    <p className="text-gray-500">
      No logs yet. Messages will appear here once sent.
    </p>
  </div>
);

const LogEntry = ({ log }: { log: LogEntry }) => {
  const isSuccess = log.status === "sent";

  return (
    <div
      className={`p-4 rounded-lg border transition-all ${
        isSuccess
          ? "border-green-100 bg-green-50 hover:bg-green-100"
          : "border-red-100 bg-red-50 hover:bg-red-100"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="font-medium text-gray-800">{log.to}</p>
          {log.error && (
            <p className="mt-1 text-sm text-red-600">{log.error}</p>
          )}
        </div>
        <span
          className={`px-3 py-1 text-xs rounded-full font-medium ${
            isSuccess
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {isSuccess ? "Delivered" : "Failed"}
        </span>
      </div>
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <Clock className="w-3 h-3 mr-1" />
        {(log.timestamp || new Date()).toLocaleString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })}
      </div>
    </div>
  );
};
