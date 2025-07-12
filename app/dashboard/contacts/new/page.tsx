// UPDATED: AddContactPage.tsx
"use client";

import { countries, formatPhone } from "@/lib/countries";
import { motion } from "framer-motion";
import { ClipboardList, Loader2, Upload, UserPlus } from "lucide-react";
import { useEffect, useState } from "react";

interface PreviewItem {
  number: string;
  formatted: string;
  valid: boolean;
  reason?: string;
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
  const [country, setCountry] = useState("Bangladesh");
  const [preview, setPreview] = useState<PreviewItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [response, setResponse] = useState<{
    success?: boolean;
    error?: string;
  } | null>(null);

  useEffect(() => {
    const lines = rawNumbers
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => formatAndValidate(line, country));
    setPreview(lines);
  }, [rawNumbers, country]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setResponse(null);

    const validContacts = preview
      .filter((p) => p.valid)
      .map((p) => ({ contact: p.formatted, country }));

    if (validContacts.length === 0) {
      setResponse({ error: "No valid numbers to save." });
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
        setResponse({ success: true });
        setRawNumbers("");
      } else {
        setResponse({ error: data.error || "Something went wrong" });
      }
    } catch (err: any) {
      setResponse({ error: err.message || "Network error" });
    }

    setSaving(false);
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
          {response?.success && (
            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg p-3">
              ✅ Contacts saved successfully.
            </div>
          )}
          {response?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3">
              ❌ {response.error}
            </div>
          )}

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
              rows={10}
              value={rawNumbers}
              onChange={(e) => setRawNumbers(e.target.value)}
              placeholder="88017XXXXXXXX"
              className="w-full p-3 rounded-lg bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              required
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 px-4 rounded-lg flex justify-center items-center gap-2 font-medium text-white transition-colors ${
              saving
                ? "bg-yellow-400 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {saving ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
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
        </div>

        {/* Right: Preview Box */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow border border-gray-200 space-y-4">
          <div className="flex items-center gap-3">
            <ClipboardList className="w-5 h-5 text-yellow-500" />
            <h3 className="text-lg font-semibold text-gray-800">
              Validation Preview
            </h3>
          </div>
          <div className="max-h-[400px] overflow-y-auto text-sm space-y-2">
            {preview.length === 0 ? (
              <p className="text-gray-500">No contacts added yet.</p>
            ) : (
              preview.map((p, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded border ${
                    p.valid
                      ? "bg-green-50 border-green-200 text-green-800"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  {p.formatted || "Invalid"}{" "}
                  {p.valid ? "✅" : `❌ (${p.reason})`}
                </div>
              ))
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
