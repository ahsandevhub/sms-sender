export function interpolateTemplate(
  template: string,
  data: Record<string, string>
): string {
  let output = template;
  for (const key in data) {
    output = output.replaceAll(`[${key}]`, data[key] || "");
  }
  return output;
}
