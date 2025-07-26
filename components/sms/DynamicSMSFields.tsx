import TextArea from "./TextArea";

export default function DynamicSMSFields({
  dynamicMode,
  setDynamicMode,
  csvText,
  setCsvText,
}: {
  dynamicMode: boolean;
  setDynamicMode: (value: boolean) => void;
  csvText: string;
  setCsvText: (value: string) => void;
}) {
  return (
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
            Use placeholders like <code>[name]</code>, <code>[position]</code>{" "}
            in your message
          </p>
        </>
      )}
    </div>
  );
}
