import bcrypt from "bcryptjs";
import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  password: string;
  comparePassword: (input: string) => Promise<boolean>;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

// Compare input password with hashed password
UserSchema.methods.comparePassword = async function (input: string) {
  return bcrypt.compare(input, this.password);
};

// Hash password before saving (optional, for signup)
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
