import Papa from "papaparse";

export function parseCsv(csvText: string): Record<string, string>[] {
  const { data, errors } = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: true,
  });

  if (errors.length > 0) {
    throw new Error("CSV parsing error");
  }

  return data;
}
