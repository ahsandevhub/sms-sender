// UPDATED: AddContactPage.tsx
"use client";

import { countries, formatPhone } from "@/lib/countries";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  Globe,
  Hash,
  Inbox,
  ListChecks,
  Loader2,
  RefreshCcw,
  Upload,
  UserPlus,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PreviewItem {
  number: string;
  formatted: string;
  valid: boolean;
  reason?: string;
}

interface ResponseState {
  success?: boolean;
  error?: string;
  message?: string; // Add this line
}

const formatAndValidate = (raw: string, country: string): PreviewItem => {
  const digits = raw.replace(/[^0-9+]/g, "");
  if (!digits)
    return { number: raw, formatted: "", valid: false, reason: "Empty line" };

  const formatted = formatPhone(digits, country);
  const valid = formatted !== null;
  const reason = valid ? undefined : "Invalid phone number";

  return {
    number: raw,
    formatted: formatted || "",
    valid,
    reason,
  };
};

export default function AddContactPage() {
  const [rawNumbers, setRawNumbers] = useState("");
  const [country, setCountry] = useState("");
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedContacts, setSavedContacts] = useState<string[]>([]);
  const [skippedContacts, setSkippedContacts] = useState<
    { phone: string; reason: string }[]
  >([]);
  const [saveResult, setSaveResult] = useState<{
    saved: number;
    skipped: number;
    reasons: string[];
  } | null>(null);
  const totalCount = preview.length;
  const validCount = preview.filter((p) => p.valid).length;
  const invalidCount = totalCount - validCount;

  useEffect(() => {
    if (!country) {
      setPreview([]);
      return;
    }

    const lines = rawNumbers
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => formatAndValidate(line, country));
    setPreview(lines);
  }, [rawNumbers, country]);

  // In your handleSubmit function in AddContactPage.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Fix: Change 'contact' to 'phone' to match backend expectation
    const validContacts = preview
      .filter((p) => p.valid)
      .map((p) => ({ phone: p.formatted, country }));

    if (validContacts.length === 0) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contacts: validContacts }),
      });

      const data = await res.json();

      if (res.ok) {
        const { created, skipped, details } = data;
        const reasons = [
          ...new Set(
            (details.skipped as { reason?: string }[]).map(
              (s) => s.reason || "Unknown reason"
            )
          ),
        ];
        setSaveResult({ saved: created, skipped, reasons });
        setSavedContacts(details.created.map((c: any) => c.phone));
        setSkippedContacts(
          details.skipped.map((c: any) => ({
            phone: c.phone,
            reason: c.reason || "Unknown reason",
          }))
        );
        setPreview([]);

        if (created > 0) {
          toast.success(`Saved ${created} contacts`);
          setRawNumbers("");
        } else if (skipped > 0) {
          toast.error(`No contacts saved. ${skipped} skipped`);
        }
      } else {
        toast.error(data.error || "Failed to save contacts");
      }
    } catch (err: any) {
      toast.error(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <UserPlus className="w-7 h-7 text-yellow-500" />
        <h2 className="text-2xl font-bold text-gray-800">
          Add Contacts (Bulk)
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-5 gap-6"
      >
        {/* Left: Input Box */}
        <div className="lg:col-span-3 space-y-4 bg-white p-6 rounded-xl shadow border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              className="emoji w-full p-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option value="">Select Country</option>
              {Object.entries(countries).map(([key, cfg]) => (
                <option key={key} value={cfg.name}>
                  {cfg.flag} {cfg.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste Numbers (one per line)
            </label>
            <textarea
              rows={20}
              value={rawNumbers}
              onChange={(e) => setRawNumbers(e.target.value)}
              placeholder={`+${countries[country]?.example || "8801712345678"}`}
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            ></textarea>
          </div>

          {saveResult ? (
            <button
              type="button"
              onClick={() => {
                setSaveResult(null);
                setSavedContacts([]);
                setSkippedContacts([]);
                setRawNumbers("");
                setPreview([]);
              }}
              className="w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium transition-colors
              bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 hover:border-gray-300
              focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1"
            >
              <RefreshCcw className="w-5 h-5 text-gray-500" />
              <span>Reset & Add New Numbers</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={saving || !country}
              className={`w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition-colors
               ${
                 saving
                   ? "bg-yellow-400 cursor-not-allowed"
                   : "bg-yellow-500 hover:bg-yellow-600 shadow-md"
               }
               ${!country ? "cursor-not-allowed opacity-80" : ""}
               focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-1`}
            >
              {saving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1,
                      ease: "linear",
                    }}
                  >
                    <Loader2 className="w-5 h-5 animate-spin" />
                  </motion.div>
                  Saving...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" /> Save Contacts
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Preview Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 space-y-6">
          {/* Validation Summary Section */}
          {!saveResult && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Validation Summary
                </h3>
              </div>

              {/* Country Information Section */}
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-800">
                    Country Information
                  </h4>
                </div>

                {country ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <p className="text-gray-500">
                      Selected:{" "}
                      <span className="emoji font-medium text-gray-800">
                        {countries[country]?.flag} {country}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Code:{" "}
                      <span className="font-medium text-gray-800">
                        +{countries[country]?.phonePrefix}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Example Format:{" "}
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        +{countries[country]?.example || "+88017XXXXXXXX"}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please select a country to validate numbers
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                {/* Total Numbers */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-gray-100">
                      <Hash className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Total</p>
                      <p className="text-lg font-semibold text-gray-800">
                        {totalCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Valid Numbers */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">Valid</p>
                      <p className="text-lg font-semibold text-green-700">
                        {validCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Invalid Numbers */}
                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-red-100">
                      <XCircle className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500">
                        Invalid
                      </p>
                      <p className="text-lg font-semibold text-red-700">
                        {invalidCount}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Saving Summary Section */}
          {saveResult && (
            <div className="space-y-4">
              {/* Save Summary Header */}
              <div className="flex items-center gap-3">
                <ClipboardCheck className="size-6 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Save Results
                </h3>
              </div>

              {/* Country Information Section */}
              <div className="space-y-3 bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <h4 className="text-sm font-semibold text-gray-800">
                    Country Information
                  </h4>
                </div>

                {country ? (
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <p className="text-gray-500">
                      Selected:{" "}
                      <span className="emoji font-medium text-gray-800">
                        {countries[country]?.flag} {country}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Code:{" "}
                      <span className="font-medium text-gray-800">
                        +{countries[country]?.phonePrefix}
                      </span>
                    </p>
                    <p className="text-gray-500">
                      Example Format:{" "}
                      <span className="font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        +{countries[country]?.example || "+88017XXXXXXXX"}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please select a country to validate numbers
                  </p>
                )}
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="size-6 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Successfully Saved
                      </p>
                      <p className="text-xl font-bold text-green-700">
                        {saveResult.saved}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                  <div className="flex items-center gap-3">
                    <XCircle className="size-6 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        Skipped
                      </p>
                      <p className="text-xl font-bold text-red-700">
                        {saveResult.skipped}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Post-Save Preview of Saved/Skipped Numbers */}
          {saveResult ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ListChecks className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Save Results Preview
                </h3>
              </div>

              {/* Saved Numbers Preview */}
              {savedContacts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Saved Numbers ({savedContacts.length})
                    </h4>
                  </div>
                  <div className="border border-green-200 bg-green-50 rounded-lg overflow-hidden">
                    <div className="max-h-40 overflow-y-auto p-3 text-sm space-y-2">
                      {savedContacts.map((number, i) => (
                        <div
                          key={i}
                          className="text-green-800 font-mono truncate"
                        >
                          {number}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Skipped Numbers Preview */}
              {skippedContacts.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <h4 className="text-sm font-medium text-gray-700">
                      Skipped Numbers ({skippedContacts.length})
                    </h4>
                  </div>
                  <div className="border border-red-200 bg-red-50 rounded-lg overflow-hidden">
                    <div className="max-h-40 overflow-y-auto p-3 text-sm space-y-2">
                      {skippedContacts.map((item, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-start gap-4"
                        >
                          <span className="text-red-800 font-mono truncate">
                            {item.phone}
                          </span>
                          <span className="text-xs text-red-600 bg-white px-2 py-0.5 rounded-full whitespace-nowrap">
                            {item.reason}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Default Validation Preview (only shown before saving) */
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <ListChecks className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-semibold text-gray-800">
                  Validation Preview
                </h3>
              </div>

              {preview.length === 0 ? (
                <div className="bg-gray-50 rounded-lg border border-dashed border-gray-300 p-6 text-center">
                  <Inbox className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No contacts added yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Paste numbers in the left panel to validate
                  </p>
                </div>
              ) : (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-200">
                    {preview.map((p, idx) => (
                      <div
                        key={idx}
                        className={`p-3 flex items-center justify-between ${
                          p.valid ? "bg-green-50" : "bg-red-50"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {p.valid ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                          )}
                          <span
                            className={`font-medium truncate ${
                              p.valid ? "text-green-800" : "text-red-800"
                            }`}
                          >
                            {p.formatted || p.number}
                          </span>
                        </div>
                        {!p.valid && (
                          <span className="text-xs bg-white px-2 py-1 rounded-full text-red-600 border border-red-200 whitespace-nowrap">
                            {p.reason}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
