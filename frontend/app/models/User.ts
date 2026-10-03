export interface IUser {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: "user" | "seller" | "admin";
  isVerified?: boolean;
  googleId?: string;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date | string;
  refreshTokens?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export default IUser;
