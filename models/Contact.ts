import { countries } from "@/lib/countries";
import mongoose, { Document, Schema } from "mongoose";

export interface IContact extends Document {
  phone: string;
  country: string;
}

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
      enum: Object.keys(countries),
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Use the countries config directly for validation
ContactSchema.pre<IContact>("validate", function (next) {
  const countryConfig = countries[this.country];

  if (!countryConfig) {
    return next(new Error(`Unsupported country: ${this.country}`));
  }

  const rawDigits = this.phone.replace(/\D/g, "");

  if (!rawDigits.startsWith(countryConfig.phonePrefix)) {
    return next(
      new Error(
        `Phone number must start with '${countryConfig.phonePrefix}' for ${this.country}`
      )
    );
  }

  if (!countryConfig.phoneRegex.test(rawDigits)) {
    return next(
      new Error(
        `Invalid phone number format for ${this.country}. Example: ${countryConfig.example}`
      )
    );
  }

  this.phone = `+${rawDigits}`; // ✅ Standard format
  next();
});

export default mongoose.models.Contact ||
  mongoose.model<IContact>("Contact", ContactSchema);
