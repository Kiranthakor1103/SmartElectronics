import { Schema, model, models, Document, Types } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role: "user" | "seller" | "admin";
  isVerified?: boolean;
  googleId?: string;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  refreshTokens?: string[];
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    phone: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    role: { type: String, enum: ["user", "seller", "admin"], default: "user" },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    refreshTokens: [{ type: String }],
  },
  { timestamps: true }
);

// Performance Indexes for authentication and user management queries
UserSchema.index({ role: 1, createdAt: -1 });
UserSchema.index({ googleId: 1 }, { sparse: true });
UserSchema.index({ resetPasswordToken: 1 }, { sparse: true });

UserSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
});

UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password as string);
};

export const User = models?.User || model<IUser>("User", UserSchema);
