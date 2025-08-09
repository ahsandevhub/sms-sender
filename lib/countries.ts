export type Provider = "twilio" | "bulksmsbd" | "cheapglobalsms" | "hablame";

export interface CountryConfig {
  name: string;
  code: string;
  flag: string;
  phoneRegex: RegExp;
  phonePrefix: string;
  example: string;
  smsRate?: Partial<Record<Provider, number>>;
  recommended?: Provider;
  language?: string;
}

export const countries: Record<string, CountryConfig> = {
  Bangladesh: {
    name: "Bangladesh",
    code: "BD",
    flag: "🇧🇩",
    phoneRegex: /^8801[3-9]\d{8}$/,
    phonePrefix: "880",
    example: "8801712345678",
    smsRate: { bulksmsbd: 0.0031 },
    recommended: "bulksmsbd",
    language: "bn", // Bengali
  },
  Canada: {
    name: "Canada",
    code: "CA",
    flag: "🇨🇦",
    phoneRegex: /^1\d{10}$/,
    phonePrefix: "1",
    example: "12065551234",
    smsRate: { twilio: 0.0166 },
    recommended: "twilio",
    language: "en", // English (main), also fr
  },
  Mexico: {
    name: "Mexico",
    code: "MX",
    flag: "🇲🇽",
    phoneRegex: /^52\d{10}$/,
    phonePrefix: "52",
    example: "5215512345678",
    smsRate: { twilio: 0.3022, cheapglobalsms: 0.016, hablame: 0.0309 },
    recommended: "cheapglobalsms",
    language: "es", // Spanish
  },
  Peru: {
    name: "Peru",
    code: "PE",
    flag: "🇵🇪",
    phoneRegex: /^51\d{9}$/,
    phonePrefix: "51",
    example: "51912345678",
    smsRate: { twilio: 0.4952, cheapglobalsms: 0.192 },
    recommended: "hablame",
    language: "es", // Spanish
  },
  Argentina: {
    name: "Argentina",
    code: "AR",
    flag: "🇦🇷",
    phoneRegex: /^54\d{10}$/,
    phonePrefix: "54",
    example: "541112345678",
    smsRate: { twilio: 0.187, cheapglobalsms: 0.182 },
    recommended: "cheapglobalsms",
    language: "es", // Spanish
  },
  Colombia: {
    name: "Colombia",
    code: "CO",
    flag: "🇨🇴",
    phoneRegex: /^57\d{10}$/,
    phonePrefix: "57",
    example: "573012345678",
    smsRate: { twilio: 0.105, cheapglobalsms: 0.014, hablame: 0.0112 },
    recommended: "hablame",
    language: "es", // Spanish
  },
  Singapore: {
    name: "Singapore",
    code: "SG",
    flag: "🇸🇬",
    phoneRegex: /^65\d{8}$/,
    phonePrefix: "65",
    example: "6591234567",
    smsRate: { twilio: 0.1185 },
    recommended: "twilio",
    language: "en", // English (official), also zh, ms, ta
  },
  "El Salvador": {
    name: "El Salvador",
    code: "SV",
    flag: "🇸🇻",
    phoneRegex: /^503\d{8}$/,
    phonePrefix: "503",
    example: "50371234567",
    smsRate: { twilio: 0.4754, cheapglobalsms: 0.5, hablame: 0.0567 },
    recommended: "hablame",
    language: "es", // Spanish
  },
  Ecuador: {
    name: "Ecuador",
    code: "EC",
    flag: "🇪🇨",
    phoneRegex: /^593\d{9}$/,
    phonePrefix: "593",
    example: "593991234567",
    smsRate: { twilio: 0.67, hablame: 0.0258 },
    recommended: "hablame",
    language: "es", // Spanish
  },
  Chile: {
    name: "Chile",
    code: "CL",
    flag: "🇨🇱",
    phoneRegex: /^56\d{9}$/,
    phonePrefix: "56",
    example: "56912345678",
    smsRate: { cheapglobalsms: 0.008, hablame: 0.0412 },
    recommended: "cheapglobalsms",
    language: "es", // Spanish
  },
  Guatemala: {
    name: "Guatemala",
    code: "GT",
    flag: "🇬🇹",
    phoneRegex: /^502\d{8}$/,
    phonePrefix: "502",
    example: "50251234567",
    smsRate: { twilio: 0.4996 },
    recommended: "twilio",
    language: "es", // Spanish
  },

  // 🌐 New entries
  "United States": {
    name: "United States",
    code: "US",
    flag: "🇺🇸",
    phoneRegex: /^1\d{10}$/,
    phonePrefix: "1",
    example: "12065551234",
    smsRate: { twilio: 0.04 },
    recommended: "twilio",
    language: "en", // English
  },
  India: {
    name: "India",
    code: "IN",
    flag: "🇮🇳",
    phoneRegex: /^91\d{10}$/,
    phonePrefix: "91",
    example: "919876543210",
    smsRate: { cheapglobalsms: 0.004 },
    recommended: "cheapglobalsms",
    language: "hi", // Hindi (official), also en
  },
  "United Kingdom": {
    name: "United Kingdom",
    code: "GB",
    flag: "🇬🇧",
    phoneRegex: /^44\d{10}$/,
    phonePrefix: "44",
    example: "447912345678",
    smsRate: { twilio: 0.04 },
    recommended: "twilio",
    language: "en", // English
  },
};

export const getCountryFlag = (country: string): string =>
  countries[country]?.flag || "🌐";

export const getCountryCode = (country: string): string =>
  countries[country]?.code || "";

export const isValidPhone = (phone: string, country: string): boolean =>
  countries[country]?.phoneRegex.test(phone.replace(/\D/g, "")) ?? false;

export interface FormattedPhoneResult {
  formatted: string | null;
  correctedFromExcel?: boolean;
  correctedLeadingZero?: boolean;
}

export const formatPhone = (
  raw: string,
  country: string
): FormattedPhoneResult => {
  const config = countries[country];
  if (!config) return { formatted: null };

  let digits = raw.replace(/[^\d]/g, "");
  const prefix = config.phonePrefix;
  let correctedFromExcel = false;
  let correctedLeadingZero = false;

  // ✅ Excel fix
  if (/e\+/i.test(raw)) {
    try {
      const parsed = Number(raw).toFixed(0);
      if (!/^\d{11,15}$/.test(parsed)) return { formatted: null };
      digits = parsed;
      correctedFromExcel = true;
    } catch {
      return { formatted: null };
    }
  }

  // ✅ Leading 0 after country code
  if (digits.startsWith(prefix + "0")) {
    digits = prefix + digits.slice(prefix.length + 1);
    correctedLeadingZero = true;
  }

  // ✅ Local 0
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
    correctedLeadingZero = true;
  }

  // ✅ Double prefix
  if (digits.startsWith(prefix + prefix)) {
    digits = digits.slice(prefix.length);
  }

  // ✅ Add prefix if needed
  if (!digits.startsWith(prefix)) {
    digits = prefix + digits;
  }

  const formatted = `+${digits}`;
  const valid = isValidPhone(formatted, country);
  return {
    formatted: valid ? formatted : null,
    correctedFromExcel,
    correctedLeadingZero,
  };
};
