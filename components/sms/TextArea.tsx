export default function TextArea({
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
}) {
  return (
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
}
