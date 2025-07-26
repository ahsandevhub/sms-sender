"use client";

import { countries } from "@/lib/countries";
import DynamicSMSFields from "./DynamicSMSFields";
import FormField from "./FormField";
import MessageStats from "./MessageStats";
import SelectField from "./SelectField";
import { SubmitButton } from "./SubmitButton";
import TextArea from "./TextArea";

export default function SmsForm({
  provider,
  setProvider,
  name,
  setName,
  country,
  setCountry,
  numbers,
  setNumbers,
  message,
  setMessage,
  twilioSender,
  setTwilioSender,
  dynamicMode,
  setDynamicMode,
  csvText,
  setCsvText,
  handleSubmit,
  segments,
  estimatedCost,
  messageLength,
  totalRecipients,
  contactCount,
}: any) {
  const handleCountryChange = async (selectedCountry: string) => {
    setCountry(selectedCountry);
    setNumbers("");

    try {
      const res = await fetch("/api/contacts/by-country", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country: selectedCountry }),
      });

      const data = await res.json();
      setNumbers(data.numbers || "");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 bg-white p-6 rounded-xl shadow border border-gray-200"
    >
      <FormField
        label="Campaign Name"
        value={name}
        onChange={setName}
        placeholder="Enter campaign name"
        required
      />

      <SelectField
        label="Select Provider"
        value={provider}
        onChange={setProvider}
        required
        options={[
          { value: "", label: "Select a provider", disabled: true },
          { value: "twilio", label: "Twilio" },
          { value: "bulksmsbd", label: "BulkSMSBD" },
          { value: "cheapglobalsms", label: "CheapGlobalSMS" },
          { value: "hablame", label: "Hablame" },
        ]}
      />

      {provider === "twilio" && (
        <SelectField
          label="Twilio Sender"
          value={twilioSender}
          onChange={setTwilioSender}
          required
          options={[
            { value: "+14312443960", label: "+14312443960 (CA)" },
            { value: "+12295149122", label: "+12295149122 (US)" },
            { value: "+16292991476", label: "+16292991476 (US)" },
          ]}
        />
      )}

      <SelectField
        label="Target Country"
        value={country}
        onChange={handleCountryChange}
        required
        options={[
          { value: "", label: "Select country", disabled: true },
          ...Object.values(countries).map((c) => ({
            value: c.name,
            label: `${c.flag} ${c.name}`,
          })),
        ]}
      />

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
          <label className="text-sm font-medium text-gray-700">
            Recipient Numbers
          </label>
          <TextArea
            rows={6}
            value={numbers}
            onChange={setNumbers}
            required
            placeholder="88017xxxxxxxx"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message Content
        </label>
        <TextArea
          rows={8}
          value={message}
          onChange={setMessage}
          required
          placeholder="Type your SMS here"
        />
        <MessageStats
          messageLength={messageLength}
          segments={segments}
          estimatedCost={estimatedCost}
        />
      </div>

      <SubmitButton
        sending={false}
        onStop={function (): void {
          throw new Error("Function not implemented.");
        }}
      />
    </form>
  );
}
