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
  country?: string; // ✅ Add this line
}

interface ResponseState {
  success?: boolean;
  error?: string;
  message?: string; // Add this line
}

const formatAndValidate = (raw: string, country: string): PreviewItem => {
  const result = formatPhone(raw, country);

  if (!raw.trim()) {
    return {
      number: raw,
      formatted: "",
      valid: false,
      reason: "Empty line",
    };
  }

  if (!result.formatted) {
    return {
      number: raw,
      formatted: "",
      valid: false,
      reason: "Invalid phone number",
    };
  }

  let reason: string | undefined;
  if (result.correctedFromExcel) reason = "Auto-corrected Excel number";
  else if (result.correctedLeadingZero) reason = "Removed leading 0";

  return {
    number: raw,
    formatted: result.formatted,
    valid: true,
    reason,
  };
};

const tryAutoDetect = (raw: string): PreviewItem => {
  for (const key in countries) {
    const cfg = countries[key];
    const result = formatPhone(raw, cfg.name);

    if (result.formatted) {
      let reason: string | undefined;
      if (result.correctedFromExcel) reason = "Auto-corrected Excel number";
      else if (result.correctedLeadingZero) reason = "Removed leading 0";

      return {
        number: raw,
        formatted: result.formatted,
        valid: true,
        reason,
        country: cfg.name, // ✅ include country
      };
    }
  }

  return {
    number: raw,
    formatted: "",
    valid: false,
    reason: "Could not detect country",
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
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [savingPreview, setSavingPreview] = useState<
    { phone: string; status: "saving" | "saved" | "skipped"; reason?: string }[]
  >([]);

  useEffect(() => {
    if (!country) {
      setPreview([]);
      return;
    }

    const lines = rawNumbers
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) =>
        country === "auto"
          ? tryAutoDetect(line)
          : formatAndValidate(line, country)
      );
    setPreview(lines);
  }, [rawNumbers, country]);

  // In your handleSubmit function in AddContactPage.tsx
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setProgressText("Preparing contacts...");

    const validContacts = preview
      .filter((p) => p.valid)
      .map((p) => {
        const matched = Object.values(countries).find((cfg) =>
          p.formatted.startsWith("+" + cfg.phonePrefix)
        );
        return {
          phone: p.formatted,
          country: matched?.name || "Unknown",
        };
      });

    if (validContacts.length === 0) {
      toast.error("No valid contacts to save.");
      setSaving(false);
      return;
    }

    const total = validContacts.length;
    const newSaved: string[] = [];
    const newSkipped: { phone: string; reason: string }[] = [];

    setSavingPreview(
      validContacts.map((c) => ({ phone: c.phone, status: "saving" }))
    );

    for (let i = 0; i < total; i++) {
      const contact = validContacts[i];
      setProgressText(`Saving contact ${i + 1} of ${total}`);
      setProgressPercent(Math.round(((i + 1) / total) * 100));

      try {
        const res = await fetch("/api/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contacts: [contact] }),
        });
        const data = await res.json();

        if (res.ok && data.success) {
          newSaved.push(contact.phone);
          setSavingPreview((prev) =>
            prev.map((p) =>
              p.phone === contact.phone ? { ...p, status: "saved" } : p
            )
          );
        } else {
          const reason =
            data?.details?.skipped?.[0]?.reason || "Server rejected";
          newSkipped.push({ phone: contact.phone, reason });
          setSavingPreview((prev) =>
            prev.map((p) =>
              p.phone === contact.phone
                ? { ...p, status: "skipped", reason }
                : p
            )
          );
        }
      } catch (err: any) {
        newSkipped.push({ phone: contact.phone, reason: "Network error" });
        setSavingPreview((prev) =>
          prev.map((p) =>
            p.phone === contact.phone
              ? { ...p, status: "skipped", reason: "Network error" }
              : p
          )
        );
      }
    }

    setSavedContacts(newSaved);
    setSkippedContacts(newSkipped);
    setSaveResult({
      saved: newSaved.length,
      skipped: newSkipped.length,
      reasons: [...new Set(newSkipped.map((s) => s.reason))],
    });
    setRawNumbers("");
    setPreview([]);
    setSaving(false);
    toast.success(`Saved ${newSaved.length}, Skipped ${newSkipped.length}`);
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
              <option value="auto">🌍 Auto Detect</option>
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
          {(saving || savingPreview.length > 0) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90">
              <div className="bg-white w-full max-w-2xl mx-auto rounded-xl shadow-xl border border-gray-200 p-6 space-y-6 max-h-[90vh] overflow-y-auto relative">
                {/* Progress Bar Section */}
                {saving && (
                  <div className="w-full bg-gray-100 border border-yellow-200 rounded-lg p-4 text-sm space-y-2">
                    <p className="text-yellow-700 font-medium">
                      {progressText}
                    </p>
                    <div className="w-full h-3 bg-yellow-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Saving Preview */}
                {savingPreview.length > 0 && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="max-h-[400px] overflow-y-auto divide-y divide-gray-100">
                      {savingPreview.map((item, i) => (
                        <div
                          key={i}
                          className="p-3 flex items-center justify-between text-sm bg-white"
                        >
                          <div className="flex gap-2 items-center font-mono truncate">
                            {item.status === "saving" && (
                              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                            )}
                            {item.status === "saved" && (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            )}
                            {item.status === "skipped" && (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span>{item.phone}</span>
                          </div>
                          {item.status === "skipped" && (
                            <span className="text-xs text-red-600 bg-white border border-red-300 px-2 py-0.5 rounded-full">
                              {item.reason}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Close Button */}
                {!saving && savingPreview.length > 0 && (
                  <div className="pt-4 text-right">
                    <button
                      onClick={() => {
                        setSavingPreview([]); // Reset preview
                      }}
                      className="px-4 py-2 bg-yellow-500 text-white text-sm rounded-lg hover:bg-yellow-600 transition"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

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

                {country && country !== "auto" ? (
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
                ) : country === "" ? (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    Please select a country to validate numbers
                  </p>
                ) : null}
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
              {country === "auto" && (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mt-2">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">
                    Country-wise Valid Numbers
                  </h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    {Object.entries(
                      preview.reduce((acc, p) => {
                        if (!p.valid || !p.country) return acc;
                        acc[p.country] = (acc[p.country] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([c, count]) => (
                      <div
                        key={c}
                        className="emoji flex items-center justify-between"
                      >
                        <span>
                          {countries[c]?.flag || "🌍"} {c}
                        </span>
                        <span className="font-semibold text-gray-800">
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        {p.reason && (
                          <span
                            className={`text-xs bg-white px-2 py-1 rounded-full border whitespace-nowrap
                            ${
                              p.reason.includes("Excel")
                                ? "text-yellow-600 border-yellow-300"
                                : !p.valid
                                ? "text-red-600 border-red-200"
                                : "text-green-600 border-green-200"
                            }`}
                          >
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
