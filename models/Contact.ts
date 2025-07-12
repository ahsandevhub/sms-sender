import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  phone: string;
  country: string;
}

const phoneRegexByCountry: Record<string, RegExp> = {
  Bangladesh: /^8801[3-9]\d{8}$/, // 88013xxx to 88019xxx
  USA: /^1\d{10}$/,
  Canada: /^1\d{10}$/,
  India: /^91\d{10}$/,
  Mexico: /^52\d{10}$/,
  Colombia: /^57\d{10}$/,
  Argentina: /^54\d{10}$/,
  Peru: /^51\d{9}$/,
  Singapore: /^65\d{8}$/,
};

const ContactSchema: Schema<IContact> = new Schema(
  {
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      unique: true,
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      enum: Object.keys(phoneRegexByCountry),
    },
  },
  {
    timestamps: true,
  }
);

// Format contact before validation
ContactSchema.pre<IContact>("validate", function (next) {
  const raw = this.phone.replace(/\D/g, "");

  const expectedPrefix = {
    Bangladesh: "880",
    USA: "1",
    Canada: "1",
    India: "91",
    Mexico: "52",
    Colombia: "57",
    Argentina: "54",
    Peru: "51",
    Singapore: "65",
  }[this.country];

  if (!expectedPrefix) {
    return next(new Error(`Unsupported country: ${this.country}`));
  }

  if (!raw.startsWith(expectedPrefix)) {
    return next(
      new Error(
        `Phone number must start with '${expectedPrefix}' for ${this.country}`
      )
    );
  }

  const formatted = `+${raw}`;
  const pattern = phoneRegexByCountry[this.country];

  if (!pattern.test(raw)) {
    return next(
      new Error(
        `Invalid phone number format for ${this.country}. Expected pattern: ${pattern}`
      )
    );
  }

  this.phone = formatted;
  next();
});

export default mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", ContactSchema);
