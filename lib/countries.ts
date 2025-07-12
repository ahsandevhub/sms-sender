export interface CountryConfig {
  name: string;
  code: string; // ISO 3166-1 alpha-2
  flag: string;
  phoneRegex: RegExp;
  phonePrefix: string; // Without "+"
}

export const countries: Record<string, CountryConfig> = {
  Bangladesh: {
    name: "Bangladesh",
    code: "BD",
    flag: "🇧🇩",
    phoneRegex: /^8801[3-9]\d{8}$/,
    phonePrefix: "880",
  },
  "United States": {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    phoneRegex: /^1\d{10}$/,
    phonePrefix: "1",
  },
  "United Kingdom": {
    name: "United Kingdom",
    code: "UK",
    flag: "🇬🇧",
    phoneRegex: /^1\d{10}$/,
    phonePrefix: "1",
  },
  Canada: {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    phoneRegex: /^1\d{10}$/,
    phonePrefix: "1",
  },
  India: {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    phoneRegex: /^91\d{10}$/,
    phonePrefix: "91",
  },
  Mexico: {
    name: "Mexico",
    code: "MX",
    flag: "🇲🇽",
    phoneRegex: /^52\d{10}$/,
    phonePrefix: "52",
  },
  Colombia: {
    name: "Colombia",
    code: "CO",
    flag: "🇨🇴",
    phoneRegex: /^57\d{10}$/,
    phonePrefix: "57",
  },
  Argentina: {
    name: "Argentina",
    code: "AR",
    flag: "🇦🇷",
    phoneRegex: /^54\d{10}$/,
    phonePrefix: "54",
  },
  Peru: {
    name: "Peru",
    code: "PE",
    flag: "🇵🇪",
    phoneRegex: /^51\d{9}$/,
    phonePrefix: "51",
  },
  Singapore: {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    phoneRegex: /^65\d{8}$/,
    phonePrefix: "65",
  },
};

export const getCountryFlag = (country: string): string =>
  countries[country]?.flag || "🌐";

export const getCountryCode = (country: string): string =>
  countries[country]?.code || "";

export const isValidPhone = (phone: string, country: string): boolean =>
  countries[country]?.phoneRegex.test(phone.replace(/\D/g, "")) ?? false;

export const formatPhone = (raw: string, country: string): string | null => {
  const digits = raw.replace(/\D/g, "");
  const prefix = countries[country]?.phonePrefix;

  if (!prefix || !digits.startsWith(prefix)) return null;

  const full = `+${digits}`;
  return isValidPhone(full, country) ? full : null;
};
